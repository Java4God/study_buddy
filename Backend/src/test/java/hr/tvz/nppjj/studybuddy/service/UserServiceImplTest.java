package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import hr.tvz.nppjj.studybuddy.requests.UpdateUserRequest;
import hr.tvz.nppjj.studybuddy.requests.UserAuthRequest;
import hr.tvz.nppjj.studybuddy.responses.UserAuthResponse;
import org.junit.jupiter.api.AfterEach;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceImplTest {

    @Mock
    UserRepository userRepository;
    @InjectMocks
    UserServiceImpl userService;
    @Mock
    JwtService jwtService;
    @Mock
    UserDetailsService userDetailsService;
    @Mock
    AuthenticationManager authenticationManager;
    @Mock
    private TokenBlacklistService tokenBlacklistService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    UUID userId;
    User user;
    private static final UUID OTHER_USER_ID = UUID.randomUUID();
    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User(userId, "testuser", "test@mail.com", "password", Role.ROLE_BASIC_USER);
        SecurityContextHolder.clearContext();
    }
    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getUserByEmail() {
        when(userRepository.findUserByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Optional<UserDTO> optionalUser = userService.getUserByEmail(user.getEmail());
        assertThat(optionalUser).isPresent();
        assertThat(optionalUser.get().equals(toDTO(user)));
    }

    @Test
    void getUserByUsername() {
        when(userRepository.findUserByUsername(user.getUsername())).thenReturn(Optional.of(user));
        Optional<UserDTO> optionalUser = userService.getUserByUsername(user.getUsername());
        assertThat(optionalUser).isPresent();
        assertThat(optionalUser.get().equals(toDTO(user)));
    }

    @Test
    void getUserById() {
        when(userRepository.findUserById(user.getId())).thenReturn(Optional.of(user));
        Optional<UserDTO> optionalUser = userService.getUserById(user.getId());
        assertThat(optionalUser).isPresent();
        assertThat(optionalUser.get().equals(toDTO(user)));
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

    @Test
    void authenticate() {
        UserAuthRequest request = new UserAuthRequest("testuser", "password");
        when(jwtService.generateToken(user.getUsername())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user.getUsername())).thenReturn("refresh-token");
        when(userRepository.findUserByUsername(user.getUsername())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(Authentication.class));

        Optional<UserAuthResponse> optionalUserAuthResponse = userService.authenticate(request);
        assertThat(optionalUserAuthResponse).isPresent();
        assertThat(optionalUserAuthResponse.get().accessToken()).isEqualTo("access-token");
        assertThat(optionalUserAuthResponse.get().refreshToken()).isEqualTo("refresh-token");
        verify(authenticationManager).authenticate(
                argThat(token ->
                        token instanceof UsernamePasswordAuthenticationToken &&
                                Objects.equals(token.getPrincipal(), "testuser") &&
                                Objects.equals(token.getCredentials(), "password")
                )
        );
    }

    @Test
    void newUser() {
        user.setPassword(encoder.encode(user.getPassword()));

        when(userRepository.saveAndFlush(any(User.class)))
                .thenReturn(user);
        Optional<UserDTO> userOptional = userService.newUser(user);
        assertThat(userOptional).isPresent();
        assertThat(userOptional.get().equals(toDTO(user)));

    }

    private void setAuthenticatedUser(String username, Role role) {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(username);
        SecurityContextHolder.getContext().setAuthentication(auth);

        User currentUser = new User(
                userId,
                username,
                username + "@test.com",
                "password",
                role
        );

        when(userRepository.findUserByUsername(username))
                .thenReturn(Optional.of(currentUser));
    }

    @Test
    void updateUser_success_normalUserUpdatesOwnProfile() {
        UUID targetId = userId; // updating own profile
        UpdateUserRequest request = new UpdateUserRequest("newuser", "new@test.com");

        Role role = Role.ROLE_BASIC_USER;
        setAuthenticatedUser(user.getUsername(), role);

        User targetUser = new User(
                targetId,
                user.getUsername(),
                user.getUsername() + "@test.com",
                "password",
                role
        );

        when(userRepository.findUserById(targetId)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(targetUser)).thenReturn(targetUser);

        Optional<UserDTO> result = userService.updateUser(targetId, request);

        assertThat(result).isPresent();
        UserDTO dto = result.get();
        assertThat(dto.username()).isEqualTo("newuser");
        assertThat(dto.email()).isEqualTo("new@test.com");

        verify(userRepository).findUserByUsername(user.getUsername());
        verify(userRepository).findUserById(targetId);
        verify(userRepository).save(targetUser);
    }

    @Test
    void updateUser_accessDenied_whenNormalUserTriesToUpdateOthersProfile() {
        UpdateUserRequest request = new UpdateUserRequest("newuser", "new@test.com");

        Role role = Role.ROLE_BASIC_USER;
        setAuthenticatedUser(user.getUsername(), role);

        assertThatThrownBy(() -> userService.updateUser(OTHER_USER_ID, request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You can only update your own profile");

        verify(userRepository).findUserByUsername(user.getUsername());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUser_success_adminUpdatesAnyUser() {
        UUID targetId = OTHER_USER_ID;
        UpdateUserRequest request = new UpdateUserRequest("newuser", "new@test.com");

        Role adminRole = Role.ROLE_ADMIN;
        setAuthenticatedUser(user.getUsername(), adminRole);

        User targetUser = new User(
                targetId,
                "testuser2",
                "testuser2" + "@test.com",
                "password",
                Role.ROLE_BASIC_USER
        );

        when(userRepository.findUserById(targetId)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(targetUser)).thenReturn(targetUser);

        Optional<UserDTO> result = userService.updateUser(targetId, request);

        assertThat(result).isPresent();
        UserDTO dto = result.get();
        assertThat(dto.username()).isEqualTo("newuser");
        assertThat(dto.email()).isEqualTo("new@test.com");

        verify(userRepository).findUserByUsername(user.getUsername());
        verify(userRepository).findUserById(targetId);
        verify(userRepository).save(targetUser);
    }


    @Test
    void updateUser_onlyUpdatesProvidedFields_nullAndBlankFieldsIgnored() {
        UUID targetId = userId;
        UpdateUserRequest request = new UpdateUserRequest(null, "only@email.com");

        Role role = Role.ROLE_BASIC_USER;
        setAuthenticatedUser(user.getUsername(), role);

        User targetUser = new User(
                targetId,
                user.getUsername(),
                user.getUsername() + "@test.com",
                "password",
                role
        );

        when(userRepository.findUserById(targetId)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(targetUser)).thenReturn(targetUser);

        Optional<UserDTO> result = userService.updateUser(targetId, request);

        assertThat(result).isPresent();
        UserDTO dto = result.get();
        assertThat(dto.username()).isEqualTo(user.getUsername());
        assertThat(dto.email()).isEqualTo("only@email.com");

        verify(userRepository).save(targetUser);
    }

    @Test
    void deleteUser() {
        userService.deleteUser(userId);
        verify(userRepository).deleteById(userId);
    }

    @Test
    void refreshToken_returnsNull_whenTokenIsRevoked() {
        when(tokenBlacklistService.isRevoked("refresh-token")).thenReturn(true);

        UserAuthResponse response = userService.refreshToken("refresh-token");

        assertThat(response).isNull();
        verify(jwtService, never()).extractUsername(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    @Test
    void refreshToken_returnsNull_whenTokenIsInvalid() {
        when(tokenBlacklistService.isRevoked("refresh-token")).thenReturn(false);
        when(jwtService.extractUsername("refresh-token")).thenReturn("testuser");
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtService.isTokenValid("refresh-token", userDetails)).thenReturn(false);
        UserAuthResponse response = userService.refreshToken("refresh-token");
        assertThat(response).isNull();
        verify(jwtService, never()).generateToken(anyString());
    }

    @Test
    void refreshToken_success_returnsNewJwtToken() {
        when(tokenBlacklistService.isRevoked("refresh-token")).thenReturn(false);
        when(jwtService.extractUsername("refresh-token")).thenReturn("testuser");

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtService.isTokenValid("refresh-token", userDetails)).thenReturn(true);
        when(jwtService.generateToken("testuser")).thenReturn("new-jwt-token");

        UserAuthResponse response = userService.refreshToken("refresh-token");

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("new-jwt-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");

        verify(tokenBlacklistService).isRevoked("refresh-token");
        verify(jwtService).extractUsername("refresh-token");
        verify(userDetailsService).loadUserByUsername("testuser");
        verify(jwtService).isTokenValid("refresh-token", userDetails);
        verify(jwtService).generateToken("testuser");
    }


    private UserDTO toDTO(User user){
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}