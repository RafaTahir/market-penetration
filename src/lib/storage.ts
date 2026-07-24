import { supabase, isSupabaseConfigured, type Habit, type Completion } from "./supabase";

const LS_HABITS = "streak.habits";
const LS_COMPLETIONS = "streak.completions";

type Result<T> = { data: T; error: string | null };

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function lsRead<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function lsWrite<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export async function loadAll(): Promise<Result<{ habits: Habit[]; completions: Completion[] }>> {
  if (isSupabaseConfigured()) {
    try {
      const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const [hRes, cRes] = await Promise.all([
        supabase.from("habits").select("*").order("created_at", { ascending: true }),
        supabase.from("completions").select("*").gte("completed_on", since).order("completed_on"),
      ]);
      if (hRes.error || cRes.error) {
        const msg = hRes.error?.message ?? cRes.error?.message ?? "Unknown error";
        // If it's a network/connection error, fall back to local
        if (isConnError(msg)) {
          return { data: { habits: lsRead<Habit>(LS_HABITS), completions: lsRead<Completion>(LS_COMPLETIONS) }, error: null };
        }
        return { data: { habits: [], completions: [] }, error: msg };
      }
      return { data: { habits: hRes.data as Habit[], completions: cRes.data as Completion[] }, error: null };
    } catch {
      return { data: { habits: lsRead<Habit>(LS_HABITS), completions: lsRead<Completion>(LS_COMPLETIONS) }, error: null };
    }
  }
  return { data: { habits: lsRead<Habit>(LS_HABITS), completions: lsRead<Completion>(LS_COMPLETIONS) }, error: null };
}

export async function addHabit(input: { name: string; icon: string; color: string; target_per_week: number }): Promise<Result<Habit | null>> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("habits").insert(input).select().single();
      if (error) {
        if (isConnError(error.message)) return localAddHabit(input);
        return { data: null, error: error.message };
      }
      return { data: data as Habit, error: null };
    } catch {
      return localAddHabit(input);
    }
  }
  return localAddHabit(input);
}

function localAddHabit(input: { name: string; icon: string; color: string; target_per_week: number }): Result<Habit | null> {
  const habit: Habit = {
    id: uid(),
    ...input,
    created_at: new Date().toISOString(),
  };
  const habits = lsRead<Habit>(LS_HABITS);
  habits.push(habit);
  lsWrite(LS_HABITS, habits);
  return { data: habit, error: null };
}

export async function updateHabit(id: string, input: { name: string; icon: string; color: string; target_per_week: number }): Promise<Result<null>> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("habits").update(input).eq("id", id);
      if (error) {
        if (isConnError(error.message)) return localUpdateHabit(id, input);
        return { data: null, error: error.message };
      }
      return { data: null, error: null };
    } catch {
      return localUpdateHabit(id, input);
    }
  }
  return localUpdateHabit(id, input);
}

function localUpdateHabit(id: string, input: { name: string; icon: string; color: string; target_per_week: number }): Result<null> {
  const habits = lsRead<Habit>(LS_HABITS);
  const idx = habits.findIndex((h) => h.id === id);
  if (idx >= 0) habits[idx] = { ...habits[idx], ...input };
  lsWrite(LS_HABITS, habits);
  return { data: null, error: null };
}

export async function deleteHabit(id: string): Promise<Result<null>> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) {
        if (isConnError(error.message)) return localDeleteHabit(id);
        return { data: null, error: error.message };
      }
      return { data: null, error: null };
    } catch {
      return localDeleteHabit(id);
    }
  }
  return localDeleteHabit(id);
}

function localDeleteHabit(id: string): Result<null> {
  lsWrite(LS_HABITS, lsRead<Habit>(LS_HABITS).filter((h) => h.id !== id));
  lsWrite(LS_COMPLETIONS, lsRead<Completion>(LS_COMPLETIONS).filter((c) => c.habit_id !== id));
  return { data: null, error: null };
}

export async function toggleCompletion(habitId: string, dateKey: string, existing: Completion | null): Promise<Result<Completion | null>> {
  if (existing) {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("completions").delete().eq("id", existing.id);
        if (error && !isConnError(error.message)) return { data: null, error: error.message };
      } catch {
        /* fall through to local delete */
      }
    }
    localDeleteCompletion(existing.id);
    return { data: null, error: null };
  }

  const completion: Completion = { id: uid(), habit_id: habitId, completed_on: dateKey };
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("completions")
        .insert({ habit_id: habitId, completed_on: dateKey })
        .select()
        .single();
      if (error) {
        if (isConnError(error.message)) {
          localAddCompletion(completion);
          return { data: completion, error: null };
        }
        return { data: null, error: error.message };
      }
      return { data: data as Completion, error: null };
    } catch {
      localAddCompletion(completion);
      return { data: completion, error: null };
    }
  }
  localAddCompletion(completion);
  return { data: completion, error: null };
}

function localAddCompletion(c: Completion): void {
  const all = lsRead<Completion>(LS_COMPLETIONS);
  all.push(c);
  lsWrite(LS_COMPLETIONS, all);
}

function localDeleteCompletion(id: string): void {
  lsWrite(LS_COMPLETIONS, lsRead<Completion>(LS_COMPLETIONS).filter((c) => c.id !== id));
}

export function localAll(): { habits: Habit[]; completions: Completion[] } {
  return {
    habits: lsRead<Habit>(LS_HABITS),
    completions: lsRead<Completion>(LS_COMPLETIONS),
  };
}

function isConnError(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("failed to fetch") ||
    m.includes("network") ||
    m.includes("fetch") ||
    m.includes("timeout") ||
    m.includes("connection") ||
    m.includes("offline") ||
    m.includes("relation") && m.includes("does not exist")
  );
}
