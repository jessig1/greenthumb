package com.greenthumb.backend.planting.dto;

import com.greenthumb.backend.planting.PlantingStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Dashboard/garden "add a plant" flow: garden/container are optional - pass containerId and/or
 * gardenId to assign one up front. When both are given, containerId's garden must match gardenId.
 */
public record QuickAddPlantingRequest(
        @NotNull UUID plantId,
        UUID containerId,
        UUID gardenId,
        @NotNull PlantingStatus status,
        @NotNull @Min(1) Integer quantity) {}
