package com.greenthumb.backend.plant;

import com.greenthumb.backend.plant.dto.PlantResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/plants")
public class PlantController {

    private final PlantService plantService;

    public PlantController(PlantService plantService) {
        this.plantService = plantService;
    }

    @GetMapping
    public List<PlantResponse> list(@RequestParam(required = false) PlantCategory category) {
        return plantService.findAll(category).stream().map(PlantResponse::from).toList();
    }

    @GetMapping("/{id}")
    public PlantResponse getOne(@PathVariable UUID id) {
        return PlantResponse.from(plantService.getById(id));
    }
}
