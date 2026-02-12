package com.example.demo.security;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.example.demo.exception.JwtAuthenticationException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Gère les réponses d'erreur d'authentification de manière centralisée
 */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, 
                        AuthenticationException authException) throws IOException, ServletException {
        
        logger.error("Erreur d'authentification pour l'URI {}: {}", 
                   request.getRequestURI(), authException.getMessage());
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        // Déterminer le code d'état HTTP approprié
        HttpStatus httpStatus = determineHttpStatus(authException);
        response.setStatus(httpStatus.value());
        
        // Construire la réponse d'erreur
        Map<String, Object> errorResponse = buildErrorResponse(request, authException, httpStatus);
        
        // Écrire la réponse JSON
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
    
    private HttpStatus determineHttpStatus(AuthenticationException authException) {
        if (authException instanceof CredentialsExpiredException) {
            return HttpStatus.UNAUTHORIZED; // 401
        } else if (authException instanceof BadCredentialsException) {
            return HttpStatus.UNAUTHORIZED; // 401
        } else if (authException instanceof JwtAuthenticationException) {
            return HttpStatus.BAD_REQUEST; // 400 pour les erreurs de format de token
        }
        return HttpStatus.FORBIDDEN; // 403 par défaut
    }
    
    private Map<String, Object> buildErrorResponse(HttpServletRequest request, 
                                                 AuthenticationException authException, 
                                                 HttpStatus httpStatus) {
        Map<String, Object> errorResponse = new HashMap<>();
        
        errorResponse.put("status", httpStatus.value());
        errorResponse.put("error", httpStatus.getReasonPhrase());
        errorResponse.put("message", getErrorMessage(authException));
        errorResponse.put("path", request.getRequestURI());
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        // Ajouter des détails supplémentaires pour le débogage en environnement de développement
        if (logger.isDebugEnabled()) {
            errorResponse.put("exception", authException.getClass().getName());
            if (authException.getCause() != null) {
                errorResponse.put("cause", authException.getCause().getMessage());
            }
        }
        
        return errorResponse;
    }
    
    private String getErrorMessage(AuthenticationException authException) {
        // Personnaliser les messages d'erreur pour une meilleure expérience utilisateur
        if (authException instanceof CredentialsExpiredException) {
            return "Votre session a expiré. Veuillez vous reconnecter.";
        } else if (authException instanceof BadCredentialsException) {
            return "Identifiants invalides. Veuillez vérifier vos informations de connexion.";
        } else if (authException instanceof JwtAuthenticationException) {
            return authException.getMessage(); // Utiliser le message personnalisé
        }
        return "Accès non autorisé. Veuillez vous authentifier.";
    }
}
