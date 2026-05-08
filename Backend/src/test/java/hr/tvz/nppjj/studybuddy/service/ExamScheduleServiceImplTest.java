package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.exception.ExamNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.ExamScheduleRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExamScheduleServiceImpl - unit testovi")
class ExamScheduleServiceImplTest {

    @Mock
    private ExamScheduleRepository examScheduleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExamScheduleServiceImpl examScheduleService;

    private User basicUser;
    private User otherUser;
    private ExamSchedule existingExam;

    @BeforeEach
    void setUp() {
        // given - basic user koji je vlasnik ispita
        basicUser = new User();
        basicUser.setId(UUID.randomUUID());
        basicUser.setUsername("ana");
        basicUser.setEmail("ana@tvz.hr");
        basicUser.setRole(Role.ROLE_BASIC_USER);

        // given - drugi user (za ownership testove)
        otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        otherUser.setUsername("marko");
        otherUser.setEmail("marko@tvz.hr");
        otherUser.setRole(Role.ROLE_BASIC_USER);

        // given - postojeći ispit u vlasništvu basicUsera
        existingExam = new ExamSchedule(
                UUID.randomUUID(),
                "Programiranje u Javi",
                LocalDate.of(2026, 6, 15),
                LocalTime.of(10, 0),
                "Dvorana A1",
                "Ponijeti osobnu",
                basicUser
        );

        // given - postavi authentication u SecurityContext kao da je basicUser logiran
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
    @DisplayName("getExamById vraća DTO kad ispit postoji i pripada korisniku")
    void getExamById_kadIspitPostojiIPripadaKorisniku_vracaDTO() {
        // given
        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
        when(examScheduleRepository.findById(existingExam.getId()))
                .thenReturn(Optional.of(existingExam));

        // when
        ExamScheduleDTO result = examScheduleService.getExamById(existingExam.getId());

        // then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(existingExam.getId());
        assertThat(result.subjectName()).isEqualTo("Programiranje u Javi");
        assertThat(result.location()).isEqualTo("Dvorana A1");
    }

    @Test
    @DisplayName("getExamById baca ExamNotFoundException kad ispit ne postoji")
    void getExamById_kadIspitNePostoji_bacaExamNotFoundException() {
        // given
        UUID nepostojeciId = UUID.randomUUID();
        when(examScheduleRepository.findById(nepostojeciId)).thenReturn(Optional.empty());

        // when + then
        assertThatThrownBy(() -> examScheduleService.getExamById(nepostojeciId))
                .isInstanceOf(ExamNotFoundException.class)
                .hasMessageContaining(nepostojeciId.toString());
    }

    @Test
    @DisplayName("getExamById baca AccessDeniedException kad korisnik nije vlasnik ispita")
    void getExamById_kadKorisnikNijeVlasnik_bacaAccessDeniedException() {
        // given - ispit pripada otherUseru, a logiran je basicUser
        existingExam.setUser(otherUser);
        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
        when(examScheduleRepository.findById(existingExam.getId()))
                .thenReturn(Optional.of(existingExam));

        // when + then
        assertThatThrownBy(() -> examScheduleService.getExamById(existingExam.getId()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("permission");
    }

    @Test
    @DisplayName("createExam sprema ispit i postavlja trenutnog korisnika kao vlasnika")
    void createExam_kadJeUlazValjan_spremaIspitSTrenutnimKorisnikomKaoVlasnikom() {
        // given
        ExamScheduleDTO ulaznDTO = new ExamScheduleDTO(
                null,
                "Baze podataka",
                LocalDate.of(2026, 7, 1),
                LocalTime.of(12, 0),
                "Dvorana B2",
                "Donijeti kalkulator"
        );

        ExamSchedule spremljeni = new ExamSchedule(
                UUID.randomUUID(),
                ulaznDTO.subjectName(),
                ulaznDTO.examDate(),
                ulaznDTO.examTime(),
                ulaznDTO.location(),
                ulaznDTO.notes(),
                basicUser
        );

        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
        when(examScheduleRepository.save(any(ExamSchedule.class))).thenReturn(spremljeni);

        // when
        ExamScheduleDTO result = examScheduleService.createExam(ulaznDTO);

        // then
        assertThat(result).isNotNull();
        assertThat(result.subjectName()).isEqualTo("Baze podataka");
        assertThat(result.id()).isEqualTo(spremljeni.getId());
        verify(examScheduleRepository).save(any(ExamSchedule.class));
    }

    @Test
    @DisplayName("deleteExam briše ispit kad je korisnik vlasnik")
    void deleteExam_kadJeKorisnikVlasnik_brisIspit() {
        // given
        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
        when(examScheduleRepository.findById(existingExam.getId()))
                .thenReturn(Optional.of(existingExam));

        // when
        examScheduleService.deleteExam(existingExam.getId());

        // then
        verify(examScheduleRepository).deleteById(existingExam.getId());
    }

    @Test
    @DisplayName("deleteExam ne briše i baca AccessDeniedException kad korisnik nije vlasnik")
    void deleteExam_kadKorisnikNijeVlasnik_bacaIznimkuINeBrise() {
        // given - ispit pripada otherUseru
        existingExam.setUser(otherUser);
        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
        when(examScheduleRepository.findById(existingExam.getId()))
                .thenReturn(Optional.of(existingExam));

        // when + then
        assertThatThrownBy(() -> examScheduleService.deleteExam(existingExam.getId()))
                .isInstanceOf(AccessDeniedException.class);

        verify(examScheduleRepository, never()).deleteById(any(UUID.class));
    }

    @Test
    @DisplayName("getCurrentUser baca UserNotFoundException ako username iz tokena ne postoji u bazi")
    void getExamById_kadTrenutniKorisnikNePostojiUBazi_bacaUserNotFoundException() {
        // given - autentikacija postoji, ali user više nije u bazi (npr. obrisan)
        when(examScheduleRepository.findById(existingExam.getId()))
                .thenReturn(Optional.of(existingExam));
        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.empty());

        // when + then
        assertThatThrownBy(() -> examScheduleService.getExamById(existingExam.getId()))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("Current user not found");
    }

    @Test
    @DisplayName("getAllExams kao basic user vraća samo svoje ispite")
    void getAllExams_kaoBasicUser_vracaSamoSvojeIspite() {
        // given
        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(0, 10);
        org.springframework.data.domain.Page<ExamSchedule> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(existingExam));
        when(examScheduleRepository.findAllByUserId(basicUser.getId(), pageable)).thenReturn(page);

        // when
        var result = examScheduleService.getAllExams(pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).subjectName()).isEqualTo("Programiranje u Javi");
        verify(examScheduleRepository).findAllByUserId(basicUser.getId(), pageable);
    }

