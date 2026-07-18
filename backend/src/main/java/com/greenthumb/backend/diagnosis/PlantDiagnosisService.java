package com.greenthumb.backend.diagnosis;

import com.greenthumb.backend.ai.AiClient;
import com.greenthumb.backend.ai.PlantContext;
import com.greenthumb.backend.common.web.InvalidRequestException;
import com.greenthumb.backend.photo.Photo;
import com.greenthumb.backend.photo.PhotoEntityType;
import com.greenthumb.backend.photo.PhotoService;
import com.greenthumb.backend.photo.storage.StorageService;
import com.greenthumb.backend.planting.PlantedPlant;
import com.greenthumb.backend.planting.PlantedPlantService;
import com.greenthumb.backend.user.AppUserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PlantDiagnosisService {

    private final PlantDiagnosisRepository plantDiagnosisRepository;
    private final PlantedPlantService plantedPlantService;
    private final PhotoService photoService;
    private final StorageService storageService;
    private final AiClient aiClient;
    private final AppUserRepository appUserRepository;

    public PlantDiagnosisService(
            PlantDiagnosisRepository plantDiagnosisRepository,
            PlantedPlantService plantedPlantService,
            PhotoService photoService,
            StorageService storageService,
            AiClient aiClient,
            AppUserRepository appUserRepository) {
        this.plantDiagnosisRepository = plantDiagnosisRepository;
        this.plantedPlantService = plantedPlantService;
        this.photoService = photoService;
        this.storageService = storageService;
        this.aiClient = aiClient;
        this.appUserRepository = appUserRepository;
    }

    public List<PlantDiagnosis> findAllForPlanting(UUID plantedPlantId, UUID ownerId) {
        plantedPlantService.getForOwner(plantedPlantId, ownerId); // ensures the planting is owned by the caller
        return plantDiagnosisRepository.findByPlantedPlant_IdAndOwner_IdOrderByCreatedAtDesc(plantedPlantId, ownerId);
    }

    @Transactional
    public PlantDiagnosis diagnose(UUID plantedPlantId, UUID photoId, UUID ownerId) {
        PlantedPlant plantedPlant = plantedPlantService.getForOwner(plantedPlantId, ownerId);
        Photo photo = photoService.getForOwner(photoId, ownerId);
        if (photo.getEntityType() != PhotoEntityType.PLANTED_PLANT || !photo.getEntityId().equals(plantedPlantId)) {
            throw new InvalidRequestException("Photo does not belong to this planting");
        }

        byte[] imageBytes = storageService.getObject(photo.getObjectKey());
        String resultText =
                aiClient.diagnosePlant(imageBytes, photo.getContentType(), PlantContext.from(plantedPlant));

        PlantDiagnosis diagnosis = new PlantDiagnosis(
                appUserRepository.getReferenceById(ownerId), plantedPlant, photo, resultText);
        return plantDiagnosisRepository.save(diagnosis);
    }

    @Transactional
    public PlantDiagnosis suggestCare(UUID plantedPlantId, UUID ownerId) {
        PlantedPlant plantedPlant = plantedPlantService.getForOwner(plantedPlantId, ownerId);
        String resultText = aiClient.suggestCareForPlant(PlantContext.from(plantedPlant));

        PlantDiagnosis diagnosis =
                new PlantDiagnosis(appUserRepository.getReferenceById(ownerId), plantedPlant, null, resultText);
        return plantDiagnosisRepository.save(diagnosis);
    }
}
