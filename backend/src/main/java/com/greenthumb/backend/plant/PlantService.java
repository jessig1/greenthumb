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
            PlantLifeCycle lifeCycle,
            PlantCareDifficulty careDifficulty,
            LightRequirement lightRequirement,
            String lightNotes,
            String temperatureNotes,
            String soilNotes,
            String wateringNotes,
            String feedingNotes,
            String pruningNotes,
            String toxicityNotes) {
        Plant plant = new Plant(
                commonName,
                scientificName,
                category,
                lifeCycle,
                careDifficulty,
                lightRequirement,
                lightNotes,
                temperatureNotes,
                soilNotes,
                wateringNotes,
                feedingNotes,
                pruningNotes,
                toxicityNotes);
        return plantRepository.save(plant);
    }
}
