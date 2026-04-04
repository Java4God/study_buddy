package hr.tvz.nppjj.studybuddy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "GOALS")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "target_hours")
    @NotBlank(message = "Target hours must be entered")
    private Integer targetHours;
    @Column(name = "current_hours")
    private Integer currentHours;
    @Column(name = "streak_days")
    private Integer streakDays;
    @Column(name = "week_start")
    private LocalDate weekStart;
}
