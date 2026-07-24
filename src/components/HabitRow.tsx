import type { Habit, Completion } from "../lib/supabase";
import { toLocalDateKey } from "../lib/date";

type Props = {
  habit: Habit;
  days: Date[];
  completions: Completion[];
  streak: number;
  onToggle: (habitId: string, dateKey: string) => void;
  onEdit: () => void;
};

export function HabitRow({ habit, days, completions, streak, onToggle, onEdit }: Props) {
  const doneSet = new Set(completions.map((c) => c.completed_on));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="habit-row">
      <div className="habit-info" onClick={onEdit} title="Edit habit">
        <div className="habit-icon" style={{ background: `${habit.color}22`, border: `1.5px solid ${habit.color}55` }}>
          <span>{habit.icon}</span>
        </div>
        <div className="habit-name-wrap">
          <div className="habit-name">{habit.name}</div>
          <div className="habit-streak">
            {streak > 0 ? (<><span className="flame">🔥</span> {streak} day{streak !== 1 ? "s" : ""}</>) : "Tap to start"}
          </div>
        </div>
      </div>
      {days.map((d) => {
        const key = toLocalDateKey(d);
        const isDone = doneSet.has(key);
        const isFuture = d > today;
        return (
          <div className="cell" key={key}>
            <button
              className={`cell-btn ${isDone ? "is-done" : ""} ${isFuture ? "is-future" : ""} ${isDone ? "pulse" : ""}`}
              style={isDone ? { background: habit.color, borderColor: habit.color } : undefined}
              onClick={() => !isFuture && onToggle(habit.id, key)}
              aria-label={`${isDone ? "Unmark" : "Mark"} ${habit.name} on ${key}`}
            >
              <svg className="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
