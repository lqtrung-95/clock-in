"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

async function syncProfileFromAuth(user: { id: string; user_metadata?: { display_name?: string; avatar_url?: string; name?: string; picture?: string } }) {
  const supabase = createClient();

  // Get display name and avatar from auth metadata (Google, etc.)
  const displayName = user.user_metadata?.display_name ||
    user.user_metadata?.name ||
    null;
  const avatarUrl = user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  if (!displayName && !avatarUrl) return;

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  const profileData = {
    id: user.id,
    user_id: user.id,
    ...(displayName && { display_name: displayName }),
    ...(avatarUrl && { avatar_url: avatarUrl }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updated_at: new Date().toISOString(),
  };

  if (existingProfile) {
    // Update existing profile
    await supabase.from("profiles").update(profileData).eq("id", user.id);
  } else {
    // Create new profile
    await supabase.from("profiles").insert({
      ...profileData,
      created_at: new Date().toISOString(),
    } as never);
  }
}

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);

      // Sync profile from auth data (Google, etc.)
      if (user) {
        await syncProfileFromAuth(user);
      }

      setIsLoading(false);
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);

      // Sync profile on sign in
      if (event === "SIGNED_IN" && session?.user) {
        syncProfileFromAuth(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated, userId, isLoading };
}
