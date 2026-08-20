import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one card treatment for the app. Replaces three competing patterns that
 * existed before this: shadcn <Card> with its base overridden per call site,
 * raw divs re-implementing it, and one-off gradient cards.
 */
export function DataCard({
  title,
  description,
  action,
  footer,
  padding = "md",
  className,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  footer?: ReactNode;
  padding?: "md" | "none";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-md border border-line bg-surface-raised shadow-card",
        padding === "md" && "p-6",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
      {footer && <div className="border-t border-line pt-4">{footer}</div>}
    </div>
  );
}
