package com.greenthumb.backend.photo.storage;

import com.greenthumb.backend.common.web.StorageException;
import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

/**
 * Local dev implementation backed by the MinIO container in docker-compose.yml, reached through
 * the AWS S3 SDK with a path-style endpoint override. A real-S3 implementation later drops the
 * endpoint override and switches to IAM auth - {@link StorageService} callers don't change.
 *
 * <p>Excluded from the {@code test} profile - tests use an in-memory {@code StorageService} fake
 * instead of requiring a live MinIO container.
 */
@Component
@Profile("!test")
public class MinioStorageService implements StorageService {

    private static final Duration PRESIGN_DURATION = Duration.ofMinutes(15);

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;

    public MinioStorageService(
            @Value("${app.storage.endpoint}") String endpoint,
            @Value("${app.storage.access-key}") String accessKey,
            @Value("${app.storage.secret-key}") String secretKey,
            @Value("${app.storage.bucket}") String bucket) {
        this.bucket = bucket;
        StaticCredentialsProvider credentials =
                StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
        URI endpointUri = URI.create(endpoint);

        this.s3Client = S3Client.builder()
                .endpointOverride(endpointUri)
                .credentialsProvider(credentials)
                .region(Region.US_EAST_1)
                .forcePathStyle(true)
                .build();

        this.s3Presigner = S3Presigner.builder()
                .endpointOverride(endpointUri)
                // Must match the S3Client's path-style setting, or presigned URLs come back
                // virtual-hosted-style (bucket.host) instead - that doesn't resolve locally since
                // there's no wildcard DNS for *.localhost.
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .credentialsProvider(credentials)
                .region(Region.US_EAST_1)
                .build();
    }

    @PostConstruct
    void createBucketIfMissing() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception e) {
            throw new StorageException("Failed to verify/create storage bucket: " + bucket, e);
        }
    }

    @Override
    public String putObject(String key, byte[] content, String contentType) {
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromBytes(content));
            return key;
        } catch (S3Exception e) {
            throw new StorageException("Failed to upload object: " + key, e);
        }
    }

    @Override
    public byte[] getObject(String key) {
        try {
            return s3Client
                    .getObject(GetObjectRequest.builder().bucket(bucket).key(key).build())
                    .readAllBytes();
        } catch (Exception e) {
            throw new StorageException("Failed to read object: " + key, e);
        }
    }

    @Override
    public String presignGetUrl(String key) {
        try {
            return s3Presigner
                    .presignGetObject(GetObjectPresignRequest.builder()
                            .signatureDuration(PRESIGN_DURATION)
                            .getObjectRequest(GetObjectRequest.builder()
                                    .bucket(bucket)
                                    .key(key)
                                    .build())
                            .build())
                    .url()
                    .toString();
        } catch (S3Exception e) {
            throw new StorageException("Failed to presign object: " + key, e);
        }
    }

    @Override
    public void deleteObject(String key) {
        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (S3Exception e) {
            throw new StorageException("Failed to delete object: " + key, e);
        }
    }
}
