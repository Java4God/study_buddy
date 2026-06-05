package hr.tvz.nppjj.studybuddy.config;

import static org.junit.jupiter.api.Assertions.*;

import static org.assertj.core.api.Assertions.assertThat;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void generateToken_and_extractUsername_shouldRoundTrip() {
        String token = jwtService.generateToken("testuser");

        assertThat(jwtService.extractUsername(token)).isEqualTo("testuser");
    }

    @Test
    void generateRefreshToken_and_extractUsername_shouldRoundTrip() {
        String token = jwtService.generateRefreshToken("refreshUser");

        assertThat(jwtService.extractUsername(token)).isEqualTo("refreshUser");
    }

    @Test
    void isTokenValid_shouldReturnTrue_forMatchingUsername() {
        String token = jwtService.generateToken("testuser");
        UserDetails userDetails = User.withUsername("testuser").password("pw").authorities("ROLE_USER").build();

        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    void isTokenValid_shouldReturnFalse_forDifferentUsername() {
        String token = jwtService.generateToken("testuser");
        UserDetails userDetails = User.withUsername("otheruser").password("pw").authorities("ROLE_USER").build();

        assertThat(jwtService.isTokenValid(token, userDetails)).isFalse();
    }

    @Test
    void extractClaim_shouldReturnCustomClaimValue() {
        String token = Jwts.builder()
                .subject("testuser")
                .claim("role", "ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(getSigningKey())
                .compact();

        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));

        assertThat(role).isEqualTo("ADMIN");
    }

    @Test
    void extractClaim_shouldReturnClaimsFromExpiredToken() {
        String token = Jwts.builder()
                .subject("expireduser")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000))
                .expiration(new Date(System.currentTimeMillis() - 60_000))
                .signWith(getSigningKey())
                .compact();

        String username = jwtService.extractClaim(token, Claims::getSubject);

        assertThat(username).isEqualTo("expireduser");
    }

    private Key getSigningKey() {
        String secret = "b3efea866ad0b783d4a18fcbf8a23c1d72fc177d0a5107dfe4c91fb4f2051cd4";
        byte[] decoded = io.jsonwebtoken.io.Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(decoded);
    }
}