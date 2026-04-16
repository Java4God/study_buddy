package hr.tvz.nppjj.studybuddy.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
}