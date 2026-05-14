package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.config.JwtService;
import hr.tvz.nppjj.studybuddy.model.RevokedToken;
import hr.tvz.nppjj.studybuddy.repository.RevokedTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenBlacklistServiceTest {

    @Mock
    private RevokedTokenRepository repository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private TokenBlacklistService tokenBlacklistService;

    private static final String VALID_TOKEN = "valid-jwt-token";
    private static final String VALID_TOKEN_HASH = "3697573a8323f8285c644e2b4ec8f01c9cfb08161fe91b9650cff0f69709c1f9";

    @Test
    void revoke_nullOrBlankToken_doesNothing() {
        tokenBlacklistService.revoke(null);
        tokenBlacklistService.revoke("");
        tokenBlacklistService.revoke("   ");

        verify(repository, never()).existsByTokenHash(anyString());
        verify(repository, never()).save(any());
        verify(jwtService, never()).extractClaim(anyString(), any());
    }

    @Test
    void revoke_tokenAlreadyRevoked_doesNothing() {
        when(repository.existsByTokenHash(VALID_TOKEN_HASH)).thenReturn(true);

        tokenBlacklistService.revoke(VALID_TOKEN);

        verify(repository).existsByTokenHash(VALID_TOKEN_HASH);
        verify(repository, never()).save(any());
        verify(jwtService, never()).extractClaim(anyString(), any());
    }

    @Test
    void revoke_validToken_jwtParsingFails_uses1MinDefault() {
        when(repository.existsByTokenHash(anyString())).thenReturn(false);
        when(jwtService.extractClaim(eq(VALID_TOKEN), any(Function.class)))
                .thenThrow(new RuntimeException("JWT parse error"));

        tokenBlacklistService.revoke(VALID_TOKEN);

        ArgumentCaptor<RevokedToken> tokenCaptor = ArgumentCaptor.forClass(RevokedToken.class);
        verify(repository).save(tokenCaptor.capture());

        RevokedToken saved = tokenCaptor.getValue();
        assertThat(saved.getTokenHash()).isEqualTo(VALID_TOKEN_HASH);

        LocalDateTime now = LocalDateTime.now();
        assertThat(saved.getExpiresAt())
                .isAfter(now.minusSeconds(5))
                .isBefore(now.plusSeconds(65));
    }

    @Test
    void revoke_validToken_savesWithCorrectExpiration() {
        when(repository.existsByTokenHash(VALID_TOKEN_HASH)).thenReturn(false);

        Date jwtExpiration = new Date(System.currentTimeMillis() + 3600000); // 1 hour
        when(jwtService.extractClaim(eq(VALID_TOKEN), any(Function.class)))
                .thenReturn(jwtExpiration);

        tokenBlacklistService.revoke(VALID_TOKEN);

        ArgumentCaptor<RevokedToken> tokenCaptor = ArgumentCaptor.forClass(RevokedToken.class);
        verify(repository).save(tokenCaptor.capture());

        RevokedToken saved = tokenCaptor.getValue();
        assertThat(saved.getTokenHash()).isEqualTo(VALID_TOKEN_HASH);
        assertThat(saved.getExpiresAt())
                .isCloseTo(jwtExpiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime(),
                        within(1, ChronoUnit.SECONDS));
    }

    @Test
    void isRevoked_nullOrBlankToken_returnsFalse() {
        assertThat(tokenBlacklistService.isRevoked(null)).isFalse();
        assertThat(tokenBlacklistService.isRevoked("")).isFalse();
        assertThat(tokenBlacklistService.isRevoked("   ")).isFalse();

        verify(repository, never()).existsByTokenHash(anyString());
    }

    @Test
    void isRevoked_tokenNotRevoked_returnsFalse() {
        when(repository.existsByTokenHash(VALID_TOKEN_HASH)).thenReturn(false);

        boolean result = tokenBlacklistService.isRevoked(VALID_TOKEN);

        assertThat(result).isFalse();
        verify(repository).existsByTokenHash(VALID_TOKEN_HASH);
    }

    @Test
    void isRevoked_tokenRevoked_returnsTrue() {
        when(repository.existsByTokenHash(VALID_TOKEN_HASH)).thenReturn(true);

        boolean result = tokenBlacklistService.isRevoked(VALID_TOKEN);

        assertThat(result).isTrue();
        verify(repository).existsByTokenHash(VALID_TOKEN_HASH);
    }

    @Test
    void hash_validToken_returnsSha256Hash() {
        String result = tokenBlacklistService.hash(VALID_TOKEN);

        assertThat(result).isEqualTo(VALID_TOKEN_HASH);
    }

    @Test
    void hash_throwsException_whenHashingFails() {
        assertThatThrownBy(() -> tokenBlacklistService.hash(null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Hashing failed");
    }
}