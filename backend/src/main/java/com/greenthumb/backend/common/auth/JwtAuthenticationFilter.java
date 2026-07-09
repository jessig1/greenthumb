package com.greenthumb.backend.common.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Validates the {@code Authorization: Bearer <token>} header issued by {@code AuthService} on
 * login/registration. On a valid token, populates both {@link CurrentUserContext} (read by every
 * domain service for ownership checks) and the {@code SecurityContextHolder} (read by Spring
 * Security's {@code authorizeHttpRequests().anyRequest().authenticated()} rule). On a missing or
 * invalid token, does nothing and lets the authorization step reject the request.
 *
 * <p>Replaces the old {@code DevUserResolutionFilter}; only this filter and
 * {@link com.greenthumb.backend.common.SecurityConfig} should need to change again if a future
 * Cognito User Pool replaces self-issued JWTs with federated ones.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CurrentUserContext currentUserContext;

    public JwtAuthenticationFilter(JwtService jwtService, CurrentUserContext currentUserContext) {
        this.jwtService = jwtService;
        this.currentUserContext = currentUserContext;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith(BEARER_PREFIX)) {
            String token = header.substring(BEARER_PREFIX.length());
            Optional<UUID> userId = jwtService.validateAndGetUserId(token);

            if (userId.isPresent()) {
                currentUserContext.setAppUserId(userId.get());
                SecurityContextHolder.getContext()
                        .setAuthentication(new UsernamePasswordAuthenticationToken(userId.get(), null, List.of()));
            }
        }

        filterChain.doFilter(request, response);
    }
}
