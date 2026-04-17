package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.model.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, UUID> {
    List<PomodoroSession> findAllByUserIdOrderByCompletedAtDesc(UUID userId);
}