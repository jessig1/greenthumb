package com.greenthumb.backend.ai;

import com.greenthumb.backend.common.web.AiProviderException;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.errors.OpenAIException;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionContentPart;
import com.openai.models.chat.completions.ChatCompletionContentPartImage;
import com.openai.models.chat.completions.ChatCompletionContentPartText;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Calls the OpenAI API directly with an API key - the local-dev stand-in for what will be a
 * Bedrock-backed {@code AiClient} implementation (IAM role auth) once the app deploys to AWS.
 * Model is {@code gpt-5.4-nano}: the cheapest vision-capable tier, chosen because this project is
 * explicitly optimized for near-$0 cost and these are occasional hobby-scale calls, not
 * intelligence-sensitive work.
 *
 * <p>Excluded from the {@code test} profile - tests use a canned {@code AiClient} fake instead of
 * ever calling the real OpenAI API (cost + non-determinism).
 */
@Component
@Profile("!test")
public class OpenAiClient implements AiClient {

    private static final ChatModel MODEL = ChatModel.GPT_5_4_NANO;
    private static final long MAX_TOKENS = 1024;
    private static final String CARE_CATEGORIES = "watering, fertilizing, pruning, and disease/pest management";

    private final String apiKey;
    private final OpenAIClient client;

    public OpenAiClient(@Value("${app.openai.api-key}") String apiKey) {
        this.apiKey = apiKey;
        // Safe to construct even with a blank key - no request is sent until a call is made, and
        // callers get a clear AiProviderException from requireApiKey() before that happens.
        this.client = OpenAIOkHttpClient.builder().apiKey(apiKey).build();
    }

    @Override
    public String identifyPlant(byte[] imageBytes, String contentType) {
        String system =
                """
                You are a horticulture expert helping a gardening app user identify a plant from a photo.
                Always give your best guess even if you're not fully certain - never refuse to answer.
                Respond with EXACTLY these labeled lines, one per line, no extra commentary. Keep each
                line to 1 short sentence. Leave a line blank (nothing after the colon) if it truly
                doesn't apply to this plant, rather than repeating another line's content.
                COMMON_NAME: <common name>
                SCIENTIFIC_NAME: <scientific name, or "unknown">
                CATEGORY: <one of VEGETABLE, HERB, FLOWER, FRUIT, HOUSEPLANT, OTHER>
                LIGHT_REQUIREMENT: <one of FULL_SUN, PARTIAL_SHADE, FULL_SHADE>
                LIGHT: <light requirements>
                SOIL: <soil type and drainage needs>
                WATERING: <watering frequency and technique>
                FERTILIZER: <feeding schedule and type>
                PRUNING: <pruning or deadheading guidance>
                PEST_MANAGEMENT: <common pests/diseases to watch for and how to manage them>
                OTHER: <any other notable care tip that doesn't fit above, or blank>
                NOTES: <confidence level and any caveats>
                """;

        return callVision(system, "What plant is this?", imageBytes, contentType);
    }

    @Override
    public String diagnosePlant(byte[] imageBytes, String contentType, PlantContext context) {
        String system =
                """
                You are a horticulture expert helping a gardening app user diagnose a plant from a photo.
                Assess %s, plus overall health. Be specific and actionable.

                What's already known about this plant:
                %s
                """
                        .formatted(CARE_CATEGORIES, describe(context));

        return callVision(system, "Diagnose this plant's health from the photo.", imageBytes, contentType);
    }

    @Override
    public String suggestCareForPlant(PlantContext context) {
        String system =
                """
                You are a horticulture expert giving proactive care tips for a gardening app user's plant.
                Cover %s. Be specific and actionable.

                What's already known about this plant:
                %s
                """
                        .formatted(CARE_CATEGORIES, describe(context));

        return callText(system, "What care does this plant need right now?");
    }

    @Override
    public String suggestPlanning(GardenContext context, String question) {
        String system =
                """
                You are a garden planning assistant for a gardening app user. Answer questions about
                what to plant, spacing, companion planting, and timing, grounded in the garden's
                environment and current inventory below.

                %s
                """
                        .formatted(describe(context));

        return callText(system, question);
    }

    private String callVision(String system, String userText, byte[] imageBytes, String contentType) {
        requireApiKey();
        try {
            String dataUrl = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(imageBytes);
            ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                    .model(MODEL)
                    .maxCompletionTokens(MAX_TOKENS)
                    .addSystemMessage(system)
                    .addUserMessageOfArrayOfContentParts(List.of(
                            ChatCompletionContentPart.ofText(
                                    ChatCompletionContentPartText.builder().text(userText).build()),
                            ChatCompletionContentPart.ofImageUrl(ChatCompletionContentPartImage.builder()
                                    .imageUrl(ChatCompletionContentPartImage.ImageUrl.builder()
                                            .url(dataUrl)
                                            .build())
                                    .build())))
                    .build();
            return extractText(client.chat().completions().create(params));
        } catch (OpenAIException e) {
            throw new AiProviderException("OpenAI API call failed", e);
        }
    }

    private String callText(String system, String userText) {
        requireApiKey();
        try {
            ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                    .model(MODEL)
                    .maxCompletionTokens(MAX_TOKENS)
                    .addSystemMessage(system)
                    .addUserMessage(userText)
                    .build();
            return extractText(client.chat().completions().create(params));
        } catch (OpenAIException e) {
            throw new AiProviderException("OpenAI API call failed", e);
        }
    }

    private void requireApiKey() {
        if (!StringUtils.hasText(apiKey)) {
            throw new AiProviderException("OPENAI_API_KEY is not set - set it to use AI features in local dev");
        }
    }

    private String extractText(ChatCompletion completion) {
        return completion.choices().stream()
                .flatMap(choice -> choice.message().content().stream())
                .collect(Collectors.joining("\n"))
                .trim();
    }

    private String describe(PlantContext context) {
        StringBuilder sb = new StringBuilder();
        appendIfPresent(sb, "Common name", context.commonName());
        appendIfPresent(sb, "Scientific name", context.scientificName());
        appendIfPresent(sb, "Nickname", context.nickname());
        appendIfPresent(sb, "Light notes", context.lightNotes());
        appendIfPresent(sb, "Watering notes", context.wateringNotes());
        appendIfPresent(sb, "Soil notes", context.soilNotes());
        appendIfPresent(sb, "Feeding notes", context.feedingNotes());
        appendIfPresent(sb, "Pruning notes", context.pruningNotes());
        return sb.isEmpty() ? "(no additional context)" : sb.toString();
    }

    private String describe(GardenContext context) {
        StringBuilder sb = new StringBuilder();
        appendIfPresent(sb, "Garden type", context.type() == null ? null : context.type().name());
        appendIfPresent(sb, "City", context.city());
        appendIfPresent(sb, "State", context.state());
        appendIfPresent(sb, "Zip code", context.zipCode());
        appendIfPresent(sb, "Climate zone", context.climateZone() == null ? null : context.climateZone().name());
        if (context.plantCommonNames() != null && !context.plantCommonNames().isEmpty()) {
            appendIfPresent(sb, "Currently planted", String.join(", ", context.plantCommonNames()));
        } else {
            sb.append("Currently planted: nothing yet\n");
        }
        return sb.toString();
    }

    private void appendIfPresent(StringBuilder sb, String label, String value) {
        if (StringUtils.hasText(value)) {
            sb.append(label).append(": ").append(value).append('\n');
        }
    }
}
