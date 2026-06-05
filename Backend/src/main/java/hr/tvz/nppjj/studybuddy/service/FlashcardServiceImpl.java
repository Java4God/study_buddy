package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.FlashcardDTO;
import hr.tvz.nppjj.studybuddy.model.Flashcard;
import hr.tvz.nppjj.studybuddy.repository.FlashcardRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component("db")
@Service
@AllArgsConstructor
public class FlashcardServiceImpl implements FlashcardService{
    private final FlashcardRepository flashcardRepository;

    @Override
    public Optional<FlashcardDTO> findById(UUID uuid) {
        Optional<Flashcard> flashcard = flashcardRepository.findById(uuid);
        return flashcard.map(this::toDto);
    }

    @Override
    public List<FlashcardDTO> findAll() {
        return flashcardRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    public Optional<FlashcardDTO> newFlashcard(Flashcard flashcard) {
        return Optional.of(toDto(flashcardRepository.saveAndFlush(flashcard)));
    }

    @Override
    public Optional<FlashcardDTO> updateFlashcard(UUID uuid, FlashcardDTO flashcardDTO) {
        Optional<Flashcard> flashcard = flashcardRepository.findFlashcardById(uuid);
        if(flashcard.isPresent()){
            return Optional.of(flashcardRepository.saveAndFlush(new Flashcard(uuid,
                    flashcardDTO.question(),
                    flashcardDTO.answer(),
                    flashcardDTO.repetition(),
                    flashcardDTO.easiness(),
                    flashcardDTO.nextReview()))).map(this::toDto);
        }
        return Optional.empty();
    }

    @Override
    public void deleteFlashcard(UUID uuid) {
        flashcardRepository.deleteById(uuid);
    }

    private FlashcardDTO toDto(Flashcard flashcard){
        return new FlashcardDTO(flashcard.getId(),
                flashcard.getQuestion(),
                flashcard.getAnswer(),
                flashcard.getRepetition(),
                flashcard.getEasiness(),
                flashcard.getNextReview());
    }
}
