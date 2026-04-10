ALTER TABLE user_table ADD COLUMN role VARCHAR(50);

INSERT INTO user_table (id, email, password, username, role)
VALUES (gen_random_uuid(), 'admin@tvz.hr', '$2a$12$FQpA6mMcxnwkGyX.0Lh6zOlN3H1rWvcS8RsE8G5pEi8/60fAA1AeG',
        'Admin', 'ROLE_ADMIN');

CREATE TABLE password_reset_token (
                                      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                                      token VARCHAR(255) NOT NULL UNIQUE,
                                      user_id UUID NOT NULL REFERENCES user_table(id) ON DELETE CASCADE,
                                      expires_at TIMESTAMP NOT NULL,
                                      used BOOLEAN NOT NULL DEFAULT FALSE,
                                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_token_token ON password_reset_token(token);