package hr.tvz.nppjj.studybuddy.dto;

import java.time.LocalDate;

public record WeeklyPomodoroDTO(
        LocalDate date,
        int totalMinutes
) {}
