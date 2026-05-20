CREATE TABLE study_room (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            name VARCHAR(100) NOT NULL,
                            subject VARCHAR(50) NOT NULL,
                            access_code VARCHAR(20) NOT NULL UNIQUE,
                            is_public BOOLEAN NOT NULL DEFAULT TRUE,
                            description VARCHAR(500),
                            owner_id UUID NOT NULL REFERENCES user_table(id) ON DELETE CASCADE,
                            created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE room_member (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             room_id UUID NOT NULL REFERENCES study_room(id) ON DELETE CASCADE,
                             user_id UUID NOT NULL REFERENCES user_table(id) ON DELETE CASCADE,
                             status VARCHAR(20) NOT NULL DEFAULT 'STUDYING',
                             joined_at TIMESTAMP NOT NULL DEFAULT now(),
                             CONSTRAINT uq_room_member UNIQUE (room_id, user_id)
);

CREATE INDEX idx_study_room_owner ON study_room(owner_id);
CREATE INDEX idx_study_room_access_code ON study_room(access_code);
CREATE INDEX idx_room_member_room ON room_member(room_id);
CREATE INDEX idx_room_member_user ON room_member(user_id);