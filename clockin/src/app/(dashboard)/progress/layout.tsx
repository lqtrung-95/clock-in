import { HubTabs } from "@/components/layout/hub-tabs";

// Progress hub — consolidates the former Goals, Achievements and Dream pages
// under one nav item with a tab bar. Each tab keeps its own page/data.
export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 pt-6 md:px-8 md:pt-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <HubTabs
            tabs={[
              { label: "Goals & streaks", href: "/progress/goals" },
              { label: "Badges", href: "/progress/badges" },
              { label: "Dream goal", href: "/progress/dream" },
            ]}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
