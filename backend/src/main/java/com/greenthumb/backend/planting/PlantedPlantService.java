package com.greenthumb.backend.planting;

import com.greenthumb.backend.common.web.InvalidRequestException;
import com.greenthumb.backend.common.web.NotFoundException;
import com.greenthumb.backend.container.Container;
import com.greenthumb.backend.container.ContainerService;
import com.greenthumb.backend.plant.Plant;
import com.greenthumb.backend.plant.PlantRepository;
import com.greenthumb.backend.planting.dto.CreatePlantedPlantRequest;
import com.greenthumb.backend.planting.dto.UpdatePlantedPlantRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PlantedPlantService {

    private final PlantedPlantRepository plantedPlantRepository;
    private final ContainerService containerService;
    private final PlantRepository plantRepository;

    public PlantedPlantService(
            PlantedPlantRepository plantedPlantRepository,
            ContainerService containerService,
            PlantRepository plantRepository) {
        this.plantedPlantRepository = plantedPlantRepository;
        this.containerService = containerService;
        this.plantRepository = plantRepository;
    }

    public List<PlantedPlant> findAllForContainer(UUID containerId, UUID ownerId) {
        containerService.getForOwner(containerId, ownerId); // ensures the container is owned by the caller
        return plantedPlantRepository.findByContainer_IdAndContainer_Garden_Owner_IdOrderByCreatedAtDesc(
                containerId, ownerId);
    }

    /** Throws {@link NotFoundException} if the planting doesn't exist OR its container's garden belongs to someone else. */
    public PlantedPlant getForOwner(UUID plantedPlantId, UUID ownerId) {
        return plantedPlantRepository.findByIdAndContainer_Garden_Owner_Id(plantedPlantId, ownerId)
                .orElseThrow(() -> new NotFoundException("Planting not found: " + plantedPlantId));
    }

    @Transactional
    public PlantedPlant create(UUID containerId, UUID ownerId, CreatePlantedPlantRequest request) {
        Container container = containerService.getForOwner(containerId, ownerId);
        Plant plant = plantRepository.findById(request.plantId())
                .orElseThrow(() -> new NotFoundException("Plant not found: " + request.plantId()));

        PlantingStatus status = request.status() == null ? PlantingStatus.PLANNED : request.status();
        requirePlantedDateWhenPastPlanned(status, request.plantedDate());

        PlantedPlant plantedPlant = new PlantedPlant(
                container,
                plant,
                request.nickname(),
                request.quantity() == null ? 1 : request.quantity(),
                request.plannedDate(),
                request.plantedDate(),
                status,
                request.notes());
        return plantedPlantRepository.save(plantedPlant);
    }

    @Transactional
    public PlantedPlant update(UUID plantedPlantId, UUID ownerId, UpdatePlantedPlantRequest request) {
        requirePlantedDateWhenPastPlanned(request.status(), request.plantedDate());

        PlantedPlant plantedPlant = getForOwner(plantedPlantId, ownerId);
        plantedPlant.setNickname(request.nickname());
        plantedPlant.setQuantity(request.quantity() == null ? plantedPlant.getQuantity() : request.quantity());
        plantedPlant.setPlannedDate(request.plannedDate());
        plantedPlant.setPlantedDate(request.plantedDate());
        plantedPlant.setStatus(request.status());
        plantedPlant.setNotes(request.notes());
        return plantedPlant;
    }

    @Transactional
    public void delete(UUID plantedPlantId, UUID ownerId) {
        PlantedPlant plantedPlant = getForOwner(plantedPlantId, ownerId);
        plantedPlantRepository.delete(plantedPlant);
    }

    private void requirePlantedDateWhenPastPlanned(PlantingStatus status, LocalDate plantedDate) {
        if (status != PlantingStatus.PLANNED && plantedDate == null) {
            throw new InvalidRequestException("plantedDate is required once status is " + status);
        }
    }
}
