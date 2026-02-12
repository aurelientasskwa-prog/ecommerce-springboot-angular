package com.example.demo.repository;

import com.example.demo.model.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByToken(String token);
    Optional<RevokedToken> findByToken(String token);
    
    @Modifying
    @Query("DELETE FROM RevokedToken rt WHERE rt.expiryDate < :now")
    int deleteByExpiryDateBefore(@Param("now") LocalDateTime now);
}
