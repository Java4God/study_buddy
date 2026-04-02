package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.service.UserService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("users")
@AllArgsConstructor
public class UserController {
    UserService userService;

    @GetMapping("user/{email}")
    ResponseEntity<User> getUserByEmail(@PathVariable String email){
        return userService.getUserByEmail(email).map(user -> ResponseEntity.status(HttpStatus.FOUND).body(user))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    List<User> getUsers(){
        return userService.getUsers();
    }

    @PostMapping("register-user")
    ResponseEntity<User> newUser(@RequestBody User user){
        return userService.newUser(user).map(u -> ResponseEntity.status(HttpStatus.OK).body(u))
                .orElseGet(()-> ResponseEntity.badRequest().build());
    }

    @PutMapping("update-user/{id}")
    ResponseEntity<User> updateUser(@RequestBody User user, @PathVariable String id){
        return userService.updateUser(UUID.fromString(id), user).map(u -> ResponseEntity.status(HttpStatus.OK).body(u))
                .orElseGet(()-> ResponseEntity.notFound().build());
    }

    @DeleteMapping("delete-user/{id}")
    ResponseEntity<String> updateUser(@PathVariable String id){
        if(userService.getUserById(UUID.fromString(id)).isPresent())
        {
            userService.deleteUser(UUID.fromString(id));
            return ResponseEntity.status(HttpStatus.OK).body("User with id: " + id + ", was successfully deleted");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No such user with id: " + id);
    }
}
