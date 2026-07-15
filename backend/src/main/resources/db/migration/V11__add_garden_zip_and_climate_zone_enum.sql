ALTER TABLE garden
    ADD COLUMN zip_code VARCHAR(10);

ALTER TABLE garden
    ADD CONSTRAINT garden_climate_zone_check CHECK (climate_zone IN (
        'ZONE_1A', 'ZONE_1B',
        'ZONE_2A', 'ZONE_2B',
        'ZONE_3A', 'ZONE_3B',
        'ZONE_4A', 'ZONE_4B',
        'ZONE_5A', 'ZONE_5B',
        'ZONE_6A', 'ZONE_6B',
        'ZONE_7A', 'ZONE_7B',
        'ZONE_8A', 'ZONE_8B',
        'ZONE_9A', 'ZONE_9B',
        'ZONE_10A', 'ZONE_10B',
        'ZONE_11A', 'ZONE_11B',
        'ZONE_12A', 'ZONE_12B',
        'ZONE_13A', 'ZONE_13B'
    ));
