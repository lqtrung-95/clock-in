-- Focus Room Session Management
-- Host-controlled synchronized timer with session history

-- Add session fields to focus_rooms table
ALTER TABLE focus_rooms
ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 25, -- minutes
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS session_state TEXT DEFAULT 'idle' CHECK (session_state IN ('idle', 'active', 'paused', 'completed'));

-- Create focus room sessions table for history
CREATE TABLE IF NOT EXISTS focus_room_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL, -- in minutes
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    participant_count INTEGER NOT NULL DEFAULT 0,
    completed_count INTEGER NOT NULL DEFAULT 0, -- how many completed the session
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_room_sessions_room ON focus_room_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_focus_room_sessions_host ON focus_room_sessions(host_id);

-- Participant session tracking (for individual completion status)
CREATE TABLE IF NOT EXISTS focus_room_session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES focus_room_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    focus_seconds INTEGER NOT NULL DEFAULT 0,
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_session_participants_session ON focus_room_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user ON focus_room_session_participants(user_id);

-- Enable RLS
ALTER TABLE focus_room_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_room_session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY focus_room_sessions_select ON focus_room_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM focus_rooms fr
            WHERE fr.id = focus_room_sessions.room_id
            AND (fr.is_private = false OR fr.host_id = auth.uid())
        )
    );

CREATE POLICY focus_room_sessions_insert ON focus_room_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM focus_rooms fr
            WHERE fr.id = focus_room_sessions.room_id
            AND fr.host_id = auth.uid()
        )
    );

CREATE POLICY focus_room_sessions_update ON focus_room_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM focus_rooms fr
            WHERE fr.id = focus_room_sessions.room_id
            AND fr.host_id = auth.uid()
        )
    );

CREATE POLICY focus_room_session_participants_select ON focus_room_session_participants
    FOR SELECT USING (true);

CREATE POLICY focus_room_session_participants_insert ON focus_room_session_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY focus_room_session_participants_update ON focus_room_session_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Enable realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE focus_room_sessions;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE focus_room_session_participants;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Function to start a focus room session
CREATE OR REPLACE FUNCTION start_focus_room_session(
    p_room_id UUID,
    p_host_id UUID,
    p_duration INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Update room session state
    UPDATE focus_rooms
    SET session_duration = p_duration,
        session_started_at = NOW(),
        session_state = 'active'
    WHERE id = p_room_id AND host_id = p_host_id;

    -- Create session record
    INSERT INTO focus_room_sessions (room_id, host_id, duration, started_at, participant_count)
    SELECT p_room_id, p_host_id, p_duration, NOW(), COUNT(*)
    FROM focus_room_participants
    WHERE room_id = p_room_id AND left_at IS NULL
    RETURNING id INTO v_session_id;

    -- Add current participants to session
    INSERT INTO focus_room_session_participants (session_id, user_id)
    SELECT v_session_id, user_id
    FROM focus_room_participants
    WHERE room_id = p_room_id AND left_at IS NULL;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a focus room session
CREATE OR REPLACE FUNCTION complete_focus_room_session(
    p_room_id UUID,
    p_host_id UUID
)
RETURNS void AS $$
BEGIN
    -- Update room session state
    UPDATE focus_rooms
    SET session_state = 'completed',
        session_started_at = NULL
    WHERE id = p_room_id AND host_id = p_host_id;

    -- Update session record
    UPDATE focus_room_sessions
    SET completed_at = NOW(),
        completed_count = (
            SELECT COUNT(*)
            FROM focus_room_session_participants
            WHERE session_id = (
                SELECT id FROM focus_room_sessions
                WHERE room_id = p_room_id
                AND completed_at IS NULL
                ORDER BY started_at DESC
                LIMIT 1
            )
            AND completed_at IS NOT NULL
        )
    WHERE room_id = p_room_id
    AND completed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to pause a focus room session
CREATE OR REPLACE FUNCTION pause_focus_room_session(
    p_room_id UUID,
    p_host_id UUID
)
RETURNS void AS $$
BEGIN
    UPDATE focus_rooms
    SET session_state = 'paused'
    WHERE id = p_room_id AND host_id = p_host_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset a focus room session
CREATE OR REPLACE FUNCTION reset_focus_room_session(
    p_room_id UUID,
    p_host_id UUID
)
RETURNS void AS $$
BEGIN
    -- Mark current session as completed if exists
    UPDATE focus_room_sessions
    SET completed_at = NOW()
    WHERE room_id = p_room_id
    AND completed_at IS NULL;

    -- Reset room state
    UPDATE focus_rooms
    SET session_state = 'idle',
        session_started_at = NULL
    WHERE id = p_room_id AND host_id = p_host_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark participant as completed
CREATE OR REPLACE FUNCTION complete_session_participant(
    p_session_id UUID,
    p_user_id UUID
)
RETURNS void AS $$
BEGIN
    UPDATE focus_room_session_participants
    SET completed_at = NOW()
    WHERE session_id = p_session_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
