package hr.tvz.nppjj.studybuddy.service;

import java.time.LocalDate;
import java.time.LocalTime;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
    void sendExamReminderEmail(String to, String subjectName, LocalDate examDate, LocalTime examTime, String location);
}