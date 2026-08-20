import type { ReactNode } from "react";

/**
 * The sole owner of <h1> in this app. Not exported outside page-shell.tsx —
 * a page cannot render its own title, which is what a layout previously did
 * (insights/layout.tsx rendering "Insights" while insights/trends/page.tsx
 * rendered its own "Statistics" header underneath it).
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
