package hr.tvz.nppjj.studybuddy.service;

import java.util.List;
import java.util.UUID;

import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.dto.WeeklyPomodoroDTO;

public interface PomodoroSessionService {
    List<PomodoroSessionDTO> getAllSessions();
    List<PomodoroSessionDTO> getSessionsByUserId(UUID userId);
    PomodoroSessionDTO getSessionById(UUID id);
    PomodoroSessionDTO createSession(PomodoroSessionDTO dto, UUID userId);
    PomodoroSessionDTO updateSession(UUID id, PomodoroSessionDTO dto);
    void deleteSession(UUID id);
    List<WeeklyPomodoroDTO> getWeeklyTotals();
    List<WeeklyPomodoroDTO> getHeatmapTotals(java.time.LocalDate from, java.time.LocalDate to);
}