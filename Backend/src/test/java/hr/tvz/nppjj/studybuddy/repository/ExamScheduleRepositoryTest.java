package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import hr.tvz.nppjj.studybuddy.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("ExamScheduleRepository - testovi JPA sloja")
class ExamScheduleRepositoryTest {

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("ana_" + UUID.randomUUID());
        testUser.setEmail("ana_" + UUID.randomUUID() + "@tvz.hr");
        testUser.setPassword("password123");
        testUser.setRole(Role.ROLE_BASIC_USER);
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("save i findById vraćaju pohranjeni ispit")
    void save_iFindById_vracajuPohranjeniIspit() {
        ExamSchedule exam = new ExamSchedule();
        exam.setSubjectName("Programiranje u Javi");
        exam.setExamDate(LocalDate.of(2026, 6, 15));
        exam.setExamTime(LocalTime.of(10, 0));
        exam.setLocation("Dvorana A1");
        exam.setNotes("Ponijeti osobnu");
        exam.setUser(testUser);

        ExamSchedule saved = examScheduleRepository.save(exam);
        Optional<ExamSchedule> found = examScheduleRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getSubjectName()).isEqualTo("Programiranje u Javi");
        assertThat(found.get().getExamDate()).isEqualTo(LocalDate.of(2026, 6, 15));
        assertThat(found.get().getUser().getId()).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("findById vraća Optional.empty() za nepostojeći ID")
    void findById_zaNepostojeciId_vracaEmpty() {
        UUID nepostojeciId = UUID.randomUUID();

        Optional<ExamSchedule> found = examScheduleRepository.findById(nepostojeciId);

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("findExamsInDateRange (custom @Query) vraća samo ispite unutar zadanog raspona")
    void findExamsInDateRange_vracaSamoIspiteUnutarRaspona() {
        ExamSchedule lipanj1 = createExam("Programiranje u Javi", LocalDate.of(2026, 6, 15));
        ExamSchedule lipanj2 = createExam("Baze podataka", LocalDate.of(2026, 6, 20));
        ExamSchedule rujan = createExam("Web programiranje", LocalDate.of(2026, 9, 1));
        examScheduleRepository.saveAll(List.of(lipanj1, lipanj2, rujan));

        List<ExamSchedule> rezultat = examScheduleRepository.findExamsInDateRange(
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 30)
        );

        assertThat(rezultat).hasSize(2);
        assertThat(rezultat).extracting(ExamSchedule::getSubjectName)
                .containsExactly("Programiranje u Javi", "Baze podataka");
    }

    @Test
    @DisplayName("findAllByUserId vraća samo ispite koji pripadaju zadanom korisniku")
    void findAllByUserId_vracaSamoIspiteOdredenogKorisnika() {
        User drugiUser = new User();
        drugiUser.setUsername("marko_" + UUID.randomUUID());
        drugiUser.setEmail("marko_" + UUID.randomUUID() + "@tvz.hr");
        drugiUser.setPassword("password123");
        drugiUser.setRole(Role.ROLE_BASIC_USER);
        drugiUser = userRepository.save(drugiUser);

        ExamSchedule mojIspit = createExam("Java", LocalDate.of(2026, 6, 15));
        ExamSchedule tudIspit = createExam("Web", LocalDate.of(2026, 6, 20));
        tudIspit.setUser(drugiUser);
        examScheduleRepository.saveAll(List.of(mojIspit, tudIspit));

        var moji = examScheduleRepository.findAllByUserId(
                testUser.getId(),
                PageRequest.of(0, 10)
        );

        assertThat(moji.getContent()).hasSize(1);
        assertThat(moji.getContent().get(0).getSubjectName()).isEqualTo("Java");
    }

    private ExamSchedule createExam(String subjectName, LocalDate date) {
        ExamSchedule exam = new ExamSchedule();
        exam.setSubjectName(subjectName);
        exam.setExamDate(date);
        exam.setExamTime(LocalTime.of(10, 0));
        exam.setLocation("Dvorana");
        exam.setUser(testUser);
        return exam;
    }
}