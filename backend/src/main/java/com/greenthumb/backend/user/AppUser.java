package com.greenthumb.backend.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "cognito_sub", unique = true)
    private String cognitoSub;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "password_hash")
    private String passwordHash;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AppUser() {
        // for JPA
    }

    public AppUser(String cognitoSub, String email, String displayName, String passwordHash) {
        this.cognitoSub = cognitoSub;
        this.email = email;
        this.displayName = displayName;
        this.passwordHash = passwordHash;
    }

    public UUID getId() {
        return id;
    }

    public String getCognitoSub() {
        return cognitoSub;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
