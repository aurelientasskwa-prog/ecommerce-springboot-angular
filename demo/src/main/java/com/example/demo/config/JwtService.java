package com.example.demo.config;

import com.example.demo.model.RevokedToken;
import com.example.demo.model.User;
import com.example.demo.repository.RevokedTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final RevokedTokenRepository revokedTokenRepository;

    @Value("${app.jwtSecret:secret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:3600000}")
    private long jwtExpirationMs;

    @Value("${app.refreshExpirationMs:2592000000}")
    private long refreshExpirationMs;

    public String generateToken(User user) {
        String subject = Optional.ofNullable(user.getEmail()).orElse(user.getUsername());
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String generateRefreshToken(User user) {
        // simple opaque refresh token implementation
        return UUID.randomUUID().toString();
    }

    public String extractUsername(String token) {
        try {
            Claims claims = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody();
            return claims.getSubject();
        } catch (ExpiredJwtException ex) {
            return ex.getClaims() != null ? ex.getClaims().getSubject() : null;
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTokenValid(String token, User user) {
        if (token == null) return false;
        // check revoked
        if (revokedTokenRepository.existsByToken(token)) return false;
        String username = extractUsername(token);
        String subject = Optional.ofNullable(user.getEmail()).orElse(user.getUsername());
        return username != null && username.equals(subject) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        try {
            Date exp = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().getExpiration();
            return exp.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    @Transactional
    public void revokeToken(String token) {
        if (token == null) return;
        try {
            Claims claims = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody();
            Date exp = claims.getExpiration();
            LocalDateTime expiry = LocalDateTime.ofInstant(Instant.ofEpochMilli(exp.getTime()), ZoneId.systemDefault());
            RevokedToken revoked = RevokedToken.builder()
                    .token(token)
                    .expiryDate(expiry)
                    .user(null)
                    .build();
            revokedTokenRepository.save(revoked);
        } catch (Exception e) {
            // If parsing fails, store with a short expiry
            RevokedToken revoked = RevokedToken.builder()
                    .token(token)
                    .expiryDate(LocalDateTime.now().plusDays(1))
                    .user(null)
                    .build();
            revokedTokenRepository.save(revoked);
        }
    }
}
