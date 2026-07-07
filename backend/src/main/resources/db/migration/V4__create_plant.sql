CREATE TABLE plant (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    common_name            VARCHAR(255) NOT NULL,
    scientific_name        VARCHAR(255),
    category               VARCHAR(20) NOT NULL
                               CHECK (category IN ('VEGETABLE', 'HERB', 'FLOWER', 'FRUIT', 'HOUSEPLANT', 'OTHER')),
    description            TEXT,

    -- Care guide: each category is a structured field (drives future filtering/scheduling)
    -- paired with free-text notes for nuance.
    light_requirement      VARCHAR(20) NOT NULL
                               CHECK (light_requirement IN ('FULL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE')),
    light_notes            TEXT,
    watering_interval_days INTEGER,
    watering_notes         TEXT,
    soil_notes             TEXT,
    feeding_notes          TEXT,
    pruning_notes          TEXT,

    -- Harvest guide: only populated when is_harvestable is true.
    is_harvestable         BOOLEAN NOT NULL DEFAULT false,
    days_to_maturity_min   INTEGER,
    days_to_maturity_max   INTEGER,
    harvest_notes          TEXT,

    image_url              VARCHAR(1024),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plant_category ON plant (category);
