package com.example.demo.security;

import java.io.IOException;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.exception.JwtAuthenticationException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class AuthTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);
    private static final Set<String> PUBLIC_PATHS = new HashSet<>(
        Set.of("/api/auth/signin", 
              "/api/auth/signup",
              "/api/auth/refresh-token",
              "/v3/api-docs",
              "/swagger-ui")
    );
    private static final Pattern BEARER_PATTERN = Pattern.compile("^Bearer [A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*$");
    
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        
        // Skip authentication for public endpoints
        if (isPublicPath(requestURI)) {
            logRequestDetails(request, "Public endpoint accessed");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = parseJwt(request);
            
            if (jwt == null) {
                logger.warn("Aucun token JWT trouvé dans la requête vers {}", requestURI);
                throw new JwtAuthenticationException("Token d'authentification manquant");
            }
            
            // Validation du format du token
            if (!isValidTokenFormat(jwt)) {
                logger.warn("Format de token JWT invalide pour l'URI: {}", requestURI);
                throw new JwtAuthenticationException("Format de token JWT invalide");
            }
            
            // Vérification de la validité du token
            if (!jwtUtils.validateJwtToken(jwt)) {
                logger.warn("Token JWT invalide ou expiré pour l'URI: {}", requestURI);
                throw new CredentialsExpiredException("Token JWT expiré ou invalide");
            }
            
            // Récupération de l'utilisateur
            String username = jwtUtils.getUserNameFromJwtToken(jwt);
            if (username == null) {
                logger.error("Impossible d'extraire le nom d'utilisateur du token JWT");
                throw new BadCredentialsException("Token JWT invalide: nom d'utilisateur manquant");
            }
            
            // Chargement des détails de l'utilisateur
            UserDetails userDetails;
            try {
                userDetails = userDetailsService.loadUserByUsername(username);
            } catch (UsernameNotFoundException e) {
                logger.error("Utilisateur non trouvé: {}", username);
                throw new UsernameNotFoundException("Utilisateur non trouvé: " + username);
            }
            
            // Création de l'authentification
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
            
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            logger.debug("Utilisateur authentifié avec succès: {}", username);
            
        } catch (AuthenticationException e) {
            SecurityContextHolder.clearContext();
            logger.error("Échec de l'authentification pour l'URI {}: {}", requestURI, e.getMessage());
            request.setAttribute("authenticationException", e);
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            logger.error("Erreur lors de l'authentification pour l'URI {}: {}", requestURI, e.getMessage(), e);
            request.setAttribute("authenticationException", 
                new JwtAuthenticationException("Une erreur est survenue lors de l'authentification"));
        }

        filterChain.doFilter(request, response);
    }
    
    private boolean isPublicPath(String requestURI) {
        return PUBLIC_PATHS.stream().anyMatch(requestURI::startsWith);
    }
    
    private boolean isValidTokenFormat(String token) {
        return token != null && BEARER_PATTERN.matcher("Bearer " + token).matches();
    }
    
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        // Vérification des paramètres de requête (pour la compatibilité avec les WebSockets)
        String token = request.getParameter("token");
        if (StringUtils.hasText(token)) {
            return token;
        }
        
        return null;
    }
    
    private void logRequestDetails(HttpServletRequest request, String message) {
        if (logger.isDebugEnabled()) {
            logger.debug("{} - {} {}", message, request.getMethod(), request.getRequestURI());
            
            // Log des en-têtes pour le débogage
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                logger.trace("Header: {} = {}", headerName, request.getHeader(headerName));
            }
        }
    }
}
