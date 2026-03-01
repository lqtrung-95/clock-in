"use client";

import { useState, useRef } from "react";
import type { Category } from "@/types/timer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "@/services/category-service";
import { guestStorage } from "@/lib/guest-storage";
import { CategoryIcon, getIconName } from "./icon-picker";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  categories: Category[];
  onUpdate?: () => void;
  onEdit: (cat: Category) => void;
  onDelete?: (id: string) => void;
  isGuest?: boolean;
}

export function CategoryList({ categories, onUpdate, onEdit, onDelete, isGuest }: CategoryListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  // Local ordered list for optimistic reorder
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null);
  const dragItem = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  // Apply local ordering if set, otherwise fall back to sort_order
  const sorted = orderedIds
    ? orderedIds
        .map((id) => categories.find((c) => c.id === id))
        .filter((c): c is Category => !!c && !c.is_archived)
    : [...categories]
        .filter((c) => !c.is_archived)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    if (onDelete) { onDelete(id); return; }
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

  function handleDragStart(id: string) {
    dragItem.current = id;
  }

  function handleDragEnter(id: string) {
    dragOver.current = id;
  }

  async function handleDragEnd() {
    const from = dragItem.current;
    const to = dragOver.current;
    dragItem.current = null;
    dragOver.current = null;

    if (!from || !to || from === to) return;

    // Build new order
    const base = orderedIds ?? sorted.map((c) => c.id);
    const newOrder = [...base];
    const fromIdx = newOrder.indexOf(from);
    const toIdx = newOrder.indexOf(to);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, from);

    // Optimistic UI update
    setOrderedIds(newOrder);

    // Persist (only for authenticated users)
    if (!isGuest) {
      try {
        await categoryService.reorderCategories("", newOrder);
      } catch {
        toast.error("Failed to save order");
        setOrderedIds(null);
      }
    }
  }

  if (categories.filter((c) => !c.is_archived).length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sorted.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onDelete={() => handleDelete(cat.id)}
          onEdit={() => onEdit(cat)}
          deleting={deleting === cat.id}
          onDragStart={() => handleDragStart(cat.id)}
          onDragEnter={() => handleDragEnter(cat.id)}
          onDragEnd={handleDragEnd}
          isDragging={dragItem.current === cat.id}
        />
      ))}
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  onDelete: () => void;
  onEdit: () => void;
  deleting: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function CategoryCard({
  category, onDelete, onEdit, deleting,
  onDragStart, onDragEnter, onDragEnd, isDragging,
}: CategoryCardProps) {
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        "p-4 border border-border bg-white/[0.02] transition-opacity duration-150",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing shrink-0" />
          <CategoryIcon icon={category.icon} color={category.color} size="md" />
          <div>
            <p className="font-medium text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {getIconName(category.icon)}
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
