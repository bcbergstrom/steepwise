
CREATE TABLE teas (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    tea_type VARCHAR(50) NOT NULL,
    origin_country VARCHAR(100),
    origin_region VARCHAR(150),
    harvest_year INTEGER,
    quantity_grams NUMERIC(8, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_teas_users
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT chk_quantity
        CHECK (quantity_grams IS NULL OR quantity_grams >= 0)
);

CREATE INDEX idx_teas_user_id
    ON teas(user_id);
