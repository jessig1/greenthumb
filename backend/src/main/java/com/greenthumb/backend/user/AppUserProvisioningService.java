package com.greenthumb.backend.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Looks up the {@link AppUser} for an external identity subject, creating it on first sight.
 * Currently unused now that local email/password registration is the live auth path; reserved
 * for a future Cognito JWT filter that auto-provisions from a token's {@code sub}/{@code email}
 * claims the same way this always did.
 */
@Service
public class AppUserProvisioningService {

    private final AppUserRepository appUserRepository;

    public AppUserProvisioningService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public AppUser getOrCreate(String externalSubject, String email, String displayName) {
        return appUserRepository.findByCognitoSub(externalSubject)
            .orElseGet(() -> appUserRepository.save(new AppUser(externalSubject, email, displayName, null)));
    }
}
