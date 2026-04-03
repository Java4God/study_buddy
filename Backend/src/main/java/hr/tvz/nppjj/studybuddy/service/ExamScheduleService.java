package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ExamScheduleService {

    Page<ExamScheduleDTO> getAllExams(Pageable pageable);

    ExamScheduleDTO getExamById(UUID id);

    ExamScheduleDTO createExam(ExamScheduleDTO dto);

    ExamScheduleDTO updateExam(UUID id, ExamScheduleDTO dto);

    void deleteExam(UUID id);
}