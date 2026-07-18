package com.greenthumb.backend.photo.dto;

import com.greenthumb.backend.photo.Photo;
import com.greenthumb.backend.photo.PhotoEntityType;
import com.greenthumb.backend.photo.storage.StorageService;
import java.time.Instant;
import java.util.UUID;

public record PhotoResponse(
        UUID id,
        PhotoEntityType entityType,
        UUID entityId,
        String url,
        String contentType,
        String caption,
        Instant createdAt) {

    // url is a freshly-presigned URL, not a stored value - always regenerated per response.
    public static PhotoResponse from(Photo photo, StorageService storageService) {
        return new PhotoResponse(
                photo.getId(),
                photo.getEntityType(),
                photo.getEntityId(),
                storageService.presignGetUrl(photo.getObjectKey()),
                photo.getContentType(),
                photo.getCaption(),
                photo.getCreatedAt());
    }
}
