package com.greenthumb.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.greenthumb.backend.auth.dto.RegisterRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.ObjectMapper;

/** Shared test helper for registering a user and attaching their JWT to subsequent requests. */
public final class AuthTestSupport {

    private AuthTestSupport() {}

    public static String registerAndLogin(MockMvc mockMvc, ObjectMapper objectMapper, String username) throws Exception {
        String email = username + "@test.local";
        String response = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest(email, "password123", username))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    public static RequestPostProcessor bearerToken(String token) {
        return request -> {
            request.addHeader("Authorization", "Bearer " + token);
            return request;
        };
    }
}
