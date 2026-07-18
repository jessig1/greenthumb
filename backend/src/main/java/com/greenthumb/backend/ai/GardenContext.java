package com.greenthumb.backend.ai;

import com.greenthumb.backend.garden.ClimateZone;
import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.garden.GardenType;
import java.util.List;

/** Grounds planning-assistant prompts in the garden's environment and current inventory. */
public record GardenContext(
        GardenType type,
        String city,
        String state,
        String zipCode,
        ClimateZone climateZone,
        List<String> plantCommonNames) {

    public static GardenContext from(Garden garden, List<String> plantCommonNames) {
        return new GardenContext(
                garden.getType(),
                garden.getCity(),
                garden.getState(),
                garden.getZipCode(),
                garden.getClimateZone(),
                plantCommonNames);
    }
}
