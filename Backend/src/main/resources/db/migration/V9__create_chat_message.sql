CREATE TABLE chat_message (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              room_id UUID NOT NULL REFERENCES study_room(id) ON DELETE CASCADE,
                              sender_id UUID NOT NULL REFERENCES user_table(id) ON DELETE CASCADE,
                              content VARCHAR(2000) NOT NULL,
                              sent_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_message_room_sent ON chat_message(room_id, sent_at DESC);