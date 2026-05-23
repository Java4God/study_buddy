package hr.tvz.nppjj.studybuddy.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatMessageDTO(
        UUID id,
        UUID roomId,
        UUID senderId,
        String senderUsername,
        String content,
        LocalDateTime sentAt
) {}