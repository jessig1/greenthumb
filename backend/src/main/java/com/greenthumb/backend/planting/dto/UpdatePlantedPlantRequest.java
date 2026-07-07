package com.greenthumb.backend.planting.dto;

import com.greenthumb.backend.planting.PlantingStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdatePlantedPlantRequest(
        String nickname,
        @Min(1) Integer quantity,
        LocalDate plannedDate,
        LocalDate plantedDate,
        @NotNull PlantingStatus status,
        String notes) {}
