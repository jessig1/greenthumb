package com.greenthumb.backend.ai;

import java.nio.charset.StandardCharsets;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Canned {@link AiClient} test double - the test suite never calls the real OpenAI API. */
@Component
@Profile("test")
public class FakeAiClient implements AiClient {

    /**
     * When the uploaded bytes contain this marker, {@link #identifyPlant} answers with a species
     * that's deliberately NOT in the seeded catalog, so tests can exercise the
     * add-to-catalog/history path deterministically without touching the real OpenAI API.
     */
    public static final String UNMATCHED_SPECIES_MARKER = "UNMATCHED_SPECIES";

    @Override
    public String identifyPlant(byte[] imageBytes, String contentType) {
        if (new String(imageBytes, StandardCharsets.UTF_8).contains(UNMATCHED_SPECIES_MARKER)) {
            return """
                    COMMON_NAME: Ghost Orchid
                    SCIENTIFIC_NAME: Dendrophylax lindenii
                    CATEGORY: HOUSEPLANT
                    LIGHT_REQUIREMENT: PARTIAL_SHADE
                    LIGHT: Bright indirect light, no direct sun.
                    SOIL: Epiphytic - mounted on bark, no soil.
                    WATERING: Mist regularly to maintain high humidity.
                    FERTILIZER: Dilute orchid fertilizer monthly.
                    PRUNING: Remove dead roots only.
                    PEST_MANAGEMENT: Watch for scale insects.
                    OTHER: Extremely rare in cultivation.
                    NOTES: Fake test response for a species not in the seeded catalog.
                    """;
        }
        return """
                COMMON_NAME: Tomato
                SCIENTIFIC_NAME: Solanum lycopersicum
                CATEGORY: VEGETABLE
                LIGHT_REQUIREMENT: FULL_SUN
                LIGHT: Full sun, at least 6 hours a day.
                SOIL: Well-drained, fertile loam.
                WATERING: Water deeply 2-3 times a week, keeping soil evenly moist.
                FERTILIZER: Feed biweekly with a balanced fertilizer once fruiting starts.
                PRUNING: Prune suckers to encourage airflow and fruit production.
                PEST_MANAGEMENT: Watch for hornworms and blight; treat early.
                OTHER: Stake or cage plants to support heavy fruit.
                NOTES: Fake test response - high confidence.
                """;
    }

    @Override
    public String diagnosePlant(byte[] imageBytes, String contentType, PlantContext context) {
        return "Fake diagnosis: looks healthy overall; keep watering on schedule.";
    }

    @Override
    public String suggestCareForPlant(PlantContext context) {
        return "Fake care suggestion: water twice a week and feed monthly.";
    }

    @Override
    public String suggestPlanning(GardenContext context, String question) {
        return "Fake planning answer for: " + question;
    }
}
