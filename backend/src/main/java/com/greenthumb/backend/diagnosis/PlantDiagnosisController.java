package com.greenthumb.backend.diagnosis;

import com.greenthumb.backend.common.auth.CurrentUserContext;
import com.greenthumb.backend.diagnosis.dto.PlantDiagnosisResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlantDiagnosisController {

    private final PlantDiagnosisService plantDiagnosisService;
    private final CurrentUserContext currentUserContext;

    public PlantDiagnosisController(PlantDiagnosisService plantDiagnosisService, CurrentUserContext currentUserContext) {
        this.plantDiagnosisService = plantDiagnosisService;
        this.currentUserContext = currentUserContext;
    }

    @GetMapping("/api/v1/plantings/{plantingId}/diagnoses")
    public List<PlantDiagnosisResponse> list(@PathVariable UUID plantingId) {
        return plantDiagnosisService.findAllForPlanting(plantingId, currentUserContext.getAppUserId()).stream()
                .map(PlantDiagnosisResponse::from)
                .toList();
    }

    @PostMapping("/api/v1/plantings/{plantingId}/photos/{photoId}/diagnose")
    public ResponseEntity<PlantDiagnosisResponse> diagnose(
            @PathVariable UUID plantingId, @PathVariable UUID photoId) {
        PlantDiagnosis diagnosis =
                plantDiagnosisService.diagnose(plantingId, photoId, currentUserContext.getAppUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(PlantDiagnosisResponse.from(diagnosis));
    }

    @PostMapping("/api/v1/plantings/{plantingId}/care-suggestions")
    public ResponseEntity<PlantDiagnosisResponse> careSuggestions(@PathVariable UUID plantingId) {
        PlantDiagnosis diagnosis = plantDiagnosisService.suggestCare(plantingId, currentUserContext.getAppUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(PlantDiagnosisResponse.from(diagnosis));
    }
}
