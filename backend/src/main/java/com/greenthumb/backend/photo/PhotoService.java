package com.greenthumb.backend.photo;

import com.greenthumb.backend.common.web.InvalidRequestException;
import com.greenthumb.backend.common.web.NotFoundException;
import com.greenthumb.backend.container.ContainerService;
import com.greenthumb.backend.garden.GardenService;
import com.greenthumb.backend.photo.storage.StorageService;
import com.greenthumb.backend.planting.PlantedPlantService;
import com.greenthumb.backend.user.AppUserRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class PhotoService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE_BYTES = 8L * 1024 * 1024;

    private final PhotoRepository photoRepository;
    private final StorageService storageService;
    private final GardenService gardenService;
    private final ContainerService containerService;
    private final PlantedPlantService plantedPlantService;
    private final AppUserRepository appUserRepository;

    public PhotoService(
            PhotoRepository photoRepository,
            StorageService storageService,
            GardenService gardenService,
            ContainerService containerService,
            PlantedPlantService plantedPlantService,
            AppUserRepository appUserRepository) {
        this.photoRepository = photoRepository;
        this.storageService = storageService;
        this.gardenService = gardenService;
        this.containerService = containerService;
        this.plantedPlantService = plantedPlantService;
        this.appUserRepository = appUserRepository;
    }

    public List<Photo> findAllForGarden(UUID gardenId, UUID ownerId) {
        gardenService.getForOwner(gardenId, ownerId); // ensures the garden is owned by the caller
        return photoRepository.findByEntityTypeAndEntityIdAndOwner_IdOrderByCreatedAtDesc(
                PhotoEntityType.GARDEN, gardenId, ownerId);
    }

    public List<Photo> findAllForContainer(UUID containerId, UUID ownerId) {
        containerService.getForOwner(containerId, ownerId); // ensures the container is owned by the caller
        return photoRepository.findByEntityTypeAndEntityIdAndOwner_IdOrderByCreatedAtDesc(
                PhotoEntityType.CONTAINER, containerId, ownerId);
    }

    public List<Photo> findAllForPlanting(UUID plantedPlantId, UUID ownerId) {
        plantedPlantService.getForOwner(plantedPlantId, ownerId); // ensures the planting is owned by the caller
        return photoRepository.findByEntityTypeAndEntityIdAndOwner_IdOrderByCreatedAtDesc(
                PhotoEntityType.PLANTED_PLANT, plantedPlantId, ownerId);
    }

    /** Throws {@link NotFoundException} if the photo doesn't exist OR belongs to someone else. */
    public Photo getForOwner(UUID photoId, UUID ownerId) {
        return photoRepository
                .findByIdAndOwner_Id(photoId, ownerId)
                .orElseThrow(() -> new NotFoundException("Photo not found: " + photoId));
    }

    @Transactional
    public Photo uploadForGarden(UUID gardenId, UUID ownerId, MultipartFile file, String caption) {
        gardenService.getForOwner(gardenId, ownerId);
        return upload(PhotoEntityType.GARDEN, gardenId, ownerId, file, caption);
    }

    @Transactional
    public Photo uploadForContainer(UUID containerId, UUID ownerId, MultipartFile file, String caption) {
        containerService.getForOwner(containerId, ownerId);
        return upload(PhotoEntityType.CONTAINER, containerId, ownerId, file, caption);
    }

    @Transactional
    public Photo uploadForPlanting(UUID plantedPlantId, UUID ownerId, MultipartFile file, String caption) {
        plantedPlantService.getForOwner(plantedPlantId, ownerId);
        return upload(PhotoEntityType.PLANTED_PLANT, plantedPlantId, ownerId, file, caption);
    }

    @Transactional
    public void delete(UUID photoId, UUID ownerId) {
        Photo photo = getForOwner(photoId, ownerId);
        storageService.deleteObject(photo.getObjectKey());
        photoRepository.delete(photo);
    }

    private Photo upload(PhotoEntityType entityType, UUID entityId, UUID ownerId, MultipartFile file, String caption) {
        validate(file);

        String extension = extensionFor(file.getContentType());
        String key = "photos/%s/%s/%s/%s%s".formatted(
                ownerId, entityType.name().toLowerCase(), entityId, UUID.randomUUID(), extension);

        byte[] content;
        try {
            content = file.getBytes();
        } catch (java.io.IOException e) {
            throw new InvalidRequestException("Could not read uploaded file");
        }

        storageService.putObject(key, content, file.getContentType());

        Photo photo = new Photo(
                appUserRepository.getReferenceById(ownerId),
                entityType,
                entityId,
                key,
                file.getContentType(),
                (int) file.getSize(),
                caption);
        return photoRepository.save(photo);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("A photo file is required");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new InvalidRequestException("Unsupported image type: " + file.getContentType());
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new InvalidRequestException("Photo exceeds the 8MB size limit");
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
