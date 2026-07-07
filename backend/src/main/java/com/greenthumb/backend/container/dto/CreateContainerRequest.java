package com.greenthumb.backend.container.dto;

import com.greenthumb.backend.container.ContainerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateContainerRequest(
        @NotBlank String name, @NotNull ContainerType containerType, String sizeDescription) {}
