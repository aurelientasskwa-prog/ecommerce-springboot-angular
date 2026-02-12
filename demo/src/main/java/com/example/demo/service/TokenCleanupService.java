package com.example.demo.service;

import com.example.demo.repository.RevokedTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenCleanupService {
    
    private final RevokedTokenRepository revokedTokenRepository;
    
    /**
     * Nettoie les tokens révoqués expirés tous les jours à minuit
     */
    @Scheduled(cron = "0 0 0 * * ?") // Tous les jours à minuit
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Nettoyage des tokens révoqués expirés...");
        int deletedCount = revokedTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        log.info("{} tokens révoqués expirés ont été supprimés", deletedCount);
    }
}
