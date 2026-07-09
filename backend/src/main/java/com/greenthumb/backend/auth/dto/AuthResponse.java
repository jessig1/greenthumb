package com.greenthumb.backend.auth.dto;

import com.greenthumb.backend.user.dto.AppUserResponse;

public record AuthResponse(String token, AppUserResponse user) {}
