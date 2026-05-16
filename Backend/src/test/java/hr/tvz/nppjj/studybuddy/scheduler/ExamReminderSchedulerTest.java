package hr.tvz.nppjj.studybuddy.scheduler;

import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.ExamScheduleRepository;
import hr.tvz.nppjj.studybuddy.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExamReminderScheduler - unit testovi")
class ExamReminderSchedulerTest {

    @Mock
    private ExamScheduleRepository examScheduleRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ExamReminderScheduler examReminderScheduler;

    private User userSEmailom;

    @BeforeEach
    void setUp() {
        userSEmailom = new User();
        userSEmailom.setId(UUID.randomUUID());
        userSEmailom.setUsername("ana");
        userSEmailom.setEmail("ana@tvz.hr");
        userSEmailom.setRole(Role.ROLE_BASIC_USER);
    }

    @Test
    @DisplayName("sendExamReminders ne šalje email kad nema ispita za zadani datum")
    void sendExamReminders_kadNemaIspita_nePosaljeEmail() {
        // given
        when(examScheduleRepository.findAllByExamDate(any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        // when
        examReminderScheduler.sendExamReminders();

        // then
        verify(emailService, never()).sendExamReminderEmail(
                any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("sendExamReminders šalje email kad ispit ima usera s emailom")
    void sendExamReminders_kadIspitImaUseraSEmailom_saljeEmail() {
        // given
        ExamSchedule exam = new ExamSchedule(
                UUID.randomUUID(),
                "Programiranje u Javi",
                LocalDate.now().plusDays(3),
                LocalTime.of(10, 0),
                "Dvorana A1",
                "Ponijeti osobnu",
                userSEmailom
        );
        when(examScheduleRepository.findAllByExamDate(any(LocalDate.class)))
                .thenReturn(List.of(exam));

        // when
        examReminderScheduler.sendExamReminders();

        // then
        verify(emailService).sendExamReminderEmail(
                eq("ana@tvz.hr"),
                eq("Programiranje u Javi"),
                eq(exam.getExamDate()),
                eq(exam.getExamTime()),
                eq("Dvorana A1")
        );
    }

    @Test
    @DisplayName("sendExamReminders preskače ispit kad user nema email")
    void sendExamReminders_kadUserNemaEmail_preskaceIspit() {
        // given
        User userBezEmaila = new User();
        userBezEmaila.setId(UUID.randomUUID());
        userBezEmaila.setUsername("noemail");
        userBezEmaila.setEmail(null);
        userBezEmaila.setRole(Role.ROLE_BASIC_USER);

        ExamSchedule exam = new ExamSchedule(
                UUID.randomUUID(),
                "Java",
                LocalDate.now().plusDays(3),
                LocalTime.of(10, 0),
                "Dvorana",
                "Note",
                userBezEmaila
        );
        when(examScheduleRepository.findAllByExamDate(any(LocalDate.class)))
                .thenReturn(List.of(exam));

        // when
        examReminderScheduler.sendExamReminders();

        // then
        verify(emailService, never()).sendExamReminderEmail(
                any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("sendExamReminders preskače ispit kad user je null")
    void sendExamReminders_kadUserJeNull_preskaceIspit() {
        // given
        ExamSchedule exam = new ExamSchedule(
                UUID.randomUUID(),
                "Java",
                LocalDate.now().plusDays(3),
                LocalTime.of(10, 0),
                "Dvorana",
                "Note",
                null
        );
        when(examScheduleRepository.findAllByExamDate(any(LocalDate.class)))
                .thenReturn(List.of(exam));

        // when
        examReminderScheduler.sendExamReminders();

        // then
        verify(emailService, never()).sendExamReminderEmail(
                any(), any(), any(), any(), any());
    }
}