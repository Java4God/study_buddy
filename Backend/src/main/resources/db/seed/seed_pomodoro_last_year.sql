DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT id
    INTO target_user_id
    FROM user_table
    WHERE username = 'leo5'
      AND email = 'leo.znika@gmail.com'
    LIMIT 1;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User leo5 / leo.znika@gmail.com not found';
    END IF;

    DELETE FROM pomodoro_session
    WHERE user_id = target_user_id
      AND completed_at::date BETWEEN (CURRENT_DATE - INTERVAL '1 year')::date AND CURRENT_DATE
      AND subject LIKE 'Seeded study block%';

    WITH days AS (
        SELECT gs::date AS day
        FROM generate_series(CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE, INTERVAL '1 day') AS gs
    ),
    daily_sessions AS (
        SELECT
            day,
            ordinal,
            CASE
                WHEN ordinal = 1 THEN 'FOCUS'
                WHEN ordinal = 2 THEN 'SHORT_BREAK'
                ELSE 'LONG_BREAK'
            END AS mode,
            CASE
                WHEN ordinal = 1 THEN
                    CASE
                        WHEN EXTRACT(DOW FROM day) IN (0, 6) THEN 25 + ((EXTRACT(DAY FROM day)::int % 3) * 10)
                        WHEN EXTRACT(DAY FROM day)::int % 5 = 0 THEN 100
                        WHEN EXTRACT(DAY FROM day)::int % 4 = 0 THEN 75
                        ELSE 50
                    END
                WHEN ordinal = 2 THEN 15 + ((EXTRACT(DAY FROM day)::int % 3) * 5)
                ELSE 25 + ((EXTRACT(DAY FROM day)::int % 2) * 5)
            END AS duration_minutes
        FROM days
        CROSS JOIN LATERAL generate_series(
            1,
            CASE
                WHEN EXTRACT(DOW FROM day) IN (0, 6) THEN 1
                WHEN EXTRACT(DAY FROM day)::int % 7 = 0 THEN 2
                ELSE 3
            END
        ) AS series(ordinal)
    )
    INSERT INTO pomodoro_session (
        id,
        user_id,
        mode,
        duration_minutes,
        subject,
        completed,
        completed_at,
        created_at
    )
    SELECT
        gen_random_uuid(),
        target_user_id,
        mode,
        duration_minutes,
        format('Seeded study block %s #%s', to_char(day, 'YYYY-MM-DD'), ordinal),
        TRUE,
        day + time '08:00' + ((ordinal - 1) * interval '2 hours'),
        day + time '07:55' + ((ordinal - 1) * interval '2 hours')
    FROM daily_sessions
    WHERE duration_minutes > 0;
END $$;
