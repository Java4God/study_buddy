package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<User> getUserByEmail(String email);
    List<User> getUsers();
    Optional<User> newUser(User user);
}
