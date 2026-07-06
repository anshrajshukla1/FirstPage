-- V6: Create reactions table
CREATE TABLE reactions (
    id                  UUID PRIMARY KEY,
    microsite_id        UUID        NOT NULL,
    type                VARCHAR(20) NOT NULL,
    visitor_session_id  VARCHAR(255),
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_reactions_microsite FOREIGN KEY (microsite_id) REFERENCES microsites (id) ON DELETE CASCADE
);

CREATE INDEX idx_reactions_microsite_id ON reactions (microsite_id);
CREATE INDEX idx_reactions_type ON reactions (microsite_id, type);
