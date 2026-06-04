package hr.tvz.nppjj.studybuddy.config;

import hr.tvz.nppjj.studybuddy.scheduler.ExamReminderJob;
import org.quartz.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuartzConfig {

    @Bean
    public JobDetail examReminderJobDetail() {
        return JobBuilder.newJob(ExamReminderJob.class)
                .withIdentity("examReminderJob")
                .usingJobData("daysAhead", "3")   // JobDataMap
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger examReminderTrigger(JobDetail examReminderJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(examReminderJobDetail)
                .withIdentity("examReminderTrigger")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 30 7 ? * MON-FRI")
                        .withMisfireHandlingInstructionDoNothing())
                .build();
    }
}