package com.greenthumb.backend.common.auth;

import com.greenthumb.backend.user.AppUser;
import com.greenthumb.backend.user.AppUserProvisioningService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Temporary stand-in for real Cognito JWT authentication. Resolves the caller's identity from
 * an {@code X-Dev-User-Id} header (defaulting to a fixed local user), auto-provisioning an
 * {@link AppUser} exactly like the future Cognito-based resolver will from a JWT's {@code sub}
 * and {@code email} claims. Send different header values to simulate distinct users locally
 * (e.g. to test that one user cannot see another's gardens).
 *
 * <p>Replace with real JWT validation once a Cognito User Pool exists; only this filter and
 * {@link com.greenthumb.backend.common.SecurityConfig} should need to change - service-layer
 * ownership checks are already built against {@link CurrentUserContext}.
 */
@Component
public class DevUserResolutionFilter extends OncePerRequestFilter {

    private static final String DEV_USER_HEADER = "X-Dev-User-Id";
    private static final String DEFAULT_DEV_USER = "local-dev-user";

    private final AppUserProvisioningService appUserProvisioningService;
    private final CurrentUserContext currentUserContext;

    public DevUserResolutionFilter(
            AppUserProvisioningService appUserProvisioningService, CurrentUserContext currentUserContext) {
        this.appUserProvisioningService = appUserProvisioningService;
        this.currentUserContext = currentUserContext;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String devUserId = request.getHeader(DEV_USER_HEADER);
        String subject = (devUserId == null || devUserId.isBlank()) ? DEFAULT_DEV_USER : devUserId.trim();

        AppUser appUser = appUserProvisioningService.getOrCreate(subject, subject + "@dev.local", subject);
        currentUserContext.setAppUserId(appUser.getId());

        filterChain.doFilter(request, response);
    }
}
