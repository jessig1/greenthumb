package com.greenthumb.backend.garden.dto;

import com.greenthumb.backend.garden.ClimateZone;
import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.garden.GardenLightExposure;
import com.greenthumb.backend.garden.GardenLightSource;
import com.greenthumb.backend.garden.GardenType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record GardenResponse(
        UUID id,
        String name,
        GardenType type,
        String description,
        GardenLightSource lightSource,
        Integer lightHoursPerDay,
        GardenLightExposure lightExposure,
        String city,
        String state,
        String zipCode,
        ClimateZone climateZone,
        LocalDate lastFrostDate,
        LocalDate firstFrostDate,
        Instant createdAt,
        Instant updatedAt) {

    public static GardenResponse from(Garden garden) {
        return new GardenResponse(
                garden.getId(),
                garden.getName(),
                garden.getType(),
                garden.getDescription(),
                garden.getLightSource(),
                garden.getLightHoursPerDay(),
                garden.getLightExposure(),
                garden.getCity(),
                garden.getState(),
                garden.getZipCode(),
                garden.getClimateZone(),
                garden.getLastFrostDate(),
                garden.getFirstFrostDate(),
                garden.getCreatedAt(),
                garden.getUpdatedAt());
    }
}
