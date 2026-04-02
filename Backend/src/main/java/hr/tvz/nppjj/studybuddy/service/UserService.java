package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    Optional<User> getUserByEmail(String email);
    Optional<User> getUserById(UUID uuid);
    List<User> getUsers();
    Optional<User> newUser(User user);
    Optional<User> updateUser(UUID uuid, User user);
    void deleteUser(UUID uuid);
}
