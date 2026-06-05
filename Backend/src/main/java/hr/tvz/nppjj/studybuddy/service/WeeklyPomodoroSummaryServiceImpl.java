package hr.tvz.nppjj.studybuddy.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hr.tvz.nppjj.studybuddy.dto.DailyPomodoroSummaryDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroSummaryRating;
import hr.tvz.nppjj.studybuddy.model.PomodoroSession;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.PomodoroSessionRepository;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.buildDailySummaries;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.calculateRating;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.weekEnd;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.weekEndDateTime;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.weekStartDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklyPomodoroSummaryServiceImpl implements WeeklyPomodoroSummaryService {

    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public int sendWeeklySummariesForWeek(LocalDate weekStart) {
        LocalDate weekEnd = weekEnd(weekStart);

        List<PomodoroSession> sessions = pomodoroSessionRepository.findCompletedWithUserByCompletedAtBetween(
                weekStartDateTime(weekStart),
                weekEndDateTime(weekStart)
        );
        if (sessions.isEmpty()) {
            log.info("Nema dovršenih Pomodoro sesija za tjedni sažetak od {} do {}", weekStart, weekEnd);
            return 0;
        }

        Map<User, List<PomodoroSession>> sessionsByUser = sessions.stream()
                .filter(session -> session.getUser() != null)
                .collect(Collectors.groupingBy(
                        PomodoroSession::getUser,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        int sent = 0;
        for (Map.Entry<User, List<PomodoroSession>> entry : sessionsByUser.entrySet()) {
            User user = entry.getKey();
            if (user.getEmail() == null || user.getEmail().isBlank()) {
                log.warn("Preskačem tjedni Pomodoro sažetak za korisnika {} jer nema email", user.getUsername());
                continue;
            }

            List<DailyPomodoroSummaryDTO> dailySummaries = buildDailySummaries(weekStart, entry.getValue());
            PomodoroSummaryRating rating = calculateRating(dailySummaries);

            emailService.sendWeeklyPomodoroSummaryEmail(
                    user.getEmail(),
                    user.getUsername(),
                    weekStart,
                    weekEnd,
                    dailySummaries,
                    rating
            );
            sent++;
        }

        log.info("Poslano {} tjednih Pomodoro sažetaka za razdoblje od {} do {}", sent, weekStart, weekEnd);
        return sent;
    }

    @Override
    @Transactional(readOnly = true)
    public int sendWeeklySummaryForUser(String username, LocalDate weekStart) {
        LocalDate weekEnd = weekEnd(weekStart);

        List<PomodoroSession> sessions = pomodoroSessionRepository
                .findCompletedWithUserByUsernameAndCompletedAtBetween(
                        username,
                        weekStartDateTime(weekStart),
                        weekEndDateTime(weekStart)
                );
        if (sessions.isEmpty()) {
            log.info("Korisnik {} nema dovršenih Pomodoro sesija od {} do {}", username, weekStart, weekEnd);
            return 0;
        }

        User user = sessions.get(0).getUser();
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            log.warn("Preskačem tjedni Pomodoro sažetak za korisnika {} jer nema email", username);
            return 0;
        }

        List<DailyPomodoroSummaryDTO> dailySummaries = buildDailySummaries(weekStart, sessions);
        PomodoroSummaryRating rating = calculateRating(dailySummaries);

        emailService.sendWeeklyPomodoroSummaryEmail(
                user.getEmail(),
                user.getUsername(),
                weekStart,
                weekEnd,
                dailySummaries,
                rating
        );
        log.info("Poslan tjedni Pomodoro sažetak za korisnika {} od {} do {}", username, weekStart, weekEnd);
        return 1;
    }

}
