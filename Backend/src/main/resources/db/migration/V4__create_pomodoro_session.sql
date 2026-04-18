CREATE TABLE pomodoro_session (
                                  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                                  user_id UUID NOT NULL REFERENCES user_table(id) ON DELETE CASCADE,
                                  subject VARCHAR(255),
                                  duration_minutes INTEGER NOT NULL,
                                  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pomodoro_session_user_id ON pomodoro_session(user_id);
CREATE INDEX idx_pomodoro_session_completed_at ON pomodoro_session(completed_at);