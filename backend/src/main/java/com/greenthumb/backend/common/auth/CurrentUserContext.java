package com.greenthumb.backend.common.auth;

import java.util.UUID;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;

/**
 * Holds the resolved current user's {@code AppUser} id for the duration of one request.
 * Populated by a request filter - {@link DevUserResolutionFilter} for now, a Cognito
 * JWT-based filter later - so service-layer ownership checks stay unchanged when the
 * resolution mechanism changes.
 */
@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentUserContext {

    private UUID appUserId;

    public UUID getAppUserId() {
        if (appUserId == null) {
            throw new IllegalStateException("No current user has been resolved for this request");
        }
        return appUserId;
    }

    public void setAppUserId(UUID appUserId) {
        this.appUserId = appUserId;
    }
}
