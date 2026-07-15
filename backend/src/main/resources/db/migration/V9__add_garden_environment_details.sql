ALTER TABLE garden
    ADD COLUMN light_source VARCHAR(20)
        CHECK (light_source IN ('GROW_LAMP', 'WINDOW', 'FULL_SUN', 'PARTIAL_SUN', 'OTHER')),
    ADD COLUMN light_hours_per_day INTEGER,
    ADD COLUMN light_exposure VARCHAR(20)
        CHECK (light_exposure IN
            ('NORTH_FACING', 'SOUTH_FACING', 'EAST_FACING', 'WEST_FACING', 'DIRECT', 'INDIRECT', 'OTHER')),
    ADD COLUMN city VARCHAR(255),
    ADD COLUMN state VARCHAR(255),
    ADD COLUMN climate_zone VARCHAR(20),
    ADD COLUMN last_frost_date DATE,
    ADD COLUMN first_frost_date DATE,
    ADD COLUMN soil_notes TEXT;
