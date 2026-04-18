package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.exception.PomodoroSessionNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.PomodoroSession;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.PomodoroSessionRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class PomodoroSessionServiceImpl implements PomodoroSessionService {

    private final PomodoroSessionRepository repository;
    private final UserRepository userRepository;

    @Override
    public List<PomodoroSessionDTO> getAllSessions() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    @Override
    public List<PomodoroSessionDTO> getSessionsByUserId(UUID userId) {
        return repository.findAllByUserIdOrderByCompletedAtDesc(userId)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public PomodoroSessionDTO getSessionById(UUID id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new PomodoroSessionNotFoundException("Pomodoro session not found: " + id));
    }

    @Override
    @Transactional
    public PomodoroSessionDTO createSession(PomodoroSessionDTO dto, UUID userId) {
        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        PomodoroSession session = new PomodoroSession();
        session.setUser(user);
        session.setMode(dto.mode());
        session.setDurationMinutes(dto.durationMinutes());
        session.setSubject(dto.subject());
        session.setCompleted(dto.completed() != null ? dto.completed() : true);
        session.setCompletedAt(dto.completedAt() != null ? dto.completedAt() : LocalDateTime.now());

        return toDTO(repository.save(session));
    }

    @Override
    @Transactional
    public PomodoroSessionDTO updateSession(UUID id, PomodoroSessionDTO dto) {
        PomodoroSession session = repository.findById(id)
                .orElseThrow(() -> new PomodoroSessionNotFoundException("Pomodoro session not found: " + id));

        session.setMode(dto.mode());
        session.setDurationMinutes(dto.durationMinutes());
        session.setSubject(dto.subject());
        if (dto.completed() != null) session.setCompleted(dto.completed());
        if (dto.completedAt() != null) session.setCompletedAt(dto.completedAt());

        return toDTO(repository.save(session));
    }

    @Override
    @Transactional
    public void deleteSession(UUID id) {
        if (!repository.existsById(id)) {
            throw new PomodoroSessionNotFoundException("Pomodoro session not found: " + id);
        }
        repository.deleteById(id);
    }

    private PomodoroSessionDTO toDTO(PomodoroSession session) {
        return new PomodoroSessionDTO(
                session.getId(),
                session.getUser().getId(),
                session.getMode(),
                session.getDurationMinutes(),
                session.getSubject(),
                session.getCompleted(),
                session.getCompletedAt(),
                session.getCreatedAt()
        );
    }
}