export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppTopbar } from "@/components/shell/app-topbar";
import { MobileTabBar } from "@/components/shell/mobile-tab-bar";
import { AiCoachPanel } from "@/components/ai/ai-coach-panel";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultCollapsed = cookieStore.get("sidebar-collapsed")?.value === "1";

  return (
    <div className="flex min-h-screen bg-surface">
      <AppSidebar defaultCollapsed={defaultCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>
      <MobileTabBar />
      <AiCoachPanel />
    </div>
  );
}
