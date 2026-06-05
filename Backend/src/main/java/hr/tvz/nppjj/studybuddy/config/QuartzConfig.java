package hr.tvz.nppjj.studybuddy.config;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import hr.tvz.nppjj.studybuddy.scheduler.ExamReminderJob;
import hr.tvz.nppjj.studybuddy.scheduler.PurgeOldChatMessagesJob;
import hr.tvz.nppjj.studybuddy.scheduler.RevokedTokenCleanupJob;
import hr.tvz.nppjj.studybuddy.scheduler.WeeklyPomodoroSummaryJob;

@Configuration
public class QuartzConfig {

    // --- ExamReminderJob (CRON) ---
    @Bean
    public JobDetail examReminderJobDetail() {
        return JobBuilder.newJob(ExamReminderJob.class)
                .withIdentity("examReminderJob")
                .usingJobData("daysAhead", "3")
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

    // --- RevokedTokenCleanupJob (SIMPLE) ---
    @Bean
    public JobDetail revokedTokenCleanupJobDetail() {
        return JobBuilder.newJob(RevokedTokenCleanupJob.class)
                .withIdentity("revokedTokenCleanupJob")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger revokedTokenCleanupTrigger(JobDetail revokedTokenCleanupJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(revokedTokenCleanupJobDetail)
                .withIdentity("revokedTokenCleanupTrigger")
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInMinutes(15)
                        .repeatForever()
                        .withMisfireHandlingInstructionNextWithRemainingCount())
                .build();
    }

    @Bean
    public JobDetail purgeOldChatMessagesJobDetail() {
        return JobBuilder.newJob(PurgeOldChatMessagesJob.class)
                .withIdentity("purgeOldChatMessagesJob", "chat")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger purgeOldChatMessagesTrigger(JobDetail purgeOldChatMessagesJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(purgeOldChatMessagesJobDetail)
                .withIdentity("purgeOldChatMessagesTrigger", "chat")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 0 0 1 10 ?"))
                .build();
    }

    // --- WeeklyPomodoroSummaryJob (CRON) ---
    @Bean
    public JobDetail weeklyPomodoroSummaryJobDetail() {
        return JobBuilder.newJob(WeeklyPomodoroSummaryJob.class)
                .withIdentity("weeklyPomodoroSummaryJob")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger weeklyPomodoroSummaryTrigger(JobDetail weeklyPomodoroSummaryJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(weeklyPomodoroSummaryJobDetail)
                .withIdentity("weeklyPomodoroSummaryTrigger")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 0 8 ? * MON")
                        .withMisfireHandlingInstructionDoNothing())
                .build();
    }
}
