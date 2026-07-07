package com.greenthumb.backend.garden;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GardenRepository extends JpaRepository<Garden, UUID> {

    List<Garden> findByOwner_IdOrderByCreatedAtDesc(UUID ownerId);

    Optional<Garden> findByIdAndOwner_Id(UUID id, UUID ownerId);
}
