package hr.tvz.nppjj.studybuddy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ACHIEVEMENTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @NotBlank(message = "Name must be entered")
    private String name;
    @NotBlank(message = "Description must be entered")
    private String description;
    @Column(name = "earned_at")
    private LocalDateTime earnedAt;
}

