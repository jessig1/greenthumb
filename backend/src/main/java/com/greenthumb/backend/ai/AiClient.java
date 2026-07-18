package com.greenthumb.backend.ai;

/**
 * Seam for the AI provider. {@link OpenAiClient} calls the OpenAI API directly for local
 * dev; a future {@code BedrockAiClient} implementing this same interface (IAM role auth) is the
 * entire migration path when the app deploys to AWS - callers never change.
 */
public interface AiClient {

    /** Best-guess species identification from a photo, with no existing planting context yet. */
    String identifyPlant(byte[] imageBytes, String contentType);

    /** Health assessment (watering, fertilizing, pruning, disease/pest) grounded in a photo. */
    String diagnosePlant(byte[] imageBytes, String contentType, PlantContext context);

    /** Same care categories as diagnosis, but proactive - no photo, just the plant's context. */
    String suggestCareForPlant(PlantContext context);

    /** Free-form garden planning Q&A grounded in the garden's context. */
    String suggestPlanning(GardenContext context, String question);
}
