-- Global Leaderboard Function
-- Returns top focusers across all users

CREATE OR REPLACE FUNCTION get_global_leaderboard(
    p_user_id UUID,
    p_period TEXT DEFAULT 'weekly'
)
RETURNS TABLE (
    friend_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    total_seconds BIGINT,
    session_count BIGINT,
    rank BIGINT,
    is_current_user BOOLEAN
) AS $$
BEGIN
    IF p_period = 'weekly' THEN
        RETURN QUERY
        SELECT
            wl.user_id::UUID as friend_id,
            COALESCE(p.display_name, 'Anonymous')::TEXT as display_name,
            p.avatar_url::TEXT,
            COALESCE(wl.total_seconds, 0)::BIGINT as total_seconds,
            COALESCE(wl.session_count, 0)::BIGINT as session_count,
            ROW_NUMBER() OVER (ORDER BY COALESCE(wl.total_seconds, 0) DESC)::BIGINT as rank,
            (wl.user_id = p_user_id)::BOOLEAN as is_current_user
        FROM weekly_leaderboard wl
        LEFT JOIN profiles p ON p.user_id = wl.user_id
        WHERE COALESCE(wl.total_seconds, 0) > 0
        ORDER BY total_seconds DESC
        LIMIT 100;
    ELSE
        RETURN QUERY
        SELECT
            ml.user_id::UUID as friend_id,
            COALESCE(p.display_name, 'Anonymous')::TEXT as display_name,
            p.avatar_url::TEXT,
            COALESCE(ml.total_seconds, 0)::BIGINT as total_seconds,
            COALESCE(ml.session_count, 0)::BIGINT as session_count,
            ROW_NUMBER() OVER (ORDER BY COALESCE(ml.total_seconds, 0) DESC)::BIGINT as rank,
            (ml.user_id = p_user_id)::BOOLEAN as is_current_user
        FROM monthly_leaderboard ml
        LEFT JOIN profiles p ON p.user_id = ml.user_id
        WHERE COALESCE(ml.total_seconds, 0) > 0
        ORDER BY total_seconds DESC
        LIMIT 100;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');
