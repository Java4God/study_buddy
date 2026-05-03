package hr.tvz.nppjj.studybuddy.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroMode;
import hr.tvz.nppjj.studybuddy.service.PomodoroSessionService;
import hr.tvz.nppjj.studybuddy.service.UserService;
import hr.tvz.nppjj.studybuddy.utils.TokenUserResolver;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/pomodoro-sessions")
@AllArgsConstructor
public class PomodoroSessionController {

    private final PomodoroSessionService service;
    private final JwtService jwtService;
    private final UserService userService;
    private final TokenUserResolver tokenUserResolver;

    @GetMapping
    public ResponseEntity<List<PomodoroSessionDTO>> getAll() {
        return ResponseEntity.ok(service.getAllSessions());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PomodoroSessionDTO>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.getSessionsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PomodoroSessionDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getSessionById(id));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<PomodoroSessionDTO> create(
            @PathVariable UUID userId,
            @Valid @RequestBody PomodoroSessionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createSession(dto, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PomodoroSessionDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody PomodoroSessionDTO dto) {
        return ResponseEntity.ok(service.updateSession(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/by-token")
    public ResponseEntity<List<PomodoroSessionDTO>> getByToken(
            @Valid @RequestBody PomodoroTokenRequest request
    ) {
        UUID userId = tokenUserResolver.resolveUserIdFromToken(request.token());
        return ResponseEntity.ok(service.getSessionsByUserId(userId));
    }

    @PostMapping("/by-token/create")
    public ResponseEntity<PomodoroSessionDTO> createByToken(
            @Valid @RequestBody PomodoroSessionTokenRequest request
    ) {
        UUID userId = tokenUserResolver.resolveUserIdFromToken(request.token());
        PomodoroSessionDTO dto = new PomodoroSessionDTO(
                null,
                userId,
                request.mode(),
                request.durationMinutes(),
                request.subject(),
                request.completed(),
                null,
                null
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(service.createSession(dto, userId));
    }

    @GetMapping("/week")
    public ResponseEntity<List<hr.tvz.nppjj.studybuddy.dto.WeeklyPomodoroDTO>> getWeekTotals() {
        return ResponseEntity.ok(service.getWeeklyTotals());
    }

    public record PomodoroTokenRequest(
            @NotBlank(message = "Token is required")
            String token
    ) {
    }

    public record PomodoroSessionTokenRequest(
            @NotBlank(message = "Token is required")
            String token,
            @NotNull(message = "Mode is required")
            PomodoroMode mode,
            @NotNull(message = "Duration is required")
            @Min(value = 1, message = "Duration must be at least 1 minute")
            Integer durationMinutes,
            String subject,
            Boolean completed
    ) {
    }
}