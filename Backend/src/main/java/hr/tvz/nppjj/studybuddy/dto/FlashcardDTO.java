package hr.tvz.nppjj.studybuddy.dto;

import java.time.LocalDate;

public record FlashcardDTO(
        String question,
        String answer,
        Integer repetition,
        Float easiness,
        LocalDate nextReview
) {
}
