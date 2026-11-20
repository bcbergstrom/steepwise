
CREATE TABLE tasting_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    tea_id UUID NOT NULL REFERENCES teas(id),

    tasted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    brewing_method VARCHAR(50) NOT NULL,

    leaf_grams NUMERIC(6, 2) NOT NULL,
    water_ml INTEGER NOT NULL,
    temperature_c NUMERIC(5, 1) NOT NULL,

    overall_rating INTEGER,
    overall_notes TEXT,

    CONSTRAINT chk_leaf_grams CHECK (leaf_grams > 0),
    CONSTRAINT chk_water_ml CHECK (water_ml > 0),
    CONSTRAINT chk_temperature
        CHECK (temperature_c BETWEEN 0 AND 100),
    CONSTRAINT chk_rating
        CHECK (overall_rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_tastings_user_id
    ON tasting_sessions(user_id);
