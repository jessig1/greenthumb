package com.greenthumb.backend.container;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContainerRepository extends JpaRepository<Container, UUID> {

    List<Container> findByGarden_IdAndGarden_Owner_IdOrderByCreatedAtDesc(UUID gardenId, UUID ownerId);

    // PlantedPlantService.create()/quickAdd() hold onto this Container (via ContainerService's
    // ownership check) and pass it straight into a new PlantedPlant that gets mapped to
    // PlantedPlantResponse before the request ends - that mapping reaches into
    // container.getGarden().getName(), so garden must be fetched eagerly here rather than lazily
    // (see the LazyInitializationException gotcha in backend/CLAUDE.md).
    @EntityGraph(attributePaths = "garden")
    Optional<Container> findByIdAndGarden_Owner_Id(UUID id, UUID ownerId);
}
