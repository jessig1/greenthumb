package com.greenthumb.backend.ai.dto;

import java.util.UUID;

public record IdentifyPlantResponse(
        String suggestedCommonName,
        String suggestedScientificName,
        String suggestedCategory,
        String light,
        String soil,
        String watering,
        String fertilizer,
        String pruning,
        String pestManagement,
        String other,
        String notes,
        UUID matchedPlantId,
        boolean addedToCatalog) {}
