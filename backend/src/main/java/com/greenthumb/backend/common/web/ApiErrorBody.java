package com.greenthumb.backend.common.web;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;

/** Builds the flat {@code {timestamp, status, message}} error shape shared by every error response. */
public final class ApiErrorBody {

    private ApiErrorBody() {}

    public static Map<String, Object> of(HttpStatus status, String message) {
        return Map.of("timestamp", Instant.now().toString(), "status", status.value(), "message", message);
    }
}
