CREATE TABLE container (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garden_id        UUID NOT NULL REFERENCES garden (id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    container_type   VARCHAR(20) NOT NULL
                         CHECK (container_type IN ('RAISED_BED', 'POT', 'IN_GROUND', 'WINDOW_BOX', 'HANGING', 'OTHER')),
    size_description TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_container_garden_id ON container (garden_id);
