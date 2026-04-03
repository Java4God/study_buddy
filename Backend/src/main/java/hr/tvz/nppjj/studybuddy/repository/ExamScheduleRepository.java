package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, UUID> {

    @Query("SELECT e FROM ExamSchedule e WHERE e.examDate >= :startDate AND e.examDate <= :endDate ORDER BY e.examDate ASC")
    List<ExamSchedule> findExamsInDateRange(LocalDate startDate, LocalDate endDate);
}