package hr.tvz.nppjj.studybuddy.config;

import hr.tvz.nppjj.studybuddy.scheduler.LoggingJobListener;
import org.springframework.boot.quartz.autoconfigure.SchedulerFactoryBeanCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuartzListenerConfig {

    @Bean
    public SchedulerFactoryBeanCustomizer jobListenerCustomizer(LoggingJobListener listener) {
        return factory -> factory.setGlobalJobListeners(listener);
    }
}