-- V4: Create media table
CREATE TABLE media (
    id              UUID PRIMARY KEY,
    microsite_id    UUID         NOT NULL,
    slide_id        UUID,
    type            VARCHAR(20)  NOT NULL,
    url             TEXT         NOT NULL,
    public_id       VARCHAR(255),
    caption         VARCHAR(500),
    order_index     INTEGER      NOT NULL DEFAULT 0,
    file_size       BIGINT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_media_microsite FOREIGN KEY (microsite_id) REFERENCES microsites (id) ON DELETE CASCADE,
    CONSTRAINT fk_media_slide FOREIGN KEY (slide_id) REFERENCES slides (id) ON DELETE SET NULL
);

CREATE INDEX idx_media_microsite_id ON media (microsite_id);
CREATE INDEX idx_media_slide_id ON media (slide_id);
