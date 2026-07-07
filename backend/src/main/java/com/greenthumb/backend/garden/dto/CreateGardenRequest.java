package com.greenthumb.backend.garden.dto;

import com.greenthumb.backend.garden.GardenType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateGardenRequest(
        @NotBlank String name, @NotNull GardenType type, String description) {}
