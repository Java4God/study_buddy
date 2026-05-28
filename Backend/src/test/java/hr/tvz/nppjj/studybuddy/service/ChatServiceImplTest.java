package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.ChatMessageDTO;
import hr.tvz.nppjj.studybuddy.exception.ChatAccessException;
import hr.tvz.nppjj.studybuddy.exception.RoomNotFoundException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.ChatMessage;
import hr.tvz.nppjj.studybuddy.model.StudyRoom;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.ChatMessageRepository;
import hr.tvz.nppjj.studybuddy.repository.RoomMemberRepository;
import hr.tvz.nppjj.studybuddy.repository.StudyRoomRepository;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private StudyRoomRepository studyRoomRepository;
    @Mock
    private RoomMemberRepository roomMemberRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatServiceImpl chatService;

    private UUID roomId;
    private UUID userId;
    private StudyRoom room;
    private User user;

    @BeforeEach
    void setUp() {
        roomId = UUID.randomUUID();
        userId = UUID.randomUUID();

        room = new StudyRoom();
        room.setId(roomId);

        user = new User();
        user.setId(userId);
        user.setUsername("testuser");
    }

    @Test
    void sendMessage_returnsDto_whenSuccessful() {
        ChatMessage saved = new ChatMessage();
        saved.setId(UUID.randomUUID());
        saved.setRoom(room);
        saved.setSender(user);
        saved.setContent("Hello");
        saved.setSentAt(LocalDateTime.of(2026, 5, 28, 18, 45));

        when(studyRoomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));
        when(roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)).thenReturn(true);
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(saved);

        ChatMessageDTO result = chatService.sendMessage(roomId, "testuser", "Hello");

        assertThat(result.roomId()).isEqualTo(roomId);
        assertThat(result.senderId()).isEqualTo(userId);
        assertThat(result.senderUsername()).isEqualTo("testuser");
        assertThat(result.content()).isEqualTo("Hello");

        verify(chatMessageRepository).save(any(ChatMessage.class));
    }

    @Test
    void sendMessage_throws_whenRoomNotFound() {
        when(studyRoomRepository.findById(roomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> chatService.sendMessage(roomId, "testuser", "Hello"))
                .isInstanceOf(RoomNotFoundException.class)
                .hasMessage("Room not found");

        verify(userRepository, never()).findUserByUsername(anyString());
        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    void sendMessage_throws_whenUserNotFound() {
        when(studyRoomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> chatService.sendMessage(roomId, "testuser", "Hello"))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("User not found");

        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    void sendMessage_throws_whenUserNotMember() {
        when(studyRoomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));
        when(roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)).thenReturn(false);

        assertThatThrownBy(() -> chatService.sendMessage(roomId, "testuser", "Hello"))
                .isInstanceOf(ChatAccessException.class)
                .hasMessage("You are not a member of this room");

        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    void getRecentMessages_returnsAscendingOrderAfterReverse() {
        ChatMessage newer = new ChatMessage();
        newer.setId(UUID.randomUUID());
        newer.setRoom(room);
        newer.setSender(user);
        newer.setContent("newer");
        newer.setSentAt(LocalDateTime.of(2026, 5, 28, 18, 10));

        ChatMessage older = new ChatMessage();
        older.setId(UUID.randomUUID());
        older.setRoom(room);
        older.setSender(user);
        older.setContent("older");
        older.setSentAt(LocalDateTime.of(2026, 5, 28, 18, 0));

        when(studyRoomRepository.existsById(roomId)).thenReturn(true);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));
        when(roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)).thenReturn(true);
        when(chatMessageRepository.findAllByRoomIdOrderBySentAtDesc(eq(roomId), any(Pageable.class)))
                .thenReturn(List.of(newer, older));

        List<ChatMessageDTO> result = chatService.getRecentMessages(roomId, "testuser", 50);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).content()).isEqualTo("older");
        assertThat(result.get(1).content()).isEqualTo("newer");
    }

    @Test
    void getOlderMessages_returnsAscendingOrderAfterReverse() {
        LocalDateTime before = LocalDateTime.of(2026, 5, 28, 18, 30);

        ChatMessage newer = new ChatMessage();
        newer.setId(UUID.randomUUID());
        newer.setRoom(room);
        newer.setSender(user);
        newer.setContent("second");
        newer.setSentAt(LocalDateTime.of(2026, 5, 28, 18, 10));

        ChatMessage older = new ChatMessage();
        older.setId(UUID.randomUUID());
        older.setRoom(room);
        older.setSender(user);
        older.setContent("first");
        older.setSentAt(LocalDateTime.of(2026, 5, 28, 18, 0));

        when(studyRoomRepository.existsById(roomId)).thenReturn(true);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));
        when(roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)).thenReturn(true);
        when(chatMessageRepository.findOlderMessages(eq(roomId), eq(before), any(Pageable.class)))
                .thenReturn(List.of(newer, older));

        List<ChatMessageDTO> result = chatService.getOlderMessages(roomId, "testuser", before, 50);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).content()).isEqualTo("first");
        assertThat(result.get(1).content()).isEqualTo("second");
    }

    @Test
    void getRecentMessages_throws_whenRoomNotFound() {
        when(studyRoomRepository.existsById(roomId)).thenReturn(false);

        assertThatThrownBy(() -> chatService.getRecentMessages(roomId, "testuser", 50))
                .isInstanceOf(RoomNotFoundException.class)
                .hasMessage("Room not found");
    }

    @Test
    void getRecentMessages_throws_whenUserNotFound() {
        when(studyRoomRepository.existsById(roomId)).thenReturn(true);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> chatService.getRecentMessages(roomId, "testuser", 50))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void getRecentMessages_throws_whenUserNotMember() {
        when(studyRoomRepository.existsById(roomId)).thenReturn(true);
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));
        when(roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)).thenReturn(false);

        assertThatThrownBy(() -> chatService.getRecentMessages(roomId, "testuser", 50))
                .isInstanceOf(ChatAccessException.class)
                .hasMessage("You are not a member of this room");
    }
}