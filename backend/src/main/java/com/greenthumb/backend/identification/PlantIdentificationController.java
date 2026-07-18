package com.greenthumb.backend.identification;

import com.greenthumb.backend.common.auth.CurrentUserContext;
import com.greenthumb.backend.identification.dto.PlantIdentificationResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlantIdentificationController {

    private final PlantIdentificationHistoryService plantIdentificationHistoryService;
    private final CurrentUserContext currentUserContext;

    public PlantIdentificationController(
            PlantIdentificationHistoryService plantIdentificationHistoryService,
            CurrentUserContext currentUserContext) {
        this.plantIdentificationHistoryService = plantIdentificationHistoryService;
        this.currentUserContext = currentUserContext;
    }

    @GetMapping("/api/v1/plant-identifications")
    public List<PlantIdentificationResponse> recent() {
        return plantIdentificationHistoryService.recentForOwner(currentUserContext.getAppUserId()).stream()
                .map(PlantIdentificationResponse::from)
                .toList();
    }
}
