package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.FlashcardDTO;
import hr.tvz.nppjj.studybuddy.model.Flashcard;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FlashcardFileServiceImplTest {

    private FlashcardFileServiceImpl flashcardFileService;

    @BeforeEach
    void setUp() {
        flashcardFileService = new FlashcardFileServiceImpl();
    }

    @Test
    void findById_returnsEmptyOptional() {
        UUID id = UUID.randomUUID();

        Optional<FlashcardDTO> result = flashcardFileService.findById(id);

        assertThat(result).isEmpty();
    }

    @Test
    void findAll_returnsEmptyList() {
        List<FlashcardDTO> result = flashcardFileService.findAll();

        assertThat(result).isEmpty();
    }

    @Test
    void newFlashcard_returnsEmptyOptional() {
        Flashcard flashcard = new Flashcard();

        Optional<FlashcardDTO> result = flashcardFileService.newFlashcard(flashcard);

        assertThat(result).isEmpty();
    }

    @Test
    void updateFlashcard_returnsEmptyOptional() {
        UUID id = UUID.randomUUID();
        FlashcardDTO flashcardDTO = new FlashcardDTO(
                null,
                null,
                null,
                null,
                null,
                null
        );

        Optional<FlashcardDTO> result = flashcardFileService.updateFlashcard(id, flashcardDTO);

        assertThat(result).isEmpty();
    }

    @Test
    void deleteFlashcard_doesNotThrow() {
        UUID id = UUID.randomUUID();

        assertThatCode(() -> flashcardFileService.deleteFlashcard(id))
                .doesNotThrowAnyException();
    }
}