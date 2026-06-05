package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.DailyPomodoroSummaryDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroMode;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroSummaryRating;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.PomodoroSession;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.PomodoroSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.calculateRating;

@ExtendWith(MockitoExtension.class)
class WeeklyPomodoroSummaryServiceImplTest {

    @Mock
    private PomodoroSessionRepository pomodoroSessionRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private WeeklyPomodoroSummaryServiceImpl service;

    private User user;
    private LocalDate weekStart;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("ana");
        user.setEmail("ana@tvz.hr");
        user.setRole(Role.ROLE_BASIC_USER);

        weekStart = LocalDate.of(2026, 6, 1);
    }

    @Test
    void calculateRating_usesWeeklyTotalsWithFiveDayExcellentTarget() {
        List<DailyPomodoroSummaryDTO> excellent = List.of(
                new DailyPomodoroSummaryDTO(weekStart, 6, 90),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(1), 6, 90),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(2), 6, 90),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(3), 6, 90),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(4), 6, 90),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(5), 20, 500),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(6), 20, 500)
        );

        assertThat(calculateRating(excellent)).isEqualTo(PomodoroSummaryRating.EXCELLENT);

        List<DailyPomodoroSummaryDTO> weekendOnly = List.of(
                new DailyPomodoroSummaryDTO(weekStart, 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(1), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(2), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(3), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(4), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(5), 30, 450),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(6), 30, 450)
        );

        assertThat(calculateRating(weekendOnly)).isEqualTo(PomodoroSummaryRating.EXCELLENT);
    }

    @Test
    void calculateRating_mapsThresholds() {
        assertThat(calculateRating(summaryWithWeekdayTotals(22, 0))).isEqualTo(PomodoroSummaryRating.GREAT);
        assertThat(calculateRating(summaryWithWeekdayTotals(15, 0))).isEqualTo(PomodoroSummaryRating.GOOD);
        assertThat(calculateRating(summaryWithWeekdayTotals(5, 0))).isEqualTo(PomodoroSummaryRating.OK);
        assertThat(calculateRating(summaryWithWeekdayTotals(1, 0))).isEqualTo(PomodoroSummaryRating.LOW);
    }

    @Test
    void sendWeeklySummaries_includesWeekendRowsAndCountsThemForRating() {
        PomodoroSession monday = session(weekStart.atTime(9, 0), 25);
        PomodoroSession saturday = session(weekStart.plusDays(5).atTime(10, 0), 450);

        when(pomodoroSessionRepository.findCompletedWithUserByCompletedAtBetween(
                eq(weekStart.atStartOfDay()),
                eq(weekStart.plusDays(6).atTime(java.time.LocalTime.MAX))
        )).thenReturn(List.of(monday, saturday));

        int sent = service.sendWeeklySummariesForWeek(weekStart);

        assertThat(sent).isEqualTo(1);

        ArgumentCaptor<List<DailyPomodoroSummaryDTO>> summariesCaptor = ArgumentCaptor.forClass(List.class);
        verify(emailService).sendWeeklyPomodoroSummaryEmail(
                eq("ana@tvz.hr"),
                eq("ana"),
                eq(weekStart),
                eq(weekStart.plusDays(6)),
                summariesCaptor.capture(),
                eq(PomodoroSummaryRating.GREAT)
        );

        List<DailyPomodoroSummaryDTO> summaries = summariesCaptor.getValue();
        assertThat(summaries).hasSize(7);
        assertThat(summaries.get(0).pomodoroCount()).isEqualTo(1);
        assertThat(summaries.get(0).totalMinutes()).isEqualTo(25);
        assertThat(summaries.get(5).pomodoroCount()).isEqualTo(1);
        assertThat(summaries.get(5).totalMinutes()).isEqualTo(450);
    }

    @Test
    void sendWeeklySummaries_skipsWhenNoSessionsExist() {
        when(pomodoroSessionRepository.findCompletedWithUserByCompletedAtBetween(any(), any()))
                .thenReturn(List.of());

        int sent = service.sendWeeklySummariesForWeek(weekStart);

        assertThat(sent).isZero();
        verify(emailService, never()).sendWeeklyPomodoroSummaryEmail(any(), any(), any(), any(), any(), any());
    }

    private List<DailyPomodoroSummaryDTO> summaryWithWeekdayTotals(int pomodoros, int minutes) {
        return List.of(
                new DailyPomodoroSummaryDTO(weekStart, pomodoros, minutes),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(1), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(2), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(3), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(4), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(5), 0, 0),
                new DailyPomodoroSummaryDTO(weekStart.plusDays(6), 0, 0)
        );
    }

    private PomodoroSession session(LocalDateTime completedAt, int durationMinutes) {
        return new PomodoroSession(
                UUID.randomUUID(),
                user,
                PomodoroMode.FOCUS,
                durationMinutes,
                "Java",
                true,
                completedAt,
                completedAt.minusMinutes(durationMinutes)
        );
    }
}
