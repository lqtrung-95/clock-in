"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AUTH_QUERY_KEY, syncProfileFromAuth, type AuthState } from "@/hooks/use-auth-state";

/**
 * Subscribes once (app-wide) to Supabase auth changes and writes them into the
 * shared auth query cache, so every useAuthState() caller updates on sign
 * in/out without each maintaining its own subscription. Renders nothing.
 */
export function AuthStateListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      queryClient.setQueryData<AuthState>(AUTH_QUERY_KEY, {
        isAuthenticated: !!session?.user,
        userId: session?.user?.id ?? null,
      });
      if (event === "SIGNED_IN" && session?.user) {
        syncProfileFromAuth(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return null;
}
