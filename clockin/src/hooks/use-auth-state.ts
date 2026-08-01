"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

// Single shared cache entry so auth resolves once per app load instead of every
// component re-running getUser() on mount (which made navigation feel slow and
// caused children to briefly render with a null userId).
export const AUTH_QUERY_KEY = ["auth-user"] as const;

export async function syncProfileFromAuth(user: {
  id: string;
  user_metadata?: { display_name?: string; avatar_url?: string; name?: string; picture?: string };
}) {
  const supabase = createClient();

  const displayName = user.user_metadata?.display_name || user.user_metadata?.name || null;
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  if (!displayName && !avatarUrl) return;

  // Try to create profile — if duplicate key, profile already exists
  try {
    await supabase.from("profiles").insert({
      id: user.id,
      user_id: user.id,
      ...(displayName && { display_name: displayName }),
      ...(avatarUrl && { avatar_url: avatarUrl }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as never);
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err?.code !== "23505" && !err?.message?.includes("duplicate key")) {
      console.error("Error creating profile:", error);
    }
  }
}

async function fetchAuthState(): Promise<AuthState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await syncProfileFromAuth(user);
  return { isAuthenticated: !!user, userId: user?.id ?? null };
}

/**
 * Shared auth state. All callers read one cache entry (keyed AUTH_QUERY_KEY),
 * so getUser() runs a single time and subsequent mounts get the value instantly.
 * The global AuthStateListener keeps it in sync on sign in/out.
 */
export function useAuthState() {
  const { data, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthState,
    staleTime: Infinity, // only changes via the auth listener
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    // null while unresolved (preserves the prior boolean | null contract)
    isAuthenticated: data ? data.isAuthenticated : null,
    userId: data?.userId ?? null,
    isLoading,
  };
}
