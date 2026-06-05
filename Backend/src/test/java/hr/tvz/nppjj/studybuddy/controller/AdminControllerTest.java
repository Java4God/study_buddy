package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.service.AllUsersService;
import hr.tvz.nppjj.studybuddy.service.TokenBlacklistService;
import hr.tvz.nppjj.studybuddy.service.UserService;
import hr.tvz.nppjj.studybuddy.utils.TokenUserResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired
    MockMvc mockMvc;
    @MockitoBean
    AllUsersService userService;
    @MockitoBean
    JwtService jwtService;
    @MockitoBean
    UserDetailsService userDetailsService;
    @MockitoBean
    TokenBlacklistService tokenBlacklistService;
    @MockitoBean
    TokenUserResolver tokenUserResolver;
    @MockitoBean
    private org.quartz.Scheduler scheduler;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        userDTO = new UserDTO(UUID.randomUUID(), "testuser", "test@mail.com");
    }
    @Test
    void getUsers() throws Exception {
        Page<UserDTO> page = new PageImpl<>(List.of(userDTO));
        when(userService.getUsers(any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username").value("testuser"));
    }

    @Test
    void getStats() throws Exception {
        Page<UserDTO> page = new PageImpl<>(List.of(userDTO));
        when(userService.getUsers(any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string("Total users: 1"));
    }
}