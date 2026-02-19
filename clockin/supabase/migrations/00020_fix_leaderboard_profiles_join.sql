-- Fix the get_friends_leaderboard function to join on profiles.user_id instead of profiles.id

DROP FUNCTION IF EXISTS get_friends_leaderboard(UUID, TEXT);

CREATE OR REPLACE FUNCTION get_friends_leaderboard(
    p_user_id UUID,
    p_period TEXT DEFAULT 'weekly' -- 'weekly' or 'monthly'
)
RETURNS TABLE (
    friend_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    total_seconds BIGINT,
    session_count BIGINT,
    rank BIGINT
) AS $$
BEGIN
    IF p_period = 'weekly' THEN
        RETURN QUERY
        SELECT
            wl.user_id as friend_id,
            COALESCE(p.display_name, 'Unknown') as display_name,
            p.avatar_url,
            wl.total_seconds,
            wl.session_count,
            wl.rank
        FROM weekly_leaderboard wl
        LEFT JOIN profiles p ON wl.user_id = p.user_id  -- Fixed: join on user_id, not id
        WHERE wl.user_id IN (
            SELECT DISTINCT CASE
                WHEN requester_id = p_user_id THEN addressee_id
                ELSE requester_id
            END
            FROM friendships
            WHERE (requester_id = p_user_id OR addressee_id = p_user_id)
            AND status = 'accepted'
            UNION
            SELECT p_user_id
        )
        ORDER BY wl.rank;
    ELSE
        RETURN QUERY
        SELECT
            ml.user_id as friend_id,
            COALESCE(p.display_name, 'Unknown') as display_name,
            p.avatar_url,
            ml.total_seconds,
            ml.session_count,
            ml.rank
        FROM monthly_leaderboard ml
        LEFT JOIN profiles p ON ml.user_id = p.user_id  -- Fixed: join on user_id, not id
        WHERE ml.user_id IN (
            SELECT DISTINCT CASE
                WHEN requester_id = p_user_id THEN addressee_id
                ELSE requester_id
            END
            FROM friendships
            WHERE (requester_id = p_user_id OR addressee_id = p_user_id)
            AND status = 'accepted'
            UNION
            SELECT p_user_id
        )
        ORDER BY ml.rank;
    END IF;
END;
$$ LANGUAGE plpgsql;
