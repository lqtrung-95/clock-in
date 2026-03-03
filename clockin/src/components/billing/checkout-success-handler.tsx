"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CheckoutSuccessHandlerProps {
  userId: string | null;
}

/**
 * Detects ?success=true on return from Polar checkout.
 * Invalidates subscription cache so UI reflects new plan immediately,
 * shows a success toast, then strips the query param from the URL.
 */
export function CheckoutSuccessHandler({ userId }: CheckoutSuccessHandlerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchParams.get("success") !== "true") return;

    // Invalidate so useProStatus re-fetches with updated plan
    queryClient.invalidateQueries({ queryKey: ["subscription", userId] });

    toast.success("You're now on Pro! Thank you for subscribing.", {
      duration: 6000,
    });

    // Remove ?success=true from URL without triggering a navigation
    router.replace("/settings/billing");
  }, [searchParams, userId, queryClient, router]);

  return null;
}
