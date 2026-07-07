package com.greenthumb.backend.container;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;
import com.greenthumb.backend.TestcontainersConfiguration;
import com.greenthumb.backend.container.dto.CreateContainerRequest;
import com.greenthumb.backend.garden.GardenType;
import com.greenthumb.backend.garden.dto.CreateGardenRequest;
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
class ContainerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createThenListReturnsContainerForGardenOwner() throws Exception {
        String gardenId = createGarden("alice");

        mockMvc.perform(post("/api/v1/gardens/" + gardenId + "/containers")
                        .header("X-Dev-User-Id", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateContainerRequest("Raised Bed #1", ContainerType.RAISED_BED, "4x8 ft"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Raised Bed #1")))
                .andExpect(jsonPath("$.gardenId", is(gardenId)));

        mockMvc.perform(get("/api/v1/gardens/" + gardenId + "/containers").header("X-Dev-User-Id", "alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Raised Bed #1")));
    }

    @Test
    void otherUserCannotListContainersOfSomeoneElsesGarden() throws Exception {
        String gardenId = createGarden("alice");

        mockMvc.perform(get("/api/v1/gardens/" + gardenId + "/containers").header("X-Dev-User-Id", "bob"))
                .andExpect(status().isNotFound());
    }

    @Test
    void otherUserCannotCreateContainerInSomeoneElsesGarden() throws Exception {
        String gardenId = createGarden("alice");

        mockMvc.perform(post("/api/v1/gardens/" + gardenId + "/containers")
                        .header("X-Dev-User-Id", "bob")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateContainerRequest("Intruding Pot", ContainerType.POT, null))))
                .andExpect(status().isNotFound());
    }

    @Test
    void otherUserCannotReadOrDeleteContainerOfSomeoneElsesGarden() throws Exception {
        String gardenId = createGarden("alice");
        String containerId = createContainer("alice", gardenId);

        mockMvc.perform(get("/api/v1/containers/" + containerId).header("X-Dev-User-Id", "bob"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/containers/" + containerId).header("X-Dev-User-Id", "bob"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/containers/" + containerId).header("X-Dev-User-Id", "alice"))
                .andExpect(status().isOk());
    }

    private String createGarden(String user) throws Exception {
        String response = mockMvc.perform(post("/api/v1/gardens")
                        .header("X-Dev-User-Id", user)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateGardenRequest("Garden", GardenType.OUTDOOR, null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

    private String createContainer(String user, String gardenId) throws Exception {
        String response = mockMvc.perform(post("/api/v1/gardens/" + gardenId + "/containers")
                        .header("X-Dev-User-Id", user)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateContainerRequest("Container", ContainerType.POT, null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
