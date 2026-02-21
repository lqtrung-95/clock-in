import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Entry = { duration_seconds: number; started_at: string; categories: { name: string } | null };
type Goal = { title: string; target_hours: number; current_hours: number };
type Category = { id: string; name: string };

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: entries } = await supabase
    .from("time_entries")
    .select("duration_seconds, started_at, categories(name)")
    .eq("user_id", user.id)
    .gte("started_at", since)
    .limit(100) as { data: Entry[] | null };

  const { data: goals } = await supabase
    .from("goals")
    .select("title, target_hours, current_hours")
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .limit(5) as { data: Goal[] | null };

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("is_archived", false) as { data: Category[] | null };

  if (!entries?.length || !categories?.length) return NextResponse.json({ suggestion: null });

  const catMins: Record<string, number> = {};
  for (const e of entries) {
    const cat = e.categories?.name ?? "Uncategorized";
    catMins[cat] = (catMins[cat] ?? 0) + Math.floor(e.duration_seconds / 60);
  }
  const avgDuration = Math.round(
    entries.reduce((s, e) => s + e.duration_seconds, 0) / entries.length / 60
  );
  const topCats = Object.entries(catMins).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([n, m]) => `${n}(${(m / 60).toFixed(1)}h)`).join(", ");
  const goalsText = goals?.length
    ? goals.map(g => `"${g.title}" needs ${(g.target_hours - g.current_hours).toFixed(1)}h more`).join("; ")
    : "none";
  const nowHour = new Date().getHours();
  const timeOfDay = nowHour < 12 ? "morning" : nowHour < 17 ? "afternoon" : "evening";

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 120,
    messages: [
      { role: "system", content: "You are a concise productivity assistant. Respond ONLY with valid JSON, no explanation." },
      { role: "user", content: `Suggest the best next focus session. Return JSON with keys: category (string from available), duration (number: 25, 50, or 90), reason (string, max 12 words).\n\nAvailable categories: ${categories.map(c => c.name).join(", ")}\nMost worked recently: ${topCats}\nGoals: ${goalsText}\nAverage session: ${avgDuration}min\nTime of day: ${timeOfDay}` },
    ],
  });

  try {
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json({ suggestion: json });
  } catch {
    return NextResponse.json({ suggestion: null });
  }
}
