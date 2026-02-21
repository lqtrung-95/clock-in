import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Entry = { duration_seconds: number };
type Goal = { title: string; target_hours: number; current_hours: number };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json() as { messages: { role: "user" | "assistant"; content: string }[] };

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: entries } = await supabase
    .from("time_entries")
    .select("duration_seconds")
    .eq("user_id", user.id)
    .gte("started_at", since)
    .limit(100) as { data: Entry[] | null };

  const { data: goals } = await supabase
    .from("goals")
    .select("title, target_hours, current_hours")
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .limit(5) as { data: Goal[] | null };

  const totalMins = (entries ?? []).reduce((s, e) => s + Math.floor(e.duration_seconds / 60), 0);
  const goalsText = goals?.length
    ? goals.map(g => `"${g.title}" ${g.current_hours}/${g.target_hours}h`).join("; ")
    : "no active goals";

  const systemPrompt = `You are a friendly, motivating focus & productivity coach inside the Clockin app. Keep replies concise (2-4 sentences max unless asked for more). Be warm, specific, and actionable.

User's last 7 days: ${(totalMins / 60).toFixed(1)} focus hours in ${entries?.length ?? 0} sessions.
Active goals: ${goalsText}.
Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}.`;

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 300,
    stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
  });
}
