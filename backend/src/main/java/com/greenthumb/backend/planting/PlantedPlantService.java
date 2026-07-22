package com.greenthumb.backend.planting;

import com.greenthumb.backend.common.web.InvalidRequestException;
import com.greenthumb.backend.common.web.NotFoundException;
import com.greenthumb.backend.container.Container;
import com.greenthumb.backend.container.ContainerService;
import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.garden.GardenService;
import com.greenthumb.backend.plant.Plant;
import com.greenthumb.backend.plant.PlantRepository;
import com.greenthumb.backend.planting.dto.CreatePlantedPlantRequest;
import com.greenthumb.backend.planting.dto.QuickAddPlantingRequest;
import com.greenthumb.backend.planting.dto.UpdatePlantedPlantRequest;
import com.greenthumb.backend.user.AppUserRepository;
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
    private final GardenService gardenService;
    private final PlantRepository plantRepository;
    private final AppUserRepository appUserRepository;

    public PlantedPlantService(
            PlantedPlantRepository plantedPlantRepository,
            ContainerService containerService,
            GardenService gardenService,
            PlantRepository plantRepository,
            AppUserRepository appUserRepository) {
        this.plantedPlantRepository = plantedPlantRepository;
        this.containerService = containerService;
        this.gardenService = gardenService;
        this.plantRepository = plantRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<PlantedPlant> findAllForContainer(UUID containerId, UUID ownerId) {
        containerService.getForOwner(containerId, ownerId); // ensures the container is owned by the caller
        return plantedPlantRepository.findByContainer_IdAndOwner_IdOrderByCreatedAtDesc(containerId, ownerId);
    }

    /** Every planting the caller owns, assigned to a container or not - backs the dashboard inventory. */
    public List<PlantedPlant> findAllForOwner(UUID ownerId) {
        return plantedPlantRepository.findByOwner_IdOrderByCreatedAtDesc(ownerId);
    }

    /** Throws {@link NotFoundException} if the planting doesn't exist OR belongs to someone else. */
    public PlantedPlant getForOwner(UUID plantedPlantId, UUID ownerId) {
        return plantedPlantRepository.findByIdAndOwner_Id(plantedPlantId, ownerId)
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
                appUserRepository.getReferenceById(ownerId),
                container,
                container.getGarden(),
                plant,
                request.nickname(),
                request.quantity() == null ? 1 : request.quantity(),
                request.plannedDate(),
                request.plantedDate(),
                status,
                request.notes());
        return plantedPlantRepository.save(plantedPlant);
    }

    /** Dashboard/garden "quick add": garden/container are optional - either may be assigned up front. */
    @Transactional
    public PlantedPlant quickAdd(UUID ownerId, QuickAddPlantingRequest request) {
        Plant plant = plantRepository.findById(request.plantId())
                .orElseThrow(() -> new NotFoundException("Plant not found: " + request.plantId()));

        Container container = null;
        Garden garden = null;
        if (request.containerId() != null) {
            container = containerService.getForOwner(request.containerId(), ownerId);
            garden = container.getGarden();
            if (request.gardenId() != null && !request.gardenId().equals(garden.getId())) {
                throw new InvalidRequestException(
                        "containerId " + request.containerId() + " does not belong to gardenId " + request.gardenId());
            }
        } else if (request.gardenId() != null) {
            garden = gardenService.getForOwner(request.gardenId(), ownerId);
        }

        // The quick-add form doesn't collect a planted date, but the DB requires one once status
        // moves past PLANNED - default to today rather than asking the user for a field they
        // weren't meant to need.
        LocalDate plantedDate = request.status() == PlantingStatus.PLANNED ? null : LocalDate.now();

        PlantedPlant plantedPlant = new PlantedPlant(
                appUserRepository.getReferenceById(ownerId),
                container,
                garden,
                plant,
                null,
                request.quantity(),
                null,
                plantedDate,
                request.status(),
                null);
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
