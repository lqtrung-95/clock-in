import { HubTabs } from "@/components/layout/hub-tabs";

// Insights hub — consolidates the former Stats and History pages under one nav
// item with a tab bar. Each tab keeps its own page/data.
export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 pt-6 md:px-8 md:pt-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <HubTabs
            tabs={[
              { label: "Trends", href: "/insights/trends" },
              { label: "History", href: "/insights/history" },
            ]}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
