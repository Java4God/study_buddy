package hr.tvz.nppjj.studybuddy.dto;

import hr.tvz.nppjj.studybuddy.enumerators.MemberStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record RoomMemberDTO(
        UUID id,
        UUID userId,
        String username,
        MemberStatus status,
        LocalDateTime joinedAt
) {}