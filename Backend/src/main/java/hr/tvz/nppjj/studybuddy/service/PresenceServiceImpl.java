package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.PresenceUpdateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PresenceServiceImpl implements PresenceService {

    private final SimpMessagingTemplate messagingTemplate;

    // roomId → Set<username>
    private final ConcurrentHashMap<UUID, Set<String>> roomPresence = new ConcurrentHashMap<>();
    // sessionId → (roomId, username) — za clean disconnect
    private final ConcurrentHashMap<String, SessionInfo> sessions = new ConcurrentHashMap<>();

    @Override
    public void userJoinedRoom(String sessionId, UUID roomId, String username) {
        roomPresence.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(username);
        sessions.put(sessionId, new SessionInfo(roomId, username));
        broadcast(roomId);
    }

    @Override
    public void userLeftSession(String sessionId) {
        SessionInfo info = sessions.remove(sessionId);
        if (info != null) {
            Set<String> set = roomPresence.get(info.roomId());
            if (set != null) {
                set.remove(info.username());
                if (set.isEmpty()) {
                    roomPresence.remove(info.roomId());
                }
            }
            broadcast(info.roomId());
        }
    }

    @Override
    public Set<String> getOnlineUsers(UUID roomId) {
        return Collections.unmodifiableSet(
                roomPresence.getOrDefault(roomId, Collections.emptySet()));
    }

    private void broadcast(UUID roomId) {
        messagingTemplate.convertAndSend(
                "/topic/presence/" + roomId,
                new PresenceUpdateDTO(roomId, getOnlineUsers(roomId)));
    }

    private record SessionInfo(UUID roomId, String username) {}
}