package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.model.User;

import java.util.Optional;

public interface UserService {
    Optional<User> getUserByEmail(String email);
}
