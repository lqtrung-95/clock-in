"use client";

import { create } from "zustand";
import type { Category } from "@/types/timer";

interface CategoryState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  archiveCategory: (id: string) => void;
  getActiveCategories: () => Category[];
}

export const useCategoryStore = create<CategoryState>()((set, get) => ({
  categories: [],

  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  archiveCategory: (id) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, is_archived: true } : c
      ),
    })),

  getActiveCategories: () =>
    get().categories.filter((c) => !c.is_archived),
}));
