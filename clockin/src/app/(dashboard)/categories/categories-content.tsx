"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { categoryService } from "@/services/category-service";
import { CategoryList } from "@/components/categories/category-list";
import { CategoryForm } from "@/components/categories/category-form";
import { LoginBanner } from "@/components/auth/login-prompt";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { guestStorage } from "@/lib/guest-storage";
import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";
import type { Category } from "@/types/timer";
import { Plus, Tags } from "lucide-react";
import { CategoriesPageSkeleton } from "@/components/skeletons/list-page-skeletons";
import { toast } from "sonner";

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
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {!isAuthenticated && <LoginBanner feature="sync" />}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/25">
              <Tags className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Categories</h1>
              <p className="text-sm text-muted-foreground">Organize your time entries</p>
            </div>
          </div>
          {isAuthenticated && !isPro && (categories ?? []).length >= FREE_CATEGORY_LIMIT ? (
            <UpgradePrompt
              feature="Unlimited Categories"
              compact
              onUpgrade={() => {}}
            />
          ) : (
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          )}
        </div>

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
      </div>
    </div>
  );
}
