package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.service.PomodoroSessionService;
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
}