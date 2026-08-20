import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** One row in a list — entries, categories, badges, friends, leaderboard. Renders as a link when href is given. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  href,
  onClick,
  className,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      {leading && <div className="flex shrink-0 items-center">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{title}</div>
        {subtitle && <div className="truncate text-xs text-ink-muted">{subtitle}</div>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
    </>
  );

  const rowClass = cn(
    "flex items-center gap-3 rounded-sm px-2 py-2.5",
    (href || onClick) && "transition-colors hover:bg-surface-sunken",
    className
  );

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(rowClass, "w-full text-left")}>
        {content}
      </button>
    );
  }

  return <div className={rowClass}>{content}</div>;
}
