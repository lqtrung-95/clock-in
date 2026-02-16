-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Categories
CREATE POLICY "Users can view own categories"
  ON public.categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE USING (user_id = auth.uid());

-- Time Entries
CREATE POLICY "Users can view own entries"
  ON public.time_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own entries"
  ON public.time_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own entries"
  ON public.time_entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own entries"
  ON public.time_entries FOR DELETE USING (user_id = auth.uid());

-- Pomodoro Sessions
CREATE POLICY "Users can view own pomodoro"
  ON public.pomodoro_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pomodoro"
  ON public.pomodoro_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pomodoro"
  ON public.pomodoro_sessions FOR UPDATE USING (user_id = auth.uid());

-- Streaks
CREATE POLICY "Users can view own streaks"
  ON public.streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE USING (user_id = auth.uid());

-- Goals
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE USING (user_id = auth.uid());

-- User Badges
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT USING (user_id = auth.uid());

-- Challenges
CREATE POLICY "Users can view own challenges"
  ON public.challenges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own challenges"
  ON public.challenges FOR UPDATE USING (user_id = auth.uid());

-- User Preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE USING (user_id = auth.uid());
