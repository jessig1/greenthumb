package com.greenthumb.backend.container;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContainerRepository extends JpaRepository<Container, UUID> {

    List<Container> findByGarden_IdAndGarden_Owner_IdOrderByCreatedAtDesc(UUID gardenId, UUID ownerId);

    Optional<Container> findByIdAndGarden_Owner_Id(UUID id, UUID ownerId);
}
