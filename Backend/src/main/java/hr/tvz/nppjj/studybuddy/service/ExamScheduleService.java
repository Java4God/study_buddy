package hr.tvz.nppjj.studybuddy.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;

public interface ExamScheduleService {

    Page<ExamScheduleDTO> getAllExams(Pageable pageable);

    List<ExamScheduleDTO> getNextExams();

    ExamScheduleDTO getExamById(UUID id);

    ExamScheduleDTO createExam(ExamScheduleDTO dto);

    ExamScheduleDTO updateExam(UUID id, ExamScheduleDTO dto);

    void deleteExam(UUID id);
}