package hr.tvz.nppjj.studybuddy.service;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

import hr.tvz.nppjj.studybuddy.dto.FlashcardDTO;
import hr.tvz.nppjj.studybuddy.model.Flashcard;

public interface FlashcardService {
    Optional<FlashcardDTO> findById(UUID uuid);
    List<FlashcardDTO> findAll();
    Optional<FlashcardDTO> newFlashcard(Flashcard flashcard);
    Optional<FlashcardDTO> updateFlashcard(UUID uuid, FlashcardDTO flashcardDTO);
    void deleteFlashcard(UUID uuid);
}
