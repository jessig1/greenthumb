package com.greenthumb.backend.planting;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantedPlantRepository extends JpaRepository<PlantedPlant, UUID> {

    // PlantedPlantResponse.from() always needs the full Plant, plus (for the dashboard inventory's
    // garden/container tags) the container and its garden - fetch them all eagerly here rather
    // than lazily, since with open-in-view disabled, a lazy touch after the transaction closes
    // throws LazyInitializationException.
    @EntityGraph(attributePaths = {"plant", "container", "container.garden"})
    List<PlantedPlant> findByContainer_IdAndOwner_IdOrderByCreatedAtDesc(UUID containerId, UUID ownerId);

    @EntityGraph(attributePaths = {"plant", "container", "container.garden"})
    Optional<PlantedPlant> findByIdAndOwner_Id(UUID id, UUID ownerId);

    // Every planting owned by the caller, assigned to a container or not - backs the dashboard's
    // full plant inventory.
    @EntityGraph(attributePaths = {"plant", "container", "container.garden"})
    List<PlantedPlant> findByOwner_IdOrderByCreatedAtDesc(UUID ownerId);
}
