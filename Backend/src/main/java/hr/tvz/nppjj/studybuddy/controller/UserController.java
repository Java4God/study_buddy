package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.model.User;
import hr.tvz.nppjj.studybuddy.service.UserService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
