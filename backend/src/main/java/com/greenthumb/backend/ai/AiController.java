package com.greenthumb.backend.ai;

import com.greenthumb.backend.ai.dto.IdentifyPlantResponse;
import com.greenthumb.backend.ai.dto.PlanningAssistantRequest;
import com.greenthumb.backend.ai.dto.PlanningAssistantResponse;
import com.greenthumb.backend.common.auth.CurrentUserContext;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class AiController {

    private final PlantIdentificationService plantIdentificationService;
    private final GardenPlanningService gardenPlanningService;
    private final CurrentUserContext currentUserContext;

    public AiController(
            PlantIdentificationService plantIdentificationService,
            GardenPlanningService gardenPlanningService,
            CurrentUserContext currentUserContext) {
        this.plantIdentificationService = plantIdentificationService;
        this.gardenPlanningService = gardenPlanningService;
        this.currentUserContext = currentUserContext;
    }

    @PostMapping("/api/v1/ai/identify-plant")
    public IdentifyPlantResponse identifyPlant(@RequestParam("file") MultipartFile file) {
        return plantIdentificationService.identify(file);
    }

    @PostMapping("/api/v1/gardens/{gardenId}/planning-assistant")
    public PlanningAssistantResponse planningAssistant(
            @PathVariable UUID gardenId, @Valid @RequestBody PlanningAssistantRequest request) {
        String answer = gardenPlanningService.suggestPlanning(
                gardenId, currentUserContext.getAppUserId(), request.question());
        return new PlanningAssistantResponse(answer);
    }
}
