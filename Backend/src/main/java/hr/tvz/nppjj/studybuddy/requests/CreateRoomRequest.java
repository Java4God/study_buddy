package hr.tvz.nppjj.studybuddy.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRoomRequest(
        @NotBlank(message = "Room name is required")
        @Size(max = 100)
        String name,

        @NotBlank(message = "Subject is required")
        @Size(max = 50)
        String subject,

        @Size(max = 500)
        String description,

        Boolean isPublic
) {}