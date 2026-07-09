package com.greenthumb.backend.auth;

import com.greenthumb.backend.auth.dto.AuthResponse;
import com.greenthumb.backend.auth.dto.LoginRequest;
import com.greenthumb.backend.auth.dto.RegisterRequest;
import com.greenthumb.backend.common.auth.JwtService;
import com.greenthumb.backend.common.web.InvalidRequestException;
import com.greenthumb.backend.common.web.UnauthorizedException;
import com.greenthumb.backend.user.AppUser;
import com.greenthumb.backend.user.AppUserRepository;
import com.greenthumb.backend.user.dto.AppUserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByEmail(request.email())) {
            throw new InvalidRequestException("Email already registered");
        }

        AppUser appUser = appUserRepository.save(
                new AppUser(null, request.email(), request.displayName(), passwordEncoder.encode(request.password())));

        return new AuthResponse(jwtService.issueToken(appUser), AppUserResponse.from(appUser));
    }

    public AuthResponse login(LoginRequest request) {
        AppUser appUser = appUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (appUser.getPasswordHash() == null || !passwordEncoder.matches(request.password(), appUser.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return new AuthResponse(jwtService.issueToken(appUser), AppUserResponse.from(appUser));
    }
}
