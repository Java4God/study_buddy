package hr.tvz.nppjj.studybuddy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

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
    @NotBlank(message = "Repetition must be selected")
    private Integer repetition;
    @NotBlank(message = "Easiness must be entered")
    private Float easiness;
    @Column(name = "next_review")
    @NotBlank(message = "Next review date must be entered")
    private LocalDate nextReview;
}
