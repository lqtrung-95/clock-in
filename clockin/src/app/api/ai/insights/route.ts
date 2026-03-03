import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import { checkProAccess } from "@/lib/check-pro-access";
import { subscriptionService } from "@/services/subscription-service";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const FREE_MONTHLY_LIMIT = 3;

type Entry = { duration_seconds: number; started_at: string; categories: { name: string } | null };
type Goal = { title: string; target_hours: number; current_hours: number };

export async function POST() {
  let userId: string;
  let isPro: boolean;
  let aiInsightsUsedThisMonth: number;

  try {
    ({ userId, isPro, aiInsightsUsedThisMonth } = await checkProAccess());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Free tier: allow up to 3 AI insight generations per month
  if (!isPro && aiInsightsUsedThisMonth >= FREE_MONTHLY_LIMIT) {
    return NextResponse.json(
      { error: "FREE_LIMIT_REACHED", message: "Upgrade to Pro for unlimited AI insights" },
      { status: 403 }
    );
  }

  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: entries } = await supabase
    .from("time_entries")
    .select("duration_seconds, started_at, categories(name)")
    .eq("user_id", userId)
    .gte("started_at", since)
    .order("started_at", { ascending: false })
    .limit(200) as { data: Entry[] | null };

  const { data: goals } = await supabase
    .from("goals")
    .select("title, target_hours, current_hours")
    .eq("user_id", userId)
    .eq("is_completed", false)
    .limit(10) as { data: Goal[] | null };

  if (!entries || entries.length === 0) {
    return NextResponse.json({ insights: "Start a few focus sessions and I'll generate personalized insights for you! 🚀" });
  }

  const totalMins = entries.reduce((s, e) => s + Math.floor(e.duration_seconds / 60), 0);
  const byCategory: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  for (const e of entries) {
    const cat = e.categories?.name ?? "Uncategorized";
    byCategory[cat] = (byCategory[cat] ?? 0) + Math.floor(e.duration_seconds / 60);
    const day = new Date(e.started_at).toLocaleDateString("en-US", { weekday: "short" });
    byDay[day] = (byDay[day] ?? 0) + Math.floor(e.duration_seconds / 60);
  }

  const topCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([n, m]) => `${n}: ${(m / 60).toFixed(1)}h`).join(", ");
  const dayBreakdown = Object.entries(byDay).sort((a, b) => b[1] - a[1])
    .map(([d, m]) => `${d}: ${(m / 60).toFixed(1)}h`).join(", ");
  const goalsText = goals?.length
    ? goals.map(g => `"${g.title}" ${g.current_hours}/${g.target_hours}h`).join("; ")
    : "No active goals";

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 400,
    messages: [
      { role: "system", content: "You are an encouraging, concise productivity coach. Write in natural flowing paragraphs (no bullet points, no markdown headers). Be specific and warm." },
      { role: "user", content: `Analyze these 30-day focus stats and write a 3-paragraph personalized insight (under 200 words):\n- Total: ${(totalMins / 60).toFixed(1)}h in ${entries.length} sessions\n- By category: ${topCats}\n- By day: ${dayBreakdown}\n- Goals: ${goalsText}\n\nCover: strongest pattern, one specific improvement tip, encouraging close.` },
    ],
  });

  const insights = completion.choices[0]?.message?.content ?? "Unable to generate insights.";

  // Track usage for free tier (fire-and-forget, don't block response)
  if (!isPro) {
    subscriptionService.incrementAiInsightsUsed(userId).catch(() => {});
  }

  return NextResponse.json({ insights, generatedAt: new Date().toISOString() });
}
