import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type TimeEntryInput = {
  duration_seconds: number | null;
  started_at: string;
  category?: { name: string } | null;
};

type FocusInsightsResponse = {
  bestTimeOfDay: string;
  topCategory: string;
  avgSessionLength: string;
  weeklyTrend: string;
  tip: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { userId?: string; entries?: TimeEntryInput[] };
  const entries: TimeEntryInput[] = body.entries ?? [];

  if (entries.length < 3) {
    return NextResponse.json({ error: "Not enough sessions" }, { status: 422 });
  }

  // Compute stats from entries for the AI prompt
  const totalSessions = entries.length;
  const totalSeconds = entries.reduce((s, e) => s + (e.duration_seconds ?? 0), 0);
  const avgSessionSeconds = Math.round(totalSeconds / totalSessions);

  // Best time of day by hour bucket
  const byHour: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const e of entries) {
    const hour = new Date(e.started_at).getHours();
    const bucket =
      hour < 6 ? "night" :
      hour < 12 ? "morning" :
      hour < 17 ? "afternoon" :
      hour < 21 ? "evening" : "night";
    byHour[bucket] = (byHour[bucket] ?? 0) + (e.duration_seconds ?? 0);

    const cat = e.category?.name ?? "Uncategorized";
    byCategory[cat] = (byCategory[cat] ?? 0) + (e.duration_seconds ?? 0);
  }

  const topHourBucket = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "morning";
  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "General";
  const avgMinutes = Math.round(avgSessionSeconds / 60);

  const statsPrompt = `Weekly focus stats:
- Sessions: ${totalSessions}
- Total focus time: ${(totalSeconds / 3600).toFixed(1)} hours
- Average session: ${avgMinutes} minutes
- Most productive time: ${topHourBucket}
- Top category: ${topCat}

Respond ONLY with a valid JSON object (no markdown, no extra text):
{"bestTimeOfDay":"<string>","topCategory":"<string>","avgSessionLength":"<string>","weeklyTrend":"<string>","tip":"<string>"}

Rules:
- bestTimeOfDay: short label like "Morning (9–11am)"
- topCategory: category name as given
- avgSessionLength: e.g. "28 min"
- weeklyTrend: one encouraging sentence about the user's pattern
- tip: one specific, actionable productivity tip`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 200,
    messages: [
      { role: "system", content: "You are a concise productivity coach. Output only valid JSON, no markdown." },
      { role: "user", content: statsPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

  let parsed: FocusInsightsResponse;
  try {
    parsed = JSON.parse(raw) as FocusInsightsResponse;
  } catch {
    // Fallback to computed values if JSON parse fails
    parsed = {
      bestTimeOfDay: topHourBucket.charAt(0).toUpperCase() + topHourBucket.slice(1),
      topCategory: topCat,
      avgSessionLength: `${avgMinutes} min`,
      weeklyTrend: "You're building a solid focus habit — keep it up!",
      tip: "Try to start your first session within 30 minutes of waking up.",
    };
  }

  return NextResponse.json({ ...parsed, generatedAt: new Date().toISOString() });
}
