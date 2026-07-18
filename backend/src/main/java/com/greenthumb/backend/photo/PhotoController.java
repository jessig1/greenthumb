package com.greenthumb.backend.photo;

import com.greenthumb.backend.common.auth.CurrentUserContext;
import com.greenthumb.backend.photo.dto.PhotoResponse;
import com.greenthumb.backend.photo.storage.StorageService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class PhotoController {

    private final PhotoService photoService;
    private final StorageService storageService;
    private final CurrentUserContext currentUserContext;

    public PhotoController(PhotoService photoService, StorageService storageService, CurrentUserContext currentUserContext) {
        this.photoService = photoService;
        this.storageService = storageService;
        this.currentUserContext = currentUserContext;
    }

    @GetMapping("/api/v1/gardens/{gardenId}/photos")
    public List<PhotoResponse> listForGarden(@PathVariable UUID gardenId) {
        return toResponses(photoService.findAllForGarden(gardenId, currentUserContext.getAppUserId()));
    }

    @PostMapping("/api/v1/gardens/{gardenId}/photos")
    public ResponseEntity<PhotoResponse> uploadForGarden(
            @PathVariable UUID gardenId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String caption) {
        Photo photo = photoService.uploadForGarden(gardenId, currentUserContext.getAppUserId(), file, caption);
        return ResponseEntity.status(HttpStatus.CREATED).body(PhotoResponse.from(photo, storageService));
    }

    @GetMapping("/api/v1/containers/{containerId}/photos")
    public List<PhotoResponse> listForContainer(@PathVariable UUID containerId) {
        return toResponses(photoService.findAllForContainer(containerId, currentUserContext.getAppUserId()));
    }

    @PostMapping("/api/v1/containers/{containerId}/photos")
    public ResponseEntity<PhotoResponse> uploadForContainer(
            @PathVariable UUID containerId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String caption) {
        Photo photo = photoService.uploadForContainer(containerId, currentUserContext.getAppUserId(), file, caption);
        return ResponseEntity.status(HttpStatus.CREATED).body(PhotoResponse.from(photo, storageService));
    }

    @GetMapping("/api/v1/plantings/{plantingId}/photos")
    public List<PhotoResponse> listForPlanting(@PathVariable UUID plantingId) {
        return toResponses(photoService.findAllForPlanting(plantingId, currentUserContext.getAppUserId()));
    }

    @PostMapping("/api/v1/plantings/{plantingId}/photos")
    public ResponseEntity<PhotoResponse> uploadForPlanting(
            @PathVariable UUID plantingId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String caption) {
        Photo photo = photoService.uploadForPlanting(plantingId, currentUserContext.getAppUserId(), file, caption);
        return ResponseEntity.status(HttpStatus.CREATED).body(PhotoResponse.from(photo, storageService));
    }

    @DeleteMapping("/api/v1/photos/{photoId}")
    public ResponseEntity<Void> delete(@PathVariable UUID photoId) {
        photoService.delete(photoId, currentUserContext.getAppUserId());
        return ResponseEntity.noContent().build();
    }

    private List<PhotoResponse> toResponses(List<Photo> photos) {
        return photos.stream().map(photo -> PhotoResponse.from(photo, storageService)).toList();
    }
}
