package com.greenthumb.backend.plant;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantRepository extends JpaRepository<Plant, UUID> {

    List<Plant> findByCategoryOrderByCommonName(PlantCategory category);

    List<Plant> findAllByOrderByCommonName();

    // Best-effort catalog match for AI plant identification - case-insensitive since the AI's
    // suggested name won't reliably match the seeded catalog's exact casing.
    Optional<Plant> findByCommonNameIgnoreCase(String commonName);
}
