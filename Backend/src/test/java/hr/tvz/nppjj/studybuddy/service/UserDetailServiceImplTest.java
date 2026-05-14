package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.CustomUserDetails;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserDetailService")
class UserDetailServiceImplTest {
    @Mock
    UserRepository userRepository;
    @InjectMocks
    UserDetailServiceImpl userDetailService;

    User user;

    @BeforeEach
    void setUp() {
        user = new User(UUID.randomUUID(), "testuser", "test@mail.com", "password", Role.ROLE_BASIC_USER);
    }

    @Test
    void loadUserByUsername() {
        when(userRepository.findUserByUsername("testuser")).thenReturn(Optional.of(user));

        UserDetails result = userDetailService.loadUserByUsername("testuser");

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getAuthorities()).hasSize(1);
        assertThat(result.isAccountNonExpired()).isTrue();
        assertThat(result.isAccountNonLocked()).isTrue();
        assertThat(result.isCredentialsNonExpired()).isTrue();
        assertThat(result.isEnabled()).isTrue();

        verify(userRepository).findUserByUsername("testuser");    }
}