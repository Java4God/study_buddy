package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
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

import java.util.UUID;

@RestController
@RequestMapping("users")
@AllArgsConstructor
public class UserController {
    UserService userService;

    @GetMapping("user/{email}")
    ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email){
        return userService.getUserByEmail(email).map(user -> ResponseEntity.status(HttpStatus.FOUND).body(user))
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
    ResponseEntity<UserDTO> newUser(@Valid @RequestBody User user){
        return userService.newUser(user).map(u -> ResponseEntity.status(HttpStatus.OK).body(u))
                .orElseGet(()-> ResponseEntity.badRequest().build());
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
}
