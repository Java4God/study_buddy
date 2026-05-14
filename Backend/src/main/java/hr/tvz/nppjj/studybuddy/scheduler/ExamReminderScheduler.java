package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import hr.tvz.nppjj.studybuddy.repository.ExamScheduleRepository;
import hr.tvz.nppjj.studybuddy.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExamReminderScheduler {

    private final ExamScheduleRepository examScheduleRepository;
    private final EmailService emailService;

    /**
     * Salje email podsjetnik svaki dan u 9:00 ujutro za ispite koji su za 3 dana.
     * Cron format: sekunde minute sati dan-u-mjesecu mjesec dan-u-tjednu
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void sendExamReminders() {
        LocalDate targetDate = LocalDate.now().plusDays(3);
        log.info("Running exam reminder scheduler for date: {}", targetDate);

        List<ExamSchedule> upcomingExams = examScheduleRepository.findAllByExamDate(targetDate);

        if (upcomingExams.isEmpty()) {
            log.info("No exams found for {}, skipping reminder emails", targetDate);
            return;
        }

        log.info("Found {} exams for {}, sending reminders", upcomingExams.size(), targetDate);

        for (ExamSchedule exam : upcomingExams) {
            if (exam.getUser() == null || exam.getUser().getEmail() == null) {
                log.warn("Exam {} has no user or email, skipping", exam.getId());
                continue;
            }

            emailService.sendExamReminderEmail(
                    exam.getUser().getEmail(),
                    exam.getSubjectName(),
                    exam.getExamDate(),
                    exam.getExamTime(),
                    exam.getLocation()
            );
        }

        log.info("Exam reminder scheduler completed");
    }
}