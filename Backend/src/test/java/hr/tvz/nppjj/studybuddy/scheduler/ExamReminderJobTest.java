package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.service.ExamReminderService;
import org.junit.jupiter.api.Test;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.*;

class ExamReminderJobTest {

    @Test
    void executePozivaServisSDaysAhead() throws Exception {
        ExamReminderService svc = mock(ExamReminderService.class);
        ExamReminderJob job = new ExamReminderJob();
        ReflectionTestUtils.setField(job, "examReminderService", svc);

        JobExecutionContext ctx = mock(JobExecutionContext.class);
        JobDataMap dataMap = new JobDataMap();
        dataMap.put("daysAhead", "3");
        when(ctx.getMergedJobDataMap()).thenReturn(dataMap);

        job.executeInternal(ctx);   // QuartzJobBean.execute delegira na executeInternal

        verify(svc).sendRemindersForExamsWithin(3);
    }
}