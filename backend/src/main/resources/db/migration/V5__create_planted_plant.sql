CREATE TABLE planted_plant (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID NOT NULL REFERENCES container (id) ON DELETE CASCADE,
    plant_id     UUID NOT NULL REFERENCES plant (id) ON DELETE RESTRICT,
    nickname     VARCHAR(255),
    quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    planned_date DATE,
    planted_date DATE,
    status       VARCHAR(20) NOT NULL DEFAULT 'PLANNED'
                     CHECK (status IN ('PLANNED', 'PLANTED', 'HARVESTED', 'REMOVED')),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- status is the source of truth: plantedDate is required once status moves past PLANNED.
    CONSTRAINT chk_planted_date_matches_status
        CHECK (status = 'PLANNED' OR planted_date IS NOT NULL)
);

CREATE INDEX idx_planted_plant_container_id ON planted_plant (container_id);
CREATE INDEX idx_planted_plant_plant_id ON planted_plant (plant_id);
