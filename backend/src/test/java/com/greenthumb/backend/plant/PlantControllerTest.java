package com.greenthumb.backend.plant;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.greenthumb.backend.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class PlantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listReturnsSeededCatalog() throws Exception {
        mockMvc.perform(get("/api/v1/plants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThan(0)));
    }

    @Test
    void listFiltersByCategory() throws Exception {
        mockMvc.perform(get("/api/v1/plants").param("category", "HERB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThan(0)))
                .andExpect(jsonPath("$[*].category", everyItem(is("HERB"))));
    }

    @Test
    void getOneReturns404ForUnknownId() throws Exception {
        mockMvc.perform(get("/api/v1/plants/" + java.util.UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }
}
