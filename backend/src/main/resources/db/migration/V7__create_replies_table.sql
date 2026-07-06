-- V7: Create replies table
CREATE TABLE replies (
    id                  UUID PRIMARY KEY,
    microsite_id        UUID         NOT NULL,
    message             TEXT         NOT NULL,
    visitor_session_id  VARCHAR(255),
    is_read             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_replies_microsite FOREIGN KEY (microsite_id) REFERENCES microsites (id) ON DELETE CASCADE
);

CREATE INDEX idx_replies_microsite_id ON replies (microsite_id);
CREATE INDEX idx_replies_unread ON replies (microsite_id, is_read);
