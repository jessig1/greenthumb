package com.greenthumb.backend.diagnosis;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantDiagnosisRepository extends JpaRepository<PlantDiagnosis, UUID> {

    @EntityGraph(attributePaths = "photo")
    List<PlantDiagnosis> findByPlantedPlant_IdAndOwner_IdOrderByCreatedAtDesc(UUID plantedPlantId, UUID ownerId);
}
