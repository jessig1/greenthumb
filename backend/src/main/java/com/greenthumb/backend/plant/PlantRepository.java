package com.greenthumb.backend.plant;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantRepository extends JpaRepository<Plant, UUID> {

    List<Plant> findByCategoryOrderByCommonName(PlantCategory category);

    List<Plant> findAllByOrderByCommonName();
}
