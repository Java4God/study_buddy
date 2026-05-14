package hr.tvz.nppjj.studybuddy.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import hr.tvz.nppjj.studybuddy.model.ExamSchedule;

@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, UUID> {

    @Query("SELECT e FROM ExamSchedule e WHERE e.examDate >= :startDate AND e.examDate <= :endDate ORDER BY e.examDate ASC")
    List<ExamSchedule> findExamsInDateRange(LocalDate startDate, LocalDate endDate);

    Page<ExamSchedule> findByExamDateGreaterThanEqual(LocalDate startDate, Pageable pageable);

    Page<ExamSchedule> findByUserIdAndExamDateGreaterThanEqual(UUID userId, LocalDate startDate, Pageable pageable);

    Page<ExamSchedule> findAllByUserId(UUID userId, Pageable pageable);

    @Query("SELECT e FROM ExamSchedule e WHERE e.examDate = :targetDate")
    List<ExamSchedule> findAllByExamDate(LocalDate targetDate);
}