package hr.tvz.nppjj.studybuddy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ExamScheduleDTO(
        UUID id,
        @NotBlank(message = "Subject name is required")
        String subjectName,
        @NotNull(message = "Exam date is required")
        LocalDate examDate,
        @NotNull(message = "Exam time is required")
        LocalTime examTime,
        String location,
        String notes
) {}