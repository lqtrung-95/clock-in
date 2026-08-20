"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { categoryService } from "@/services/category-service";
import { CategoryList } from "@/components/categories/category-list";
import { CategoryForm } from "@/components/categories/category-form";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { guestStorage } from "@/lib/guest-storage";
import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";
import type { Category } from "@/types/timer";
import { Plus } from "lucide-react";
import { CategoriesPageSkeleton } from "@/components/skeletons/list-page-skeletons";
import { toast } from "sonner";
import { PageShell } from "@/components/ui-app/page-shell";
import { LocalDataBanner } from "@/components/ui-app/local-data-banner";
import { SEGMENTS } from "@/lib/navigation";

const FREE_CATEGORY_LIMIT = 5;

export default function CategoriesContent() {
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthState();
  const queryClient = useQueryClient();
  const { isPro } = useProStatus(userId);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryKey = ["categories", userId] as const;

  const { data: categories, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (isAuthenticated && userId) {
        return categoryService.getCategories(userId);
      }
      return guestStorage.getCategories() as unknown as Category[];
    },
    enabled: !authLoading,
  });

  // Create mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; icon: string }) => {
      if (isAuthenticated) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        return categoryService.createCategory(user.id, data);
      }
      guestStorage.addCategory(data);
      return null;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Category[]>(queryKey) ?? [];
      const now = new Date().toISOString();
      const optimistic: Category = {
        id: `optimistic-${Date.now()}`,
        user_id: userId ?? "",
        name: data.name,
        color: data.color,
        icon: data.icon,
        is_archived: false,
        sort_order: 0,
        created_at: now,
        updated_at: now,
      };
      queryClient.setQueryData<Category[]>(queryKey, [...previous, optimistic]);
      return { previous };
    },
    onError: (err, _data, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      const msg = err instanceof Error ? err.message : "";
      if (msg === "CATEGORY_LIMIT_REACHED") {
        toast.error("Category limit reached. Upgrade to Pro for unlimited categories.");
      } else {
        toast.error("Failed to create category");
      }
    },
    onSuccess: () => {
      toast.success("Category created");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: async ({ category, data }: { category: Category; data: { name: string; color: string; icon: string } }) => {
      if (isAuthenticated) {
        return categoryService.updateCategory(category.id, data);
      }
      guestStorage.updateCategory(category.id, data);
      return null;
    },
    onMutate: async ({ category, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Category[]>(queryKey) ?? [];
      queryClient.setQueryData<Category[]>(
        queryKey,
        previous.map((c) => (c.id === category.id ? { ...c, ...data } : c))
      );
      return { previous };
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      toast.error("Failed to update category");
    },
    onSuccess: () => {
      toast.success("Category updated");
      setEditingCategory(null);
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isAuthenticated) {
        await categoryService.deleteCategory(id);
      } else {
        guestStorage.deleteCategory(id);
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Category[]>(queryKey) ?? [];
      queryClient.setQueryData<Category[]>(queryKey, previous.filter((c) => c.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      toast.error("Failed to delete category");
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  function handleEdit(cat: Category) {
    setEditingCategory(cat);
    setFormOpen(true);
  }

  function handleSubmit(data: { name: string; color: string; icon: string }) {
    if (editingCategory) {
      updateMutation.mutate({ category: editingCategory, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function invalidateCategories() {
    queryClient.invalidateQueries({ queryKey });
  }

  if (isLoading || authLoading) {
    return <CategoriesPageSkeleton />;
  }

  const formLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <PageShell
      title="Settings"
      description="Organize your time entries"
      segments={SEGMENTS.settings}
      banner={!isAuthenticated && <LocalDataBanner />}
      actions={
        isAuthenticated && !isPro && (categories ?? []).length >= FREE_CATEGORY_LIMIT ? (
          <UpgradePrompt feature="Unlimited Categories" compact onUpgrade={() => {}} />
        ) : (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            New category
          </Button>
        )
      }
    >
        <Card className="border border-border bg-card p-6 backdrop-blur-sm">
          <CategoryList
            categories={categories ?? []}
            onUpdate={invalidateCategories}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
            isGuest={!isAuthenticated}
          />
        </Card>

        <CategoryForm
          category={editingCategory}
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingCategory(null);
          }}
          onSubmit={handleSubmit}
          loading={formLoading}
        />
    </PageShell>
  );
}
