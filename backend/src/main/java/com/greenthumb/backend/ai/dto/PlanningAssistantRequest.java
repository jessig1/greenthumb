package com.greenthumb.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record PlanningAssistantRequest(@NotBlank String question) {}
