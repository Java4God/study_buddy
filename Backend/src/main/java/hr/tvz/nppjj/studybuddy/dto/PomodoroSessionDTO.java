package hr.tvz.nppjj.studybuddy.dto;

import hr.tvz.nppjj.studybuddy.enumerators.PomodoroMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record PomodoroSessionDTO(
        UUID id,
        UUID userId,
        @NotNull(message = "Mode is required")
        PomodoroMode mode,
        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        Integer durationMinutes,
        String subject,
        Boolean completed,
        LocalDateTime completedAt,
        LocalDateTime createdAt
) {}