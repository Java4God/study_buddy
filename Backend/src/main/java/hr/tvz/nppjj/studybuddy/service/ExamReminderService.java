package hr.tvz.nppjj.studybuddy.service;

public interface ExamReminderService {
    int sendRemindersForExamsWithin(int daysAhead);
}