"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { PRESET_CATEGORIES } from "@/data/preset-categories";
import { Check } from "lucide-react";

// Force dynamic rendering to avoid prerender env var issues
export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  function toggleCategory(name: string) {
    const next = new Set(selected);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelected(next);
  }

  async function handleContinue() {
    if (selected.size === 0) {
      toast.error("Select at least one category");
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }
    const categoriesToCreate = PRESET_CATEGORIES.filter((c) =>
      selected.has(c.name)
    ).map((c, i) => ({
      user_id: user.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      sort_order: i,
    }));
    const { error } = await supabase.from("categories").insert(categoriesToCreate as never);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Choose your categories</h1>
          <p className="text-muted-foreground">
            Select what you want to track. You can add more later.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PRESET_CATEGORIES.map((cat) => {
            const isSelected = selected.has(cat.name);
            return (
              <Card
                key={cat.name}
                className={`cursor-pointer p-4 transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
                onClick={() => toggleCategory(cat.name)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-foreground"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name[0]}
                  </div>
                  <span className="flex-1 font-medium">{cat.name}</span>
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </div>
              </Card>
            );
          })}
        </div>
        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={loading || selected.size === 0}
        >
          {loading ? "Creating..." : `Continue (${selected.size} selected)`}
        </Button>
      </div>
    </div>
  );
}
