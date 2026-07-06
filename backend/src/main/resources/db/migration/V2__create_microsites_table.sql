-- V2: Create microsites table
CREATE TABLE microsites (
    id              UUID PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    recipient_name  VARCHAR(255),
    category        VARCHAR(50)  NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    user_id         UUID         NOT NULL,
    theme_id        UUID,
    password_hash   VARCHAR(255),
    is_anonymous    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_one_time_view BOOLEAN     NOT NULL DEFAULT FALSE,
    has_been_viewed BOOLEAN      NOT NULL DEFAULT FALSE,
    music_url       TEXT,
    scheduled_at    TIMESTAMP,
    expires_at      TIMESTAMP,
    published_at    TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_microsites_slug UNIQUE (slug),
    CONSTRAINT fk_microsites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_microsites_user_id ON microsites (user_id);
CREATE INDEX idx_microsites_slug ON microsites (slug);
CREATE INDEX idx_microsites_status ON microsites (status);
CREATE INDEX idx_microsites_category ON microsites (category);
