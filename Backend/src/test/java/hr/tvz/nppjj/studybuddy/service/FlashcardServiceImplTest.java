package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.FlashcardDTO;
import hr.tvz.nppjj.studybuddy.model.Flashcard;
import hr.tvz.nppjj.studybuddy.repository.FlashcardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlashcardServiceImplTest {

    @Mock
    private FlashcardRepository flashcardRepository;

    @InjectMocks
    private FlashcardServiceImpl flashcardService;


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
    void findById_returnsDto_whenFlashcardExists() {
        when(flashcardRepository.findById(flashcardId)).thenReturn(Optional.of(flashcard));

        Optional<FlashcardDTO> result = flashcardService.findById(flashcardId);

        assertThat(result).isPresent();
        assertThat(result.get().id()).isEqualTo(flashcardId);
        assertThat(result.get().question()).isEqualTo("What is Java?");
        assertThat(result.get().answer()).isEqualTo("A programming language");
        assertThat(result.get().repetition()).isEqualTo(1);
        assertThat(result.get().easiness()).isEqualTo(2.5f);
        assertThat(result.get().nextReview()).isEqualTo(LocalDate.of(2026, 5, 30));

        verify(flashcardRepository).findById(flashcardId);
    }

    @Test
    void findById_returnsEmpty_whenFlashcardDoesNotExist() {
        when(flashcardRepository.findById(flashcardId)).thenReturn(Optional.empty());

        Optional<FlashcardDTO> result = flashcardService.findById(flashcardId);

        assertThat(result).isEmpty();
        verify(flashcardRepository).findById(flashcardId);
    }

    @Test
    void findAll_returnsMappedDtos() {
        when(flashcardRepository.findAll()).thenReturn(List.of(flashcard));

        List<FlashcardDTO> result = flashcardService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().id()).isEqualTo(flashcardId);
        assertThat(result.getFirst().question()).isEqualTo("What is Java?");
        assertThat(result.getFirst().answer()).isEqualTo("A programming language");

        verify(flashcardRepository).findAll();
    }

    @Test
    void newFlashcard_returnsSavedDto() {
        when(flashcardRepository.saveAndFlush(flashcard)).thenReturn(flashcard);

        Optional<FlashcardDTO> result = flashcardService.newFlashcard(flashcard);

        assertThat(result).isPresent();
        assertThat(result.get().id()).isEqualTo(flashcardId);
        assertThat(result.get().question()).isEqualTo("What is Java?");
        assertThat(result.get().answer()).isEqualTo("A programming language");

        verify(flashcardRepository).saveAndFlush(flashcard);
    }

    @Test
    void updateFlashcard_returnsUpdatedDto_whenFlashcardExists() {
        FlashcardDTO updatedDto = new FlashcardDTO(
                flashcardId,
                "Updated question",
                "Updated answer",
                2,
                2.8f,
                LocalDate.of(2026, 6, 5)
        );

        Flashcard updatedFlashcard = new Flashcard(
                flashcardId,
                "Updated question",
                "Updated answer",
                2,
                2.8f,
                LocalDate.of(2026, 6, 5)
        );

        when(flashcardRepository.findFlashcardById(flashcardId)).thenReturn(Optional.of(flashcard));
        when(flashcardRepository.saveAndFlush(any(Flashcard.class))).thenReturn(updatedFlashcard);

        Optional<FlashcardDTO> result = flashcardService.updateFlashcard(flashcardId, updatedDto);

        assertThat(result).isPresent();
        assertThat(result.get().id()).isEqualTo(flashcardId);
        assertThat(result.get().question()).isEqualTo("Updated question");
        assertThat(result.get().answer()).isEqualTo("Updated answer");
        assertThat(result.get().repetition()).isEqualTo(2);
        assertThat(result.get().easiness()).isEqualTo(2.8f);
        assertThat(result.get().nextReview()).isEqualTo(LocalDate.of(2026, 6, 5));

        verify(flashcardRepository).findFlashcardById(flashcardId);
        verify(flashcardRepository).saveAndFlush(any(Flashcard.class));
    }

    @Test
    void updateFlashcard_returnsEmpty_whenFlashcardDoesNotExist() {
        when(flashcardRepository.findFlashcardById(flashcardId)).thenReturn(Optional.empty());

        Optional<FlashcardDTO> result = flashcardService.updateFlashcard(flashcardId, flashcardDTO);

        assertThat(result).isEmpty();
        verify(flashcardRepository).findFlashcardById(flashcardId);
        verify(flashcardRepository, never()).saveAndFlush(any(Flashcard.class));
    }

    @Test
    void deleteFlashcard_callsRepositoryDeleteById() {
        flashcardService.deleteFlashcard(flashcardId);

        verify(flashcardRepository).deleteById(flashcardId);
    }
}