package hr.tvz.nppjj.studybuddy.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import hr.tvz.nppjj.studybuddy.model.PomodoroSession;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, UUID> {
    List<PomodoroSession> findAllByUserIdOrderByCompletedAtDesc(UUID userId);

    List<PomodoroSession> findByUserIdAndCompletedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);
}