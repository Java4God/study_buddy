package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    Optional<Flashcard> findFlashcardById(UUID uuid);
    void deleteById(UUID id);
}
