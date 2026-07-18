CREATE TABLE plant_identification (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id                  UUID NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
    suggested_common_name     VARCHAR(255),
    suggested_scientific_name VARCHAR(255),
    matched_plant_id          UUID REFERENCES plant (id) ON DELETE SET NULL,
    added_to_catalog          BOOLEAN NOT NULL DEFAULT false,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plant_identification_owner_id ON plant_identification (owner_id);
