package com.greenthumb.backend.garden.dto;

import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.garden.GardenType;
import java.time.Instant;
import java.util.UUID;

public record GardenResponse(
        UUID id, String name, GardenType type, String description, Instant createdAt, Instant updatedAt) {

    public static GardenResponse from(Garden garden) {
        return new GardenResponse(
                garden.getId(),
                garden.getName(),
                garden.getType(),
                garden.getDescription(),
                garden.getCreatedAt(),
                garden.getUpdatedAt());
    }
}
