package hr.tvz.nppjj.studybuddy.scheduler;

import org.junit.jupiter.api.Test;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles({"test"})
class QuartzRegistrationTest {

    @Autowired
    private Scheduler scheduler;

    @Test
    void obaPoslaSuRegistrirana() throws SchedulerException {
        assertTrue(scheduler.checkExists(JobKey.jobKey("examReminderJob")));
        assertTrue(scheduler.checkExists(JobKey.jobKey("revokedTokenCleanupJob")));
        assertTrue(scheduler.checkExists(JobKey.jobKey("weeklyPomodoroSummaryJob")));
    }
}
