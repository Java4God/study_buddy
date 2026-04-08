package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
//@Transactional(readOnly = true)
public class UserServiceImpl implements UserService{
    UserRepository userRepository;
    @Override
    public Optional<UserDTO> getUserByEmail(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(()-> new UserNotFoundException("No user with such an email address"));
        return Optional.of(toDTO(user));
    }

    @Override
    public Optional<UserDTO> getUserById(UUID uuid) {
        User user = userRepository.findUserById(uuid)
                .orElseThrow(()-> new UserNotFoundException("No user with such an id"));
        return Optional.of(toDTO(user));
    }

    @Override
    public Page<UserDTO> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDTO);
    }

    @Override
    public Optional<UserDTO> newUser(User user) {
        return Optional.of(toDTO(userRepository.saveAndFlush(user)));
    }

    @Override
    public Optional<UserDTO> updateUser(UUID uuid, User user) {
        try{
            userRepository.findUserById(uuid).map(u->{
                u.setId(uuid);
                u.setPassword(user.getPassword());
                u.setUsername(user.getUsername());
                return userRepository.save(u);
            }).orElseThrow(() -> new UserNotFoundException("User not found!"));
            user.setId(uuid);
        }catch (UserNotFoundException e){
            return Optional.empty();
        }
        return Optional.of(toDTO(user));
    }

    @Override
    public void deleteUser(UUID uuid) {
        userRepository.deleteById(uuid);
    }

    @Override
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findUserByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private UserDTO toDTO(User user){
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}
