package com.greenthumb.backend.container.dto;

import com.greenthumb.backend.container.Container;
import com.greenthumb.backend.container.ContainerType;
import java.time.Instant;
import java.util.UUID;

public record ContainerResponse(
        UUID id,
        UUID gardenId,
        String name,
        ContainerType containerType,
        String sizeDescription,
        String soilNotes,
        Instant createdAt) {

    public static ContainerResponse from(Container container) {
        return new ContainerResponse(
                container.getId(),
                container.getGarden().getId(),
                container.getName(),
                container.getContainerType(),
                container.getSizeDescription(),
                container.getSoilNotes(),
                container.getCreatedAt());
    }
}
