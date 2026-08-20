import type { ReactNode } from "react";

/**
 * Codifies the `ready`/isPending convention already used by
 * use-focus-today-stats.ts and use-focus-active-goals.ts. Takes `ready`,
 * never `isLoading` — isLoading (isPending && isFetching) can briefly flip
 * false mid-query and release the gate one render before data actually
 * resolved, which is exactly the bug that caused layout-shift pop-in on the
 * Focus page earlier in this project. Do not "simplify" a call site to pass
 * isLoading here.
 */
export function LoadingGate({
  ready,
  skeleton,
  children,
}: {
  ready: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}) {
  return ready ? children : skeleton;
}
