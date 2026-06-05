package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.ChatMessageDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ChatService {

    ChatMessageDTO sendMessage(UUID roomId, String username, String content);

    List<ChatMessageDTO> getRecentMessages(UUID roomId, String username, int limit);

    List<ChatMessageDTO> getOlderMessages(UUID roomId, String username, LocalDateTime before, int limit);
    int purgeMessagesOlderThanDays(int days);
}