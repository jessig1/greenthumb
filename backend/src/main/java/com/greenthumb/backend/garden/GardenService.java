package com.greenthumb.backend.garden;

import com.greenthumb.backend.common.web.NotFoundException;
import com.greenthumb.backend.garden.dto.CreateGardenRequest;
import com.greenthumb.backend.garden.dto.UpdateGardenRequest;
import com.greenthumb.backend.user.AppUserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class GardenService {

    private final GardenRepository gardenRepository;
    private final AppUserRepository appUserRepository;

    public GardenService(GardenRepository gardenRepository, AppUserRepository appUserRepository) {
        this.gardenRepository = gardenRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<Garden> findAllForOwner(UUID ownerId) {
        return gardenRepository.findByOwner_IdOrderByCreatedAtDesc(ownerId);
    }

    /** Throws {@link NotFoundException} if the garden doesn't exist OR belongs to a different owner - the caller can't tell the two apart. */
    public Garden getForOwner(UUID gardenId, UUID ownerId) {
        return gardenRepository.findByIdAndOwner_Id(gardenId, ownerId)
                .orElseThrow(() -> new NotFoundException("Garden not found: " + gardenId));
    }

    @Transactional
    public Garden create(UUID ownerId, CreateGardenRequest request) {
        Garden garden = new Garden(
                appUserRepository.getReferenceById(ownerId), request.name(), request.type(), request.description());
        return gardenRepository.save(garden);
    }

    @Transactional
    public Garden update(UUID gardenId, UUID ownerId, UpdateGardenRequest request) {
        Garden garden = getForOwner(gardenId, ownerId);
        garden.setName(request.name());
        garden.setType(request.type());
        garden.setDescription(request.description());
        return garden;
    }

    @Transactional
    public void delete(UUID gardenId, UUID ownerId) {
        Garden garden = getForOwner(gardenId, ownerId);
        gardenRepository.delete(garden);
    }
}