    @Test
    @DisplayName("getAllExams kao admin vraća sve ispite (svih korisnika)")
    void getAllExams_kaoAdmin_vracaSveIspite() {
        // given - postavi admina u SecurityContext
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
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(0, 10);
        org.springframework.data.domain.Page<ExamSchedule> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(existingExam));
        when(examScheduleRepository.findAll(pageable)).thenReturn(page);

        // when
        var result = examScheduleService.getAllExams(pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        verify(examScheduleRepository).findAll(pageable);
    }

    @Test
    @DisplayName("getNextExams vraća do 3 nadolazeća ispita za basic usera")
    void getNextExams_kaoBasicUser_vracaSljedeceIspite() {
        // given
        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
        org.springframework.data.domain.Page<ExamSchedule> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(existingExam));
        when(examScheduleRepository.findByUserIdAndExamDateGreaterThanEqual(
                org.mockito.ArgumentMatchers.eq(basicUser.getId()),
                org.mockito.ArgumentMatchers.any(java.time.LocalDate.class),
                org.mockito.ArgumentMatchers.any(org.springframework.data.domain.Pageable.class)
        )).thenReturn(page);

        // when
        var result = examScheduleService.getNextExams();

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).subjectName()).isEqualTo("Programiranje u Javi");
    }

    @Test
    @DisplayName("updateExam ažurira polja kad je korisnik vlasnik")
    void updateExam_kadJeKorisnikVlasnik_azuriraIspit() {
        // given
        ExamScheduleDTO updateDTO = new ExamScheduleDTO(
                existingExam.getId(),
                "Napredna Java",
                LocalDate.of(2026, 8, 1),
                LocalTime.of(14, 0),
                "Dvorana C3",
                "Update note"
        );
        when(userRepository.findUserByUsername("ana")).thenReturn(Optional.of(basicUser));
        when(examScheduleRepository.findById(existingExam.getId()))
                .thenReturn(Optional.of(existingExam));

        // when
        ExamScheduleDTO result = examScheduleService.updateExam(existingExam.getId(), updateDTO);

        // then
        assertThat(result.subjectName()).isEqualTo("Napredna Java");
        assertThat(result.location()).isEqualTo("Dvorana C3");
    }
}