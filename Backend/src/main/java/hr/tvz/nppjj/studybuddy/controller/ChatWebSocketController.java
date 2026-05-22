package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.ChatMessageDTO;
import hr.tvz.nppjj.studybuddy.exception.ChatAccessException;
import hr.tvz.nppjj.studybuddy.exception.RoomNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.requests.SendMessageRequest;
import hr.tvz.nppjj.studybuddy.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable UUID roomId,
                            @Payload @Valid SendMessageRequest request,
                            Principal principal) {
        ChatMessageDTO saved = chatService.sendMessage(roomId, principal.getName(), request.content());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, saved);
    }

    @MessageExceptionHandler(ChatAccessException.class)
    @SendToUser("/queue/errors")
    public Map<String, String> handleChatAccess(ChatAccessException ex) {
        return Map.of("error", ex.getMessage(), "type", "FORBIDDEN");
    }

    @MessageExceptionHandler(RoomNotFoundException.class)
    @SendToUser("/queue/errors")
    public Map<String, String> handleRoomNotFound(RoomNotFoundException ex) {
        return Map.of("error", ex.getMessage(), "type", "NOT_FOUND");
    }

    @MessageExceptionHandler(UserNotFoundException.class)
    @SendToUser("/queue/errors")
    public Map<String, String> handleUserNotFound(UserNotFoundException ex) {
        return Map.of("error", ex.getMessage(), "type", "NOT_FOUND");
    }

    @MessageExceptionHandler(Exception.class)
    @SendToUser("/queue/errors")
    public Map<String, String> handleGeneric(Exception ex) {
        return Map.of("error", "Internal error", "type", "INTERNAL");
    }
}