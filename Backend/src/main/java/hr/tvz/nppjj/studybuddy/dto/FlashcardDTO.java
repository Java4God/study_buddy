package hr.tvz.nppjj.studybuddy.dto;

import java.time.LocalDate;
import java.util.UUID;

public record FlashcardDTO(
        UUID id,
        String question,
        String answer,
        Integer repetition,
        Float easiness,
        LocalDate nextReview
) {
}
