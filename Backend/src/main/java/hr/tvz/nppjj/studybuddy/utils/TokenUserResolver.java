package hr.tvz.nppjj.studybuddy.utils;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.exception.InvalidTokenException;
import hr.tvz.nppjj.studybuddy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenUserResolver {

    private final JwtService jwtService;
    private final UserService userService;

    public UUID resolveUserIdFromToken(String token) {
        if (token == null || token.isBlank()) {
            throw new InvalidTokenException("Token is required");
        }

        try {
            String username = jwtService.extractUsername(token);
            if (username == null || username.isBlank()) {
                throw new InvalidTokenException("Invalid token");
            }

            return userService.getUserByUsername(username)
                    .map(user -> user.uuid())
                    .orElseThrow(() -> new InvalidTokenException("User not found for token"));
        } catch (InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid token");
        }
    }
}
