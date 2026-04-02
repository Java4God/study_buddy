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

    @PostMapping("register")
    ResponseEntity<User> newUser(@RequestBody User user){
        return ResponseEntity.ok().build();
    }
}
