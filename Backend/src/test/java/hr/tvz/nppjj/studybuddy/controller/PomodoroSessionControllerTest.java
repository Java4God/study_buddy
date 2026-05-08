package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.config.JwtAuthenticationFilter;
import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.dto.WeeklyPomodoroDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroMode;
import hr.tvz.nppjj.studybuddy.exception.PomodoroSessionNotFoundException;
import hr.tvz.nppjj.studybuddy.service.PomodoroSessionService;
import hr.tvz.nppjj.studybuddy.service.UserService;
import hr.tvz.nppjj.studybuddy.utils.TokenUserResolver;
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
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
	controllers = PomodoroSessionController.class,
	excludeFilters = @ComponentScan.Filter(
		type = FilterType.ASSIGNABLE_TYPE,
		classes = JwtAuthenticationFilter.class
	)
)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("PomodoroSessionController - testovi web sloja")
class PomodoroSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PomodoroSessionService pomodoroSessionService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private TokenUserResolver tokenUserResolver;

    private ObjectMapper objectMapper;
    private UUID sessionId;
    private UUID userId;
    private PomodoroSessionDTO sampleDTO;

    @BeforeEach
    void setUp() {
	objectMapper = JsonMapper.builder().build();
	sessionId = UUID.randomUUID();
	userId = UUID.randomUUID();

	sampleDTO = new PomodoroSessionDTO(
		sessionId,
		userId,
		PomodoroMode.FOCUS,
		25,
		"Programiranje",
		true,
		LocalDateTime.of(2026, 6, 15, 10, 0),
		LocalDateTime.of(2026, 6, 15, 9, 0)
	);
    }

    @Test
    @DisplayName("GET /pomodoro-sessions - 200 OK i lista sesija")
    void getAll_vraca200() throws Exception {
	when(pomodoroSessionService.getAllSessions()).thenReturn(List.of(sampleDTO));

	mockMvc.perform(get("/pomodoro-sessions"))
		.andExpect(status().isOk())
		.andExpect(jsonPath("$[0].mode").value("FOCUS"))
		.andExpect(jsonPath("$[0].durationMinutes").value(25));
    }

    @Test
    @DisplayName("GET /pomodoro-sessions/user/{userId} - 200 OK i lista korisnickih sesija")
    void getByUser_vraca200() throws Exception {
	when(pomodoroSessionService.getSessionsByUserId(userId)).thenReturn(List.of(sampleDTO));

	mockMvc.perform(get("/pomodoro-sessions/user/{userId}", userId))
		.andExpect(status().isOk())
		.andExpect(jsonPath("$[0].userId").value(userId.toString()))
		.andExpect(jsonPath("$[0].subject").value("Programiranje"));
    }

    @Test
    @DisplayName("GET /pomodoro-sessions/{id} - 200 OK kad sesija postoji")
    void getById_vraca200() throws Exception {
	when(pomodoroSessionService.getSessionById(sessionId)).thenReturn(sampleDTO);

	mockMvc.perform(get("/pomodoro-sessions/{id}", sessionId))
		.andExpect(status().isOk())
		.andExpect(jsonPath("$.id").value(sessionId.toString()))
		.andExpect(jsonPath("$.mode").value("FOCUS"));
    }

    @Test
    @DisplayName("GET /pomodoro-sessions/{id} - 404 kad sesija ne postoji")
    void getById_kadNePostoji_vraca404() throws Exception {
	when(pomodoroSessionService.getSessionById(sessionId))
		.thenThrow(new PomodoroSessionNotFoundException("Pomodoro session not found: " + sessionId));

	mockMvc.perform(get("/pomodoro-sessions/{id}", sessionId))
		.andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /pomodoro-sessions/user/{userId} - 201 Created kad je tijelo valjano")
    void create_vraca201() throws Exception {
	PomodoroSessionDTO ulaz = new PomodoroSessionDTO(
		null,
		userId,
		PomodoroMode.FOCUS,
		25,
		"Baze podataka",
		true,
		null,
		null
	);
	when(pomodoroSessionService.createSession(any(PomodoroSessionDTO.class), eq(userId)))
		.thenReturn(sampleDTO);

	mockMvc.perform(post("/pomodoro-sessions/user/{userId}", userId)
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(ulaz)))
		.andExpect(status().isCreated())
		.andExpect(jsonPath("$.id").value(sessionId.toString()));
    }

    @Test
    @DisplayName("POST /pomodoro-sessions/user/{userId} - 400 kad je tijelo nevaljano")
    void create_kadJeTijeloNevazece_vraca400() throws Exception {
	String invalidJson = """
		{
		  "mode": null,
		  "durationMinutes": 0
		}
		""";

	mockMvc.perform(post("/pomodoro-sessions/user/{userId}", userId)
			.contentType(MediaType.APPLICATION_JSON)
			.content(invalidJson))
		.andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /pomodoro-sessions/{id} - 200 OK kad je tijelo valjano")
    void update_vraca200() throws Exception {
	PomodoroSessionDTO ulaz = new PomodoroSessionDTO(
		sessionId,
		userId,
		PomodoroMode.SHORT_BREAK,
		5,
		"Pauza",
		false,
		null,
		null
	);
	when(pomodoroSessionService.updateSession(eq(sessionId), any(PomodoroSessionDTO.class)))
		.thenReturn(sampleDTO);

	mockMvc.perform(put("/pomodoro-sessions/{id}", sessionId)
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(ulaz)))
		.andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /pomodoro-sessions/{id} - 204 No Content")
    void delete_vraca204() throws Exception {
	mockMvc.perform(delete("/pomodoro-sessions/{id}", sessionId))
		.andExpect(status().isNoContent());

	verify(pomodoroSessionService).deleteSession(eq(sessionId));
    }

    @Test
    @DisplayName("POST /pomodoro-sessions/by-token - 200 OK i lista sesija")
    void getByToken_vraca200() throws Exception {
	when(tokenUserResolver.resolveUserIdFromToken("valid"))
		.thenReturn(userId);
	when(pomodoroSessionService.getSessionsByUserId(userId)).thenReturn(List.of(sampleDTO));

	String body = """
		{
		  "token": "valid"
		}
		""";

	mockMvc.perform(post("/pomodoro-sessions/by-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content(body))
		.andExpect(status().isOk())
		.andExpect(jsonPath("$[0].userId").value(userId.toString()));
    }

    @Test
    @DisplayName("POST /pomodoro-sessions/by-token/create - 201 Created")
    void createByToken_vraca201() throws Exception {
	when(tokenUserResolver.resolveUserIdFromToken("valid"))
		.thenReturn(userId);
	when(pomodoroSessionService.createSession(any(PomodoroSessionDTO.class), eq(userId)))
		.thenReturn(sampleDTO);

	String body = """
		{
		  "token": "valid",
		  "mode": "FOCUS",
		  "durationMinutes": 25,
		  "subject": "Programiranje",
		  "completed": true
		}
		""";

	mockMvc.perform(post("/pomodoro-sessions/by-token/create")
			.contentType(MediaType.APPLICATION_JSON)
			.content(body))
		.andExpect(status().isCreated())
		.andExpect(jsonPath("$.id").value(sessionId.toString()));

	verify(pomodoroSessionService).createSession(any(PomodoroSessionDTO.class), eq(userId));
    }

    @Test
    @DisplayName("GET /pomodoro-sessions/week - 200 OK i tjedni zbroj")
    void getWeekTotals_vraca200() throws Exception {
	WeeklyPomodoroDTO dto = new WeeklyPomodoroDTO(LocalDate.of(2026, 6, 16), 50);
	when(pomodoroSessionService.getWeeklyTotals()).thenReturn(List.of(dto));

	mockMvc.perform(get("/pomodoro-sessions/week"))
		.andExpect(status().isOk())
		.andExpect(jsonPath("$[0].totalMinutes").value(50));
    }
}
