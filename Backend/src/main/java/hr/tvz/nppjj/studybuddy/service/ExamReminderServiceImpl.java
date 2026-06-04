package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import hr.tvz.nppjj.studybuddy.repository.ExamScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamReminderServiceImpl implements ExamReminderService {

    private final ExamScheduleRepository examScheduleRepository;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public int sendRemindersForExamsWithin(int daysAhead) {
        LocalDate targetDate = LocalDate.now().plusDays(daysAhead);
        log.info("Slanje podsjetnika za ispite na datum: {}", targetDate);

        List<ExamSchedule> upcomingExams = examScheduleRepository.findAllByExamDate(targetDate);
        if (upcomingExams.isEmpty()) {
            log.info("Nema ispita za {}, preskačem", targetDate);
            return 0;
        }

        int sent = 0;
        for (ExamSchedule exam : upcomingExams) {
            if (exam.getUser() == null || exam.getUser().getEmail() == null) {
                log.warn("Exam {} nema usera ili email, preskačem", exam.getId());
                continue;
            }
            emailService.sendExamReminderEmail(
                    exam.getUser().getEmail(),
                    exam.getSubjectName(),
                    exam.getExamDate(),
                    exam.getExamTime(),
                    exam.getLocation()
            );
            sent++;
        }
        log.info("Poslano {} podsjetnika za {}", sent, targetDate);
        return sent;
    }
}