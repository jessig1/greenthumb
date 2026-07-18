package com.greenthumb.backend.identification.dto;

import com.greenthumb.backend.identification.PlantIdentification;
import java.time.Instant;
import java.util.UUID;

public record PlantIdentificationResponse(
        UUID id,
        String suggestedCommonName,
        String suggestedScientificName,
        UUID matchedPlantId,
        boolean addedToCatalog,
        Instant createdAt) {

    public static PlantIdentificationResponse from(PlantIdentification identification) {
        return new PlantIdentificationResponse(
                identification.getId(),
                identification.getSuggestedCommonName(),
                identification.getSuggestedScientificName(),
                identification.getMatchedPlantId(),
                identification.isAddedToCatalog(),
                identification.getCreatedAt());
    }
}
