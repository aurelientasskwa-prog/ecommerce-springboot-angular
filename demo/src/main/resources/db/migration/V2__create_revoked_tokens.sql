-- V2: Create revoked_tokens table (depends on users table)
CREATE TABLE IF NOT EXISTS revoked_tokens (
    id BIGSERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_revoked_tokens_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_revoked_tokens_token UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON revoked_tokens (token);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expiry ON revoked_tokens (expiry_date);
