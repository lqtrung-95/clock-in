-- Add missing INSERT policy for profiles table
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
