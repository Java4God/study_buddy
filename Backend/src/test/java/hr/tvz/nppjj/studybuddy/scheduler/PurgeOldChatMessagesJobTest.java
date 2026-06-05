package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.service.ChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.quartz.JobExecutionContext;
import org.quartz.Scheduler;
import org.quartz.SchedulerContext;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PurgeOldChatMessagesJobTest {

    @Mock
    private ChatService chatService;

    @Mock
    private JobExecutionContext context;

    @Mock
    private Scheduler scheduler;

    @InjectMocks
    private PurgeOldChatMessagesJob job;

    @Test
    void execute_callsChatServiceWith365Days() throws Exception {
        when(context.getScheduler()).thenReturn(scheduler);
        when(scheduler.getContext()).thenReturn(new SchedulerContext());

        job.execute(context);

        verify(chatService).purgeMessagesOlderThanDays(365);
    }
}