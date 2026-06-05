package hr.tvz.nppjj.studybuddy.utils;

import hr.tvz.nppjj.studybuddy.dto.DailyPomodoroSummaryDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroSummaryRating;
import hr.tvz.nppjj.studybuddy.model.PomodoroSession;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class WeeklyPomodoroSummaryUtil {

    private WeeklyPomodoroSummaryUtil() {
    }

    public static LocalDate previousWeekStart() {
        return LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .minusWeeks(1);
    }

    public static LocalDate resolveWeekStart(LocalDate weekStart) {
        return weekStart != null ? weekStart : previousWeekStart();
    }

    public static LocalDate weekEnd(LocalDate weekStart) {
        return weekStart.plusDays(6);
    }

    public static LocalDateTime weekStartDateTime(LocalDate weekStart) {
        return weekStart.atStartOfDay();
    }

    public static LocalDateTime weekEndDateTime(LocalDate weekStart) {
        return weekEnd(weekStart).atTime(LocalTime.MAX);
    }

    public static List<DailyPomodoroSummaryDTO> buildDailySummaries(LocalDate weekStart, List<PomodoroSession> sessions) {
        Map<LocalDate, List<PomodoroSession>> sessionsByDate = sessions.stream()
                .filter(session -> session.getCompletedAt() != null)
                .collect(Collectors.groupingBy(session -> session.getCompletedAt().toLocalDate()));

        return weekStart.datesUntil(weekStart.plusDays(7))
                .map(date -> {
                    List<PomodoroSession> dailySessions = sessionsByDate.getOrDefault(date, List.of());
                    int count = dailySessions.size();
                    int minutes = dailySessions.stream()
                            .map(PomodoroSession::getDurationMinutes)
                            .filter(duration -> duration != null)
                            .mapToInt(Integer::intValue)
                            .sum();
                    return new DailyPomodoroSummaryDTO(date, count, minutes);
                })
                .sorted(Comparator.comparing(DailyPomodoroSummaryDTO::date))
                .toList();
    }

    public static PomodoroSummaryRating calculateRating(List<DailyPomodoroSummaryDTO> dailySummaries) {
        int pomodoros = totalPomodoros(dailySummaries);
        int minutes = totalMinutes(dailySummaries);

        if (pomodoros >= 30 && minutes >= 450) {
            return PomodoroSummaryRating.EXCELLENT;
        }
        if (pomodoros >= 22 || minutes >= 330) {
            return PomodoroSummaryRating.GREAT;
        }
        if (pomodoros >= 15 || minutes >= 225) {
            return PomodoroSummaryRating.GOOD;
        }
        if (pomodoros >= 5 || minutes >= 75) {
            return PomodoroSummaryRating.OK;
        }
        return PomodoroSummaryRating.LOW;
    }

    public static int totalPomodoros(List<DailyPomodoroSummaryDTO> dailySummaries) {
        return dailySummaries.stream()
                .mapToInt(DailyPomodoroSummaryDTO::pomodoroCount)
                .sum();
    }

    public static int totalMinutes(List<DailyPomodoroSummaryDTO> dailySummaries) {
        return dailySummaries.stream()
                .mapToInt(DailyPomodoroSummaryDTO::totalMinutes)
                .sum();
    }

    public static int weekdayPomodoros(List<DailyPomodoroSummaryDTO> dailySummaries) {
        return dailySummaries.stream()
                .filter(summary -> summary.date().getDayOfWeek().getValue() <= 5)
                .mapToInt(DailyPomodoroSummaryDTO::pomodoroCount)
                .sum();
    }

    public static int weekdayMinutes(List<DailyPomodoroSummaryDTO> dailySummaries) {
        return dailySummaries.stream()
                .filter(summary -> summary.date().getDayOfWeek().getValue() <= 5)
                .mapToInt(DailyPomodoroSummaryDTO::totalMinutes)
                .sum();
    }

    public static String formatMinutes(int totalMinutes) {
        int hours = totalMinutes / 60;
        int minutes = totalMinutes % 60;
        if (hours == 0) {
            return minutes + " min";
        }
        if (minutes == 0) {
            return hours + " h";
        }
        return hours + " h " + minutes + " min";
    }
}
