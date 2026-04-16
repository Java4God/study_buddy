package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.PasswordResetConfirmDTO;
import hr.tvz.nppjj.studybuddy.dto.PasswordResetRequestDTO;
import hr.tvz.nppjj.studybuddy.exception.InvalidTokenException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.PasswordResetToken;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.PasswordResetTokenRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional
    public void requestPasswordReset(PasswordResetRequestDTO dto) {
        User user = userRepository.findUserByEmail(dto.email())
                .orElseThrow(() -> new UserNotFoundException("No user with email: " + dto.email()));

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false);
        resetToken.setCreatedAt(LocalDateTime.now());

        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(dto.email(), token);
    }

    @Override
    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmDTO dto) {
        PasswordResetToken resetToken = tokenRepository.findByToken(dto.token())
                .orElseThrow(() -> new InvalidTokenException("Invalid or non-existent token"));

        if (resetToken.getUsed()) {
            throw new InvalidTokenException("Token has already been used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}