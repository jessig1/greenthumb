package com.greenthumb.backend.diagnosis.dto;

import com.greenthumb.backend.diagnosis.PlantDiagnosis;
import java.time.Instant;
import java.util.UUID;

public record PlantDiagnosisResponse(UUID id, UUID plantedPlantId, UUID photoId, String resultText, Instant createdAt) {

    public static PlantDiagnosisResponse from(PlantDiagnosis diagnosis) {
        return new PlantDiagnosisResponse(
                diagnosis.getId(),
                diagnosis.getPlantedPlant().getId(),
                diagnosis.getPhoto() == null ? null : diagnosis.getPhoto().getId(),
                diagnosis.getResultText(),
                diagnosis.getCreatedAt());
    }
}
