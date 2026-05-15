package hr.tvz.nppjj.studybuddy.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import hr.tvz.nppjj.studybuddy.model.Flashcard;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    Optional<Flashcard> findFlashcardById(UUID uuid);
    void deleteById(UUID id);
}
