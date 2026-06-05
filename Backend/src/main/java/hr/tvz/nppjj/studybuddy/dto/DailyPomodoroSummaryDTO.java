package hr.tvz.nppjj.studybuddy.dto;

import java.time.LocalDate;

public record DailyPomodoroSummaryDTO(
        LocalDate date,
        int pomodoroCount,
        int totalMinutes
) {
}
