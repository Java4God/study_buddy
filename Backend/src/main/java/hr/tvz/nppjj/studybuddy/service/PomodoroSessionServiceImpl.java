package hr.tvz.nppjj.studybuddy.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.dto.WeeklyPomodoroDTO;
import hr.tvz.nppjj.studybuddy.exception.PomodoroSessionNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.PomodoroSession;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.PomodoroSessionRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class PomodoroSessionServiceImpl implements PomodoroSessionService {

    private final PomodoroSessionRepository repository;
    private final UserRepository userRepository;

    @Override
    public List<PomodoroSessionDTO> getAllSessions() {
        User currentUser = getCurrentUser();
        if (isAdmin(currentUser)) {
            return repository.findAll().stream().map(this::toDTO).toList();
        }
        return repository.findAllByUserIdOrderByCompletedAtDesc(currentUser.getId())
                .stream().map(this::toDTO).toList();
    }

    @Override
    public List<PomodoroSessionDTO> getSessionsByUserId(UUID userId) {
        User currentUser = getCurrentUser();
        if (!isAdmin(currentUser) && !currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to view these sessions");
        }
        return repository.findAllByUserIdOrderByCompletedAtDesc(userId)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public PomodoroSessionDTO getSessionById(UUID id) {
        PomodoroSession session = repository.findById(id)
                .orElseThrow(() -> new PomodoroSessionNotFoundException("Pomodoro session not found: " + id));
        checkOwnership(session);
        return toDTO(session);
    }

    @Override
    @Transactional
    public PomodoroSessionDTO createSession(PomodoroSessionDTO dto, UUID userId) {
        User currentUser = getCurrentUser();
        if (!isAdmin(currentUser) && !currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("You can only create sessions for yourself");
        }

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
        checkOwnership(session);

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
        PomodoroSession session = repository.findById(id)
                .orElseThrow(() -> new PomodoroSessionNotFoundException("Pomodoro session not found: " + id));
        checkOwnership(session);
        repository.deleteById(id);
    }

        @Override
        public List<WeeklyPomodoroDTO> getWeeklyTotals() {
        User currentUser = getCurrentUser();

        // ISO week starting Monday
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);

        LocalDateTime start = monday.atStartOfDay();
        LocalDateTime end = sunday.atTime(LocalTime.MAX);

        List<PomodoroSession> sessions = isAdmin(currentUser)
            ? repository.findByUserIdAndCompletedAtBetween(currentUser.getId(), start, end)
            : repository.findByUserIdAndCompletedAtBetween(currentUser.getId(), start, end);

        Map<LocalDate, Integer> grouped = sessions.stream()
            .collect(Collectors.groupingBy(s -> s.getCompletedAt().toLocalDate(), Collectors.summingInt(PomodoroSession::getDurationMinutes)));

        // ensure all 7 days present
        return monday.datesUntil(monday.plusDays(7))
            .map(d -> new WeeklyPomodoroDTO(d, grouped.getOrDefault(d, 0)))
            .collect(Collectors.toList());
        }

    @Override
    public List<WeeklyPomodoroDTO> getHeatmapTotals(LocalDate from, LocalDate to) {
        User currentUser = getCurrentUser();

        if (from == null || to == null) {
            throw new IllegalArgumentException("Both 'from' and 'to' dates are required");
        }
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("'from' date must be before or equal to 'to' date");
        }

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        List<PomodoroSession> sessions =
                repository.findByUserIdAndCompletedAtBetween(currentUser.getId(), start, end);

        Map<LocalDate, Integer> grouped = sessions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getCompletedAt().toLocalDate(),
                        Collectors.summingInt(PomodoroSession::getDurationMinutes)));

        // vrati zapis za svaki dan u rasponu, i one s 0 minuta (heatmap treba sve dane)
        return from.datesUntil(to.plusDays(1))
                .map(d -> new WeeklyPomodoroDTO(d, grouped.getOrDefault(d, 0)))
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Current user not found"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && user.getRole().name().equals("ROLE_ADMIN");
    }

    private void checkOwnership(PomodoroSession session) {
        User currentUser = getCurrentUser();
        if (!isAdmin(currentUser) && !session.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to access this session");
        }
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