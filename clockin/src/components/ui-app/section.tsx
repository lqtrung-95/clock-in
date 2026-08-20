import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A titled group of content within a page — not a card, just a labeled block. */
export function Section({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-section text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
