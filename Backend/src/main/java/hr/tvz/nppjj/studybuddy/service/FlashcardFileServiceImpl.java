package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.FlashcardDTO;
import hr.tvz.nppjj.studybuddy.model.Flashcard;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component("file")
@Service
@AllArgsConstructor
public class FlashcardFileServiceImpl implements FlashcardService{
    @Override
    public Optional<FlashcardDTO> findById(UUID uuid) {
        return Optional.empty();
    }

    @Override
    public List<FlashcardDTO> findAll() {
        return List.of();
    }

    @Override
    public Optional<FlashcardDTO> newFlashcard(Flashcard flashcard) {
        return Optional.empty();
    }

    @Override
    public Optional<FlashcardDTO> updateFlashcard(UUID uuid, FlashcardDTO flashcardDTO) {
        return Optional.empty();
    }

    @Override
    public void deleteFlashcard(UUID uuid) {

    }
}
