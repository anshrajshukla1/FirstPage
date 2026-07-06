-- V5: Create themes table with seed data
CREATE TABLE themes (
    id                UUID PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    slug              VARCHAR(100) NOT NULL,
    category          VARCHAR(50),
    css_variables     TEXT,
    preview_image_url TEXT,
    is_premium        BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_themes_slug UNIQUE (slug)
);

CREATE INDEX idx_themes_slug ON themes (slug);
CREATE INDEX idx_themes_category ON themes (category);
CREATE INDEX idx_themes_active ON themes (is_active);

-- Seed 12 default themes
INSERT INTO themes (id, name, slug, category, css_variables, is_premium, is_active) VALUES
(gen_random_uuid(), 'Sunset Glow', 'sunset-glow', 'romantic',
 '{"--primary": "#FF6B6B", "--secondary": "#FFA07A", "--bg": "#FFF5F5", "--text": "#2D1B1B", "--accent": "#FF4757", "--font-heading": "Playfair Display", "--font-body": "Lato"}',
 FALSE, TRUE),

(gen_random_uuid(), 'Ocean Breeze', 'ocean-breeze', 'calming',
 '{"--primary": "#0077B6", "--secondary": "#00B4D8", "--bg": "#F0F8FF", "--text": "#023E8A", "--accent": "#48CAE4", "--font-heading": "Montserrat", "--font-body": "Open Sans"}',
 FALSE, TRUE),

(gen_random_uuid(), 'Midnight Velvet', 'midnight-velvet', 'elegant',
 '{"--primary": "#6C63FF", "--secondary": "#A29BFE", "--bg": "#1A1A2E", "--text": "#E8E8E8", "--accent": "#FF6B9D", "--font-heading": "Cormorant Garamond", "--font-body": "Raleway"}',
 FALSE, TRUE),

(gen_random_uuid(), 'Cherry Blossom', 'cherry-blossom', 'romantic',
 '{"--primary": "#FFB7C5", "--secondary": "#FF69B4", "--bg": "#FFF0F5", "--text": "#4A0028", "--accent": "#FF1493", "--font-heading": "Dancing Script", "--font-body": "Quicksand"}',
 FALSE, TRUE),

(gen_random_uuid(), 'Forest Whisper', 'forest-whisper', 'nature',
 '{"--primary": "#2D6A4F", "--secondary": "#52B788", "--bg": "#F0FFF0", "--text": "#1B4332", "--accent": "#95D5B2", "--font-heading": "Merriweather", "--font-body": "Source Sans Pro"}',
 FALSE, TRUE),

(gen_random_uuid(), 'Golden Hour', 'golden-hour', 'warm',
 '{"--primary": "#F4A261", "--secondary": "#E9C46A", "--bg": "#FFFBF0", "--text": "#264653", "--accent": "#E76F51", "--font-heading": "Abril Fatface", "--font-body": "Nunito"}',
 FALSE, TRUE),

(gen_random_uuid(), 'Arctic Frost', 'arctic-frost', 'minimal',
 '{"--primary": "#A8DADC", "--secondary": "#457B9D", "--bg": "#F1FAEE", "--text": "#1D3557", "--accent": "#E63946", "--font-heading": "Poppins", "--font-body": "Inter"}',
 FALSE, TRUE),

(gen_random_uuid(), 'Lavender Dreams', 'lavender-dreams', 'calming',
 '{"--primary": "#B8A9C9", "--secondary": "#9B72AA", "--bg": "#F5F0FF", "--text": "#2D1B4E", "--accent": "#D4A5FF", "--font-heading": "Libre Baskerville", "--font-body": "Karla"}',
 TRUE, TRUE),

(gen_random_uuid(), 'Neon Pulse', 'neon-pulse', 'modern',
 '{"--primary": "#00F5FF", "--secondary": "#FF00FF", "--bg": "#0D0D0D", "--text": "#FFFFFF", "--accent": "#FFD700", "--font-heading": "Orbitron", "--font-body": "Exo 2"}',
 TRUE, TRUE),

(gen_random_uuid(), 'Vintage Rose', 'vintage-rose', 'vintage',
 '{"--primary": "#C9A0A0", "--secondary": "#D4B5B5", "--bg": "#FDF6F0", "--text": "#5C3D3D", "--accent": "#8B4513", "--font-heading": "Amatic SC", "--font-body": "Josefin Sans"}',
 TRUE, TRUE),

(gen_random_uuid(), 'Cosmic Aurora', 'cosmic-aurora', 'fantasy',
 '{"--primary": "#7B2FBE", "--secondary": "#3498DB", "--bg": "#0C0C1D", "--text": "#E0E0FF", "--accent": "#FF6EC7", "--font-heading": "Space Grotesk", "--font-body": "DM Sans"}',
 TRUE, TRUE),

(gen_random_uuid(), 'Minimalist', 'minimalist', 'minimal',
 '{"--primary": "#333333", "--secondary": "#666666", "--bg": "#FFFFFF", "--text": "#111111", "--accent": "#0066FF", "--font-heading": "Inter", "--font-body": "Inter"}',
 FALSE, TRUE);
