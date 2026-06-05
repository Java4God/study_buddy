package hr.tvz.nppjj.studybuddy.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import hr.tvz.nppjj.studybuddy.dto.DailyPomodoroSummaryDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroSummaryRating;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
    void sendExamReminderEmail(String to, String subjectName, LocalDate examDate, LocalTime examTime, String location);
    void sendWeeklyPomodoroSummaryEmail(String to, String username, LocalDate weekStart, LocalDate weekEnd,
                                        List<DailyPomodoroSummaryDTO> dailySummaries,
                                        PomodoroSummaryRating rating);
}
