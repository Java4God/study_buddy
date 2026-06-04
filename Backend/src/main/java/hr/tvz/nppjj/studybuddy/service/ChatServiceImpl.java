package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.ChatMessageDTO;
import hr.tvz.nppjj.studybuddy.exception.ChatAccessException;
import hr.tvz.nppjj.studybuddy.exception.RoomNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.ChatMessage;
import hr.tvz.nppjj.studybuddy.model.StudyRoom;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.ChatMessageRepository;
import hr.tvz.nppjj.studybuddy.repository.RoomMemberRepository;
import hr.tvz.nppjj.studybuddy.repository.StudyRoomRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final StudyRoomRepository studyRoomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ChatMessageDTO sendMessage(UUID roomId, String username, String content) {
        StudyRoom room = studyRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        User sender = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, sender.getId())) {
            throw new ChatAccessException("You are not a member of this room");
        }

        ChatMessage message = new ChatMessage();
        message.setRoom(room);
        message.setSender(sender);
        message.setContent(content);

        ChatMessage saved = chatMessageRepository.save(message);
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getRecentMessages(UUID roomId, String username, int limit) {
        validateMembership(roomId, username);
        List<ChatMessage> messages = new ArrayList<>(chatMessageRepository.findAllByRoomIdOrderBySentAtDesc(
                roomId, PageRequest.of(0, limit)));
        Collections.reverse(messages); // chronološki ascending za prikaz
        return messages.stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getOlderMessages(UUID roomId, String username, LocalDateTime before, int limit) {
        validateMembership(roomId, username);
        List<ChatMessage> messages = new ArrayList<>(chatMessageRepository.findOlderMessages(
                roomId, before, PageRequest.of(0, limit)));
        Collections.reverse(messages);
        return messages.stream().map(this::toDTO).toList();
    }

    private void validateMembership(UUID roomId, String username) {
        if (!studyRoomRepository.existsById(roomId)) {
            throw new RoomNotFoundException("Room not found");
        }
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId())) {
            throw new ChatAccessException("You are not a member of this room");
        }
    }

    private ChatMessageDTO toDTO(ChatMessage m) {
        return new ChatMessageDTO(
                m.getId(),
                m.getRoom().getId(),
                m.getSender().getId(),
                m.getSender().getUsername(),
                m.getContent(),
                m.getSentAt()
        );
    }
}