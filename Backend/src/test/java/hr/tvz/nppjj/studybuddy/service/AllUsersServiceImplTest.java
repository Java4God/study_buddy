package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

import static hr.tvz.nppjj.studybuddy.utils.UserDTOUtil.toDTO;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AllUsersService")
class AllUsersServiceImplTest {
    @Mock
    UserRepository userRepository;
    @InjectMocks
    AllUsersServiceImpl userService;


    UUID userId;
    User user;
    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User(userId, "testuser", "test@mail.com", "password", Role.ROLE_BASIC_USER);
    }
    @Test
    void getUsers() {
        Pageable pageable = PageRequest.of(0,1);
        Page<User> users = new PageImpl<>(List.of(user), pageable, 1);
        when(userRepository.findAll(pageable)).thenReturn((users));
        Page<UserDTO> userList = userService.getUsers(pageable);
        assertThat(userList).hasSize(1);
        assertThat(userList).containsExactly(toDTO(user));
    }
}