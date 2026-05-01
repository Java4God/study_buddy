ALTER TABLE exam_schedule ADD COLUMN user_id UUID;

UPDATE exam_schedule
SET user_id = (SELECT id FROM user_table WHERE role = 'ROLE_ADMIN' LIMIT 1)
WHERE user_id IS NULL;

ALTER TABLE exam_schedule ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE exam_schedule ADD CONSTRAINT fk_exam_user
    FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE;

CREATE INDEX idx_exam_schedule_user_id ON exam_schedule(user_id);