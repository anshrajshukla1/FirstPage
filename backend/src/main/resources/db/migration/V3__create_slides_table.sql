-- V3: Create slides table
CREATE TABLE slides (
    id              UUID PRIMARY KEY,
    microsite_id    UUID         NOT NULL,
    order_index     INTEGER      NOT NULL DEFAULT 0,
    type            VARCHAR(50)  NOT NULL,
    title           VARCHAR(255),
    content         TEXT,
    animation_type  VARCHAR(50)  DEFAULT 'FADE',
    background_type VARCHAR(100),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_slides_microsite FOREIGN KEY (microsite_id) REFERENCES microsites (id) ON DELETE CASCADE
);

CREATE INDEX idx_slides_microsite_id ON slides (microsite_id);
CREATE INDEX idx_slides_order ON slides (microsite_id, order_index);
