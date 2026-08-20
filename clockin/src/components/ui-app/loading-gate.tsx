import type { ReactNode } from "react";

/**
 * Codifies the `ready`/isPending convention used across this app's one-shot
 * loading gates (e.g. the Focus setup page). Takes `ready`, never
 * `isLoading` — isLoading (isPending && isFetching) can briefly flip false
 * mid-query and release the gate one render before data actually resolved,
 * which is exactly the bug that caused layout-shift pop-in on the Focus
 * page earlier in this project. Do not "simplify" a call site to pass
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
