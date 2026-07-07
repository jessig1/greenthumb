package com.greenthumb.backend.user.dto;

import com.greenthumb.backend.user.AppUser;
import java.util.UUID;

public record AppUserResponse(UUID id, String email, String displayName) {

    public static AppUserResponse from(AppUser appUser) {
        return new AppUserResponse(appUser.getId(), appUser.getEmail(), appUser.getDisplayName());
    }
}
