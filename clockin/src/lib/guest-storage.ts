"use client";

import type { TimeEntry, Category } from "@/types/timer";

const STORAGE_KEYS = {
  ENTRIES: "clockin-guest-entries",
  CATEGORIES: "clockin-guest-categories",
  SESSIONS: "clockin-guest-sessions",
};

// Guest entries with local IDs
export interface GuestTimeEntry extends Omit<TimeEntry, "id" | "user_id"> {
  id: string;
  localId: string;
}

export interface GuestCategory extends Omit<Category, "id" | "user_id"> {
  id: string;
  localId: string;
}

export const guestStorage = {
  // Categories
  getCategories(): GuestCategory[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : getDefaultCategories();
  },

  saveCategories(categories: GuestCategory[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory(category: Omit<GuestCategory, "id" | "localId" | "created_at" | "updated_at" | "sort_order" | "is_archived">): GuestCategory {
    const categories = this.getCategories();
    const newCategory: GuestCategory = {
      ...category,
      id: `local-${Date.now()}`,
      localId: `local-${Date.now()}`,
      sort_order: categories.length,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  },

  updateCategory(id: string, updates: Partial<GuestCategory>) {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id || c.localId === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates, updated_at: new Date().toISOString() };
      this.saveCategories(categories);
    }
  },

  deleteCategory(id: string) {
    const categories = this.getCategories();
    const filtered = categories.filter((c) => c.id !== id && c.localId !== id);
    this.saveCategories(filtered);
  },

  // Entries
  getEntries(): GuestTimeEntry[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return stored ? JSON.parse(stored) : [];
  },

  saveEntries(entries: GuestTimeEntry[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  },

  addEntry(entry: Omit<GuestTimeEntry, "id" | "localId" | "created_at" | "updated_at">): GuestTimeEntry {
    const entries = this.getEntries();
    const newEntry: GuestTimeEntry = {
      ...entry,
      id: `local-${Date.now()}`,
      localId: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    entries.unshift(newEntry);
    this.saveEntries(entries);
    return newEntry;
  },

  updateEntry(id: string, updates: Partial<GuestTimeEntry>) {
    const entries = this.getEntries();
    const index = entries.findIndex((e) => e.id === id || e.localId === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates, updated_at: new Date().toISOString() };
      this.saveEntries(entries);
    }
  },

  deleteEntry(id: string) {
    const entries = this.getEntries();
    const filtered = entries.filter((e) => e.id !== id && e.localId !== id);
    this.saveEntries(filtered);
  },

  // Stats
  getStats() {
    const entries = this.getEntries();
    const totalMinutes = entries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / 60;
    const today = new Date().toISOString().split("T")[0];
    const todayEntries = entries.filter((e) => e.started_at.startsWith(today));
    const todayMinutes = todayEntries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / 60;

    return {
      totalEntries: entries.length,
      totalMinutes,
      todayMinutes,
      todayEntries: todayEntries.length,
    };
  },

  // Clear all guest data (e.g., after sign in)
  clearAll() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  },

  // Check if has data to sync
  hasDataToSync(): boolean {
    return this.getEntries().length > 0;
  },
};

function getDefaultCategories(): GuestCategory[] {
  const defaults = [
    { name: "Work", color: "#3b82f6", icon: "briefcase" },
    { name: "Study", color: "#8b5cf6", icon: "book" },
    { name: "Exercise", color: "#22c55e", icon: "dumbbell" },
    { name: "Personal", color: "#f97316", icon: "user" },
  ];

  return defaults.map((cat, i) => ({
    ...cat,
    id: `default-${i}`,
    localId: `default-${i}`,
    sort_order: i,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
