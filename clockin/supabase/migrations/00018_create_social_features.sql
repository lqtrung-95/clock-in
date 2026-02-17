-- Social Features Schema
-- Friend system, leaderboards, focus rooms, achievement sharing

-- ============================================
-- FRIENDS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- Index for friend lookups
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- ============================================
-- FOCUS ROOMS
-- ============================================

CREATE TABLE IF NOT EXISTS focus_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_private BOOLEAN NOT NULL DEFAULT false,
    access_code TEXT, -- For private rooms
    max_participants INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_rooms_host ON focus_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_focus_rooms_active ON focus_rooms(is_active);

-- Focus room participants
CREATE TABLE IF NOT EXISTS focus_room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_focused BOOLEAN NOT NULL DEFAULT false, -- Whether user is currently in focus mode
    focus_started_at TIMESTAMPTZ,
    total_focus_seconds INTEGER NOT NULL DEFAULT 0,
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_focus_room_participants_room ON focus_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_focus_room_participants_user ON focus_room_participants(user_id);

-- Focus room messages (for encouragement)
CREATE TABLE IF NOT EXISTS focus_room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'chat' CHECK (message_type IN ('chat', 'encouragement', 'milestone', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_room_messages_room ON focus_room_messages(room_id);

-- ============================================
-- SHARED ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS shared_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badge_definitions(key) ON DELETE CASCADE,
    share_message TEXT,
    share_image_url TEXT, -- Generated share card URL
    platform TEXT, -- 'twitter', 'facebook', 'linkedin', etc.
    share_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_achievements_user ON shared_achievements(user_id);

-- ============================================
-- PROGRESS SHARE CARDS
-- ============================================

CREATE TABLE IF NOT EXISTS progress_share_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_type TEXT NOT NULL CHECK (card_type IN ('daily', 'weekly', 'monthly', 'streak', 'achievement')),
    title TEXT NOT NULL,
    subtitle TEXT,
    stats JSONB NOT NULL, -- Store various stats
    image_url TEXT, -- Generated image
    share_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_share_cards_user ON progress_share_cards(user_id);

-- ============================================
-- LEADERBOARD VIEWS (Materialized)
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_leaderboard AS
SELECT
    user_id,
    EXTRACT(YEAR FROM started_at) as year,
    EXTRACT(WEEK FROM started_at) as week,
    SUM(duration_seconds) as total_seconds,
    COUNT(*) as session_count,
    ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM started_at), EXTRACT(WEEK FROM started_at)
                       ORDER BY SUM(duration_seconds) DESC) as rank
FROM time_entries
WHERE started_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id, EXTRACT(YEAR FROM started_at), EXTRACT(WEEK FROM started_at);

CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_leaderboard AS
SELECT
    user_id,
    EXTRACT(YEAR FROM started_at) as year,
    EXTRACT(MONTH FROM started_at) as month,
    SUM(duration_seconds) as total_seconds,
    COUNT(*) as session_count,
    ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM started_at), EXTRACT(MONTH FROM started_at)
                       ORDER BY SUM(duration_seconds) DESC) as rank
FROM time_entries
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id, EXTRACT(YEAR FROM started_at), EXTRACT(MONTH FROM started_at);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS friendships_select ON friendships;
DROP POLICY IF EXISTS friendships_insert ON friendships;
DROP POLICY IF EXISTS friendships_update ON friendships;
DROP POLICY IF EXISTS friendships_delete ON friendships;

CREATE POLICY friendships_select ON friendships
    FOR SELECT USING (
        requester_id = auth.uid() OR addressee_id = auth.uid()
    );

CREATE POLICY friendships_insert ON friendships
    FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY friendships_update ON friendships
    FOR UPDATE USING (
        requester_id = auth.uid() OR addressee_id = auth.uid()
    );

CREATE POLICY friendships_delete ON friendships
    FOR DELETE USING (
        requester_id = auth.uid() OR addressee_id = auth.uid()
    );

-- Focus rooms
ALTER TABLE focus_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS focus_rooms_select ON focus_rooms;
DROP POLICY IF EXISTS focus_rooms_insert ON focus_rooms;
DROP POLICY IF EXISTS focus_rooms_update ON focus_rooms;
DROP POLICY IF EXISTS focus_rooms_delete ON focus_rooms;

CREATE POLICY focus_rooms_select ON focus_rooms
    FOR SELECT USING (
        is_private = false OR host_id = auth.uid()
    );

CREATE POLICY focus_rooms_insert ON focus_rooms
    FOR INSERT WITH CHECK (host_id = auth.uid());

CREATE POLICY focus_rooms_update ON focus_rooms
    FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY focus_rooms_delete ON focus_rooms
    FOR DELETE USING (host_id = auth.uid());

-- Focus room participants
ALTER TABLE focus_room_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS focus_room_participants_select ON focus_room_participants;
DROP POLICY IF EXISTS focus_room_participants_insert ON focus_room_participants;
DROP POLICY IF EXISTS focus_room_participants_update ON focus_room_participants;

CREATE POLICY focus_room_participants_select ON focus_room_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM focus_rooms fr
            WHERE fr.id = focus_room_participants.room_id
            AND fr.is_private = false
        )
    );

CREATE POLICY focus_room_participants_insert ON focus_room_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY focus_room_participants_update ON focus_room_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Focus room messages
ALTER TABLE focus_room_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS focus_room_messages_select ON focus_room_messages;
DROP POLICY IF EXISTS focus_room_messages_insert ON focus_room_messages;

CREATE POLICY focus_room_messages_select ON focus_room_messages
    FOR SELECT USING (true);

CREATE POLICY focus_room_messages_insert ON focus_room_messages
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Shared achievements
ALTER TABLE shared_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shared_achievements_select ON shared_achievements;
DROP POLICY IF EXISTS shared_achievements_insert ON shared_achievements;

CREATE POLICY shared_achievements_select ON shared_achievements
    FOR SELECT USING (true); -- Public

CREATE POLICY shared_achievements_insert ON shared_achievements
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Progress share cards
ALTER TABLE progress_share_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS progress_share_cards_select ON progress_share_cards;
DROP POLICY IF EXISTS progress_share_cards_insert ON progress_share_cards;

CREATE POLICY progress_share_cards_select ON progress_share_cards
    FOR SELECT USING (true); -- Public

CREATE POLICY progress_share_cards_insert ON progress_share_cards
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS refresh_leaderboards();
DROP FUNCTION IF EXISTS increment_share_count(UUID);
DROP FUNCTION IF EXISTS get_friends_leaderboard(UUID, TEXT);

-- Function to refresh leaderboards
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_leaderboard;
    REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Function to increment share count
CREATE OR REPLACE FUNCTION increment_share_count(card_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE progress_share_cards
    SET share_count = share_count + 1
    WHERE id = card_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get friends leaderboard for a user
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
        LEFT JOIN profiles p ON wl.user_id = p.id
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
        LEFT JOIN profiles p ON ml.user_id = p.id
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

-- ============================================
-- REALTIME CONFIGURATION
-- ============================================

-- Enable realtime for focus rooms (ignore if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE focus_rooms;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE focus_room_participants;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE focus_room_messages;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
