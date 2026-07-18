package com.greenthumb.backend.plant;

import com.greenthumb.backend.common.web.NotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PlantService {

    private final PlantRepository plantRepository;

    public PlantService(PlantRepository plantRepository) {
        this.plantRepository = plantRepository;
    }

    public List<Plant> findAll(PlantCategory category) {
        return category == null
                ? plantRepository.findAllByOrderByCommonName()
                : plantRepository.findByCategoryOrderByCommonName(category);
    }

    public Plant getById(UUID id) {
        return plantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Plant not found: " + id));
    }

    @Transactional
    public Plant createFromIdentification(
            String commonName,
            String scientificName,
            PlantCategory category,
            LightRequirement lightRequirement,
            String lightNotes,
            String soilNotes,
            String wateringNotes,
            String feedingNotes,
            String pruningNotes) {
        Plant plant = new Plant(
                commonName,
                scientificName,
                category,
                lightRequirement,
                lightNotes,
                soilNotes,
                wateringNotes,
                feedingNotes,
                pruningNotes);
        return plantRepository.save(plant);
    }
}
