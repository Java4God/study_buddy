package hr.tvz.nppjj.studybuddy.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;
import hr.tvz.nppjj.studybuddy.exception.ExamNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.ExamSchedule;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.ExamScheduleRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class ExamScheduleServiceImpl implements ExamScheduleService {

    private final ExamScheduleRepository examScheduleRepository;
    private final UserRepository userRepository;

    @Override
    public Page<ExamScheduleDTO> getAllExams(Pageable pageable) {
        User currentUser = getCurrentUser();
        if (isAdmin(currentUser)) {
            return examScheduleRepository.findAll(pageable).map(this::toDTO);
        }
        return examScheduleRepository.findAllByUserId(currentUser.getId(), pageable).map(this::toDTO);
    }

    @Override
    public List<ExamScheduleDTO> getNextExams() {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(0, 3, Sort.by(Sort.Order.asc("examDate"), Sort.Order.asc("examTime")));
        LocalDate today = LocalDate.now();

        Page<ExamSchedule> nextExams = isAdmin(currentUser)
                ? examScheduleRepository.findByExamDateGreaterThanEqual(today, pageable)
                : examScheduleRepository.findByUserIdAndExamDateGreaterThanEqual(currentUser.getId(), today, pageable);

        return nextExams.stream().map(this::toDTO).toList();
    }

    @Override
    public ExamScheduleDTO getExamById(UUID id) {
        ExamSchedule exam = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
        checkOwnership(exam);
        return toDTO(exam);
    }

    @Override
    @Transactional
    public ExamScheduleDTO createExam(ExamScheduleDTO dto) {
        User currentUser = getCurrentUser();
        ExamSchedule exam = toEntity(dto);
        exam.setUser(currentUser);
        return toDTO(examScheduleRepository.save(exam));
    }

    @Override
    @Transactional
    public ExamScheduleDTO updateExam(UUID id, ExamScheduleDTO dto) {
        ExamSchedule exam = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
        checkOwnership(exam);
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
        ExamSchedule exam = examScheduleRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
        checkOwnership(exam);
        examScheduleRepository.deleteById(id);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Current user not found"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && user.getRole().name().equals("ROLE_ADMIN");
    }

    private void checkOwnership(ExamSchedule exam) {
        User currentUser = getCurrentUser();
        if (!isAdmin(currentUser) && !exam.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to access this exam");
        }
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