package com.greenthumb.backend.photo.storage;

/**
 * Object storage seam for photos. {@link MinioStorageService} is the local-dev implementation
 * (S3 SDK pointed at a MinIO container via an endpoint override); a real-S3 implementation later
 * only needs to drop the endpoint override and switch to IAM auth - callers of this interface
 * don't change.
 */
public interface StorageService {

    /** Uploads the object and returns the storage key it was saved under. */
    String putObject(String key, byte[] content, String contentType);

    byte[] getObject(String key);

    /** Short-lived presigned GET URL for direct browser access. */
    String presignGetUrl(String key);

    void deleteObject(String key);
}
