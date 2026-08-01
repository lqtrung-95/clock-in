import { CategoriesPageSkeleton } from "@/components/skeletons/list-page-skeletons";

// Instant route-transition skeleton (shown while the RSC payload loads on nav).
export default function Loading() {
  return <CategoriesPageSkeleton />;
}
