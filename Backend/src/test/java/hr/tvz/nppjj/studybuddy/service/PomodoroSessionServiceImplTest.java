package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.dto.WeeklyPomodoroDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroMode;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.exception.PomodoroSessionNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.PomodoroSession;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.PomodoroSessionRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PomodoroSessionServiceImpl - unit testovi")
class PomodoroSessionServiceImplTest {

    @Mock
    private PomodoroSessionRepository pomodoroSessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PomodoroSessionServiceImpl pomodoroSessionService;

    private User basicUser;
    private User otherUser;
    private PomodoroSession existingSession;

    @BeforeEach
    void setUp() {
	basicUser = new User();
	basicUser.setId(UUID.randomUUID());
	basicUser.setUsername("ana");
	basicUser.setEmail("ana@tvz.hr");
	basicUser.setRole(Role.ROLE_BASIC_USER);

	otherUser = new User();
	otherUser.setId(UUID.randomUUID());
	otherUser.setUsername("marko");
	otherUser.setEmail("marko@tvz.hr");
	otherUser.setRole(Role.ROLE_BASIC_USER);

	existingSession = new PomodoroSession(
		UUID.randomUUID(),
		basicUser,
		PomodoroMode.FOCUS,
		25,
		"Programiranje",
		true,
		LocalDateTime.of(2026, 6, 15, 10, 0),
		LocalDateTime.of(2026, 6, 15, 9, 0)
	);

	Authentication auth = new UsernamePasswordAuthenticationToken(
		basicUser.getUsername(), null, java.util.Collections.emptyList()
	);
	SecurityContext context = SecurityContextHolder.createEmptyContext();
	context.setAuthentication(auth);
	SecurityContextHolder.setContext(context);
    }

