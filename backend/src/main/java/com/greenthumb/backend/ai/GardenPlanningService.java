package com.greenthumb.backend.ai;

import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.garden.GardenService;
import com.greenthumb.backend.planting.PlantedPlantService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class GardenPlanningService {

    private final GardenService gardenService;
    private final PlantedPlantService plantedPlantService;
    private final AiClient aiClient;

    public GardenPlanningService(GardenService gardenService, PlantedPlantService plantedPlantService, AiClient aiClient) {
        this.gardenService = gardenService;
        this.plantedPlantService = plantedPlantService;
        this.aiClient = aiClient;
    }

    public String suggestPlanning(UUID gardenId, UUID ownerId, String question) {
        Garden garden = gardenService.getForOwner(gardenId, ownerId);

        List<String> plantCommonNames = plantedPlantService.findAllForOwner(ownerId).stream()
                .filter(plantedPlant -> plantedPlant.getContainer() != null
                        && plantedPlant.getContainer().getGarden().getId().equals(gardenId))
                .map(plantedPlant -> plantedPlant.getPlant().getCommonName())
                .distinct()
                .toList();

        GardenContext context = GardenContext.from(garden, plantCommonNames);
        return aiClient.suggestPlanning(context, question);
    }
}
