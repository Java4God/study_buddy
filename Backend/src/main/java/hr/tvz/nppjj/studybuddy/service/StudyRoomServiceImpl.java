package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.RoomMemberDTO;
import hr.tvz.nppjj.studybuddy.dto.StudyRoomDTO;
import hr.tvz.nppjj.studybuddy.enumerators.MemberStatus;
import hr.tvz.nppjj.studybuddy.exception.RoomAccessException;
import hr.tvz.nppjj.studybuddy.exception.RoomMembershipException;
import hr.tvz.nppjj.studybuddy.exception.RoomNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.RoomMember;
import hr.tvz.nppjj.studybuddy.model.StudyRoom;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.RoomMemberRepository;
import hr.tvz.nppjj.studybuddy.repository.StudyRoomRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import hr.tvz.nppjj.studybuddy.requests.CreateRoomRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudyRoomServiceImpl implements StudyRoomService {

    private static final String ACCESS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int ACCESS_CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StudyRoomRepository studyRoomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StudyRoomDTO createRoom(CreateRoomRequest request, String username) {
        User owner = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        StudyRoom room = new StudyRoom();
        room.setName(request.name());
        room.setSubject(request.subject());
        room.setDescription(request.description());
        room.setIsPublic(request.isPublic() == null ? Boolean.TRUE : request.isPublic());
        room.setAccessCode(generateUniqueAccessCode());
        room.setOwner(owner);

        StudyRoom saved = studyRoomRepository.save(room);

        RoomMember ownerMember = new RoomMember();
        ownerMember.setRoom(saved);
        ownerMember.setUser(owner);
        ownerMember.setStatus(MemberStatus.STUDYING);
        roomMemberRepository.save(ownerMember);

        return toDTO(saved, 1);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudyRoomDTO> getAllPublicRooms() {
        return studyRoomRepository.findAllByIsPublicTrueOrderByCreatedAtDesc()
                .stream()
                .map(room -> toDTO(room, roomMemberRepository.countByRoomId(room.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudyRoomDTO getRoomById(UUID id) {
        StudyRoom room = studyRoomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));
        return toDTO(room, roomMemberRepository.countByRoomId(room.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public StudyRoomDTO getRoomByAccessCode(String accessCode) {
        StudyRoom room = studyRoomRepository.findByAccessCode(accessCode)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));
        return toDTO(room, roomMemberRepository.countByRoomId(room.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomMemberDTO> getRoomMembers(UUID roomId) {
        return roomMemberRepository.findAllByRoomId(roomId)
                .stream()
                .map(this::memberToDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteRoom(UUID roomId, String username) {
        StudyRoom room = studyRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        if (!room.getOwner().getUsername().equals(username)) {
            throw new RoomAccessException("Only owner can delete the room");
        }

        studyRoomRepository.delete(room);
    }

    @Override
    @Transactional
    public RoomMemberDTO joinRoom(UUID roomId, String username) {
        StudyRoom room = studyRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId())) {
            throw new RoomMembershipException("User is already a member of this room");
        }

        RoomMember member = new RoomMember();
        member.setRoom(room);
        member.setUser(user);
        member.setStatus(MemberStatus.STUDYING);

        RoomMember saved = roomMemberRepository.save(member);
        return memberToDTO(saved);
    }

    @Override
    @Transactional
    public void leaveRoom(UUID roomId, String username) {
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, user.getId())
                .orElseThrow(() -> new RoomMembershipException("User is not a member of this room"));

        StudyRoom room = member.getRoom();
        if (room.getOwner().getId().equals(user.getId())) {
            throw new RoomMembershipException("Owner cannot leave the room. Delete the room instead.");
        }

        roomMemberRepository.delete(member);
    }

    @Override
    @Transactional
    public RoomMemberDTO updateMemberStatus(UUID roomId, String username, MemberStatus status) {
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        RoomMember member = roomMemberRepository.findByRoomIdAndUserId(roomId, user.getId())
                .orElseThrow(() -> new RoomMembershipException("User is not a member of this room"));

        member.setStatus(status);
        RoomMember saved = roomMemberRepository.save(member);
        return memberToDTO(saved);
    }

    private String generateUniqueAccessCode() {
        String code;
        int attempts = 0;
        do {
            code = generateAccessCode();
            attempts++;
            if (attempts > 10) {
                throw new RuntimeException("Failed to generate unique access code");
            }
        } while (studyRoomRepository.existsByAccessCode(code));
        return code;
    }

    private String generateAccessCode() {
        StringBuilder sb = new StringBuilder(ACCESS_CODE_LENGTH);
        for (int i = 0; i < ACCESS_CODE_LENGTH; i++) {
            sb.append(ACCESS_CODE_CHARS.charAt(RANDOM.nextInt(ACCESS_CODE_CHARS.length())));
        }
        return sb.toString();
    }

    private StudyRoomDTO toDTO(StudyRoom room, long memberCount) {
        return new StudyRoomDTO(
                room.getId(),
                room.getName(),
                room.getSubject(),
                room.getAccessCode(),
                room.getIsPublic(),
                room.getDescription(),
                room.getOwner().getUsername(),
                room.getCreatedAt(),
                memberCount
        );
    }

    private RoomMemberDTO memberToDTO(RoomMember member) {
        return new RoomMemberDTO(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getUsername(),
                member.getStatus(),
                member.getJoinedAt()
        );
    }
}