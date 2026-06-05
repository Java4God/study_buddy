package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.quartz.JobExecutionContext;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PurgeOldChatMessagesJob extends QuartzJobBean {

    private final ChatService chatService;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        chatService.purgeMessagesOlderThanDays(365);
    }
}