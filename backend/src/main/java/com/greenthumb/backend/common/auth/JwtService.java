package com.greenthumb.backend.common.auth;

import com.greenthumb.backend.user.AppUser;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Issues and validates the app's own HS256-signed JWTs. Self-issued rather than delegating to an
 * external IdP - there is no Cognito User Pool yet - so verification is a plain HMAC check against
 * a shared secret rather than fetching a JWK set.
 */
@Component
public class JwtService {

    private final MACSigner signer;
    private final MACVerifier verifier;
    private final Duration expiration;

    public JwtService(
            @Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration}") Duration expiration) {
        try {
            byte[] secretBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            this.signer = new MACSigner(secretBytes);
            this.verifier = new MACVerifier(secretBytes);
        } catch (JOSEException e) {
            throw new IllegalStateException("Invalid app.jwt.secret configuration", e);
        }
        this.expiration = expiration;
    }

    public String issueToken(AppUser appUser) {
        try {
            Instant now = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(appUser.getId().toString())
                    .claim("email", appUser.getEmail())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plus(expiration)))
                    .build();

            SignedJWT signedJwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            signedJwt.sign(signer);
            return signedJwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Failed to issue JWT", e);
        }
    }

    public Optional<UUID> validateAndGetUserId(String token) {
        try {
            SignedJWT signedJwt = SignedJWT.parse(token);
            if (!signedJwt.verify(verifier)) {
                return Optional.empty();
            }

            JWTClaimsSet claims = signedJwt.getJWTClaimsSet();
            Date expirationTime = claims.getExpirationTime();
            if (expirationTime == null || expirationTime.toInstant().isBefore(Instant.now())) {
                return Optional.empty();
            }

            return Optional.of(UUID.fromString(claims.getSubject()));
        } catch (ParseException | JOSEException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
