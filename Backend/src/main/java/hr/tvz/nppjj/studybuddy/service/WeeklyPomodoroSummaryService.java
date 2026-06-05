package hr.tvz.nppjj.studybuddy.service;

import java.time.LocalDate;

public interface WeeklyPomodoroSummaryService {
    int sendWeeklySummariesForWeek(LocalDate weekStart);
    int sendWeeklySummaryForUser(String username, LocalDate weekStart);
}
