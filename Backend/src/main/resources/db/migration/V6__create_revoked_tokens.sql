CREATE TABLE revoked_tokens (
                                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                                token_hash VARCHAR(255) NOT NULL UNIQUE,
                                revoked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_revoked_tokens_hash ON revoked_tokens(token_hash);
CREATE INDEX idx_revoked_tokens_expires ON revoked_tokens(expires_at);