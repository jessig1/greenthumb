package com.greenthumb.backend.identification;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantIdentificationRepository extends JpaRepository<PlantIdentification, UUID> {

    List<PlantIdentification> findTop10ByOwner_IdOrderByCreatedAtDesc(UUID ownerId);
}
