package hr.tvz.nppjj.studybuddy.dto;

import java.util.Set;
import java.util.UUID;

public record PresenceUpdateDTO(
        UUID roomId,
        Set<String> onlineUsernames
) {}