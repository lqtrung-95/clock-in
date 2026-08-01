import { SocialPageSkeleton } from "@/components/skeletons/social-page-skeleton";

// Instant route-transition skeleton (shown while the RSC payload loads on nav).
export default function Loading() {
  return <SocialPageSkeleton />;
}
