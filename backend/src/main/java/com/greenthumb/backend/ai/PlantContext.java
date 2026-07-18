package com.greenthumb.backend.ai;

import com.greenthumb.backend.plant.Plant;
import com.greenthumb.backend.planting.PlantedPlant;

/** Grounds diagnosis/care-suggestion prompts in what's already known about the planting. */
public record PlantContext(
        String commonName,
        String scientificName,
        String lightNotes,
        String wateringNotes,
        String soilNotes,
        String feedingNotes,
        String pruningNotes,
        String nickname) {

    public static PlantContext from(PlantedPlant plantedPlant) {
        Plant plant = plantedPlant.getPlant();
        return new PlantContext(
                plant.getCommonName(),
                plant.getScientificName(),
                plant.getLightNotes(),
                plant.getWateringNotes(),
                plant.getSoilNotes(),
                plant.getFeedingNotes(),
                plant.getPruningNotes(),
                plantedPlant.getNickname());
    }
}
