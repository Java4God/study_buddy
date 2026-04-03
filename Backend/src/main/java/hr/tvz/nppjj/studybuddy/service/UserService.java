package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    Optional<UserDTO> getUserByEmail(String email);
    Optional<UserDTO> getUserById(UUID uuid);
    Page<UserDTO> getUsers(Pageable pageable);
    Optional<UserDTO> newUser(User user);
    Optional<UserDTO> updateUser(UUID uuid, User user);
    void deleteUser(UUID uuid);
}
