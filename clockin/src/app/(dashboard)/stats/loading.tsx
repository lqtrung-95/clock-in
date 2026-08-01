import { StatsPageSkeleton } from "@/components/skeletons/stats-page-skeleton";

// Instant route-transition skeleton (shown while the RSC payload loads on nav).
export default function Loading() {
  return <StatsPageSkeleton />;
}
