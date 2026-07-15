package com.greenthumb.backend.planting.dto;

import com.greenthumb.backend.planting.PlantingStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/** Dashboard "add a plant" flow: garden/container are optional - pass containerId to assign one up front. */
public record QuickAddPlantingRequest(
        @NotNull UUID plantId,
        UUID containerId,
        @NotNull PlantingStatus status,
        @NotNull @Min(1) Integer quantity) {}
