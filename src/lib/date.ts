import type { Completion } from "./supabase";

export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function weekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function lastNDays(n: number, end: Date = new Date()): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (n - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

export function computeStreak(completions: Completion[]): number {
  if (completions.length === 0) return 0;
  const set = new Set(completions.map((c) => c.completed_on));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (set.has(toLocalDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const HABIT_COLORS = [
  { name: "ember", value: "#ff6b3d" },
  { name: "coral", value: "#ff5a5f" },
  { name: "amber", value: "#f59e0b" },
  { name: "lime", value: "#84cc16" },
  { name: "emerald", value: "#10b981" },
  { name: "teal", value: "#14b8a6" },
  { name: "sky", value: "#0ea5e9" },
  { name: "blue", value: "#3b82f6" },
  { name: "violet", value: "#8b5cf6" },
  { name: "rose", value: "#f43f5e" },
];

export const HABIT_ICONS = [
  "🔥", "💧", "🏃", "📚", "🧘", "💪", "🥗", "😴",
  "✍️", "🎯", "🎸", "🧠", "☀️", "🌱", "💊", "🦷",
];
