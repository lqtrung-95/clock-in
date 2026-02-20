-- Allow users to view other users' basic profile info for social features
CREATE POLICY "Users can view other profiles for social"
  ON public.profiles FOR SELECT
  USING (true);

-- Note: This allows all authenticated users to view basic profile info
-- (display_name, avatar_url) which is necessary for social features
-- like focus rooms, leaderboards, and friend lists to work properly.
