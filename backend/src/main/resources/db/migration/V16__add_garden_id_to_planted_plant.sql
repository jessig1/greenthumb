-- Lets a planting be scoped directly to a garden without a container (garden page "add plant"
-- flow), so garden association no longer has to be derived transitively through container. When a
-- container is set, garden_id always mirrors that container's garden.
ALTER TABLE planted_plant
    ADD COLUMN garden_id UUID REFERENCES garden (id) ON DELETE CASCADE;

UPDATE planted_plant pp
    SET garden_id = c.garden_id
    FROM container c
    WHERE pp.container_id = c.id;

CREATE INDEX idx_planted_plant_garden_id ON planted_plant (garden_id);
