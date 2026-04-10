package hr.tvz.nppjj.studybuddy.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtService {
    private static final String SECRET_KEY = "b3efea866ad0b783d4a18fcbf8a23c1d72fc177d0a5107dfe4c91fb4f2051cd4";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        try {
            final Claims claims = extractAllClaims(token);
            return resolver.apply(claims);
        } catch (ExpiredJwtException e) {
            return resolver.apply(e.getClaims());
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        long refreshExpiration = 900000;
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername());
    }

    private SecretKey getSigningKey() {
        byte[] decoded = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(decoded);
    }
}
