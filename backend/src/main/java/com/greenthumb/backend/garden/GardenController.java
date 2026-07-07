package com.greenthumb.backend.garden;

import com.greenthumb.backend.common.auth.CurrentUserContext;
import com.greenthumb.backend.garden.dto.CreateGardenRequest;
import com.greenthumb.backend.garden.dto.GardenResponse;
import com.greenthumb.backend.garden.dto.UpdateGardenRequest;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gardens")
public class GardenController {

    private final GardenService gardenService;
    private final CurrentUserContext currentUserContext;

    public GardenController(GardenService gardenService, CurrentUserContext currentUserContext) {
        this.gardenService = gardenService;
        this.currentUserContext = currentUserContext;
    }

    @GetMapping
    public List<GardenResponse> list() {
        return gardenService.findAllForOwner(currentUserContext.getAppUserId()).stream()
                .map(GardenResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<GardenResponse> create(@Valid @RequestBody CreateGardenRequest request) {
        Garden garden = gardenService.create(currentUserContext.getAppUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(GardenResponse.from(garden));
    }

    @GetMapping("/{id}")
    public GardenResponse getOne(@PathVariable UUID id) {
        return GardenResponse.from(gardenService.getForOwner(id, currentUserContext.getAppUserId()));
    }

    @PutMapping("/{id}")
    public GardenResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateGardenRequest request) {
        return GardenResponse.from(gardenService.update(id, currentUserContext.getAppUserId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        gardenService.delete(id, currentUserContext.getAppUserId());
        return ResponseEntity.noContent().build();
    }
}
