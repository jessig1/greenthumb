-- Allows a planting to exist without a container (dashboard "quick add"), so ownership can no
-- longer be derived transitively through container -> garden -> owner. Add an explicit owner_id.
ALTER TABLE planted_plant
    ALTER COLUMN container_id DROP NOT NULL;

ALTER TABLE planted_plant
    ADD COLUMN owner_id UUID REFERENCES app_user (id) ON DELETE CASCADE;

UPDATE planted_plant pp
    SET owner_id = g.owner_id
    FROM container c
    JOIN garden g ON g.id = c.garden_id
    WHERE pp.container_id = c.id;

ALTER TABLE planted_plant
    ALTER COLUMN owner_id SET NOT NULL;

CREATE INDEX idx_planted_plant_owner_id ON planted_plant (owner_id);
