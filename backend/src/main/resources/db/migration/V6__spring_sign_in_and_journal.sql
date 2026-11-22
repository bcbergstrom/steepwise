CREATE TABLE one_time_tokens (
    token_value VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX one_time_tokens_expires_at ON one_time_tokens (expires_at);

CREATE TABLE sign_in_link_requests (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    requested_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE journal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind VARCHAR(12) NOT NULL CHECK (kind IN ('entry', 'collection')),
    details JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX journal_items_owner_kind_created ON journal_items (user_id, kind, created_at DESC);
