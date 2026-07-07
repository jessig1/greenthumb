package com.greenthumb.backend.planting.dto;

import com.greenthumb.backend.plant.dto.PlantResponse;
import com.greenthumb.backend.planting.PlantedPlant;
import com.greenthumb.backend.planting.PlantingStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PlantedPlantResponse(
        UUID id,
        UUID containerId,
        PlantResponse plant,
        String nickname,
        int quantity,
        LocalDate plannedDate,
        LocalDate plantedDate,
        PlantingStatus status,
        String notes,
        Instant createdAt,
        Instant updatedAt) {

    public static PlantedPlantResponse from(PlantedPlant plantedPlant) {
        return new PlantedPlantResponse(
                plantedPlant.getId(),
                plantedPlant.getContainer().getId(),
                PlantResponse.from(plantedPlant.getPlant()),
                plantedPlant.getNickname(),
                plantedPlant.getQuantity(),
                plantedPlant.getPlannedDate(),
                plantedPlant.getPlantedDate(),
                plantedPlant.getStatus(),
                plantedPlant.getNotes(),
                plantedPlant.getCreatedAt(),
                plantedPlant.getUpdatedAt());
    }
}
