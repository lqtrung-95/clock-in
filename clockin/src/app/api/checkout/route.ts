import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { createClient } from "@/lib/supabase/server";

const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN ?? "" });

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let productId: string;
  try {
    const body = await req.json();
    // Accept either productId (preferred) or legacy priceId field
    productId = body.productId ?? body.priceId;
    if (!productId || typeof productId !== "string") throw new Error("missing productId");
  } catch {
    return NextResponse.json({ error: "Invalid request body — provide { productId: string }" }, { status: 400 });
  }

  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`;

  try {
    const checkout = await polar.checkouts.create({
      // products is an array of Polar product IDs; first one is selected by default
      products: [productId],
      successUrl,
      customerEmail: user.email,
      // user_id in metadata lets the webhook resolve the subscription owner
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout] Polar error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
