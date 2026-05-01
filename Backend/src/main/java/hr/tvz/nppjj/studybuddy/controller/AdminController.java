package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userService.getUsers(pageable);
    }

    @GetMapping("/stats")
    public ResponseEntity<String> getStats() {
        long totalUsers = userService.getUsers(Pageable.unpaged()).getTotalElements();
        return ResponseEntity.ok("Total users: " + totalUsers);
    }
}