\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE source_accounts (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
) ON COMMIT DROP;

CREATE TEMP TABLE source_items (
    id UUID PRIMARY KEY,
    source_user_id UUID NOT NULL REFERENCES source_accounts(id),
    kind VARCHAR(12) NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
) ON COMMIT DROP;

\copy source_accounts FROM 'steepwise-accounts.csv' CSV HEADER
\copy source_items FROM 'steepwise-journal.csv' CSV HEADER

INSERT INTO users (id, email, display_name, created_at)
SELECT id, email, display_name, created_at FROM source_accounts
ON CONFLICT (email) DO NOTHING;

CREATE TEMP VIEW mapped_items AS
SELECT item.id, account.id AS user_id, item.kind, item.details, item.created_at
FROM source_items AS item
JOIN source_accounts AS source ON source.id = item.source_user_id
JOIN users AS account ON account.email = source.email;

INSERT INTO journal_items (id, user_id, kind, details, created_at)
SELECT id, user_id, kind, details, created_at FROM mapped_items
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM mapped_items AS source
        JOIN journal_items AS target USING (id)
        WHERE (source.user_id, source.kind, source.details, source.created_at)
            IS DISTINCT FROM (target.user_id, target.kind, target.details, target.created_at)
    ) THEN
        RAISE EXCEPTION 'An imported journal ID conflicts with a different existing record';
    END IF;
END $$;

COMMIT;
