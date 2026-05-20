package hr.tvz.nppjj.studybuddy.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record StudyRoomDTO(
        UUID id,
        String name,
        String subject,
        String accessCode,
        Boolean isPublic,
        String description,
        String ownerUsername,
        LocalDateTime createdAt,
        long memberCount
) {}