package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.service.TokenBlacklistService;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;

public class RevokedTokenCleanupJob extends QuartzJobBean {

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        tokenBlacklistService.purgeExpired();
    }

}