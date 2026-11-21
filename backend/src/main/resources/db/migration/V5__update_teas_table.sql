ALTER TABLE teas
ADD COLUMN harvest_season VARCHAR(20),
ADD COLUMN recommended_temp_min_c INTEGER,
ADD COLUMN recommended_temp_max_c INTEGER;

ALTER TABLE teas
ADD CONSTRAINT chk_harvest_season
CHECK (
    harvest_season IN ('SPRING', 'SUMMER', 'AUTUMN', 'WINTER')
);

ALTER TABLE teas
ADD CONSTRAINT chk_recommended_temperature
CHECK (
    (recommended_temp_min_c IS NULL
        AND recommended_temp_max_c IS NULL)
    OR
    (
        recommended_temp_min_c IS NOT NULL
        AND recommended_temp_max_c IS NOT NULL
        AND recommended_temp_min_c >= 0
        AND recommended_temp_max_c <= 100
        AND recommended_temp_min_c <= recommended_temp_max_c
    )
);