"use client";

import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/timer";

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon: string;
}

export const categoryService = {
  async getCategories(userId: string): Promise<Category[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getAllCategories(userId: string): Promise<Category[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createCategory(userId: string, input: CreateCategoryInput): Promise<Category> {
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("categories")
      .select("sort_order")
      .eq("user_id", userId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();
    const existingOrder = (existing as { sort_order: number } | null)?.sort_order;
    const nextSortOrder = (existingOrder ?? -1) + 1;
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: input.name,
        color: input.color,
        icon: input.icon,
        sort_order: nextSortOrder,
      } as never)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<CreateCategoryInput>): Promise<Category> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .update(updates as never)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async archiveCategory(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ is_archived: true } as never)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteCategory(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async reorderCategories(userId: string, ids: string[]): Promise<void> {
    const supabase = createClient();
    const updates = ids.map((id, index) =>
      supabase.from("categories").update({ sort_order: index } as never).eq("id", id)
    );
    await Promise.all(updates);
  },
};
