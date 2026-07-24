import { useCallback, useEffect, useMemo, useState } from "react";
import { type Completion, type Habit } from "./lib/supabase";
import {
  loadAll, addHabit, updateHabit as storeUpdate, deleteHabit as storeDelete,
  toggleCompletion,
} from "./lib/storage";
import { computeStreak, toLocalDateKey, weekDays, startOfWeek, lastNDays } from "./lib/date";
import { Header } from "./components/Header";
import { StatsBar } from "./components/StatsBar";
import { HabitRow } from "./components/HabitRow";
import { HabitModal } from "./components/HabitModal";
import { EmptyState } from "./components/EmptyState";

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const todayKey = toLocalDateKey(new Date());

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await loadAll();
    if (err) setError(err);
    setHabits(data.habits);
    setCompletions(data.completions);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const completionsByHabit = useMemo(() => {
    const map = new Map<string, Completion[]>();
    for (const c of completions) {
      const arr = map.get(c.habit_id) ?? [];
      arr.push(c);
      map.set(c.habit_id, arr);
    }
    return map;
  }, [completions]);

  const toggleDay = useCallback(async (habitId: string, dateKey: string) => {
    const existing = completions.find(
      (c) => c.habit_id === habitId && c.completed_on === dateKey,
    );
    // Optimistic update
    if (existing) {
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
    }
    const { data, error: e } = await toggleCompletion(habitId, dateKey, existing ?? null);
    if (e) {
      setError(e);
      await load();
      return;
    }
    if (data) {
      setCompletions((prev) => [...prev, data]);
    }
  }, [completions]);

  async function saveHabit(input: { name: string; icon: string; color: string; target_per_week: number }) {
    if (editing) {
      const { error: e } = await storeUpdate(editing.id, input);
      if (e) { setError(e); return; }
    } else {
      const { error: e } = await addHabit(input);
      if (e) { setError(e); return; }
    }
    setModalOpen(false);
    setEditing(null);
    await load();
  }

  async function removeHabit(id: string) {
    const { error: e } = await storeDelete(id);
    if (e) { setError(e); return; }
    setModalOpen(false);
    setEditing(null);
    await load();
  }

  function openNew() { setEditing(null); setModalOpen(true); }
  function openEdit(h: Habit) { setEditing(h); setModalOpen(true); }

  const totalToday = habits.filter((h) =>
    completions.some((c) => c.habit_id === h.id && c.completed_on === todayKey),
  ).length;
  const bestStreak = habits.reduce((max, h) => {
    const s = computeStreak(completionsByHabit.get(h.id) ?? []);
    return Math.max(max, s);
  }, 0);
  const last7 = lastNDays(7);
  const weekDone = habits.reduce((sum, h) => {
    const set = new Set((completionsByHabit.get(h.id) ?? []).map((c) => c.completed_on));
    return sum + last7.filter((d) => set.has(toLocalDateKey(d))).length;
  }, 0);
  const weekTarget = habits.reduce((sum, h) => sum + h.target_per_week, 0);

  return (
    <div className="app">
      <div className="bg-aurora" aria-hidden />
      <Header onAdd={openNew} />
      <main className="container">
        <StatsBar
          totalToday={totalToday}
          totalHabits={habits.length}
          bestStreak={bestStreak}
          weekDone={weekDone}
          weekTarget={weekTarget}
        />

        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading your habits…</div>
        ) : habits.length === 0 ? (
          <EmptyState onAdd={openNew} />
        ) : (
          <section className="week-grid">
            <div className="grid-head">
              <div className="grid-head-spacer" />
              {days.map((d) => {
                const key = toLocalDateKey(d);
                const isToday = key === todayKey;
                const isFuture = d > new Date();
                return (
                  <div
                    key={key}
                    className={`day-head ${isToday ? "is-today" : ""} ${isFuture ? "is-future" : ""}`}
                  >
                    <span className="day-dow">
                      {d.toLocaleDateString("en", { weekday: "narrow" })}
                    </span>
                    <span className="day-num">{d.getDate()}</span>
                  </div>
                );
              })}
            </div>

            {habits.map((h) => (
              <HabitRow
                key={h.id}
                habit={h}
                days={days}
                completions={completionsByHabit.get(h.id) ?? []}
                streak={computeStreak(completionsByHabit.get(h.id) ?? [])}
                onToggle={toggleDay}
                onEdit={() => openEdit(h)}
              />
            ))}
          </section>
        )}

        <footer className="foot">
          <span>Streak · tap a day to mark it done</span>
        </footer>
      </main>

      {modalOpen && (
        <HabitModal
          habit={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={saveHabit}
          onDelete={removeHabit}
        />
      )}
    </div>
  );
}
