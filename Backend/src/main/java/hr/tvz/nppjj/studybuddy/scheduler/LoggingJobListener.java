package hr.tvz.nppjj.studybuddy.scheduler;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.JobListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoggingJobListener implements JobListener {

    private static final Logger log = LoggerFactory.getLogger(LoggingJobListener.class);
    private final Map<JobKey, Long> startTimes = new ConcurrentHashMap<>();

    @Override
    public String getName() {
        return "LoggingJobListener";
    }

    @Override
    public void jobToBeExecuted(JobExecutionContext context) {
        JobKey key = context.getJobDetail().getKey();
        startTimes.put(key, System.currentTimeMillis());
        log.info("\u25B6\uFE0F Job [{}] započinje", key);
    }

    @Override
    public void jobExecutionVetoed(JobExecutionContext context) { }

    @Override
    public void jobWasExecuted(JobExecutionContext context, JobExecutionException jobException) {
        JobKey key = context.getJobDetail().getKey();
        long start = startTimes.getOrDefault(key, System.currentTimeMillis());
        long durationMs = System.currentTimeMillis() - start;
        startTimes.remove(key);
        if (jobException == null) {
            log.info("\u2705 Job [{}] gotov za {} ms", key, durationMs);
        } else {
            log.error("\u274C Job [{}] pao nakon {} ms: {}", key, durationMs,
                    jobException.getMessage(), jobException);
        }
    }
}