package hr.tvz.nppjj.studybuddy.requests;

import hr.tvz.nppjj.studybuddy.enumerators.MemberStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull(message = "Status is required")
        MemberStatus status
) {}