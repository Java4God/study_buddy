package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;
import hr.tvz.nppjj.studybuddy.service.ExamScheduleService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("exams")
@AllArgsConstructor
public class ExamScheduleController {

    private final ExamScheduleService examScheduleService;

    @GetMapping
    public Page<ExamScheduleDTO> getAllExams(Pageable pageable) {
        return examScheduleService.getAllExams(pageable);
    }

    @GetMapping("/{id}")
    public ExamScheduleDTO getExamById(@PathVariable UUID id) {
        return examScheduleService.getExamById(id);
    }

    @PostMapping
    public ResponseEntity<ExamScheduleDTO> createExam(@Valid @RequestBody ExamScheduleDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examScheduleService.createExam(dto));
    }

    @PutMapping("/{id}")
    public ExamScheduleDTO updateExam(@PathVariable UUID id, @Valid @RequestBody ExamScheduleDTO dto) {
        return examScheduleService.updateExam(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable UUID id) {
        examScheduleService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }
}