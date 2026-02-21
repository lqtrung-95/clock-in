import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Category = { id: string; name: string };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json() as { text: string };
  if (!text?.trim()) return NextResponse.json({ categoryName: null });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("is_archived", false) as { data: Category[] | null };

  if (!categories?.length) return NextResponse.json({ categoryName: null });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 20,
    messages: [
      { role: "system", content: "Reply with ONLY the exact category name from the list, nothing else. If no match, reply with null." },
      { role: "user", content: `Task: "${text}"\nCategories: ${categories.map(c => c.name).join(", ")}\nBest matching category:` },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const match = categories.find(c => c.name.toLowerCase() === raw.toLowerCase());
  return NextResponse.json({ categoryName: match?.name ?? null, categoryId: match?.id ?? null });
}
