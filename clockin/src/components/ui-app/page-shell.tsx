import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";
import { SegmentedNav } from "./segmented-nav";
import type { SegmentTab } from "@/lib/navigation";

const WIDTH_CLASS = {
  prose: "max-w-prose",
  content: "max-w-content",
  wide: "max-w-wide",
  full: "max-w-none",
} as const;

/**
 * Every route's single entry point for page chrome. Owns title, description,
 * page-level actions, the segmented sub-nav for hub routes, and page width —
 * the nine ad-hoc max-w-* values and three different title spellings this
 * app had all collapse into this one component.
 */
export function PageShell({
  title,
  description,
  actions,
  segments,
  banner,
  width = "content",
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  segments?: SegmentTab[];
  banner?: ReactNode;
  width?: keyof typeof WIDTH_CLASS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("px-4 py-8 md:px-8 md:py-10", className)}>
      <div className={cn("mx-auto flex flex-col gap-8 md:gap-10", WIDTH_CLASS[width])}>
        {banner}
        {title && <PageHeader title={title} description={description} actions={actions} />}
        {segments && <SegmentedNav segments={segments} />}
        {children}
      </div>
    </div>
  );
}
