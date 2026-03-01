import type { TimeEntry, Category } from "@/types/timer";
import { format, parseISO } from "date-fns";

/** Escapes a CSV field value by wrapping in quotes if needed */
function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if the field contains commas, quotes, or newlines
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Builds a CSV row from an array of values */
function buildRow(fields: (string | number | null | undefined)[]): string {
  return fields.map(escapeCsvField).join(",");
}

/**
 * Pure function: converts time entries to a CSV string and triggers browser download.
 * Columns: date, category, duration_minutes, notes
 */
export function exportEntriesToCsv(entries: TimeEntry[], categories: Category[]): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const header = buildRow(["date", "category", "duration_minutes", "notes"]);

  const rows = entries.map((entry) => {
    const date = entry.started_at
      ? format(parseISO(entry.started_at), "yyyy-MM-dd")
      : "";
    const categoryName =
      entry.category?.name ??
      categoryMap.get(entry.category_id) ??
      entry.category_id;
    const durationMinutes = entry.duration_seconds
      ? Math.round(entry.duration_seconds / 60)
      : 0;
    return buildRow([date, categoryName, durationMinutes, entry.notes]);
  });

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `clockin-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
