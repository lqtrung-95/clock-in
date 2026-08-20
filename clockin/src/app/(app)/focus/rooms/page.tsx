"use client";

import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";
import { FocusRooms } from "@/components/social/focus-rooms";
import { PageShell } from "@/components/ui-app/page-shell";
import { GateCard } from "@/components/ui-app/gate-card";

/**
 * New route — rooms are "start work with others," the same intent as solo
 * Focus, so they get a URL under it instead of living inside the old Social
 * page. Free users see the feature (with a gate) rather than a missing nav
 * item, which is the discovery trade-off the redesign explicitly chose.
 *
 * FocusRooms still also renders inside /progress/leaderboard until that
 * page is rebuilt (Phase 5) — a deliberate transient duplication, not a bug.
 */
export default function FocusRoomsPage() {
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthState();
  const { isPro, isPending: proPending } = useProStatus(userId);

  return (
    <PageShell title="Focus rooms" description="Work alongside friends in a shared, synced session.">
      {!isAuthenticated ? (
        <GateCard kind="auth" feature="focus rooms" description="Sign in to create or join a room." pending={authLoading} />
      ) : !isPro ? (
        <GateCard kind="pro" feature="Focus rooms" description="Connect with friends and focus together in real time." pending={proPending} />
      ) : (
        <FocusRooms userId={userId!} />
      )}
    </PageShell>
  );
}
