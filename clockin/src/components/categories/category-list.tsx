"use client";

import { useState } from "react";
import type { Category } from "@/types/timer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "@/services/category-service";
import { guestStorage } from "@/lib/guest-storage";

interface CategoryListProps {
  categories: Category[];
  onUpdate?: () => void;
  onEdit: (cat: Category) => void;
  isGuest?: boolean;
}

export function CategoryList({ categories, onUpdate, onEdit, isGuest }: CategoryListProps) {
  const [archiving, setArchiving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleArchive(id: string) {
    if (!confirm("Archive this category?")) return;
    setArchiving(id);
    try {
      await categoryService.archiveCategory(id);
      toast.success("Category archived");
      onUpdate?.();
    } catch {
      toast.error("Failed to archive");
    }
    setArchiving(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    setDeleting(id);
    try {
      if (isGuest) {
        guestStorage.deleteCategory(id);
      } else {
        await categoryService.deleteCategory(id);
      }
      toast.success("Category deleted");
      onUpdate?.();
    } catch {
      toast.error("Failed to delete");
    }
    setDeleting(null);
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {categories
        .filter((c) => !c.is_archived)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onArchive={() => handleArchive(cat.id)}
            onDelete={() => handleDelete(cat.id)}
            onEdit={() => onEdit(cat)}
            archiving={archiving === cat.id}
            deleting={deleting === cat.id}
            isGuest={isGuest}
          />
        ))}
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  onArchive: () => void;
  onDelete: () => void;
  onEdit: () => void;
  archiving: boolean;
  deleting: boolean;
  isGuest?: boolean;
}

function CategoryCard({
  category,
  onArchive,
  onDelete,
  onEdit,
  archiving,
  deleting,
  isGuest,
}: CategoryCardProps) {
  return (
    <Card className="p-4 border border-border bg-white/[0.02]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-white font-medium"
            style={{ backgroundColor: category.color }}
          >
            {category.name[0]}
          </div>
          <div>
            <p className="font-medium text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {category.icon}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {isGuest ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              onClick={onDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
              onClick={onArchive}
              disabled={archiving}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
