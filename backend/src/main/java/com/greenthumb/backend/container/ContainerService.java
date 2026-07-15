package com.greenthumb.backend.container;

import com.greenthumb.backend.container.dto.CreateContainerRequest;
import com.greenthumb.backend.container.dto.UpdateContainerRequest;
import com.greenthumb.backend.common.web.NotFoundException;
import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.garden.GardenService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ContainerService {

    private final ContainerRepository containerRepository;
    private final GardenService gardenService;

    public ContainerService(ContainerRepository containerRepository, GardenService gardenService) {
        this.containerRepository = containerRepository;
        this.gardenService = gardenService;
    }

    public List<Container> findAllForGarden(UUID gardenId, UUID ownerId) {
        gardenService.getForOwner(gardenId, ownerId); // ensures the garden exists and is owned by the caller
        return containerRepository.findByGarden_IdAndGarden_Owner_IdOrderByCreatedAtDesc(gardenId, ownerId);
    }

    /** Throws {@link NotFoundException} if the container doesn't exist OR its garden belongs to a different owner. */
    public Container getForOwner(UUID containerId, UUID ownerId) {
        return containerRepository.findByIdAndGarden_Owner_Id(containerId, ownerId)
                .orElseThrow(() -> new NotFoundException("Container not found: " + containerId));
    }

    @Transactional
    public Container create(UUID gardenId, UUID ownerId, CreateContainerRequest request) {
        Garden garden = gardenService.getForOwner(gardenId, ownerId);
        Container container = new Container(garden, request.name(), request.containerType(), request.sizeDescription());
        container.setSoilNotes(request.soilNotes());
        return containerRepository.save(container);
    }

    @Transactional
    public Container update(UUID containerId, UUID ownerId, UpdateContainerRequest request) {
        Container container = getForOwner(containerId, ownerId);
        container.setName(request.name());
        container.setContainerType(request.containerType());
        container.setSizeDescription(request.sizeDescription());
        container.setSoilNotes(request.soilNotes());
        return container;
    }

    @Transactional
    public void delete(UUID containerId, UUID ownerId) {
        Container container = getForOwner(containerId, ownerId);
        containerRepository.delete(container);
    }
}
