package com.greenthumb.backend.photo;

import com.greenthumb.backend.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "photo")
public class Photo {

    @Id
    @GeneratedValue
    private UUID id;

    // entityId points at one of three different tables depending on entityType, so it can't be a
    // real FK - owner is tracked directly here instead of derived through a join, same pattern as
    // PlantedPlant.owner.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private PhotoEntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "object_key", nullable = false)
    private String objectKey;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "file_size_bytes", nullable = false)
    private int fileSizeBytes;

    private String caption;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Photo() {
        // for JPA
    }

    public Photo(
            AppUser owner,
            PhotoEntityType entityType,
            UUID entityId,
            String objectKey,
            String contentType,
            int fileSizeBytes,
            String caption) {
        this.owner = owner;
        this.entityType = entityType;
        this.entityId = entityId;
        this.objectKey = objectKey;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
        this.caption = caption;
    }

    public UUID getId() {
        return id;
    }

    public AppUser getOwner() {
        return owner;
    }

    public PhotoEntityType getEntityType() {
        return entityType;
    }

    public UUID getEntityId() {
        return entityId;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public String getContentType() {
        return contentType;
    }

    public int getFileSizeBytes() {
        return fileSizeBytes;
    }

    public String getCaption() {
        return caption;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
