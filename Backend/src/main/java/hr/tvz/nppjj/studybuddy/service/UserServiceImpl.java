package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService{
    UserRepository userRepository;
    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    @Override
    public Optional<User> getUserById(UUID uuid) {
        return userRepository.findUserById(uuid);
    }

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> newUser(User user) {
        return Optional.of(userRepository.saveAndFlush(user));
    }

    @Override
    public Optional<User> updateUser(UUID uuid, User user) {
        try{
            userRepository.findUserById(uuid).map(u->{
                u.setId(uuid);
                u.setPassword(user.getPassword());
                u.setUsername(user.getUsername());
                return userRepository.save(u);
            }).orElseThrow(() -> new RuntimeException("User not found!"));
            user.setId(uuid);
        }catch (RuntimeException e){
            return Optional.empty();
        }
        return Optional.of(user);
    }

    @Override
    public void deleteUser(UUID uuid) {
        userRepository.deleteById(uuid);
    }

}
