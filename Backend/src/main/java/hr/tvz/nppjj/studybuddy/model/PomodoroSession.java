package hr.tvz.nppjj.studybuddy.model;

import hr.tvz.nppjj.studybuddy.enumerators.PomodoroMode;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pomodoro_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PomodoroSession {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false)
    @NotNull(message = "Mode is required")
    private PomodoroMode mode;

    @Column(name = "duration_minutes", nullable = false)
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @Column(name = "subject")
    private String subject;

    @Column(name = "completed", nullable = false)
    private Boolean completed = true;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (completedAt == null) completedAt = LocalDateTime.now();
    }
}