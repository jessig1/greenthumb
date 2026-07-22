package com.greenthumb.backend.ai;

import com.greenthumb.backend.garden.ClimateZone;
import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.garden.GardenLightExposure;
import com.greenthumb.backend.garden.GardenLightSource;
import com.greenthumb.backend.garden.GardenType;
import java.util.List;

/** Grounds planning-assistant and plant-identification prompts in a garden's environment. */
public record GardenContext(
        String name,
        GardenType type,
        GardenLightSource lightSource,
        Integer lightHoursPerDay,
        GardenLightExposure lightExposure,
        String city,
        String state,
        String zipCode,
        ClimateZone climateZone,
        List<String> plantCommonNames) {

    public static GardenContext from(Garden garden, List<String> plantCommonNames) {
        return new GardenContext(
                garden.getName(),
                garden.getType(),
                garden.getLightSource(),
                garden.getLightHoursPerDay(),
                garden.getLightExposure(),
                garden.getCity(),
                garden.getState(),
                garden.getZipCode(),
                garden.getClimateZone(),
                plantCommonNames);
    }
}
