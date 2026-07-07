package com.greenthumb.backend.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Looks up the {@link AppUser} for an external identity subject, creating it on first sight.
 * Used today by the dev header filter and later by the real Cognito JWT filter - both resolve
 * to the same "subject + email" shape, so this logic doesn't change when auth does.
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
            .orElseGet(() -> appUserRepository.save(new AppUser(externalSubject, email, displayName)));
    }
}
