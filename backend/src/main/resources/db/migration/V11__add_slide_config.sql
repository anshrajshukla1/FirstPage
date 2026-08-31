-- Per-slide structured configuration.
--
-- Until now every slide type shared the same `title` + `content` pair, so there
-- was nowhere to store a countdown's target timestamp, a quote's attribution, a
-- proposal's question, or a timeline's entries. `content` stays as free prose
-- (STORY, CUSTOM); everything structured lives here, keyed by slide type.
ALTER TABLE slides
    ADD COLUMN config JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN slides.config IS
    'Slide-type-specific settings. Shape is determined by slides.type.';
