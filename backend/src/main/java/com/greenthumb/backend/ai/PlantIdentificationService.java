package com.greenthumb.backend.ai;

import com.greenthumb.backend.ai.dto.IdentifyPlantResponse;
import com.greenthumb.backend.common.auth.CurrentUserContext;
import com.greenthumb.backend.common.web.InvalidRequestException;
import com.greenthumb.backend.garden.Garden;
import com.greenthumb.backend.garden.GardenService;
import com.greenthumb.backend.identification.PlantIdentificationHistoryService;
import com.greenthumb.backend.plant.LightRequirement;
import com.greenthumb.backend.plant.Plant;
import com.greenthumb.backend.plant.PlantCareDifficulty;
import com.greenthumb.backend.plant.PlantCategory;
import com.greenthumb.backend.plant.PlantLifeCycle;
import com.greenthumb.backend.plant.PlantRepository;
import com.greenthumb.backend.plant.PlantService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class PlantIdentificationService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE_BYTES = 8L * 1024 * 1024;
    private static final String UNKNOWN = "unknown";

    private final AiClient aiClient;
    private final PlantRepository plantRepository;
    private final PlantService plantService;
    private final GardenService gardenService;
    private final PlantIdentificationHistoryService plantIdentificationHistoryService;
    private final CurrentUserContext currentUserContext;

    public PlantIdentificationService(
            AiClient aiClient,
            PlantRepository plantRepository,
            PlantService plantService,
            GardenService gardenService,
            PlantIdentificationHistoryService plantIdentificationHistoryService,
            CurrentUserContext currentUserContext) {
        this.aiClient = aiClient;
        this.plantRepository = plantRepository;
        this.plantService = plantService;
        this.gardenService = gardenService;
        this.plantIdentificationHistoryService = plantIdentificationHistoryService;
        this.currentUserContext = currentUserContext;
    }

    // Uploaded bytes are used for this one AI call and discarded - only the AI's answer is kept
    // (as a PlantIdentification history row), not the photo itself.
    @Transactional
    public IdentifyPlantResponse identify(MultipartFile file) {
        validate(file);
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new InvalidRequestException("Could not read uploaded file");
        }

        UUID ownerId = currentUserContext.getAppUserId();
        List<Garden> gardens = gardenService.findAllForOwner(ownerId);
        List<GardenContext> gardenContexts =
                gardens.stream().map(garden -> GardenContext.from(garden, List.of())).toList();

        String raw = aiClient.identifyPlant(bytes, file.getContentType(), gardenContexts);
        Map<String, String> fields = parseLabeledLines(raw);

        String commonName = fields.get("COMMON_NAME");
        UUID matchedPlantId = null;
        boolean addedToCatalog = false;
        if (isUsable(commonName)) {
            matchedPlantId = plantRepository
                    .findByCommonNameIgnoreCase(commonName.trim())
                    .map(Plant::getId)
                    .orElse(null);
            if (matchedPlantId == null) {
                Plant created = tryAddToCatalog(commonName.trim(), fields);
                if (created != null) {
                    matchedPlantId = created.getId();
                    addedToCatalog = true;
                }
            }
        }

        List<UUID> recommendedGardenIds = matchGardenNames(fields.get("RECOMMENDED_GARDENS"), gardens);

        plantIdentificationHistoryService.record(
                ownerId, commonName, fields.get("SCIENTIFIC_NAME"), matchedPlantId, addedToCatalog);

        return new IdentifyPlantResponse(
                commonName,
                fields.get("SCIENTIFIC_NAME"),
                fields.get("CATEGORY"),
                fields.get("LIFE_CYCLE"),
                fields.get("CARE_DIFFICULTY"),
                fields.get("LIGHT"),
                fields.get("TEMPERATURE"),
                fields.get("SOIL"),
                fields.get("WATERING"),
                fields.get("FERTILIZER"),
                fields.get("PRUNING"),
                fields.get("PEST_MANAGEMENT"),
                fields.get("TOXICITY"),
                fields.get("OTHER"),
                fields.get("NOTES"),
                matchedPlantId,
                addedToCatalog,
                recommendedGardenIds,
                fields.get("GARDEN_FIT_NOTES"));
    }

    /**
     * Best-effort: only worth adding to the shared catalog when the AI gave both a usable name
     * and enum values we can trust (CATEGORY/LIGHT_REQUIREMENT must parse cleanly) - otherwise
     * leave the identification unmatched rather than pollute the catalog with a garbled row.
     * LIFE_CYCLE/CARE_DIFFICULTY are best-effort on top of that - a bad guess there just leaves
     * the column null rather than blocking catalog creation entirely.
     */
    private Plant tryAddToCatalog(String commonName, Map<String, String> fields) {
        PlantCategory category = parseEnum(PlantCategory.class, fields.get("CATEGORY"));
        LightRequirement lightRequirement = parseEnum(LightRequirement.class, fields.get("LIGHT_REQUIREMENT"));
        if (category == null || lightRequirement == null) {
            return null;
        }
        PlantLifeCycle lifeCycle = parseEnum(PlantLifeCycle.class, fields.get("LIFE_CYCLE"));
        PlantCareDifficulty careDifficulty = parseEnum(PlantCareDifficulty.class, fields.get("CARE_DIFFICULTY"));

        return plantService.createFromIdentification(
                commonName,
                fields.get("SCIENTIFIC_NAME"),
                category,
                lifeCycle,
                careDifficulty,
                lightRequirement,
                fields.get("LIGHT"),
                fields.get("TEMPERATURE"),
                fields.get("SOIL"),
                fields.get("WATERING"),
                fields.get("FERTILIZER"),
                fields.get("PRUNING"),
                fields.get("TOXICITY"));
    }

    // Best-effort, case-insensitive name matching against the user's own gardens - mirrors the
    // plant-catalog name matching above. Unmatched/hallucinated names are silently dropped rather
    // than failing the whole identification.
    private List<UUID> matchGardenNames(String namesCsv, List<Garden> gardens) {
        if (namesCsv == null || namesCsv.isBlank() || gardens.isEmpty()) {
            return List.of();
        }
        Map<String, UUID> idByName = new HashMap<>();
        for (Garden garden : gardens) {
            idByName.put(garden.getName().trim().toLowerCase(), garden.getId());
        }
        List<UUID> matched = new ArrayList<>();
        for (String name : namesCsv.split(",")) {
            UUID id = idByName.get(name.trim().toLowerCase());
            if (id != null && !matched.contains(id)) {
                matched.add(id);
            }
        }
        return matched;
    }

    private <E extends Enum<E>> E parseEnum(Class<E> type, String value) {
        if (value == null) {
            return null;
        }
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    // Substring (not exact-match) check on purpose: the model is prompted to answer exactly
    // "unknown", but in practice it sometimes hedges with a descriptive phrase instead (e.g.
    // "Unknown (photo too unclear)") - checking for the word anywhere in the name catches that
    // without relying on the model always following the exact-match convention.
    private boolean isUsable(String commonName) {
        return commonName != null && !commonName.isBlank() && !commonName.toLowerCase().contains(UNKNOWN);
    }

    /**
     * Parses "LABEL: value" lines. Best-effort - the model is prompted for this exact shape, but
     * if it deviates, unmatched labels are simply left null on the response rather than failing.
     */
    private Map<String, String> parseLabeledLines(String raw) {
        Map<String, String> fields = new HashMap<>();
        for (String line : raw.split("\n")) {
            int colon = line.indexOf(':');
            if (colon <= 0) {
                continue;
            }
            String label = line.substring(0, colon).trim().toUpperCase();
            String value = line.substring(colon + 1).trim();
            if (!value.isEmpty()) {
                fields.put(label, value);
            }
        }
        return fields;
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
}
