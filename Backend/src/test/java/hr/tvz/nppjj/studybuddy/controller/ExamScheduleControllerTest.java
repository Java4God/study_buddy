package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.service.ExamReminderService;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import hr.tvz.nppjj.studybuddy.config.JwtAuthenticationFilter;
import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;
import hr.tvz.nppjj.studybuddy.exception.ExamNotFoundException;
import hr.tvz.nppjj.studybuddy.service.ExamScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ExamScheduleController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ExamScheduleController - testovi web sloja")
class ExamScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExamScheduleService examScheduleService;
    @MockitoBean
    private ExamReminderService examReminderService;
    
    private ObjectMapper objectMapper;
    private UUID examId;
    private ExamScheduleDTO sampleDTO;

    @BeforeEach
    void setUp() {
        objectMapper = JsonMapper.builder().build();

        examId = UUID.randomUUID();
        sampleDTO = new ExamScheduleDTO(
                examId,
                "Programiranje u Javi",
                LocalDate.of(2026, 6, 15),
                LocalTime.of(10, 0),
                "Dvorana A1",
                "Ponijeti osobnu"
        );
    }

    @Test
    @DisplayName("GET /exams/{id} - 200 OK i tijelo s ispitom kad ispit postoji")
    void getExamById_kadIspitPostoji_vraca200IDTO() throws Exception {
        when(examScheduleService.getExamById(examId)).thenReturn(sampleDTO);

        mockMvc.perform(get("/exams/{id}", examId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(examId.toString()))
                .andExpect(jsonPath("$.subjectName").value("Programiranje u Javi"))
                .andExpect(jsonPath("$.location").value("Dvorana A1"));
    }

    @Test
    @DisplayName("GET /exams/{id} - 404 kad ispit ne postoji (ExamNotFoundException)")
    void getExamById_kadIspitNePostoji_vraca404() throws Exception {
        when(examScheduleService.getExamById(examId))
                .thenThrow(new ExamNotFoundException("Exam not found with id: " + examId));

        mockMvc.perform(get("/exams/{id}", examId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /exams - 400 kad je tijelo nevažeće (subjectName prazan, datumi null)")
    void createExam_kadJeTijeloNevazece_vraca400() throws Exception {
        String invalidJson = """
                {
                  "subjectName": "",
                  "examDate": null,
                  "examTime": null,
                  "location": "Dvorana C3",
                  "notes": ""
                }
                """;

        mockMvc.perform(post("/exams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /exams - 201 Created kad je tijelo valjano")
    void createExam_kadJeTijeloValjano_vraca201() throws Exception {
        ExamScheduleDTO ulaz = new ExamScheduleDTO(
                null,
                "Baze podataka",
                LocalDate.of(2026, 7, 1),
                LocalTime.of(12, 0),
                "Dvorana B2",
                "Kalkulator"
        );
        when(examScheduleService.createExam(any(ExamScheduleDTO.class))).thenReturn(sampleDTO);

        mockMvc.perform(post("/exams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ulaz)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subjectName").value("Programiranje u Javi"));
    }

    @Test
    @DisplayName("DELETE /exams/{id} - 204 No Content i poziv servisa")
    void deleteExam_kadIspitPostoji_vraca204IPozivaServis() throws Exception {
        mockMvc.perform(delete("/exams/{id}", examId))
                .andExpect(status().isNoContent());

        verify(examScheduleService).deleteExam(eq(examId));
    }

    @Test
    @DisplayName("GET /exams - 200 OK i Page rezultat")
    void getAllExams_vraca200() throws Exception {
        org.springframework.data.domain.Page<ExamScheduleDTO> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of(sampleDTO));
        when(examScheduleService.getAllExams(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/exams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].subjectName").value("Programiranje u Javi"));
    }

    @Test
    @DisplayName("GET /exams/next - 200 OK i lista nadolazećih ispita")
    void getNextExams_vraca200() throws Exception {
        when(examScheduleService.getNextExams()).thenReturn(java.util.List.of(sampleDTO));

        mockMvc.perform(get("/exams/next"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subjectName").value("Programiranje u Javi"));
    }

    @Test
    @DisplayName("PUT /exams/{id} - 200 OK kad je tijelo valjano")
    void updateExam_vraca200() throws Exception {
        ExamScheduleDTO ulaz = new ExamScheduleDTO(
                examId,
                "Napredna Java",
                LocalDate.of(2026, 8, 1),
                LocalTime.of(14, 0),
                "Dvorana C3",
                "Update"
        );
        when(examScheduleService.updateExam(eq(examId), any(ExamScheduleDTO.class)))
                .thenReturn(sampleDTO);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .put("/exams/{id}", examId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ulaz)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /exams/test-reminder - 200 OK i poziva servis")
    void triggerReminderScheduler_vraca200IPozivaServis() throws Exception {
        mockMvc.perform(post("/exams/test-reminder"))
                .andExpect(status().isOk());

        verify(examReminderService).sendRemindersForExamsWithin(3);
    }
}