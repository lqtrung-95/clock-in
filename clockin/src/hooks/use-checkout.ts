"use client";

import { useState } from "react";
import { toast } from "sonner";

interface CheckoutResponse {
  url: string;
  error?: string;
}

/**
 * Hook to initiate Polar checkout.
 * On success redirects browser to Polar's hosted checkout page.
 */
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  async function checkout(productId: string): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data: CheckoutResponse = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to create checkout session");
      }

      // Redirect to Polar hosted checkout page
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      toast.error(message);
      setIsLoading(false);
    }
    // Note: setIsLoading(false) intentionally omitted on success
    // because we redirect — component unmounts anyway
  }

  return { checkout, isLoading };
}
