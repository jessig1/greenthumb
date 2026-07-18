package com.greenthumb.backend.photo;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.greenthumb.backend.AuthTestSupport;
import com.greenthumb.backend.TestcontainersConfiguration;
import com.greenthumb.backend.container.ContainerType;
import com.greenthumb.backend.container.dto.CreateContainerRequest;
import com.greenthumb.backend.garden.GardenType;
import com.greenthumb.backend.garden.dto.CreateGardenRequest;
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
class PhotoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlantRepository plantRepository;

    @Test
    void uploadThenListReturnsPhotoForGardenOwner() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String gardenId = createGarden(aliceToken, "Backyard");
        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", "fake-bytes".getBytes());

        mockMvc.perform(multipart("/api/v1/gardens/" + gardenId + "/photos")
                        .file(file)
                        .param("caption", "Spring bloom")
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entityType", is("GARDEN")))
                .andExpect(jsonPath("$.caption", is("Spring bloom")))
                .andExpect(jsonPath("$.url").isNotEmpty());

        mockMvc.perform(get("/api/v1/gardens/" + gardenId + "/photos").with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].caption", is("Spring bloom")));
    }

    @Test
    void uploadRejectsUnsupportedContentType() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String gardenId = createGarden(aliceToken, "Backyard");
        MockMultipartFile file =
                new MockMultipartFile("file", "notes.txt", "text/plain", "not an image".getBytes());

        mockMvc.perform(multipart("/api/v1/gardens/" + gardenId + "/photos")
                        .file(file)
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteRemovesPhoto() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String gardenId = createGarden(aliceToken, "Backyard");
        String photoId = uploadPhotoForGarden(aliceToken, gardenId);

        mockMvc.perform(delete("/api/v1/photos/" + photoId).with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/gardens/" + gardenId + "/photos").with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }

    @Test
    void otherUserCannotUploadListOrDeleteAnotherUsersGardenPhotos() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        String gardenId = createGarden(aliceToken, "Alice's Garden");
        String photoId = uploadPhotoForGarden(aliceToken, gardenId);

        mockMvc.perform(get("/api/v1/gardens/" + gardenId + "/photos").with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());

        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", "bytes".getBytes());
        mockMvc.perform(multipart("/api/v1/gardens/" + gardenId + "/photos")
                        .file(file)
                        .with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/photos/" + photoId).with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void uploadForContainerAndPlantingAlsoWork() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String gardenId = createGarden(aliceToken, "Backyard");
        String containerId = createContainer(aliceToken, gardenId);
        String plantingId = createQuickPlanting(aliceToken);

        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png", "bytes".getBytes());

        mockMvc.perform(multipart("/api/v1/containers/" + containerId + "/photos")
                        .file(file)
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entityType", is("CONTAINER")));

        mockMvc.perform(multipart("/api/v1/plantings/" + plantingId + "/photos")
                        .file(file)
                        .with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.entityType", is("PLANTED_PLANT")));
    }

    private String uploadPhotoForGarden(String token, String gardenId) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", "bytes".getBytes());
        String response = mockMvc.perform(multipart("/api/v1/gardens/" + gardenId + "/photos")
                        .file(file)
                        .with(AuthTestSupport.bearerToken(token)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

    private String createGarden(String token, String name) throws Exception {
        String response = mockMvc.perform(post("/api/v1/gardens")
                        .with(AuthTestSupport.bearerToken(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateGardenRequest(
                                name, GardenType.OUTDOOR, null, null, null, null, null, null, null, null, null,
                                null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

    private String createContainer(String token, String gardenId) throws Exception {
        String response = mockMvc.perform(post("/api/v1/gardens/" + gardenId + "/containers")
                        .with(AuthTestSupport.bearerToken(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateContainerRequest("Container", ContainerType.POT, null, null))))
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
