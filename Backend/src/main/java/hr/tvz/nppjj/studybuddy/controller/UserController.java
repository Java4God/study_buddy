package hr.tvz.nppjj.studybuddy.controller;

import java.util.Optional;
import java.util.UUID;

import hr.tvz.nppjj.studybuddy.requests.UpdateUserRequest;
import hr.tvz.nppjj.studybuddy.service.TokenBlacklistService;
import hr.tvz.nppjj.studybuddy.utils.TokenUserResolver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.exception.UserLoginException;
import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.requests.RefreshTokenRequest;
import hr.tvz.nppjj.studybuddy.requests.UserAuthRequest;
import hr.tvz.nppjj.studybuddy.responses.UserAuthResponse;
import hr.tvz.nppjj.studybuddy.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("users")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    UserService userService;
    private final TokenUserResolver tokenUserResolver;
    private final TokenBlacklistService tokenBlacklistService;

    @GetMapping("user/{email}")
    ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email){
        return userService.getUserByEmail(email).map(user -> ResponseEntity.status(HttpStatus.FOUND).body(user))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("me")
    ResponseEntity<UserDTO> getCurrentUser(@RequestHeader("Authorization") String authHeader){
        if (authHeader.isBlank() || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        UUID id = tokenUserResolver.resolveUserIdFromToken(token);

        return userService.getUserById(id).map(user -> ResponseEntity.status(HttpStatus.OK).body(user))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    Page<UserDTO> getUsers(Pageable pageable){
        return userService.getUsers(pageable);
    }

    @GetMapping("user-by-id/{id}")
    ResponseEntity<UserDTO> getUserById(@PathVariable String id){
        return userService.getUserById(UUID.fromString(id)).map(user -> ResponseEntity.status(HttpStatus.OK).body(user))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("login")
    public ResponseEntity<UserAuthResponse> userLogin(@RequestBody UserAuthRequest userAuthRequest){
        return userService.authenticate(userAuthRequest).map(uar -> ResponseEntity.status(HttpStatus.OK).body(uar))
                .orElseGet(() -> ResponseEntity.badRequest().build());
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
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("refresh")
    public ResponseEntity<UserAuthResponse> refreshToken(@RequestBody RefreshTokenRequest refreshToken){
        return new ResponseEntity<>(userService.refreshToken(refreshToken.refreshToken()), HttpStatus.OK);
    }

    @PostMapping("logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                       @RequestBody(required = false) RefreshTokenRequest refreshRequest){
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            tokenBlacklistService.revoke(accessToken);
        }
        if (refreshRequest != null && refreshRequest.refreshToken() != null) {
            tokenBlacklistService.revoke(refreshRequest.refreshToken());
        }
        return ResponseEntity.ok().build();
    }

    @PutMapping("update-user/{id}")
    ResponseEntity<UserDTO> updateUser(@Valid @RequestBody UpdateUserRequest newUser, @PathVariable String id){
        return userService.updateUser(UUID.fromString(id), newUser).map(u -> ResponseEntity.status(HttpStatus.OK).body(u))
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

}