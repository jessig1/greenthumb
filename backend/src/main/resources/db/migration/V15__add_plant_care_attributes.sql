ALTER TABLE plant
    ADD COLUMN life_cycle        VARCHAR(20) CHECK (life_cycle IN ('ANNUAL', 'PERENNIAL', 'BIENNIAL')),
    ADD COLUMN care_difficulty   VARCHAR(20) CHECK (care_difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    ADD COLUMN temperature_notes TEXT,
    ADD COLUMN toxicity_notes    TEXT;
