package hr.tvz.nppjj.studybuddy.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hr.tvz.nppjj.studybuddy.dto.ExamScheduleDTO;
import hr.tvz.nppjj.studybuddy.service.ExamScheduleService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("exams")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ExamScheduleController {

    private final ExamScheduleService examScheduleService;

    @GetMapping
    public Page<ExamScheduleDTO> getAllExams(Pageable pageable) {
        return examScheduleService.getAllExams(pageable);
    }

    @GetMapping("/next")
    public List<ExamScheduleDTO> getNextExams() {
        return examScheduleService.getNextExams();
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