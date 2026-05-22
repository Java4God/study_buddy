package hr.tvz.nppjj.studybuddy.service;

import java.util.Set;
import java.util.UUID;

public interface PresenceService {

    void userJoinedRoom(String sessionId, UUID roomId, String username);

    void userLeftSession(String sessionId);

    Set<String> getOnlineUsers(UUID roomId);
}