package hr.tvz.nppjj.studybuddy.config;

import hr.tvz.nppjj.studybuddy.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final PresenceService presenceService;

    private static final Pattern CHAT_TOPIC = Pattern.compile("/topic/chat/([0-9a-fA-F-]{36})");

    @EventListener
    public void handleSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        Principal user = accessor.getUser();
        String sessionId = accessor.getSessionId();

        if (destination == null || user == null) return;

        Matcher m = CHAT_TOPIC.matcher(destination);
        if (m.matches()) {
            UUID roomId = UUID.fromString(m.group(1));
            presenceService.userJoinedRoom(sessionId, roomId, user.getName());
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        presenceService.userLeftSession(accessor.getSessionId());
    }
}