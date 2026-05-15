package hr.tvz.nppjj.studybuddy.model;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "FLASHCARDS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @NotBlank(message = "Question must be entered")
    private String question;
    @NotBlank(message = "Answer must be entered")
    private String answer;
    @NotNull(message = "Repetition must be selected")
    private Integer repetition;
    @NotNull(message = "Easiness must be entered")
    private Float easiness;
    @Column(name = "next_review")
    @NotNull(message = "Next review date must be entered")
    private LocalDate nextReview;
}
