CREATE TABLE pending_registrations (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX pending_registrations_expiry ON pending_registrations (expires_at);
