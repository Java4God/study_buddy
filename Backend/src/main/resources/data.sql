INSERT INTO user_table (id, email, password, username, role)
VALUES (gen_random_uuid(), 'admin@tvz.hr', '$2a$12$FQpA6mMcxnwkGyX.0Lh6zOlN3H1rWvcS8RsE8G5pEi8/60fAA1AeG',
        'Admin', 'ROLE_ADMIN');