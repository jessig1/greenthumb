package com.greenthumb.backend.planting.dto;

import com.greenthumb.backend.planting.PlantingStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreatePlantedPlantRequest(
        @NotNull UUID plantId,
        String nickname,
        @Min(1) Integer quantity,
        LocalDate plannedDate,
        LocalDate plantedDate,
        PlantingStatus status,
        String notes) {}
