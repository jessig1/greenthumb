package com.greenthumb.backend.plant.dto;

import com.greenthumb.backend.plant.LightRequirement;
import com.greenthumb.backend.plant.Plant;
import com.greenthumb.backend.plant.PlantCareDifficulty;
import com.greenthumb.backend.plant.PlantCategory;
import com.greenthumb.backend.plant.PlantLifeCycle;
import java.util.UUID;

public record PlantResponse(
        UUID id,
        String commonName,
        String scientificName,
        PlantCategory category,
        String description,
        PlantLifeCycle lifeCycle,
        PlantCareDifficulty careDifficulty,
        LightRequirement lightRequirement,
        String lightNotes,
        String temperatureNotes,
        Integer wateringIntervalDays,
        String wateringNotes,
        String soilNotes,
        String feedingNotes,
        String pruningNotes,
        String toxicityNotes,
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
                plant.getLifeCycle(),
                plant.getCareDifficulty(),
                plant.getLightRequirement(),
                plant.getLightNotes(),
                plant.getTemperatureNotes(),
                plant.getWateringIntervalDays(),
                plant.getWateringNotes(),
                plant.getSoilNotes(),
                plant.getFeedingNotes(),
                plant.getPruningNotes(),
                plant.getToxicityNotes(),
                plant.isHarvestable(),
                plant.getDaysToMaturityMin(),
                plant.getDaysToMaturityMax(),
                plant.getHarvestNotes(),
                plant.getImageUrl());
    }
}
