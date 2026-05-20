package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.RoomMemberDTO;
import hr.tvz.nppjj.studybuddy.dto.StudyRoomDTO;
import hr.tvz.nppjj.studybuddy.enumerators.MemberStatus;
import hr.tvz.nppjj.studybuddy.requests.CreateRoomRequest;

import java.util.List;
import java.util.UUID;

public interface StudyRoomService {

    StudyRoomDTO createRoom(CreateRoomRequest request, String username);

    List<StudyRoomDTO> getAllPublicRooms();

    StudyRoomDTO getRoomById(UUID id);

    StudyRoomDTO getRoomByAccessCode(String accessCode);

    List<RoomMemberDTO> getRoomMembers(UUID roomId);

    void deleteRoom(UUID roomId, String username);

    RoomMemberDTO joinRoom(UUID roomId, String username);

    void leaveRoom(UUID roomId, String username);

    RoomMemberDTO updateMemberStatus(UUID roomId, String username, MemberStatus status);
}

