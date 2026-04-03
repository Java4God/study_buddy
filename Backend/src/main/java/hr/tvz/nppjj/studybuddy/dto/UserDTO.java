package hr.tvz.nppjj.studybuddy.dto;

import java.util.UUID;

public record UserDTO(
        UUID uuid,
        String username,
        String email
) {
}
