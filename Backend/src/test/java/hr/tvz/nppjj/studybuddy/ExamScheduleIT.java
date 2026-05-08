package hr.tvz.nppjj.studybuddy;

import tools.jackson.databind.ObjectMapper;
import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.ExamScheduleRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("ExamSchedule integracijski test - od HTTP-a do baze i nazad")
class ExamScheduleIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        examScheduleRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setUsername("integration_test_user");
        testUser.setEmail("integration@tvz.hr");
        testUser.setPassword("$2a$10$abcdefghijklmnopqrstuv");
        testUser.setRole(Role.ROLE_BASIC_USER);
        testUser = userRepository.save(testUser);

        // postavi authentication u SecurityContext da service moze dohvatit current user
        Authentication auth = new UsernamePasswordAuthenticationToken(
                testUser.getUsername(), null, Collections.emptyList()
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
    }

    @Test
    @DisplayName("POST /exams stvara ispit u bazi i GET /exams/{id} ga vraća")
    void createExam_kadJeUlazValjan_spremaUBazuIVracaGaPrekoGet() throws Exception {
        ExamScheduleDTO ulaz = new ExamScheduleDTO(
                null,
                "Integracijski test ispit",
                LocalDate.of(2026, 12, 1),
                LocalTime.of(9, 30),
                "Dvorana D4",
                "Test napomena"
        );

        String responseJson = mockMvc.perform(post("/exams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ulaz)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subjectName").value("Integracijski test ispit"))
                .andExpect(jsonPath("$.location").value("Dvorana D4"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        ExamScheduleDTO created = objectMapper.readValue(responseJson, ExamScheduleDTO.class);

        ExamSchedule fromDb = examScheduleRepository.findById(created.id()).orElseThrow();
        assertThat(fromDb.getSubjectName()).isEqualTo("Integracijski test ispit");
        assertThat(fromDb.getUser().getId()).isEqualTo(testUser.getId());

        mockMvc.perform(get("/exams/{id}", created.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.id().toString()))
                .andExpect(jsonPath("$.subjectName").value("Integracijski test ispit"));
    }
}