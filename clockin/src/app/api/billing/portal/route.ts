import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { createClient } from "@/lib/supabase/server";
import { subscriptionService } from "@/services/subscription-service";

const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN ?? "" });

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const subscription = await subscriptionService.getSubscription(user.id);
    const { polar_customer_id } = subscription;

    if (!polar_customer_id) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
    }

    const session = await polar.customerSessions.create({
      customerId: polar_customer_id,
    });

    return NextResponse.json({ url: session.customerPortalUrl });
  } catch (err) {
    console.error("[billing/portal] Polar error:", err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
