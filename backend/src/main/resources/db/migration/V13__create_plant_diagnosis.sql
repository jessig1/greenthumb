CREATE TABLE plant_diagnosis (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planted_plant_id UUID NOT NULL REFERENCES planted_plant (id) ON DELETE CASCADE,
    photo_id         UUID REFERENCES photo (id) ON DELETE SET NULL,
    owner_id         UUID NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
    result_text      TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plant_diagnosis_planted_plant_id ON plant_diagnosis (planted_plant_id);
