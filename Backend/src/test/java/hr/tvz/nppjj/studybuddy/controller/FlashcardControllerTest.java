package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.FlashcardDTO;
import hr.tvz.nppjj.studybuddy.model.Flashcard;
import hr.tvz.nppjj.studybuddy.service.FlashcardService;
import hr.tvz.nppjj.studybuddy.service.TokenBlacklistService;
import hr.tvz.nppjj.studybuddy.service.UserService;
import hr.tvz.nppjj.studybuddy.utils.TokenUserResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FlashcardController.class)
class FlashcardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    JwtService jwtService;
    @MockitoBean
    TokenBlacklistService tokenBlacklistService;
    @MockitoBean
    UserDetailsService userDetailsService;


    @MockitoBean
    private FlashcardService flashcardService;

    private UUID flashcardId;
    private Flashcard flashcard;
    private FlashcardDTO flashcardDTO;

    @BeforeEach
    void setUp() {
        flashcardId = UUID.randomUUID();

        flashcard = new Flashcard(
                flashcardId,
                "What is Java?",
                "A programming language",
                1,
                2.5f,
                LocalDate.of(2026, 5, 30)
        );

        flashcardDTO = new FlashcardDTO(
                flashcardId,
                "What is Java?",
                "A programming language",
                1,
                2.5f,
                LocalDate.of(2026, 5, 30)
        );
    }

    @Test
    void getById_returnsOk_whenFlashcardExists() throws Exception {
        when(flashcardService.findById(flashcardId)).thenReturn(Optional.of(flashcardDTO));

        mockMvc.perform(get("/flashcards/{uuid}", flashcardId))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(flashcardId.toString()))
                .andExpect(jsonPath("$.question").value("What is Java?"))
                .andExpect(jsonPath("$.answer").value("A programming language"))
                .andExpect(jsonPath("$.repetition").value(1))
                .andExpect(jsonPath("$.easiness").value(2.5))
                .andExpect(jsonPath("$.nextReview").value("2026-05-30"));

        verify(flashcardService).findById(flashcardId);
    }

    @Test
    void getById_returnsNotFound_whenFlashcardDoesNotExist() throws Exception {
        when(flashcardService.findById(flashcardId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/flashcards/{uuid}", flashcardId))
                .andExpect(status().isNotFound());

        verify(flashcardService).findById(flashcardId);
    }

    @Test
    void getAll_returnsAllFlashcards() throws Exception {
        when(flashcardService.findAll()).thenReturn(List.of(flashcardDTO));

        mockMvc.perform(get("/flashcards"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(flashcardId.toString()))
                .andExpect(jsonPath("$[0].question").value("What is Java?"))
                .andExpect(jsonPath("$[0].answer").value("A programming language"));

        verify(flashcardService).findAll();
    }

    @Test
    void newFlashcard_returnsOk_whenCreated() throws Exception {
        when(flashcardService.newFlashcard(any(Flashcard.class))).thenReturn(Optional.of(flashcardDTO));

        mockMvc.perform(post("/flashcards/new")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(flashcard)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(flashcardId.toString()))
                .andExpect(jsonPath("$.question").value("What is Java?"))
                .andExpect(jsonPath("$.answer").value("A programming language"));

        verify(flashcardService).newFlashcard(any(Flashcard.class));
    }

    @Test
    void newFlashcard_returnsBadRequest_whenCreationFails() throws Exception {
        when(flashcardService.newFlashcard(any(Flashcard.class))).thenReturn(Optional.empty());

        mockMvc.perform(post("/flashcards/new")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(flashcard)))
                .andExpect(status().isBadRequest());

        verify(flashcardService).newFlashcard(any(Flashcard.class));
    }

    @Test
    void updateFlashcard_returnsOk_whenUpdated() throws Exception {
        when(flashcardService.updateFlashcard(eq(flashcardId), any(FlashcardDTO.class)))
                .thenReturn(Optional.of(flashcardDTO));

        mockMvc.perform(put("/flashcards/update/{uuid}", flashcardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(flashcardDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(flashcardId.toString()))
                .andExpect(jsonPath("$.question").value("What is Java?"));

        verify(flashcardService).updateFlashcard(eq(flashcardId), any(FlashcardDTO.class));
    }

    @Test
    void updateFlashcard_returnsBadRequest_whenUpdateFails() throws Exception {
        when(flashcardService.updateFlashcard(eq(flashcardId), any(FlashcardDTO.class)))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/flashcards/update/{uuid}", flashcardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(flashcardDTO)))
                .andExpect(status().isBadRequest());

        verify(flashcardService).updateFlashcard(eq(flashcardId), any(FlashcardDTO.class));
    }

    @Test
    void deleteFlashcard_returnsNoContent_whenFlashcardExists() throws Exception {
        when(flashcardService.findById(flashcardId)).thenReturn(Optional.of(flashcardDTO));

        mockMvc.perform(delete("/flashcards/delete/{uuid}", flashcardId))
                .andExpect(status().isNoContent());

        verify(flashcardService).findById(flashcardId);
        verify(flashcardService).deleteFlashcard(flashcardId);
    }

    @Test
    void deleteFlashcard_returnsBadRequest_whenFlashcardDoesNotExist() throws Exception {
        when(flashcardService.findById(flashcardId)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/flashcards/delete/{uuid}", flashcardId))
                .andExpect(status().isBadRequest());

        verify(flashcardService).findById(flashcardId);
        verify(flashcardService, never()).deleteFlashcard(any(UUID.class));
    }
}
