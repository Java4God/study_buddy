package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.service.WeeklyPomodoroSummaryService;
import org.junit.jupiter.api.Test;
import org.quartz.JobExecutionContext;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class WeeklyPomodoroSummaryJobTest {

    @Test
    void executeSaljeSazetakZaProsliTjedan() throws Exception {
        WeeklyPomodoroSummaryService service = mock(WeeklyPomodoroSummaryService.class);
        WeeklyPomodoroSummaryJob job = new WeeklyPomodoroSummaryJob();
        ReflectionTestUtils.setField(job, "weeklyPomodoroSummaryService", service);

        LocalDate expectedWeekStart = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .minusWeeks(1);

        job.executeInternal(mock(JobExecutionContext.class));

        verify(service).sendWeeklySummariesForWeek(expectedWeekStart);
    }
}
