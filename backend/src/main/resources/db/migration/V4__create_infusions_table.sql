
CREATE TABLE infusions (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL
        REFERENCES tasting_sessions(id)
        ON DELETE CASCADE,

    infusion_number INTEGER NOT NULL,
    steep_seconds INTEGER NOT NULL,
    notes TEXT,
    rating INTEGER,

    CONSTRAINT chk_infusion_number
        CHECK (infusion_number > 0),

    CONSTRAINT chk_steep_seconds
        CHECK (steep_seconds > 0),

    CONSTRAINT chk_infusion_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT uq_session_infusion
        UNIQUE (session_id, infusion_number)
);
