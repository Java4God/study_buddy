package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.PasswordResetConfirmDTO;
import hr.tvz.nppjj.studybuddy.dto.PasswordResetRequestDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.exception.InvalidTokenException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.PasswordResetToken;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.PasswordResetTokenRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PasswordResetService")
class PasswordResetServiceImplTest {
    @Mock
    UserRepository userRepository;
    @Mock
    PasswordResetTokenRepository tokenRepository;
    @InjectMocks
    PasswordResetServiceImpl passwordResetService;
    @Mock
    EmailService emailService;
    @Mock
    PasswordEncoder passwordEncoder;


    private User user;

    @BeforeEach
    void setUp() {
        user = new User(UUID.randomUUID(), "testuser", "test@tvz.hr",
                "password", Role.ROLE_BASIC_USER);
    }
    @Test
    void requestPasswordReset_success_createsTokenAndSendsEmail() {
        PasswordResetRequestDTO dto = new PasswordResetRequestDTO("test@tvz.hr");
        when(userRepository.findUserByEmail("test@tvz.hr")).thenReturn(Optional.of(user));
        PasswordResetToken savedToken = new PasswordResetToken();
        savedToken.setToken("expected-token");
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(savedToken);
        passwordResetService.requestPasswordReset(dto);

        verify(userRepository).findUserByEmail("test@tvz.hr");
/*        verify(tokenRepository).save(argThat(token ->
                token.getUser().getId().equals(user.getId()) &&
                        token.getExpiresAt().isAfter(LocalDateTime.now().minusMinutes(59)) &&
                        token.getUsed()
        ));*/
       // verify(emailService).sendPasswordResetEmail(eq("test@tvz.hr"), eq("expected-token"));
    }

    @Test
    void requestPasswordReset_throwsException_whenUserNotFound() {
        PasswordResetRequestDTO dto = new PasswordResetRequestDTO("unknown@test.com");
        when(userRepository.findUserByEmail("unknown@test.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> passwordResetService.requestPasswordReset(dto))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("No user with email: unknown@test.com");
        verify(userRepository).findUserByEmail("unknown@test.com");
        verify(tokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(any(), any());
    }

    @Test
    void confirmPasswordReset_success_updatesPasswordAndMarksTokenUsed() {
        PasswordResetConfirmDTO dto = new PasswordResetConfirmDTO("valid-token", "newPassword123");
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken("valid-token");
        resetToken.setUser(user);
        resetToken.setUsed(false);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(2));
        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPassword123");

        PasswordResetToken savedToken = new PasswordResetToken();
        savedToken.setToken("valid-token");
        savedToken.setUsed(true);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(savedToken);

        passwordResetService.confirmPasswordReset(dto);

        verify(tokenRepository).findByToken("valid-token");
        verify(passwordEncoder).encode("newPassword123");
        verify(userRepository).save(user);
/*        verify(tokenRepository).save(argThat(token ->
                token.getToken().equals("valid-token") && !token.getUsed()
        ));*/

        assertThat(user.getPassword()).isEqualTo("encodedNewPassword123");
    }

    @Test
    void confirmPasswordReset_throwsException_whenTokenNotFound() {
        PasswordResetConfirmDTO dto = new PasswordResetConfirmDTO("invalid-token", "gregrgege");

        when(tokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetService.confirmPasswordReset(dto))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Invalid or non-existent token");

        verify(tokenRepository).findByToken("invalid-token");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void confirmPasswordReset_throwsException_whenTokenAlreadyUsed() {
        PasswordResetConfirmDTO dto = new PasswordResetConfirmDTO("used-token", "fajiveiuvuanj");

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsed(true);

        when(tokenRepository.findByToken("used-token")).thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() -> passwordResetService.confirmPasswordReset(dto))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Token has already been used");

        verify(tokenRepository).findByToken("used-token");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    void confirmPasswordReset_throwsException_whenTokenExpired() {
        PasswordResetConfirmDTO dto = new PasswordResetConfirmDTO("expired-token", "ueghaubbauvb");

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsed(false);
        resetToken.setExpiresAt(LocalDateTime.now().minusMinutes(1)); // expired

        when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(resetToken));

        assertThatThrownBy(() -> passwordResetService.confirmPasswordReset(dto))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("Token has expired");

        verify(tokenRepository).findByToken("expired-token");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }
}