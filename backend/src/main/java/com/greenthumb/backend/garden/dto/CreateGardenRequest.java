package com.greenthumb.backend.garden.dto;

import com.greenthumb.backend.garden.ClimateZone;
import com.greenthumb.backend.garden.GardenLightExposure;
import com.greenthumb.backend.garden.GardenLightSource;
import com.greenthumb.backend.garden.GardenType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateGardenRequest(
        @NotBlank String name,
        @NotNull GardenType type,
        String description,
        GardenLightSource lightSource,
        Integer lightHoursPerDay,
        GardenLightExposure lightExposure,
        String city,
        String state,
        String zipCode,
        ClimateZone climateZone,
        LocalDate lastFrostDate,
        LocalDate firstFrostDate) {}
