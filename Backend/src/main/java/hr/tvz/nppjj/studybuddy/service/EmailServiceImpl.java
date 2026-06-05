package hr.tvz.nppjj.studybuddy.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import hr.tvz.nppjj.studybuddy.dto.DailyPomodoroSummaryDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroSummaryRating;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.formatMinutes;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.totalMinutes;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.totalPomodoros;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.weekdayMinutes;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.weekdayPomodoros;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("StudyBuddy - Reset lozinke");
        message.setText(
                "Pozdrav,\n\n" +
                        "Zatražili ste reset lozinke za svoj StudyBuddy račun.\n\n" +
                        "Kliknite na sljedeći link za postavljanje nove lozinke:\n" +
                        resetLink + "\n\n" +
                        "Link vrijedi 1 sat. Ako niste vi zatražili reset, ignorirajte ovaj email.\n\n" +
                        "Pozdrav,\nStudyBuddy tim"
        );

        try {
            mailSender.send(message);
            log.info("Email za reset lozinke poslan na {}", to);
        } catch (Exception e) {
            log.error("Slanje emaila za reset lozinke na {} nije uspjelo: {}", to, e.getMessage());
            throw new RuntimeException("Slanje emaila nije uspjelo", e);
        }
    }

    @Override
    public void sendExamReminderEmail(String to, String subjectName, LocalDate examDate, LocalTime examTime, String location) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("StudyBuddy - Podsjetnik za ispit: " + subjectName);
        message.setText(
                "Pozdrav,\n\n" +
                        "Podsjećamo te da imaš ispit za 3 dana:\n\n" +
                        "Predmet: " + subjectName + "\n" +
                        "Datum: " + examDate + "\n" +
                        "Vrijeme: " + examTime + "\n" +
                        (location != null && !location.isBlank() ? "Lokacija: " + location + "\n" : "") +
                        "\nSretno na ispitu!\n\n" +
                        "Pozdrav,\nStudyBuddy tim"
        );

        try {
            mailSender.send(message);
            log.info("Podsjetnik za ispit {} poslan na {}", subjectName, to);
        } catch (Exception e) {
            log.error("Slanje podsjetnika za ispit na {} nije uspjelo: {}", to, e.getMessage());
        }
    }

    @Override
    public void sendWeeklyPomodoroSummaryEmail(String to, String username, LocalDate weekStart, LocalDate weekEnd,
                                               List<DailyPomodoroSummaryDTO> dailySummaries,
                                               PomodoroSummaryRating rating) {
        int weeklyPomodoros = totalPomodoros(dailySummaries);
        int weeklyMinutes = totalMinutes(dailySummaries);
        int weekdayPomodoros = weekdayPomodoros(dailySummaries);
        int weekdayMinutes = weekdayMinutes(dailySummaries);

        StringBuilder body = new StringBuilder();
        body.append("Pozdrav");
        if (username != null && !username.isBlank()) {
            body.append(" ").append(username);
        }
        body.append(",\n\n");
        body.append("Tvoj tjedni Pomodoro sažetak za ")
                .append(weekStart)
                .append(" - ")
                .append(weekEnd)
                .append(":\n\n");

        for (DailyPomodoroSummaryDTO summary : dailySummaries) {
            body.append(summary.date())
                    .append(": ")
                    .append(summary.pomodoroCount())
                    .append(" Pomodoro sesija, ")
                    .append(formatMinutes(summary.totalMinutes()))
                    .append("\n");
        }

        body.append("\nUkupno ovaj tjedan: ")
                .append(weeklyPomodoros)
                .append(" Pomodoro sesija, ")
                .append(formatMinutes(weeklyMinutes))
                .append("\n");
        body.append("Osnovni cilj za najbolju ocjenu (5 dana): 30 Pomodoro sesija, 7 h 30 min\n");
        body.append("Radnim danima: ")
                .append(weekdayPomodoros)
                .append(" Pomodoro sesija, ")
                .append(formatMinutes(weekdayMinutes))
                .append("\n");
        body.append("Za ocjenu brojimo cijeli tjedan: ")
                .append(weeklyPomodoros)
                .append(" / 30 Pomodoro sesija, ")
                .append(formatMinutes(weeklyMinutes))
                .append(" / 7 h 30 min\n");
        body.append("Ocjena: ")
                .append(rating.getLabel())
                .append(" - ")
                .append(rating.getMessage())
                .append("\n\n");
        body.append("Vikend učenje ulazi u ocjenu, ali najbolja ocjena je postavljena prema cilju od 5 dana.\n\n");
        body.append("Pozdrav,\nStudyBuddy tim");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("StudyBuddy - Tjedni Pomodoro sažetak");
        message.setText(body.toString());

        try {
            mailSender.send(message);
            log.info("Tjedni Pomodoro sažetak poslan na {}", to);
        } catch (Exception e) {
            log.error("Slanje tjednog Pomodoro sažetka na {} nije uspjelo: {}", to, e.getMessage());
        }
    }
}
