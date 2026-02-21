export const dynamic = "force-dynamic";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AiCoachPanel } from "@/components/ai/ai-coach-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto md:ml-0 pb-24 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
      <AiCoachPanel />
    </div>
  );
}
