-- Focus Room Session Management - Fix
-- Add missing columns and functions

-- Add session fields to focus_rooms table
ALTER TABLE focus_rooms
ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS session_state TEXT DEFAULT 'idle' CHECK (session_state IN ('idle', 'active', 'paused', 'completed'));

-- Create focus_room_sessions table for history
CREATE TABLE IF NOT EXISTS focus_room_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES focus_rooms(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    participant_count INTEGER NOT NULL DEFAULT 0,
    completed_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_room_sessions_room ON focus_room_sessions(room_id);

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
    UPDATE focus_rooms
    SET session_duration = p_duration,
        session_started_at = NOW(),
        session_state = 'active'
    WHERE id = p_room_id AND host_id = p_host_id;

    INSERT INTO focus_room_sessions (room_id, host_id, duration, started_at, participant_count)
    SELECT p_room_id, p_host_id, p_duration, NOW(), COUNT(*)
    FROM focus_room_participants
    WHERE room_id = p_room_id AND left_at IS NULL
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
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
    UPDATE focus_room_sessions
    SET completed_at = NOW()
    WHERE room_id = p_room_id AND completed_at IS NULL;

    UPDATE focus_rooms
    SET session_state = 'idle',
        session_started_at = NULL
    WHERE id = p_room_id AND host_id = p_host_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a focus room session
CREATE OR REPLACE FUNCTION complete_focus_room_session(
    p_room_id UUID,
    p_host_id UUID
)
RETURNS void AS $$
BEGIN
    UPDATE focus_rooms
    SET session_state = 'completed',
        session_started_at = NULL
    WHERE id = p_room_id AND host_id = p_host_id;

    UPDATE focus_room_sessions
    SET completed_at = NOW()
    WHERE room_id = p_room_id AND completed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');
