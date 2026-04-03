package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;
import hr.tvz.nppjj.studybuddy.exception.ExamNotFoundException;
import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import hr.tvz.nppjj.studybuddy.repository.ExamScheduleRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class ExamScheduleServiceImpl implements ExamScheduleService {

    private final ExamScheduleRepository examScheduleRepository;

    @Override
    public Page<ExamScheduleDTO> getAllExams(Pageable pageable) {
        return examScheduleRepository.findAll(pageable).map(this::toDTO);
    }

    @Override
    public ExamScheduleDTO getExamById(UUID id) {
        ExamSchedule exam = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
        return toDTO(exam);
    }

    @Override
    @Transactional
    public ExamScheduleDTO createExam(ExamScheduleDTO dto) {
        ExamSchedule exam = toEntity(dto);
        return toDTO(examScheduleRepository.save(exam));
    }

    @Override
    @Transactional
    public ExamScheduleDTO updateExam(UUID id, ExamScheduleDTO dto) {
        ExamSchedule exam = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
        exam.setSubjectName(dto.subjectName());
        exam.setExamDate(dto.examDate());
        exam.setExamTime(dto.examTime());
        exam.setLocation(dto.location());
        exam.setNotes(dto.notes());
        return toDTO(exam);
    }

    @Override
    @Transactional
    public void deleteExam(UUID id) {
        if (!examScheduleRepository.existsById(id)) {
            throw new ExamNotFoundException("Exam not found with id: " + id);
        }
        examScheduleRepository.deleteById(id);
    }

    private ExamScheduleDTO toDTO(ExamSchedule exam) {
        return new ExamScheduleDTO(
                exam.getId(),
                exam.getSubjectName(),
                exam.getExamDate(),
                exam.getExamTime(),
                exam.getLocation(),
                exam.getNotes()
        );
    }

    private ExamSchedule toEntity(ExamScheduleDTO dto) {
        ExamSchedule exam = new ExamSchedule();
        exam.setSubjectName(dto.subjectName());
        exam.setExamDate(dto.examDate());
        exam.setExamTime(dto.examTime());
        exam.setLocation(dto.location());
        exam.setNotes(dto.notes());
        return exam;
    }
}