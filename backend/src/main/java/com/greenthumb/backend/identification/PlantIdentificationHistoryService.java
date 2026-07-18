package com.greenthumb.backend.identification;

import com.greenthumb.backend.user.AppUserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PlantIdentificationHistoryService {

    private final PlantIdentificationRepository plantIdentificationRepository;
    private final AppUserRepository appUserRepository;

    public PlantIdentificationHistoryService(
            PlantIdentificationRepository plantIdentificationRepository, AppUserRepository appUserRepository) {
        this.plantIdentificationRepository = plantIdentificationRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<PlantIdentification> recentForOwner(UUID ownerId) {
        return plantIdentificationRepository.findTop10ByOwner_IdOrderByCreatedAtDesc(ownerId);
    }

    @Transactional
    public void record(
            UUID ownerId,
            String suggestedCommonName,
            String suggestedScientificName,
            UUID matchedPlantId,
            boolean addedToCatalog) {
        PlantIdentification identification = new PlantIdentification(
                appUserRepository.getReferenceById(ownerId),
                suggestedCommonName,
                suggestedScientificName,
                matchedPlantId,
                addedToCatalog);
        plantIdentificationRepository.save(identification);
    }
}
