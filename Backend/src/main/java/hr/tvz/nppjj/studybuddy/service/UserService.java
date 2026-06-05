package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.requests.UpdateUserRequest;
import hr.tvz.nppjj.studybuddy.requests.UserAuthRequest;
import hr.tvz.nppjj.studybuddy.responses.UserAuthResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService extends SuperUserService{
    Optional<UserDTO> getUserByEmail(String email);
    Optional<UserDTO> getUserByUsername(String username);
    Optional<UserDTO> getUserById(UUID uuid);
    Optional<UserDTO> newUser(User user);
    Optional<UserDTO> updateUser(UUID uuid, UpdateUserRequest user);
    void deleteUser(UUID uuid);

    Optional<UserAuthResponse> authenticate(UserAuthRequest request);
    UserAuthResponse refreshToken(String refreshToken);
}
