export const dynamic = "force-dynamic";

import AchievementsContent from "./achievements-content";
import { getAllBadgeDefinitions } from "@/services/gamification-service";
import { createClient } from "@/lib/supabase/server";

export default async function AchievementsPage() {
  // Fetch data on the server
  const allBadges = await getAllBadgeDefinitions();

  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AchievementsContent
      allBadges={allBadges}
      userId={user?.id || null}
    />
  );
}
