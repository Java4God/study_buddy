package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.exception.UserLoginException;
import hr.tvz.nppjj.studybuddy.exception.UserNotFoundException;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import hr.tvz.nppjj.studybuddy.requests.UpdateUserRequest;
import hr.tvz.nppjj.studybuddy.requests.UserAuthRequest;
import hr.tvz.nppjj.studybuddy.responses.UserAuthResponse;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService{
    UserRepository userRepository;
    JwtService jwtService;
    UserDetailsService userDetailsService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    private final AuthenticationManager authenticationManager;
    @Override
    public Optional<UserDTO> getUserByEmail(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(()-> new UserNotFoundException("No user with such an email address"));
        return Optional.of(toDTO(user));
    }

    @Override
    public Optional<UserDTO> getUserByUsername(String username) {
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("No user with such a username"));
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
    public Optional<UserAuthResponse> authenticate(UserAuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );
        try{
            User user = userRepository.findUserByUsername(request.username())
                    .orElseThrow(() -> new UserLoginException("Invalid username or password"));
            var jwtToken = jwtService.generateToken(user.getUsername());
            var refreshToken = jwtService.generateRefreshToken(user.getUsername());
            return Optional.of(new UserAuthResponse(jwtToken, refreshToken));
        }catch (UserLoginException u){
            return Optional.empty();
        }

    }

    @Override
    @Transactional
    public Optional<UserDTO> newUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        user.setRole(Role.ROLE_BASIC_USER);
        return Optional.of(toDTO(userRepository.saveAndFlush(user)));
    }

    @Override
    @Transactional
    public Optional<UserDTO> updateUser(UUID uuid, UpdateUserRequest user) {
        try{
            userRepository.findUserById(uuid).map(u->{
                u.setId(uuid);
                u.setUsername(user.getUsername());
                u.setEmail(user.getEmail());
                return userRepository.save(u);
            }).orElseThrow(() -> new UserNotFoundException("User not found!"));
            //user.setId(uuid);
        }catch (UserNotFoundException e){
            return Optional.empty();
        }
        return Optional.of(toDTO(user, uuid));
    }

    @Override
    @Transactional
    public void deleteUser(UUID uuid) {
        userRepository.deleteById(uuid);
    }

    @Override
    @Transactional
    public UserAuthResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if(jwtService.isTokenValid(refreshToken, userDetails)){
            var jwt = jwtService.generateToken(username);
            return new UserAuthResponse(jwt, refreshToken);
        }
        return null;
    }

    private UserDTO toDTO(User user){
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }

    private UserDTO toDTO(UpdateUserRequest user, UUID id){
        return new UserDTO(
                id,
                user.getUsername(),
                user.getEmail()
        );
    }
}
