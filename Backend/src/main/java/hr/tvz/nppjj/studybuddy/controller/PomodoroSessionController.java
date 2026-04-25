package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.enumerators.PomodoroMode;
import hr.tvz.nppjj.studybuddy.exception.InvalidTokenException;
import hr.tvz.nppjj.studybuddy.service.PomodoroSessionService;
import hr.tvz.nppjj.studybuddy.service.UserService;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pomodoro-sessions")
@AllArgsConstructor
public class PomodoroSessionController {

    private final PomodoroSessionService service;
    private final JwtService jwtService;
    private final UserService userService;

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
        UUID userId = resolveUserIdFromToken(request.token());
        return ResponseEntity.ok(service.getSessionsByUserId(userId));
    }

    @PostMapping("/by-token/create")
    public ResponseEntity<PomodoroSessionDTO> createByToken(
            @Valid @RequestBody PomodoroSessionTokenRequest request
    ) {
        UUID userId = resolveUserIdFromToken(request.token());
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

    private UUID resolveUserIdFromToken(String token) {
        if (token == null || token.isBlank()) {
            throw new InvalidTokenException("Token is required");
        }

        try {
            String username = jwtService.extractUsername(token);
            if (username == null || username.isBlank()) {
                throw new InvalidTokenException("Invalid token");
            }

            return userService.getUserByUsername(username)
                    .map(user -> user.uuid())
                    .orElseThrow(() -> new InvalidTokenException("User not found for token"));
        } catch (InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid token");
        }
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