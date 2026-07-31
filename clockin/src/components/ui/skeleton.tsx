import { cn } from "@/lib/utils";

/**
 * Base skeleton primitive — a muted, pulsing placeholder block.
 * Compose these to mirror a component's real layout so the page reserves
 * the correct height while data loads (prevents layout shift / CLS).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
