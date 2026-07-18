package com.greenthumb.backend.photo.storage;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** In-memory {@link StorageService} test double - no live MinIO/S3 needed to run the test suite. */
@Component
@Profile("test")
public class FakeStorageService implements StorageService {

    private final Map<String, byte[]> objects = new ConcurrentHashMap<>();

    @Override
    public String putObject(String key, byte[] content, String contentType) {
        objects.put(key, content);
        return key;
    }

    @Override
    public byte[] getObject(String key) {
        byte[] content = objects.get(key);
        if (content == null) {
            throw new IllegalStateException("No fake object stored for key: " + key);
        }
        return content;
    }

    @Override
    public String presignGetUrl(String key) {
        return "https://fake-storage.test/" + key;
    }

    @Override
    public void deleteObject(String key) {
        objects.remove(key);
    }
}
