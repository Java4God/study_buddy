package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.service.AllUsersService;
import hr.tvz.nppjj.studybuddy.service.UserService;
import lombok.AllArgsConstructor;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private AllUsersService userService;

    private final Scheduler scheduler;

    @GetMapping("/users")
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userService.getUsers(pageable);
    }

    @GetMapping("/stats")
    public ResponseEntity<String> getStats() {
        long totalUsers = userService.getUsers(Pageable.unpaged()).getTotalElements();
        return ResponseEntity.ok("Total users: " + totalUsers);
    }

    @PostMapping("/jobs/{name}/trigger")
    public ResponseEntity<String> triggerJob(@PathVariable String name) throws SchedulerException {
        JobKey key = JobKey.jobKey(name);
        if (!scheduler.checkExists(key)) {
            return ResponseEntity.notFound().build();
        }
        scheduler.triggerJob(key);
        return ResponseEntity.ok("Okinut posao: " + name);
    }
}