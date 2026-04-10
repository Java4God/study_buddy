CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE user_table (
                            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                            username VARCHAR(255) NOT NULL,
                            email VARCHAR(255) NOT NULL UNIQUE,
                            password VARCHAR(255) NOT NULL
);

CREATE TABLE exam_schedule (
                               id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                               subject_name VARCHAR(255) NOT NULL,
                               exam_date DATE NOT NULL,
                               exam_time TIME NOT NULL,
                               location VARCHAR(255),
                               notes TEXT
);

CREATE TABLE achievements (
                              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                              name VARCHAR(255) NOT NULL,
                              description VARCHAR(255) NOT NULL,
                              earned_at TIMESTAMP
);

CREATE TABLE flashcards (
                            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                            question VARCHAR(255) NOT NULL,
                            answer VARCHAR(255) NOT NULL,
                            repetition INTEGER,
                            easiness REAL,
                            next_review DATE
);

CREATE TABLE goals (
                       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                       target_hours INTEGER,
                       current_hours INTEGER,
                       streak_days INTEGER,
                       week_start DATE
);

CREATE TABLE study_rooms (
                             id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                             name VARCHAR(255) NOT NULL,
                             topic VARCHAR(255) NOT NULL,
                             invite_code VARCHAR(255),
                             is_active BOOLEAN
);