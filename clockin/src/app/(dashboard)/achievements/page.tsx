export const dynamic = "force-dynamic";

import AchievementsContent from "./achievements-content";
import type { BadgeDefinition } from "@/types/gamification";

// Simple server-side fetch without service imports
async function getBadgeDefinitions(): Promise<BadgeDefinition[]> {
  // Check if env vars are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase env vars not available, returning empty badges");
    return [];
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/badge_definitions?select=*&order=xp_reward.asc`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch badges:", response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching badges:", error);
    return [];
  }
}

// Simple user check without server client
async function getCurrentUser(): Promise<{ id: string } | null> {
  // During build time, we can't verify the user
  // Return null and let client-side handle auth
  return null;
}

export default async function AchievementsPage() {
  // Fetch data on the server
  const allBadges = await getBadgeDefinitions();
  const user = await getCurrentUser();

  return (
    <AchievementsContent
      allBadges={allBadges}
      userId={user?.id || null}
    />
  );
}
