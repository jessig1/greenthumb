package com.greenthumb.backend.plant;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;
import com.greenthumb.backend.AuthTestSupport;
import com.greenthumb.backend.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PlantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void listReturnsSeededCatalog() throws Exception {
        String token = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");

        mockMvc.perform(get("/api/v1/plants").with(AuthTestSupport.bearerToken(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThan(0)));
    }

    @Test
    void listFiltersByCategory() throws Exception {
        String token = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");

        mockMvc.perform(get("/api/v1/plants").param("category", "HERB").with(AuthTestSupport.bearerToken(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThan(0)))
                .andExpect(jsonPath("$[*].category", everyItem(is("HERB"))));
    }

    @Test
    void getOneReturns404ForUnknownId() throws Exception {
        String token = AuthTestSupport.registerAndLogin(mockMvc, objectMapper, "alice");

        mockMvc.perform(get("/api/v1/plants/" + java.util.UUID.randomUUID()).with(AuthTestSupport.bearerToken(token)))
                .andExpect(status().isNotFound());
    }
}
