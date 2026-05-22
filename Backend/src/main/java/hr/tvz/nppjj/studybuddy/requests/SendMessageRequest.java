package hr.tvz.nppjj.studybuddy.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotBlank(message = "Message content is required")
        @Size(max = 2000, message = "Message too long")
        String content
) {}