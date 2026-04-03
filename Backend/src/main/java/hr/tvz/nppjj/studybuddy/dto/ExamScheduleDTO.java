package hr.tvz.nppjj.studybuddy.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ExamScheduleDTO(
        UUID id,
        String subjectName,
        LocalDate examDate,
        LocalTime examTime,
        String location,
        String notes
) {}