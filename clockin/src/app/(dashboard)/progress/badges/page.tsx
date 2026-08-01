import AchievementsContent from "./achievements-content";

// Force dynamic rendering to avoid static generation issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AchievementsPage() {
  return <AchievementsContent />;
}
