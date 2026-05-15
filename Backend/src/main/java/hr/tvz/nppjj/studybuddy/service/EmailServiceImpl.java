package hr.tvz.nppjj.studybuddy.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

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
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendExamReminderEmail(String to, String subjectName, LocalDate examDate, LocalTime examTime, String location) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("StudyBuddy Podsjetnik za ispit: " + subjectName);
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
            log.info("Exam reminder email sent to {} for exam {}", to, subjectName);
        } catch (Exception e) {
            log.error("Failed to send exam reminder email to {}: {}", to, e.getMessage());
        }
    }
}