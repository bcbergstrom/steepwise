ALTER TABLE tasting_sessions
    ALTER COLUMN tea_id DROP NOT NULL,
    ALTER COLUMN brewing_method DROP NOT NULL,
    ALTER COLUMN leaf_grams DROP NOT NULL,
    ALTER COLUMN leaf_grams TYPE NUMERIC(12, 3),
    ALTER COLUMN water_ml DROP NOT NULL,
    ALTER COLUMN temperature_c DROP NOT NULL,
    ADD COLUMN journal_entry_id UUID UNIQUE REFERENCES journal_items(id) ON DELETE CASCADE,
    ADD COLUMN journal_tea_id UUID,
    ADD COLUMN tea_name VARCHAR(200),
    ADD COLUMN tea_type VARCHAR(100),
    ADD COLUMN temperature_note VARCHAR(100),
    ADD COLUMN steep_time VARCHAR(100),
    ADD COLUMN steep_count INTEGER CHECK (steep_count > 0),
    ADD CONSTRAINT standalone_tasting_details CHECK (
        journal_entry_id IS NOT NULL OR (
            tea_id IS NOT NULL AND brewing_method IS NOT NULL AND leaf_grams IS NOT NULL
            AND water_ml IS NOT NULL AND temperature_c IS NOT NULL
        )
    );

INSERT INTO tasting_sessions (
    id, user_id, tasted_at, journal_entry_id, journal_tea_id, tea_name, tea_type,
    leaf_grams, temperature_note, steep_time, steep_count, overall_rating, overall_notes
)
SELECT id, user_id, created_at, id, (details->>'tea_id')::uuid, details->>'name', details->>'type',
    (details->>'grams_brewed')::numeric, details->>'temp', details->>'steep_time',
    (details->>'steep_count')::integer, (details->>'rating')::integer, details->>'notes'
FROM journal_items
WHERE kind = 'entry';
