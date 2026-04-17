package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;

import java.util.List;
import java.util.UUID;

public interface PomodoroSessionService {
    List<PomodoroSessionDTO> getAllSessions();
    List<PomodoroSessionDTO> getSessionsByUserId(UUID userId);
    PomodoroSessionDTO getSessionById(UUID id);
    PomodoroSessionDTO createSession(PomodoroSessionDTO dto, UUID userId);
    PomodoroSessionDTO updateSession(UUID id, PomodoroSessionDTO dto);
    void deleteSession(UUID id);
}