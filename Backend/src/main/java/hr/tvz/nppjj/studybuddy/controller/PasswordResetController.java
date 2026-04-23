package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.PasswordResetConfirmDTO;
import hr.tvz.nppjj.studybuddy.dto.PasswordResetRequestDTO;
import hr.tvz.nppjj.studybuddy.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("password-reset")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/request")
    public ResponseEntity<Map<String, String>> requestReset(@Valid @RequestBody PasswordResetRequestDTO dto) {
        passwordResetService.requestPasswordReset(dto);
        return ResponseEntity.ok(Map.of("message", "Password reset link has been sent to your email if the account exists"));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirmReset(@Valid @RequestBody PasswordResetConfirmDTO dto) {
        passwordResetService.confirmPasswordReset(dto);
        return ResponseEntity.ok(Map.of("message", "Password has been successfully reset"));
    }
}