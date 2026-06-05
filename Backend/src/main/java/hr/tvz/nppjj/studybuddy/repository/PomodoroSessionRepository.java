package hr.tvz.nppjj.studybuddy.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import hr.tvz.nppjj.studybuddy.model.PomodoroSession;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, UUID> {
    List<PomodoroSession> findAllByUserIdOrderByCompletedAtDesc(UUID userId);

    List<PomodoroSession> findByUserIdAndCompletedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT p FROM PomodoroSession p JOIN FETCH p.user WHERE p.completed = true AND p.completedAt BETWEEN :start AND :end ORDER BY p.user.id, p.completedAt")
    List<PomodoroSession> findCompletedWithUserByCompletedAtBetween(@Param("start") LocalDateTime start,
                                                                     @Param("end") LocalDateTime end);

    @Query("SELECT p FROM PomodoroSession p JOIN FETCH p.user WHERE p.completed = true AND p.user.username = :username AND p.completedAt BETWEEN :start AND :end ORDER BY p.completedAt")
    List<PomodoroSession> findCompletedWithUserByUsernameAndCompletedAtBetween(@Param("username") String username,
                                                                               @Param("start") LocalDateTime start,
                                                                               @Param("end") LocalDateTime end);
}