    @AfterEach
    void tearDown() {
	SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("getSessionById vraca DTO kad sesija postoji i pripada korisniku")
    void getSessionById_kadSesijaPostojiIPripadaKorisniku_vracaDTO() {
	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
	when(pomodoroSessionRepository.findById(existingSession.getId()))
		.thenReturn(Optional.of(existingSession));

	PomodoroSessionDTO result = pomodoroSessionService.getSessionById(existingSession.getId());

	assertThat(result).isNotNull();
	assertThat(result.id()).isEqualTo(existingSession.getId());
	assertThat(result.subject()).isEqualTo("Programiranje");
	assertThat(result.durationMinutes()).isEqualTo(25);
    }

    @Test
    @DisplayName("getSessionById baca PomodoroSessionNotFoundException kad sesija ne postoji")
    void getSessionById_kadSesijaNePostoji_bacaPomodoroSessionNotFoundException() {
	UUID nepostojeciId = UUID.randomUUID();
	when(pomodoroSessionRepository.findById(nepostojeciId)).thenReturn(Optional.empty());

	assertThatThrownBy(() -> pomodoroSessionService.getSessionById(nepostojeciId))
		.isInstanceOf(PomodoroSessionNotFoundException.class)
		.hasMessageContaining(nepostojeciId.toString());
    }

    @Test
    @DisplayName("getSessionById baca AccessDeniedException kad korisnik nije vlasnik")
    void getSessionById_kadKorisnikNijeVlasnik_bacaAccessDeniedException() {
	existingSession.setUser(otherUser);
	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
	when(pomodoroSessionRepository.findById(existingSession.getId()))
		.thenReturn(Optional.of(existingSession));

	assertThatThrownBy(() -> pomodoroSessionService.getSessionById(existingSession.getId()))
		.isInstanceOf(AccessDeniedException.class)
		.hasMessageContaining("permission");
    }

    @Test
    @DisplayName("createSession sprema sesiju i postavlja korisnika")
    void createSession_kadJeUlazValjan_spremaSesiju() {
	PomodoroSessionDTO ulazniDTO = new PomodoroSessionDTO(
		null,
		basicUser.getId(),
		PomodoroMode.FOCUS,
		25,
		"Baze podataka",
		null,
		null,
		null
	);

	PomodoroSession saved = new PomodoroSession(
		UUID.randomUUID(),
		basicUser,
		PomodoroMode.FOCUS,
		25,
		"Baze podataka",
		true,
		LocalDateTime.of(2026, 7, 1, 12, 0),
		LocalDateTime.of(2026, 7, 1, 11, 0)
	);

	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
	when(userRepository.findUserById(basicUser.getId())).thenReturn(Optional.of(basicUser));
	when(pomodoroSessionRepository.save(any(PomodoroSession.class))).thenReturn(saved);

	PomodoroSessionDTO result = pomodoroSessionService.createSession(ulazniDTO, basicUser.getId());

	assertThat(result).isNotNull();
	assertThat(result.id()).isEqualTo(saved.getId());
	assertThat(result.subject()).isEqualTo("Baze podataka");

	ArgumentCaptor<PomodoroSession> captor = ArgumentCaptor.forClass(PomodoroSession.class);
	verify(pomodoroSessionRepository).save(captor.capture());
	assertThat(captor.getValue().getUser()).isEqualTo(basicUser);
	assertThat(captor.getValue().getCompleted()).isTrue();
	assertThat(captor.getValue().getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("createSession baca AccessDeniedException kad korisnik kreira za drugog usera")
    void createSession_kadKorisnikNijeVlasnik_bacaAccessDeniedException() {
	PomodoroSessionDTO ulazniDTO = new PomodoroSessionDTO(
		null,
		otherUser.getId(),
		PomodoroMode.FOCUS,
		25,
		"Fizika",
		true,
		null,
		null
	);

	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));

	assertThatThrownBy(() -> pomodoroSessionService.createSession(ulazniDTO, otherUser.getId()))
		.isInstanceOf(AccessDeniedException.class)
		.hasMessageContaining("only create");
    }

    @Test
    @DisplayName("updateSession azurira polja kad je korisnik vlasnik")
    void updateSession_kadJeKorisnikVlasnik_azuriraSesiju() {
	PomodoroSessionDTO updateDTO = new PomodoroSessionDTO(
		existingSession.getId(),
		basicUser.getId(),
		PomodoroMode.LONG_BREAK,
		15,
		"Pauza",
		false,
		LocalDateTime.of(2026, 6, 16, 12, 0),
		null
	);

	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
	when(pomodoroSessionRepository.findById(existingSession.getId()))
		.thenReturn(Optional.of(existingSession));
	when(pomodoroSessionRepository.save(any(PomodoroSession.class)))
		.thenAnswer(invocation -> invocation.getArgument(0));

	PomodoroSessionDTO result = pomodoroSessionService.updateSession(existingSession.getId(), updateDTO);

	assertThat(result.mode()).isEqualTo(PomodoroMode.LONG_BREAK);
	assertThat(result.durationMinutes()).isEqualTo(15);
	assertThat(result.completed()).isFalse();
    }

    @Test
    @DisplayName("deleteSession brise sesiju kad je korisnik vlasnik")
    void deleteSession_kadJeKorisnikVlasnik_briseSesiju() {
	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
	when(pomodoroSessionRepository.findById(existingSession.getId()))
		.thenReturn(Optional.of(existingSession));

	pomodoroSessionService.deleteSession(existingSession.getId());

	verify(pomodoroSessionRepository).deleteById(existingSession.getId());
    }

    @Test
    @DisplayName("deleteSession ne brise i baca AccessDeniedException kad korisnik nije vlasnik")
    void deleteSession_kadKorisnikNijeVlasnik_bacaAccessDeniedException() {
	existingSession.setUser(otherUser);
	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
	when(pomodoroSessionRepository.findById(existingSession.getId()))
		.thenReturn(Optional.of(existingSession));

	assertThatThrownBy(() -> pomodoroSessionService.deleteSession(existingSession.getId()))
		.isInstanceOf(AccessDeniedException.class);

	verify(pomodoroSessionRepository, never()).deleteById(any(UUID.class));
    }

    @Test
    @DisplayName("getAllSessions kao basic user vraca samo svoje sesije")
    void getAllSessions_kaoBasicUser_vracaSamoSvojeSesije() {
	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
	when(pomodoroSessionRepository.findAllByUserIdOrderByCompletedAtDesc(basicUser.getId()))
		.thenReturn(List.of(existingSession));

	List<PomodoroSessionDTO> result = pomodoroSessionService.getAllSessions();

	assertThat(result).hasSize(1);
	assertThat(result.get(0).subject()).isEqualTo("Programiranje");
    }

    @Test
    @DisplayName("getAllSessions kao admin vraca sve sesije")
    void getAllSessions_kaoAdmin_vracaSveSesije() {
	User admin = new User();
	admin.setId(UUID.randomUUID());
	admin.setUsername("admin");
	admin.setEmail("admin@tvz.hr");
	admin.setRole(Role.ROLE_ADMIN);

	Authentication adminAuth = new UsernamePasswordAuthenticationToken(
		"admin", null, java.util.Collections.emptyList()
	);
	SecurityContext context = SecurityContextHolder.createEmptyContext();
	context.setAuthentication(adminAuth);
	SecurityContextHolder.setContext(context);

	when(userRepository.findUserByUsername("admin")).thenReturn(Optional.of(admin));
	when(pomodoroSessionRepository.findAll()).thenReturn(List.of(existingSession));

	List<PomodoroSessionDTO> result = pomodoroSessionService.getAllSessions();

	assertThat(result).hasSize(1);
	verify(pomodoroSessionRepository).findAll();
    }

    @Test
    @DisplayName("getSessionsByUserId baca AccessDeniedException kad korisnik nema pravo")
    void getSessionsByUserId_kadNemaPravo_bacaAccessDeniedException() {
	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));

