package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.model.RevokedToken;
import hr.tvz.nppjj.studybuddy.repository.RevokedTokenRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final RevokedTokenRepository repository;
    private final JwtService jwtService;

    @Transactional
    public void revoke(String token) {
        if (token == null || token.isBlank()) return;

        String hash = hash(token);
        if (repository.existsByTokenHash(hash)) return;

        Date expiration;
        try {
            expiration = jwtService.extractClaim(token, Claims::getExpiration);
        } catch (Exception e) {
            expiration = new Date(System.currentTimeMillis() + 60_000);
        }

        RevokedToken revoked = new RevokedToken();
        revoked.setTokenHash(hash);
        revoked.setRevokedAt(LocalDateTime.now());
        revoked.setExpiresAt(expiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());

        repository.save(revoked);
    }

    public boolean isRevoked(String token) {
        if (token == null || token.isBlank()) return false;
        return repository.existsByTokenHash(hash(token));
    }

    String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(token.getBytes());
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed", e);
        }
    }
}