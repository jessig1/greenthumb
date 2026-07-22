package com.greenthumb.backend.ai.dto;

import java.util.List;
import java.util.UUID;

public record IdentifyPlantResponse(
        String suggestedCommonName,
        String suggestedScientificName,
        String suggestedCategory,
        String suggestedLifeCycle,
        String suggestedCareDifficulty,
        String light,
        String temperature,
        String soil,
        String watering,
        String fertilizer,
        String pruning,
        String pestManagement,
        String toxicity,
        String other,
        String notes,
        UUID matchedPlantId,
        boolean addedToCatalog,
        List<UUID> recommendedGardenIds,
        String gardenFitNotes) {}
