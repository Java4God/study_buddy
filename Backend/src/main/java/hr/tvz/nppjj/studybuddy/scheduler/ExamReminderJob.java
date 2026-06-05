package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.service.ExamReminderService;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;

@PersistJobDataAfterExecution
@DisallowConcurrentExecution
public class ExamReminderJob extends QuartzJobBean {

    @Autowired
    private ExamReminderService examReminderService;

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        JobDataMap dataMap = context.getMergedJobDataMap();
        int daysAhead = Integer.parseInt(dataMap.getString("daysAhead"));
        try {
            int sent = examReminderService.sendRemindersForExamsWithin(daysAhead);
            dataMap.put("lastRunSentCount", String.valueOf(sent));
        } catch (Exception e) {
            throw new JobExecutionException(e, false);
        }
    }
}