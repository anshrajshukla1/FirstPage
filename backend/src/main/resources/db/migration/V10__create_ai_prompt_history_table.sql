-- AI prompt history for tracking AI usage and generated content
CREATE TABLE ai_prompt_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    prompt_type VARCHAR(50) NOT NULL,
    input_prompt TEXT NOT NULL,
    generated_output TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_prompt_history_user_id ON ai_prompt_history(user_id);
CREATE INDEX idx_ai_prompt_history_created_at ON ai_prompt_history(created_at DESC);
