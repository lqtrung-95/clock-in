import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A composed "nothing here yet" view that says how to populate the space — never a bare "No X yet" string. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "inline",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: "inline" | "page";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line-strong text-center",
        size === "page" ? "px-6 py-16" : "px-6 py-10",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunken text-ink-subtle">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
