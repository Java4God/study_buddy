package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.ChatMessageDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.CustomUserDetails;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.service.ChatService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ChatRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChatService chatService;

    private UUID roomId;
    private ChatMessageDTO messageDto;

    @BeforeEach
    void setUp() {
        roomId = UUID.randomUUID();
        messageDto = new ChatMessageDTO(
                UUID.randomUUID(),
                roomId,
                UUID.randomUUID(),
                "testuser",
                "Hello world",
                LocalDateTime.of(2026, 5, 28, 18, 30)
        );

        User userEntity = new User();
        userEntity.setUsername("testuser");
        userEntity.setRole(Role.ROLE_BASIC_USER);
        CustomUserDetails principal = new CustomUserDetails(userEntity);

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getRecent_returnsMessages() throws Exception {
        when(chatService.getRecentMessages(roomId, "testuser", 50))
                .thenReturn(List.of(messageDto));

        mockMvc.perform(get("/rooms/{roomId}/messages", roomId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roomId").value(roomId.toString()))
                .andExpect(jsonPath("$[0].senderUsername").value("testuser"))
                .andExpect(jsonPath("$[0].content").value("Hello world"));

        verify(chatService).getRecentMessages(roomId, "testuser", 50);
    }

    @Test
    void getRecent_usesCustomLimit() throws Exception {
        when(chatService.getRecentMessages(roomId, "testuser", 10))
                .thenReturn(List.of(messageDto));

        mockMvc.perform(get("/rooms/{roomId}/messages", roomId)
                        .param("limit", "10"))
                .andExpect(status().isOk());

        verify(chatService).getRecentMessages(roomId, "testuser", 10);
    }

    @Test
    void getOlder_returnsMessages() throws Exception {
        LocalDateTime before = LocalDateTime.of(2026, 5, 28, 18, 0);

        when(chatService.getOlderMessages(roomId, "testuser", before, 50))
                .thenReturn(List.of(messageDto));

        mockMvc.perform(get("/rooms/{roomId}/messages/before", roomId)
                        .param("before", "2026-05-28T18:00:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Hello world"));

        verify(chatService).getOlderMessages(roomId, "testuser", before, 50);
    }

    @Test
    void getOlder_usesCustomLimit() throws Exception {
        LocalDateTime before = LocalDateTime.of(2026, 5, 28, 18, 0);

        when(chatService.getOlderMessages(roomId, "testuser", before, 5))
                .thenReturn(List.of(messageDto));

        mockMvc.perform(get("/rooms/{roomId}/messages/before", roomId)
                        .param("before", "2026-05-28T18:00:00")
                        .param("limit", "5"))
                .andExpect(status().isOk());

        verify(chatService).getOlderMessages(roomId, "testuser", before, 5);
    }
}