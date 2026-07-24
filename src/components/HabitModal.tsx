import { useState } from "react";
import type { Habit } from "../lib/supabase";
import { HABIT_COLORS, HABIT_ICONS } from "../lib/date";

type Props = {
  habit: Habit | null;
  onClose: () => void;
  onSave: (input: { name: string; icon: string; color: string; target_per_week: number }) => void;
  onDelete: (id: string) => void;
};

export function HabitModal({ habit, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(habit?.name ?? "");
  const [icon, setIcon] = useState(habit?.icon ?? HABIT_ICONS[0]);
  const [color, setColor] = useState(habit?.color ?? HABIT_COLORS[0].value);
  const [target, setTarget] = useState(habit?.target_per_week ?? 7);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color, target_per_week: target });
  }

  function confirmDelete() {
    if (habit && confirm(`Delete "${habit.name}" and all its history?`)) {
      onDelete(habit.id);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <div className="modal-title">{habit ? "Edit habit" : "New habit"}</div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ fontSize: 22, color: "var(--text-muted)" }}>×</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="field-label" htmlFor="name">Habit name</label>
            <input
              id="name"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drink water, Read 20 min"
              autoFocus
              maxLength={40}
            />
          </div>

          <div className="field">
            <label className="field-label">Icon</label>
            <div className="opt-grid">
              {HABIT_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  className={`opt-btn ${icon === ic ? "active" : ""}`}
                  onClick={() => setIcon(ic)}
                >{ic}</button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Color</label>
            <div className="color-grid">
              {HABIT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  className={`color-btn ${color === c.value ? "active" : ""}`}
                  style={{ background: c.value }}
                  onClick={() => setColor(c.value)}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Weekly target</label>
            <div className="num-input">
              <button type="button" className="num-btn" onClick={() => setTarget((t) => Math.max(1, t - 1))}>−</button>
              <span className="num-val">{target}</span>
              <button type="button" className="num-btn" onClick={() => setTarget((t) => Math.min(7, t + 1))}>+</button>
              <span className="num-hint">days per week</span>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <div>
            {habit && (
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              {habit ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
