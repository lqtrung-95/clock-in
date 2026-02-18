"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { categoryService } from "@/services/category-service";
import { useCategoryStore } from "@/stores/category-store";
import { CategoryList } from "@/components/categories/category-list";
import { CategoryForm } from "@/components/categories/category-form";
import { LoginBanner } from "@/components/auth/login-prompt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { guestStorage } from "@/lib/guest-storage";
import { useAuthState } from "@/hooks/use-auth-state";
import type { Category } from "@/types/timer";
import { Plus, Tags } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { categories, setCategories } = useCategoryStore();

  async function loadCategories() {
    if (isAuthenticated) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cats = await categoryService.getCategories(user.id);
        setCategories(cats);
      }
    } else {
      const cats = guestStorage.getCategories();
      setCategories(cats as unknown as Category[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!authLoading) {
      loadCategories();
    }
  }, [authLoading, isAuthenticated]);

  async function handleCreate(data: { name: string; color: string; icon: string }) {
    setFormLoading(true);
    try {
      if (isAuthenticated) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        await categoryService.createCategory(user.id, data);
      } else {
        guestStorage.addCategory({
          name: data.name,
          color: data.color,
          icon: data.icon,
        });
      }
      toast.success("Category created");
      setFormOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    }
    setFormLoading(false);
  }

  async function handleUpdate(data: { name: string; color: string; icon: string }) {
    if (!editingCategory) return;
    setFormLoading(true);
    try {
      if (isAuthenticated) {
        await categoryService.updateCategory(editingCategory.id, data);
      } else {
        guestStorage.updateCategory(editingCategory.id, data);
      }
      toast.success("Category updated");
      setEditingCategory(null);
      setFormOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
    setFormLoading(false);
  }

  function handleEdit(cat: Category) {
    setEditingCategory(cat);
    setFormOpen(true);
  }

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

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
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>

        <Card className="border border-border bg-card p-6 backdrop-blur-sm">
          <CategoryList
            categories={categories}
            onUpdate={loadCategories}
            onEdit={handleEdit}
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
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          loading={formLoading}
        />
      </div>
    </div>
  );
}