	assertThatThrownBy(() -> pomodoroSessionService.getSessionsByUserId(otherUser.getId()))
		.isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("getWeeklyTotals vraca 7 dana s ukupnim minutama")
    void getWeeklyTotals_vracaSedamDana() {
	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));

	LocalDate monday = LocalDate.now().with(DayOfWeek.MONDAY);
	PomodoroSession mondaySession = new PomodoroSession(
		UUID.randomUUID(),
		basicUser,
		PomodoroMode.FOCUS,
		25,
		"Java",
		true,
		monday.atTime(10, 0),
		monday.atTime(9, 0)
	);
	PomodoroSession wednesdaySession = new PomodoroSession(
		UUID.randomUUID(),
		basicUser,
		PomodoroMode.FOCUS,
		50,
		"Web",
		true,
		monday.plusDays(2).atTime(10, 0),
		monday.plusDays(2).atTime(9, 0)
	);

	when(pomodoroSessionRepository.findByUserIdAndCompletedAtBetween(
		eq(basicUser.getId()), any(LocalDateTime.class), any(LocalDateTime.class)
	)).thenReturn(List.of(mondaySession, wednesdaySession));

	List<WeeklyPomodoroDTO> result = pomodoroSessionService.getWeeklyTotals();

	assertThat(result).hasSize(7);
	WeeklyPomodoroDTO mondayTotal = result.stream()
		.filter(r -> r.date().equals(monday))
		.findFirst()
		.orElseThrow();
	WeeklyPomodoroDTO wednesdayTotal = result.stream()
		.filter(r -> r.date().equals(monday.plusDays(2)))
		.findFirst()
		.orElseThrow();

	assertThat(mondayTotal.totalMinutes()).isEqualTo(25);
	assertThat(wednesdayTotal.totalMinutes()).isEqualTo(50);
    }

    @Test
    @DisplayName("getCurrentUser baca UserNotFoundException kad korisnik ne postoji")
    void getAllSessions_kadTrenutniKorisnikNePostoji_bacaUserNotFoundException() {
	when(userRepository.findUserByUsername("ana")).thenReturn(Optional.empty());

	assertThatThrownBy(() -> pomodoroSessionService.getAllSessions())
		.isInstanceOf(UserNotFoundException.class)
		.hasMessageContaining("Current user not found");
    }
}
