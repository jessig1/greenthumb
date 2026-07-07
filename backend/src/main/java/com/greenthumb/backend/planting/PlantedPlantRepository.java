package com.greenthumb.backend.planting;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantedPlantRepository extends JpaRepository<PlantedPlant, UUID> {

    // PlantedPlantResponse.from() always needs the full Plant, so fetch it eagerly here rather
    // than lazily - with open-in-view disabled, a lazy touch after the transaction closes throws
    // LazyInitializationException.
    @EntityGraph(attributePaths = "plant")
    List<PlantedPlant> findByContainer_IdAndContainer_Garden_Owner_IdOrderByCreatedAtDesc(
            UUID containerId, UUID ownerId);

    @EntityGraph(attributePaths = "plant")
    Optional<PlantedPlant> findByIdAndContainer_Garden_Owner_Id(UUID id, UUID ownerId);
}
