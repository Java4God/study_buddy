package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.service.WeeklyPomodoroSummaryService;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;

import java.time.LocalDate;

import static hr.tvz.nppjj.studybuddy.utils.WeeklyPomodoroSummaryUtil.previousWeekStart;

@DisallowConcurrentExecution
public class WeeklyPomodoroSummaryJob extends QuartzJobBean {

    @Autowired
    private WeeklyPomodoroSummaryService weeklyPomodoroSummaryService;

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        LocalDate previousWeekMonday = previousWeekStart();

        try {
            weeklyPomodoroSummaryService.sendWeeklySummariesForWeek(previousWeekMonday);
        } catch (Exception e) {
            throw new JobExecutionException(e, false);
        }
    }
}
