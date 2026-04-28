package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.dto.PomodoroSessionDTO;
import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.exception.InvalidTokenException;
import hr.tvz.nppjj.studybuddy.exception.UserLoginException;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.requests.RefreshTokenRequest;
import hr.tvz.nppjj.studybuddy.requests.UserAuthRequest;
import hr.tvz.nppjj.studybuddy.responses.UserAuthResponse;
import hr.tvz.nppjj.studybuddy.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("users")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    UserService userService;
    private final JwtService jwtService;

    @GetMapping("user/{email}")
    ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email){
        return userService.getUserByEmail(email).map(user -> ResponseEntity.status(HttpStatus.FOUND).body(user))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("user/{id}")
    ResponseEntity<UserDTO> getUserById(@PathVariable String id){
        return userService.getUserById(UUID.fromString(id)).map(user -> ResponseEntity.status(HttpStatus.FOUND).body(user))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("user/by-token")
    public ResponseEntity<UserDTO> getByToken(
            @Valid @RequestBody PomodoroSessionController.PomodoroTokenRequest request
    ) {
        UUID userId = resolveUserIdFromToken(request.token());
        return userService.getUserById(userId).map(user -> ResponseEntity.status(HttpStatus.FOUND).body(user))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    Page<UserDTO> getUsers(Pageable pageable){
        return userService.getUsers(pageable);
    }

    @PostMapping("login")
    public ResponseEntity<UserAuthResponse> userLogin(@RequestBody UserAuthRequest userAuthRequest){
        return userService.authenticate(userAuthRequest).map(uar -> ResponseEntity.status(HttpStatus.OK).body(uar))
                .orElseGet(() -> ResponseEntity.badRequest().build());
        //return new ResponseEntity<>(userService.authenticate(userAuthRequest), HttpStatus.OK);
    }

    @PostMapping("register-user")
    ResponseEntity<UserAuthResponse> newUser(@Valid @RequestBody User user){
        try{
            UserAuthRequest userAuthRequest = new UserAuthRequest(user.getUsername(), user.getPassword());
            Optional<UserDTO> userDTOOptional = userService.newUser(user);
            if(userDTOOptional.isPresent())
            {
                return userService.authenticate(userAuthRequest).map(u -> ResponseEntity.status(HttpStatus.OK).body(u))
                    .orElseGet(()-> ResponseEntity.badRequest().build());
            }
            else throw new UserLoginException("Something went wrong");
        } catch (UserLoginException u)
        {
            //TODO: logirati exception????
            return ResponseEntity.badRequest().build();
        }

    }

    @PostMapping("refresh")
    public ResponseEntity<UserAuthResponse> refreshToken(@RequestBody RefreshTokenRequest refreshToken){
        return new ResponseEntity<>(userService.refreshToken(refreshToken.refreshToken()), HttpStatus.OK);
    }

    @PutMapping("update-user/{id}")
    ResponseEntity<UserDTO> updateUser(@Valid @RequestBody User user, @PathVariable String id){
        return userService.updateUser(UUID.fromString(id), user).map(u -> ResponseEntity.status(HttpStatus.OK).body(u))
                .orElseGet(()-> ResponseEntity.notFound().build());
    }

    @DeleteMapping("delete-user/{id}")
    ResponseEntity<String> deleteUser(@PathVariable String id){
        if(userService.getUserById(UUID.fromString(id)).isPresent())
        {
            userService.deleteUser(UUID.fromString(id));
            return ResponseEntity.status(HttpStatus.OK).body("User with id: " + id + ", was successfully deleted");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No such user with id: " + id);
    }

    private UUID resolveUserIdFromToken(String token) {
        if (token == null || token.isBlank()) {
            throw new InvalidTokenException("Token is required");
        }

        try {
            String username = jwtService.extractUsername(token);
            if (username == null || username.isBlank()) {
                throw new InvalidTokenException("Invalid token");
            }

            return userService.getUserByUsername(username)
                    .map(user -> user.uuid())
                    .orElseThrow(() -> new InvalidTokenException("User not found for token"));
        } catch (InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid token");
        }
    }
}
