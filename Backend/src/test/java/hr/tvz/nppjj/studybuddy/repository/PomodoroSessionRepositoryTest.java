package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.enumerators.PomodoroMode;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.PomodoroSession;
import hr.tvz.nppjj.studybuddy.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("PomodoroSessionRepository - testovi JPA sloja")
class PomodoroSessionRepositoryTest {

    @Autowired
    private PomodoroSessionRepository pomodoroSessionRepository;

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
    @DisplayName("save i findById vracaju pohranjenu pomodoro sesiju")
    void save_iFindById_vracajuPohranjenuSesiju() {
	PomodoroSession session = createSession(
		testUser,
		LocalDateTime.of(2026, 6, 15, 10, 0),
		25,
		"Programiranje"
	);

	PomodoroSession saved = pomodoroSessionRepository.save(session);
	Optional<PomodoroSession> found = pomodoroSessionRepository.findById(saved.getId());

	assertThat(found).isPresent();
	assertThat(found.get().getDurationMinutes()).isEqualTo(25);
	assertThat(found.get().getUser().getId()).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("findAllByUserIdOrderByCompletedAtDesc vraca samo korisnikove sesije u silaznom poretku")
    void findAllByUserIdOrderByCompletedAtDesc_vracaSamoKorisnikoveSesije() {
	User otherUser = new User();
	otherUser.setUsername("marko_" + UUID.randomUUID());
	otherUser.setEmail("marko_" + UUID.randomUUID() + "@tvz.hr");
	otherUser.setPassword("password123");
	otherUser.setRole(Role.ROLE_BASIC_USER);
	otherUser = userRepository.save(otherUser);

	PomodoroSession older = createSession(
		testUser,
		LocalDateTime.of(2026, 6, 10, 9, 0),
		25,
		"Matematika"
	);
	PomodoroSession newer = createSession(
		testUser,
		LocalDateTime.of(2026, 6, 12, 11, 0),
		50,
		"Fizika"
	);
	PomodoroSession otherUserSession = createSession(
		otherUser,
		LocalDateTime.of(2026, 6, 11, 10, 0),
		25,
		"Biologija"
	);

	pomodoroSessionRepository.saveAll(List.of(older, newer, otherUserSession));

	List<PomodoroSession> result =
		pomodoroSessionRepository.findAllByUserIdOrderByCompletedAtDesc(testUser.getId());

	assertThat(result).hasSize(2);
	assertThat(result.get(0).getCompletedAt()).isAfter(result.get(1).getCompletedAt());
	assertThat(result).extracting(PomodoroSession::getSubject)
		.containsExactly("Fizika", "Matematika");
    }

    @Test
    @DisplayName("findByUserIdAndCompletedAtBetween vraca samo sesije unutar raspona")
    void findByUserIdAndCompletedAtBetween_vracaSamoSesijeUnutarRaspona() {
	PomodoroSession inRange = createSession(
		testUser,
		LocalDateTime.of(2026, 6, 15, 10, 0),
		25,
		"Java"
	);
	PomodoroSession outOfRange = createSession(
		testUser,
		LocalDateTime.of(2026, 7, 2, 10, 0),
		25,
		"Web"
	);

	pomodoroSessionRepository.saveAll(List.of(inRange, outOfRange));

	List<PomodoroSession> result = pomodoroSessionRepository.findByUserIdAndCompletedAtBetween(
		testUser.getId(),
		LocalDateTime.of(2026, 6, 1, 0, 0),
		LocalDateTime.of(2026, 6, 30, 23, 59)
	);

	assertThat(result).hasSize(1);
	assertThat(result.get(0).getSubject()).isEqualTo("Java");
    }

    private PomodoroSession createSession(
	    User user,
	    LocalDateTime completedAt,
	    int durationMinutes,
	    String subject
    ) {
	PomodoroSession session = new PomodoroSession();
	session.setUser(user);
	session.setMode(PomodoroMode.FOCUS);
	session.setDurationMinutes(durationMinutes);
	session.setSubject(subject);
	session.setCompleted(true);
	session.setCompletedAt(completedAt);
	return session;
    }
}
