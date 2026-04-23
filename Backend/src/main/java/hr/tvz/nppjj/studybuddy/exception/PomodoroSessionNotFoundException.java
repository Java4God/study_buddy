package hr.tvz.nppjj.studybuddy.exception;

public class PomodoroSessionNotFoundException extends RuntimeException {
    public PomodoroSessionNotFoundException(String message) {
        super(message);
    }
}