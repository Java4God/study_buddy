package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ExamScheduleRepositoryTest {

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    private ExamSchedule savedExam;

    @BeforeEach
    void setUp() {
        examScheduleRepository.deleteAll();
        ExamSchedule exam = new ExamSchedule();
        exam.setSubjectName("Programiranje u Javi");
        exam.setExamDate(LocalDate.of(2026, 6, 15));
        exam.setExamTime(LocalTime.of(10, 0));
        exam.setLocation("Dvorana A1");
        exam.setNotes("Ponijeti osobnu");
        savedExam = examScheduleRepository.save(exam);
    }

    @Test
    void shouldSaveAndFindById() {
        Optional<ExamSchedule> found = examScheduleRepository.findById(savedExam.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getSubjectName()).isEqualTo("Programiranje u Javi");
        assertThat(found.get().getExamDate()).isEqualTo(LocalDate.of(2026, 6, 15));
    }

    @Test
    void shouldReturnEmptyForNonExistentId() {
        Optional<ExamSchedule> found = examScheduleRepository.findById(UUID.randomUUID());

        assertThat(found).isEmpty();
    }

    @Test
    void shouldFindExamsInDateRange() {
        ExamSchedule exam2 = new ExamSchedule();
        exam2.setSubjectName("Baze podataka");
        exam2.setExamDate(LocalDate.of(2026, 6, 20));
        exam2.setExamTime(LocalTime.of(14, 0));
        exam2.setLocation("Dvorana B2");
        examScheduleRepository.save(exam2);

        ExamSchedule exam3 = new ExamSchedule();
        exam3.setSubjectName("Web programiranje");
        exam3.setExamDate(LocalDate.of(2026, 9, 1));
        exam3.setExamTime(LocalTime.of(9, 0));
        examScheduleRepository.save(exam3);

        List<ExamSchedule> results = examScheduleRepository.findExamsInDateRange(
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 30)
        );

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getSubjectName()).isEqualTo("Programiranje u Javi");
        assertThat(results.get(1).getSubjectName()).isEqualTo("Baze podataka");
    }

    @Test
    void shouldDeleteExam() {
        examScheduleRepository.deleteById(savedExam.getId());

        Optional<ExamSchedule> found = examScheduleRepository.findById(savedExam.getId());
        assertThat(found).isEmpty();
    }

    @Test
    void shouldUpdateExam() {
        savedExam.setSubjectName("Napredna Java");
        savedExam.setLocation("Dvorana C3");
        ExamSchedule updated = examScheduleRepository.save(savedExam);

        assertThat(updated.getSubjectName()).isEqualTo("Napredna Java");
        assertThat(updated.getLocation()).isEqualTo("Dvorana C3");
    }
}