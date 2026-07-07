package com.greenthumb.backend.plant.dto;

import com.greenthumb.backend.plant.LightRequirement;
import com.greenthumb.backend.plant.Plant;
import com.greenthumb.backend.plant.PlantCategory;
import java.util.UUID;

public record PlantResponse(
        UUID id,
        String commonName,
        String scientificName,
        PlantCategory category,
        String description,
        LightRequirement lightRequirement,
        String lightNotes,
        Integer wateringIntervalDays,
        String wateringNotes,
        String soilNotes,
        String feedingNotes,
        String pruningNotes,
        boolean harvestable,
        Integer daysToMaturityMin,
        Integer daysToMaturityMax,
        String harvestNotes,
        String imageUrl) {

    public static PlantResponse from(Plant plant) {
        return new PlantResponse(
                plant.getId(),
                plant.getCommonName(),
                plant.getScientificName(),
                plant.getCategory(),
                plant.getDescription(),
                plant.getLightRequirement(),
                plant.getLightNotes(),
                plant.getWateringIntervalDays(),
                plant.getWateringNotes(),
                plant.getSoilNotes(),
                plant.getFeedingNotes(),
                plant.getPruningNotes(),
                plant.isHarvestable(),
                plant.getDaysToMaturityMin(),
                plant.getDaysToMaturityMax(),
                plant.getHarvestNotes(),
                plant.getImageUrl());
    }
}
