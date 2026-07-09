package com.greenthumb.backend.garden;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;
import com.greenthumb.backend.AuthTestSupport;
import com.greenthumb.backend.TestcontainersConfiguration;
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
class GardenControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createThenListReturnsGardenForOwner() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");

        mockMvc.perform(post("/api/v1/gardens")
                        .with(AuthTestSupport.bearerToken(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateGardenRequest("Backyard", GardenType.OUTDOOR, "Sunny corner"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Backyard")))
                .andExpect(jsonPath("$.type", is("OUTDOOR")));

        mockMvc.perform(get("/api/v1/gardens").with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Backyard")));
    }

    @Test
    void oneUserCannotReadAnotherUsersGarden() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        String gardenId = createGarden(aliceToken, "Alice's Garden");

        mockMvc.perform(get("/api/v1/gardens/" + gardenId).with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/gardens/" + gardenId).with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void oneUserCannotUpdateAnotherUsersGarden() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        String gardenId = createGarden(aliceToken, "Alice's Garden");

        mockMvc.perform(put("/api/v1/gardens/" + gardenId)
                        .with(AuthTestSupport.bearerToken(bobToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateGardenRequest("Hijacked", GardenType.INDOOR, null))))
                .andExpect(status().isNotFound());
    }

    @Test
    void oneUserCannotDeleteAnotherUsersGarden() throws Exception {
        String aliceToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");
        String bobToken = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "bob");
        String gardenId = createGarden(aliceToken, "Alice's Garden");

        mockMvc.perform(delete("/api/v1/gardens/" + gardenId).with(AuthTestSupport.bearerToken(bobToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/gardens/" + gardenId).with(AuthTestSupport.bearerToken(aliceToken)))
                .andExpect(status().isOk());
    }

    private String createGarden(String token, String name) throws Exception {
        String response = mockMvc.perform(post("/api/v1/gardens")
                        .with(AuthTestSupport.bearerToken(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateGardenRequest(name, GardenType.OUTDOOR, null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }
}
