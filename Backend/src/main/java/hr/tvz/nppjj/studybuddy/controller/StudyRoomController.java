package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.RoomMemberDTO;
import hr.tvz.nppjj.studybuddy.dto.StudyRoomDTO;
import hr.tvz.nppjj.studybuddy.requests.CreateRoomRequest;
import hr.tvz.nppjj.studybuddy.requests.UpdateStatusRequest;
import hr.tvz.nppjj.studybuddy.service.PresenceService;
import hr.tvz.nppjj.studybuddy.service.StudyRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class StudyRoomController {

    private final StudyRoomService studyRoomService;
    private final PresenceService presenceService;

    @PostMapping("/new")
    public ResponseEntity<StudyRoomDTO> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        StudyRoomDTO created = studyRoomService.createRoom(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<StudyRoomDTO>> getAllPublicRooms() {
        return ResponseEntity.ok(studyRoomService.getAllPublicRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyRoomDTO> getRoomById(@PathVariable UUID id) {
        return ResponseEntity.ok(studyRoomService.getRoomById(id));
    }

    @GetMapping("/by-code/{accessCode}")
    public ResponseEntity<StudyRoomDTO> getRoomByAccessCode(@PathVariable String accessCode) {
        return ResponseEntity.ok(studyRoomService.getRoomByAccessCode(accessCode));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<RoomMemberDTO>> getRoomMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(studyRoomService.getRoomMembers(id));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        studyRoomService.deleteRoom(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<RoomMemberDTO> joinRoom(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        RoomMemberDTO member = studyRoomService.joinRoom(id, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        studyRoomService.leaveRoom(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<RoomMemberDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        RoomMemberDTO member = studyRoomService.updateMemberStatus(id, userDetails.getUsername(), request.status());
        return ResponseEntity.ok(member);
    }

    @GetMapping("/{id}/presence")
    public ResponseEntity<Set<String>> getOnlinePresence(@PathVariable UUID id) {
        return ResponseEntity.ok(presenceService.getOnlineUsers(id));
    }
}