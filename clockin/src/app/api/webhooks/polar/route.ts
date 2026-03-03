import { NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { subscriptionService } from "@/services/subscription-service";
import type { PlanType, BillingInterval, SubscriptionStatus, UpsertSubscriptionData } from "@/types/subscription";

// Map Polar product IDs to plan types
function resolvePlanType(productId: string): PlanType {
  if (productId === process.env.POLAR_LIFETIME_PRODUCT_ID) return "lifetime";
  if (
    productId === process.env.POLAR_PRO_MONTHLY_PRODUCT_ID ||
    productId === process.env.POLAR_PRO_ANNUAL_PRODUCT_ID
  ) return "pro";
  return "free";
}

function resolveBillingInterval(productId: string): BillingInterval {
  if (productId === process.env.POLAR_PRO_MONTHLY_PRODUCT_ID) return "month";
  if (productId === process.env.POLAR_PRO_ANNUAL_PRODUCT_ID) return "year";
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionEvent(payload: any, status: SubscriptionStatus): Promise<void> {
  const sub = payload.data;
  const userId: string | undefined = sub.metadata?.user_id ?? sub.customer?.externalId;
  if (!userId) return;

  const productId: string = sub.product?.id ?? sub.productId ?? "";
  const data: UpsertSubscriptionData = {
    user_id: userId,
    polar_customer_id: sub.customerId ?? null,
    polar_subscription_id: sub.id ?? null,
    plan_type: resolvePlanType(productId),
    billing_interval: resolveBillingInterval(productId),
    status,
    current_period_end: sub.currentPeriodEnd ?? sub.endsAt ?? null,
  };

  await subscriptionService.upsertSubscription(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleOrderEvent(payload: any): Promise<void> {
  const order = payload.data;
  const userId: string | undefined = order.metadata?.user_id ?? order.customer?.externalId;
  if (!userId) return;

  const productId: string = order.product?.id ?? order.productId ?? "";
  if (resolvePlanType(productId) !== "lifetime") return;

  const data: UpsertSubscriptionData = {
    user_id: userId,
    polar_customer_id: order.customerId ?? null,
    polar_subscription_id: null,
    plan_type: "lifetime",
    billing_interval: null,
    status: "active",
    current_period_end: null,
  };

  await subscriptionService.upsertSubscription(data);
}

// No auth — Polar calls this server-to-server
export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let payload: { type: string };
  try {
    payload = validateEvent(rawBody, headers, webhookSecret) as { type: string };
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  try {
    switch (payload.type) {
      case "subscription.created":
      case "subscription.updated":
        await handleSubscriptionEvent(payload, "active");
        break;
      case "subscription.canceled":
        await handleSubscriptionEvent(payload, "canceled");
        break;
      case "order.created":
        await handleOrderEvent(payload);
        break;
      default:
        // Unhandled event types — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error("[polar/webhook] handler error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
