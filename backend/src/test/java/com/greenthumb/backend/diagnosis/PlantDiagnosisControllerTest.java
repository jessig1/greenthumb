package com.greenthumb.backend.diagnosis;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.greenthumb.backend.AuthTestSupport;
import com.greenthumb.backend.TestcontainersConfiguration;
import com.greenthumb.backend.plant.PlantRepository;
import com.greenthumb.backend.planting.PlantingStatus;
import com.greenthumb.backend.planting.dto.QuickAddPlantingRequest;
import java.util.UUID;
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
class PlantDiagnosisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlantRepository plantRepository;

    @Test
    void diagnoseFromPhotoThenListReturnsDiagnosis() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String plantingId = createQuickPlanting(aliceToken);
        String photoId = uploadPhotoForPlanting(aliceToken, plantingId);

        mockMvc.perform(post("/api/v1/plantings/" + plantingId + "/photos/" + photoId + "/diagnose")
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.photoId", is(photoId)))
                .andExpect(jsonPath("$.resultText").isNotEmpty());

        mockMvc.perform(get("/api/v1/plantings/" + plantingId + "/diagnoses")
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].photoId", is(photoId)));
    }

    @Test
    void careSuggestionsCreatesTextOnlyDiagnosis() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String plantingId = createQuickPlanting(aliceToken);

        mockMvc.perform(post("/api/v1/plantings/" + plantingId + "/care-suggestions")
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.photoId").doesNotExist())
                .andExpect(jsonPath("$.resultText").isNotEmpty());
    }

    @Test
    void diagnoseRejectsPhotoBelongingToADifferentPlanting() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String plantingId = createQuickPlanting(aliceToken);
        String otherPlantingId = createQuickPlanting(aliceToken);
        String photoId = uploadPhotoForPlanting(aliceToken, otherPlantingId);

        mockMvc.perform(post("/api/v1/plantings/" + plantingId + "/photos/" + photoId + "/diagnose")
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void otherUserCannotDiagnoseOrListSomeoneElsesPlanting() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        String plantingId = createQuickPlanting(aliceToken);
        String photoId = uploadPhotoForPlanting(aliceToken, plantingId);

        mockMvc.perform(post("/api/v1/plantings/" + plantingId + "/photos/" + photoId + "/diagnose")
                        .with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/plantings/" + plantingId + "/care-suggestions")
                        .with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/plantings/" + plantingId + "/diagnoses")
                        .with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());
    }

    private String uploadPhotoForPlanting(String token, String plantingId) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", "bytes".getBytes());
        String response = mockMvc.perform(multipart("/api/v1/plantings/" + plantingId + "/photos")
                        .file(file)
                        .with(AuthTestSupport.bearerToken(token)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

    private String createQuickPlanting(String token) throws Exception {
        UUID plantId = plantRepository.findAllByOrderByCommonName().get(0).getId();
        String response = mockMvc.perform(post("/api/v1/plantings")
                        .with(AuthTestSupport.bearerToken(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new QuickAddPlantingRequest(plantId, null, PlantingStatus.PLANNED, 1))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
