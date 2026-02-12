package com.example.demo.service;

import com.example.demo.config.JwtService;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        // 1. Récupérer le token depuis le header Authorization
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return; // Pas de token à révoquer
        }
        
        // 2. Extraire le token (enlever "Bearer ")
        final String jwt = authHeader.substring(7);
        
        // 3. Récupérer l'utilisateur associé au token
        userRepository.findByEmail(jwtService.extractUsername(jwt)).ifPresent(user -> {
            // 4. Supprimer le refresh token de l'utilisateur
            user.setRefreshToken(null);
            userRepository.save(user);
        });
        
        // 5. Révoquer le token en l'ajoutant à la liste noire
        jwtService.revokeToken(jwt);
        
        // 6. Nettoyer le contexte de sécurité
        SecurityContextHolder.clearContext();
    }
}
