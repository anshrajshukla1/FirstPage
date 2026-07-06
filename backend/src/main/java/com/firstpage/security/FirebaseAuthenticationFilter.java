package com.firstpage.security;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * Filter that authenticates requests using Firebase ID tokens.
 * Extracts the Bearer token from the Authorization header, verifies it
 * with Firebase Auth, and sets the SecurityContext.
 */
@Slf4j
@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private static final Set<String> PUBLIC_PATHS = Set.of(
        "/api/v1/public",
        "/api/v1/visitor",
        "/health",
        "/actuator",
        "/swagger-ui",
        "/api-docs",
        "/v3/api-docs"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractToken(request);

        if (StringUtils.hasText(token)) {
            try {
                FirebaseToken firebaseToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String uid = firebaseToken.getUid();

                var authorities = Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_USER")
                );

                var authentication = new UsernamePasswordAuthenticationToken(
                    uid, firebaseToken, authorities
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated Firebase user: {}", uid);

            } catch (FirebaseAuthException e) {
                log.warn("Firebase token verification failed: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    /**
     * Extracts the Bearer token from the Authorization header.
     *
     * @param request the HTTP request
     * @return the token string, or null if not present
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
