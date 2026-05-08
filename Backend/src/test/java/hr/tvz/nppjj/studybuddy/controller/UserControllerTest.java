package hr.tvz.nppjj.studybuddy.controller;

import tools.jackson.databind.ObjectMapper;
import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.requests.RefreshTokenRequest;
import hr.tvz.nppjj.studybuddy.requests.UpdateUserRequest;
import hr.tvz.nppjj.studybuddy.requests.UserAuthRequest;
import hr.tvz.nppjj.studybuddy.responses.UserAuthResponse;
import hr.tvz.nppjj.studybuddy.service.TokenBlacklistService;
import hr.tvz.nppjj.studybuddy.service.UserService;
import hr.tvz.nppjj.studybuddy.utils.TokenUserResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.mock.web.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    MockMvc mockMvc;
    @MockitoBean
    UserService userService;
    @MockitoBean
    JwtService jwtService;
    @MockitoBean
    TokenBlacklistService  tokenBlacklistService;
    @MockitoBean
    UserDetailsService userDetailsService;
    @MockitoBean
    TokenUserResolver tokenUserResolver;


    @Autowired
    private ObjectMapper objectMapper;


    private UUID userId;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        userDTO = new UserDTO(userId, "testuser", "test@mail.com");
    }
    @Test
    void getUserByEmail_found() throws Exception {
        when(userService.getUserByEmail("test@mail.com"))
                .thenReturn(Optional.of(userDTO));
        mockMvc.perform(get("/users/user/test@mail.com"))
                .andExpect(status().isFound())
                .andExpect(jsonPath("$.email").value("test@mail.com"));
    }

    @Test
    void getUserByEmail_notFound() throws Exception {
        when(userService.getUserByEmail("test@mail.com"))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/users/user/test@mail.com"))
                .andExpect(status().isNotFound());
    }
    @Test
    void getCurrentUser_validToken() throws Exception {
        String token = "validToken";
        when(tokenUserResolver.resolveUserIdFromToken(token))
                .thenReturn(userId);
        when(userService.getUserById(userId))
                .thenReturn(Optional.of(userDTO));
        mockMvc.perform(get("/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void getCurrentUser_invalidHeader() throws Exception {
        mockMvc.perform(get("/users/me")
                        .header("Authorization", "B"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_userNotFound() throws Exception {
        String token = "validToken";
        when(tokenUserResolver.resolveUserIdFromToken(token))
                .thenReturn(userId);
        when(userService.getUserById(userId))
                .thenReturn(Optional.empty());
        mockMvc.perform(get("/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
    @Test
    void getUsers() throws Exception {
        Page<UserDTO> page = new PageImpl<>(List.of(userDTO));
        when(userService.getUsers(any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username").value("testuser"));
    }
    @Test
    void getUserById_found() throws Exception {
        when(userService.getUserById(userId))
                .thenReturn(Optional.of(userDTO));

        mockMvc.perform(get("/users/user-by-id/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@mail.com"));
    }

    @Test
    void getUserById_notFound() throws Exception {
        when(userService.getUserById(userId))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/users/user-by-id/" + userId))
                .andExpect(status().isNotFound());
    }
    @Test
    void login_success() throws Exception {
        UserAuthRequest request = new UserAuthRequest("testuser", "password");
        UserAuthResponse response = new UserAuthResponse("jwt", "refresh");

        when(userService.authenticate(any()))
                .thenReturn(Optional.of(response));

        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("jwt"));
    }

    @Test
    void login_fail() throws Exception {
        when(userService.authenticate(any()))
                .thenReturn(Optional.empty());
        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UserAuthRequest("test", "wrong"))))
                .andExpect(status().isBadRequest());
    }
    @Test
    void registerUser_success() throws Exception {
        User user = new User(
                null,
                "Admin2",
                "admin2@tvz.hr",
                "password123",
                Role.ROLE_ADMIN
        );

        UserDTO userDTO = new UserDTO(
                UUID.fromString("8cfedf74-77ce-454e-8159-8821d50deef2"),
                "Admin2",
                "admin2@tvz.hr"
        );

            UserAuthResponse authResponse = new UserAuthResponse("access-token", "refresh-token");

            when(userService.newUser(any(User.class)))
                    .thenReturn(Optional.of(userDTO));
            when(userService.authenticate(any(UserAuthRequest.class)))
                    .thenReturn(Optional.of(authResponse));

        mockMvc.perform(post("/users/register-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());
    }

    @Test
    void register_fail() throws Exception {
        when(userService.newUser(any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/users/register-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new User())))
                .andExpect(status().isBadRequest());
    }
    @Test
    void refreshToken() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh");
        UserAuthResponse response = new UserAuthResponse("newJwt", "refresh");
        when(userService.refreshToken("refresh"))
                .thenReturn(response);

        mockMvc.perform(post("/users/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("newJwt"));
    }
    @Test
    void logout_withTokens() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh");

        mockMvc.perform(post("/users/logout")
                        .header("Authorization", "Bearer access")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        verify(tokenBlacklistService).revoke("access");
        verify(tokenBlacklistService).revoke("refresh");
    }
    @Test
    void updateUser_found() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest(userDTO.username(), userDTO.email());
        request.setUsername("updated");

        when(userService.updateUser(eq(userId), any()))
                .thenReturn(Optional.of(userDTO));

        mockMvc.perform(put("/users/update-user/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void updateUser_notFound() throws Exception {
        when(userService.updateUser(eq(userId), any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/users/update-user/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateUserRequest(userDTO.username(), userDTO.email()))))
                .andExpect(status().isNotFound());
    }
    @Test
    void deleteUser_success() throws Exception {
        when(userService.getUserById(userId))
                .thenReturn(Optional.of(userDTO));

        mockMvc.perform(delete("/users/delete-user/" + userId))
                .andExpect(status().isOk());

        verify(userService).deleteUser(userId);
    }

    @Test
    void deleteUser_notFound() throws Exception {
        when(userService.getUserById(userId))
                .thenReturn(Optional.empty());

        mockMvc.perform(delete("/users/delete-user/" + userId))
                .andExpect(status().isNotFound());
    }
}
