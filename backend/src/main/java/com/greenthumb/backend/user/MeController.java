package com.greenthumb.backend.user;

import com.greenthumb.backend.common.auth.CurrentUserContext;
import com.greenthumb.backend.common.web.NotFoundException;
import com.greenthumb.backend.user.dto.AppUserResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {

    private final AppUserRepository appUserRepository;
    private final CurrentUserContext currentUserContext;

    public MeController(AppUserRepository appUserRepository, CurrentUserContext currentUserContext) {
        this.appUserRepository = appUserRepository;
        this.currentUserContext = currentUserContext;
    }

    @GetMapping
    public AppUserResponse getCurrentUser() {
        AppUser appUser = appUserRepository.findById(currentUserContext.getAppUserId())
                .orElseThrow(() -> new NotFoundException("Current user not found"));
        return AppUserResponse.from(appUser);
    }
}
