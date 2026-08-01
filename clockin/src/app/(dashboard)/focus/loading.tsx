import { FocusSetupSkeleton } from "@/components/skeletons/focus-setup-skeleton";

// Instant route-transition skeleton (shown while the RSC payload loads on nav).
export default function Loading() {
  return <FocusSetupSkeleton />;
}
