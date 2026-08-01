import { AchievementsPageSkeleton } from "@/components/skeletons/achievements-page-skeleton";

// Instant route-transition skeleton (shown while the RSC payload loads on nav).
export default function Loading() {
  return <AchievementsPageSkeleton />;
}
