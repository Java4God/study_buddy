package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.PasswordResetConfirmDTO;
import hr.tvz.nppjj.studybuddy.dto.PasswordResetRequestDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.PasswordResetToken;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.PasswordResetTokenRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import hr.tvz.nppjj.studybuddy.service.PasswordResetService;
import hr.tvz.nppjj.studybuddy.service.TokenBlacklistService;
import hr.tvz.nppjj.studybuddy.utils.TokenUserResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PasswordResetController.class)
@AutoConfigureMockMvc(addFilters = false)
class PasswordResetControllerTest {
    @Autowired
    MockMvc mockMvc;
    @MockitoBean
    PasswordResetService passwordResetService;
    @MockitoBean
    PasswordResetTokenRepository passwordResetTokenRepository;
    @MockitoBean
    UserRepository userRepository;
    @MockitoBean
    JwtService jwtService;
    @MockitoBean
    TokenBlacklistService tokenBlacklistService;
    @MockitoBean
    UserDetailsService userDetailsService;
    @MockitoBean
    TokenUserResolver tokenUserResolver;
    @Autowired
    private ObjectMapper objectMapper;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User(UUID.randomUUID(), "testuser", "testuser@tvz.hr",
                "password", Role.ROLE_BASIC_USER);
    }
    @Test
    void requestReset() throws Exception {
        when(userRepository.findUserByEmail("testuser@tvz.hr")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any())).thenReturn(Optional.empty());

        mockMvc.perform(post("/password-reset/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetRequestDTO("testuser@tvz.hr"))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Password reset link has been sent to your" +
                        " email if the account exists"));
    }

    @Test
    void confirmReset() throws Exception {
        when(passwordResetTokenRepository.findByToken("token"))
                .thenReturn(Optional.of(new PasswordResetToken(UUID.randomUUID(), "token", user,
                        LocalDateTime.now().plusHours(1),false, LocalDateTime.now().minusHours(1))));
        when(passwordResetTokenRepository.save(any())).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenReturn(Optional.empty());


        mockMvc.perform(post("/password-reset/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetConfirmDTO("token", "password"))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Password has been successfully reset"));
    }
}