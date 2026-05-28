package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.ChatMessageDTO;
import hr.tvz.nppjj.studybuddy.model.CustomUserDetails;
import hr.tvz.nppjj.studybuddy.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/rooms/{roomId}/messages")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatMessageDTO>> getRecent(
            @PathVariable UUID roomId,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(chatService.getRecentMessages(roomId, userDetails.getUsername(), limit));
    }

    @GetMapping("/before")
    public ResponseEntity<List<ChatMessageDTO>> getOlder(
            @PathVariable UUID roomId,
            @RequestParam LocalDateTime before,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(chatService.getOlderMessages(roomId, userDetails.getUsername(), before, limit));
    }
}