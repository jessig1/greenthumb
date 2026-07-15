package com.greenthumb.backend.planting.dto;

import com.greenthumb.backend.container.Container;
import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.plant.dto.PlantResponse;
import com.greenthumb.backend.planting.PlantedPlant;
import com.greenthumb.backend.planting.PlantingStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PlantedPlantResponse(
        UUID id,
        UUID containerId,
        String containerName,
        UUID gardenId,
        String gardenName,
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
        Container container = plantedPlant.getContainer();
        Garden garden = container == null ? null : container.getGarden();
        return new PlantedPlantResponse(
                plantedPlant.getId(),
                container == null ? null : container.getId(),
                container == null ? null : container.getName(),
                garden == null ? null : garden.getId(),
                garden == null ? null : garden.getName(),
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
