-- Visitor logs table for tracking analytics
CREATE TABLE visitor_logs (
    id UUID PRIMARY KEY,
    microsite_id UUID NOT NULL REFERENCES microsites(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    device VARCHAR(100),
    browser VARCHAR(100),
    current_slide_index INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    replay_count INTEGER DEFAULT 0,
    visited_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visitor_logs_microsite_id ON visitor_logs(microsite_id);
CREATE INDEX idx_visitor_logs_session_id ON visitor_logs(session_id);
CREATE INDEX idx_visitor_logs_visited_at ON visitor_logs(visited_at);
