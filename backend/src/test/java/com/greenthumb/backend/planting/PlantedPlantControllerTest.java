package com.greenthumb.backend.planting;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;
import com.greenthumb.backend.AuthTestSupport;
import com.greenthumb.backend.TestcontainersConfiguration;
import com.greenthumb.backend.container.ContainerType;
import com.greenthumb.backend.container.dto.CreateContainerRequest;
import com.greenthumb.backend.garden.GardenType;
import com.greenthumb.backend.garden.dto.CreateGardenRequest;
import com.greenthumb.backend.plant.PlantRepository;
import com.greenthumb.backend.planting.dto.CreatePlantedPlantRequest;
import com.greenthumb.backend.planting.dto.QuickAddPlantingRequest;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PlantedPlantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlantRepository plantRepository;

    @Test
    void createThenListReturnsPlantingForContainerOwner() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String containerId = createContainer(aliceToken);
        UUID plantId = anySeededPlantId();

        mockMvc.perform(post("/api/v1/containers/" + containerId + "/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreatePlantedPlantRequest(
                                plantId, "My tomato", 2, LocalDate.now(), null, null, "Started from seed"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nickname", is("My tomato")))
                .andExpect(jsonPath("$.status", is("PLANNED")))
                .andExpect(jsonPath("$.plant.id", is(plantId.toString())));

        mockMvc.perform(get("/api/v1/containers/" + containerId + "/plantings").with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nickname", is("My tomato")));
    }

    @Test
    void creatingAsPlantedWithoutPlantedDateIsRejected() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String containerId = createContainer(aliceToken);
        UUID plantId = anySeededPlantId();

        mockMvc.perform(post("/api/v1/containers/" + containerId + "/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreatePlantedPlantRequest(
                                plantId, null, 1, null, null, PlantingStatus.PLANTED, null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void creatingAsPlantedWithPlantedDateSucceeds() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String containerId = createContainer(aliceToken);
        UUID plantId = anySeededPlantId();

        mockMvc.perform(post("/api/v1/containers/" + containerId + "/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreatePlantedPlantRequest(
                                plantId, null, 1, LocalDate.now().minusDays(1), LocalDate.now(), PlantingStatus.PLANTED, null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PLANTED")));
    }

    @Test
    void otherUserCannotAccessPlantingInSomeoneElsesContainer() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        String containerId = createContainer(aliceToken);
        UUID plantId = anySeededPlantId();

        String response = mockMvc.perform(post("/api/v1/containers/" + containerId + "/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreatePlantedPlantRequest(plantId, null, 1, null, null, null, null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String plantingId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/api/v1/containers/" + containerId + "/plantings").with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/plantings/" + plantingId).with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/plantings/" + plantingId).with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void quickAddCreatesPlantingWithoutContainer() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        UUID plantId = anySeededPlantId();

        mockMvc.perform(post("/api/v1/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new QuickAddPlantingRequest(plantId, null, PlantingStatus.PLANNED, 3))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.containerId").doesNotExist())
                .andExpect(jsonPath("$.quantity", is(3)))
                .andExpect(jsonPath("$.status", is("PLANNED")));

        mockMvc.perform(get("/api/v1/plantings").with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantity", is(3)));
    }

    @Test
    void quickAddWithNonPlannedStatusDefaultsPlantedDateToToday() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        UUID plantId = anySeededPlantId();

        mockMvc.perform(post("/api/v1/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new QuickAddPlantingRequest(plantId, null, PlantingStatus.PLANTED, 1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.plantedDate", is(LocalDate.now().toString())));
    }

    @Test
    void otherUserCannotAccessQuickAddedPlanting() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        UUID plantId = anySeededPlantId();

        String response = mockMvc.perform(post("/api/v1/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new QuickAddPlantingRequest(plantId, null, PlantingStatus.PLANNED, 1))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String plantingId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/api/v1/plantings").with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));

        mockMvc.perform(get("/api/v1/plantings/" + plantingId).with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void quickAddWithContainerIdAssignsToThatContainerAndShowsLocationNames() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String containerId = createContainer(aliceToken);
        UUID plantId = anySeededPlantId();

        mockMvc.perform(post("/api/v1/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new QuickAddPlantingRequest(plantId, UUID.fromString(containerId), PlantingStatus.PLANNED, 2))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.containerId", is(containerId)))
                .andExpect(jsonPath("$.containerName", is("Container")))
                .andExpect(jsonPath("$.gardenName", is("Garden")));

        mockMvc.perform(get("/api/v1/containers/" + containerId + "/plantings").with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantity", is(2)));
    }

    @Test
    void listAllIncludesBothAssignedAndUnassignedPlantings() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String containerId = createContainer(aliceToken);
        UUID plantId = anySeededPlantId();

        mockMvc.perform(post("/api/v1/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new QuickAddPlantingRequest(plantId, UUID.fromString(containerId), PlantingStatus.PLANNED, 2))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/plantings")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new QuickAddPlantingRequest(plantId, null, PlantingStatus.PLANNED, 1))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/plantings").with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(2)));
    }

    @Test
    void quickAddWithOtherUsersContainerIdIsRejected() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        String aliceContainerId = createContainer(aliceToken);
        UUID plantId = anySeededPlantId();

        mockMvc.perform(post("/api/v1/plantings")
                        .with(AuthTestSupport.bearerToken(bobToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new QuickAddPlantingRequest(
                                plantId, UUID.fromString(aliceContainerId), PlantingStatus.PLANNED, 1))))
                .andExpect(status().isNotFound());
    }

    private UUID anySeededPlantId() {
        return plantRepository.findAllByOrderByCommonName().get(0).getId();
    }

    private String createContainer(String token) throws Exception {
        String gardenResponse = mockMvc.perform(post("/api/v1/gardens")
                        .with(AuthTestSupport.bearerToken(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateGardenRequest(
                                        "Garden",
                                        GardenType.OUTDOOR,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String gardenId = objectMapper.readTree(gardenResponse).get("id").asText();

        String containerResponse = mockMvc.perform(post("/api/v1/gardens/" + gardenId + "/containers")
                        .with(AuthTestSupport.bearerToken(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateContainerRequest("Container", ContainerType.POT, null, null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(containerResponse).get("id").asText();
    }
}
