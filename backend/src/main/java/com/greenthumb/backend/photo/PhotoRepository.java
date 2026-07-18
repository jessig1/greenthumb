package com.greenthumb.backend.photo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {

    List<Photo> findByEntityTypeAndEntityIdAndOwner_IdOrderByCreatedAtDesc(
            PhotoEntityType entityType, UUID entityId, UUID ownerId);

    Optional<Photo> findByIdAndOwner_Id(UUID id, UUID ownerId);
}
