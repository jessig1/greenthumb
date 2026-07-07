package com.greenthumb.backend.planting;

import com.greenthumb.backend.common.auth.CurrentUserContext;
import com.greenthumb.backend.planting.dto.CreatePlantedPlantRequest;
import com.greenthumb.backend.planting.dto.PlantedPlantResponse;
import com.greenthumb.backend.planting.dto.UpdatePlantedPlantRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlantedPlantController {

    private final PlantedPlantService plantedPlantService;
    private final CurrentUserContext currentUserContext;

    public PlantedPlantController(PlantedPlantService plantedPlantService, CurrentUserContext currentUserContext) {
        this.plantedPlantService = plantedPlantService;
        this.currentUserContext = currentUserContext;
    }

    @GetMapping("/api/v1/containers/{containerId}/plantings")
    public List<PlantedPlantResponse> list(@PathVariable UUID containerId) {
        return plantedPlantService.findAllForContainer(containerId, currentUserContext.getAppUserId()).stream()
                .map(PlantedPlantResponse::from)
                .toList();
    }

    @PostMapping("/api/v1/containers/{containerId}/plantings")
    public ResponseEntity<PlantedPlantResponse> create(
            @PathVariable UUID containerId, @Valid @RequestBody CreatePlantedPlantRequest request) {
        PlantedPlant plantedPlant =
                plantedPlantService.create(containerId, currentUserContext.getAppUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(PlantedPlantResponse.from(plantedPlant));
    }

    @GetMapping("/api/v1/plantings/{id}")
    public PlantedPlantResponse getOne(@PathVariable UUID id) {
        return PlantedPlantResponse.from(plantedPlantService.getForOwner(id, currentUserContext.getAppUserId()));
    }

    @PutMapping("/api/v1/plantings/{id}")
    public PlantedPlantResponse update(@PathVariable UUID id, @Valid @RequestBody UpdatePlantedPlantRequest request) {
        return PlantedPlantResponse.from(
                plantedPlantService.update(id, currentUserContext.getAppUserId(), request));
    }

    @DeleteMapping("/api/v1/plantings/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        plantedPlantService.delete(id, currentUserContext.getAppUserId());
        return ResponseEntity.noContent().build();
    }
}
