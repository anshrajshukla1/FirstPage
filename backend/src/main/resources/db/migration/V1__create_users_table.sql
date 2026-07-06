-- V1: Create users table
CREATE TABLE users (
    id              UUID PRIMARY KEY,
    firebase_uid    VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    photo_url       TEXT,
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER',
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_firebase_uid UNIQUE (firebase_uid),
    CONSTRAINT uq_users_email        UNIQUE (email)
);

CREATE INDEX idx_users_firebase_uid ON users (firebase_uid);
CREATE INDEX idx_users_email ON users (email);
