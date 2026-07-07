package com.greenthumb.backend.container;

import com.greenthumb.backend.common.auth.CurrentUserContext;
import com.greenthumb.backend.container.dto.ContainerResponse;
import com.greenthumb.backend.container.dto.CreateContainerRequest;
import com.greenthumb.backend.container.dto.UpdateContainerRequest;
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
public class ContainerController {

    private final ContainerService containerService;
    private final CurrentUserContext currentUserContext;

    public ContainerController(ContainerService containerService, CurrentUserContext currentUserContext) {
        this.containerService = containerService;
        this.currentUserContext = currentUserContext;
    }

    @GetMapping("/api/v1/gardens/{gardenId}/containers")
    public List<ContainerResponse> list(@PathVariable UUID gardenId) {
        return containerService.findAllForGarden(gardenId, currentUserContext.getAppUserId()).stream()
                .map(ContainerResponse::from)
                .toList();
    }

    @PostMapping("/api/v1/gardens/{gardenId}/containers")
    public ResponseEntity<ContainerResponse> create(
            @PathVariable UUID gardenId, @Valid @RequestBody CreateContainerRequest request) {
        Container container = containerService.create(gardenId, currentUserContext.getAppUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ContainerResponse.from(container));
    }

    @GetMapping("/api/v1/containers/{id}")
    public ContainerResponse getOne(@PathVariable UUID id) {
        return ContainerResponse.from(containerService.getForOwner(id, currentUserContext.getAppUserId()));
    }

    @PutMapping("/api/v1/containers/{id}")
    public ContainerResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateContainerRequest request) {
        return ContainerResponse.from(
                containerService.update(id, currentUserContext.getAppUserId(), request));
    }

    @DeleteMapping("/api/v1/containers/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        containerService.delete(id, currentUserContext.getAppUserId());
        return ResponseEntity.noContent().build();
    }
}
