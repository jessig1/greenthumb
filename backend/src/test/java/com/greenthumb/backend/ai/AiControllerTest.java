package com.greenthumb.backend.ai;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.greenthumb.backend.AuthTestSupport;
import com.greenthumb.backend.TestcontainersConfiguration;
import com.greenthumb.backend.ai.dto.PlanningAssistantRequest;
import com.greenthumb.backend.garden.GardenType;
import com.greenthumb.backend.garden.dto.CreateGardenRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void identifyPlantReturnsParsedFieldsAndMatchesSeededCatalogEntry() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", "bytes".getBytes());

        // FakeAiClient always answers "Tomato", which is a seeded catalog plant.
        mockMvc.perform(multipart("/api/v1/ai/identify-plant")
                        .file(file)
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestedCommonName", is("Tomato")))
                .andExpect(jsonPath("$.suggestedScientificName", is("Solanum lycopersicum")))
                .andExpect(jsonPath("$.suggestedLifeCycle", is("ANNUAL")))
                .andExpect(jsonPath("$.suggestedCareDifficulty", is("MEDIUM")))
                .andExpect(jsonPath("$.light").isNotEmpty())
                .andExpect(jsonPath("$.temperature").isNotEmpty())
                .andExpect(jsonPath("$.soil").isNotEmpty())
                .andExpect(jsonPath("$.watering").isNotEmpty())
                .andExpect(jsonPath("$.fertilizer").isNotEmpty())
                .andExpect(jsonPath("$.pruning").isNotEmpty())
                .andExpect(jsonPath("$.pestManagement").isNotEmpty())
                .andExpect(jsonPath("$.toxicity").isNotEmpty())
                .andExpect(jsonPath("$.matchedPlantId").isNotEmpty())
                .andExpect(jsonPath("$.addedToCatalog", is(false)))
                .andExpect(jsonPath("$.recommendedGardenIds", hasSize(0)));
    }

    @Test
    void identifyPlantAddsNewCatalogEntryWhenNoMatchExists() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");

        // FakeAiClient answers "Ghost Orchid" for this marker - a species not in the seeded
        // catalog, so the service should add it rather than leave the identification unmatched.
        String response = mockMvc.perform(multipart("/api/v1/ai/identify-plant")
                        .file(new MockMultipartFile(
                                "file",
                                "photo.jpg",
                                "image/jpeg",
                                FakeAiClient.UNMATCHED_SPECIES_MARKER.getBytes()))
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestedCommonName", is("Ghost Orchid")))
                .andExpect(jsonPath("$.matchedPlantId").isNotEmpty())
                .andExpect(jsonPath("$.addedToCatalog", is(true)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String newPlantId = objectMapper.readTree(response).get("matchedPlantId").asText();
        mockMvc.perform(get("/api/v1/plants/" + newPlantId).with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commonName", is("Ghost Orchid")))
                .andExpect(jsonPath("$.scientificName", is("Dendrophylax lindenii")))
                .andExpect(jsonPath("$.category", is("HOUSEPLANT")))
                .andExpect(jsonPath("$.lifeCycle", is("PERENNIAL")))
                .andExpect(jsonPath("$.careDifficulty", is("HARD")))
                .andExpect(jsonPath("$.lightRequirement", is("PARTIAL_SHADE")))
                .andExpect(jsonPath("$.temperatureNotes").isNotEmpty())
                .andExpect(jsonPath("$.toxicityNotes").isNotEmpty());
    }

    @Test
    void identifyPlantRecommendsMatchingGardenByName() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String gardenId = createGarden(aliceToken);

        // FakeAiClient always "recommends" the first garden it's given, by name - this verifies
        // the service correctly resolves that name back to the real garden id.
        mockMvc.perform(multipart("/api/v1/ai/identify-plant")
                        .file(new MockMultipartFile("file", "photo.jpg", "image/jpeg", "bytes".getBytes()))
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommendedGardenIds", hasSize(1)))
                .andExpect(jsonPath("$.recommendedGardenIds[0]", is(gardenId)))
                .andExpect(jsonPath("$.gardenFitNotes").isNotEmpty());
    }

    @Test
    void identifyPlantHasNoGardenRecommendationsWhenUserHasNoGardens() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");

        mockMvc.perform(multipart("/api/v1/ai/identify-plant")
                        .file(new MockMultipartFile("file", "photo.jpg", "image/jpeg", "bytes".getBytes()))
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommendedGardenIds", hasSize(0)))
                .andExpect(jsonPath("$.gardenFitNotes", nullValue()));
    }

    @Test
    void identifyPlantReusesCatalogEntryCreatedByAnEarlierIdentificationInsteadOfDuplicating() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");

        String firstMatchedPlantId = identifyAndReturnMatchedPlantId(aliceToken);
        String secondMatchedPlantId = identifyAndReturnMatchedPlantId(aliceToken);

        assertEquals(firstMatchedPlantId, secondMatchedPlantId);
    }

    @Test
    void identifyPlantRecordsRecentActivityForTheCallingUserOnly() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");

        mockMvc.perform(multipart("/api/v1/ai/identify-plant")
                        .file(new MockMultipartFile("file", "photo.jpg", "image/jpeg", "bytes".getBytes()))
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/plant-identifications").with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].suggestedCommonName", is("Tomato")))
                .andExpect(jsonPath("$[0].suggestedScientificName", is("Solanum lycopersicum")))
                .andExpect(jsonPath("$[0].matchedPlantId").isNotEmpty())
                .andExpect(jsonPath("$[0].addedToCatalog", is(false)))
                .andExpect(jsonPath("$[0].createdAt").isNotEmpty());

        mockMvc.perform(get("/api/v1/plant-identifications").with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    private String identifyAndReturnMatchedPlantId(String token) throws Exception {
        String response = mockMvc.perform(multipart("/api/v1/ai/identify-plant")
                        .file(new MockMultipartFile(
                                "file",
                                "photo.jpg",
                                "image/jpeg",
                                FakeAiClient.UNMATCHED_SPECIES_MARKER.getBytes()))
                        .with(AuthTestSupport.bearerToken(token)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("matchedPlantId").asText();
    }

    @Test
    void identifyPlantRejectsUnsupportedContentType() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        MockMultipartFile file = new MockMultipartFile("file", "notes.txt", "text/plain", "text".getBytes());

        mockMvc.perform(multipart("/api/v1/ai/identify-plant")
                        .file(file)
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void planningAssistantReturnsAnswerForOwnedGarden() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String gardenId = createGarden(aliceToken);

        mockMvc.perform(post("/api/v1/gardens/" + gardenId + "/planning-assistant")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new PlanningAssistantRequest("What should I plant in spring?"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", is("Fake planning answer for: What should I plant in spring?")));
    }

    @Test
    void otherUserCannotUsePlanningAssistantOnSomeoneElsesGarden() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        String gardenId = createGarden(aliceToken);

        mockMvc.perform(post("/api/v1/gardens/" + gardenId + "/planning-assistant")
                        .with(AuthTestSupport.bearerToken(bobToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PlanningAssistantRequest("Hi?"))))
                .andExpect(status().isNotFound());
    }

    private String createGarden(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/gardens")
                        .with(AuthTestSupport.bearerToken(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateGardenRequest(
                                "Backyard", GardenType.OUTDOOR, null, null, null, null, null, null, null, null, null,
                                null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
