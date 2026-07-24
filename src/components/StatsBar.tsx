type Props = {
  totalToday: number;
  totalHabits: number;
  bestStreak: number;
  weekDone: number;
  weekTarget: number;
};

export function StatsBar({ totalToday, totalHabits, bestStreak, weekDone, weekTarget }: Props) {
  const pct = weekTarget > 0 ? Math.round((weekDone / weekTarget) * 100) : 0;
  return (
    <div className="stats">
      <div className="stat">
        <div className="stat-accent" style={{ background: "var(--primary)" }} />
        <div className="stat-value">{totalToday}<span style={{ color: "var(--text-dim)", fontSize: 18 }}>/{totalHabits}</span></div>
        <div className="stat-label">Done today</div>
      </div>
      <div className="stat">
        <div className="stat-accent" style={{ background: "var(--accent)" }} />
        <div className="stat-value" style={{ color: "var(--accent)" }}>{bestStreak}</div>
        <div className="stat-label">Best streak</div>
      </div>
      <div className="stat">
        <div className="stat-accent" style={{ background: "var(--success)" }} />
        <div className="stat-value" style={{ color: "var(--success)" }}>{weekDone}</div>
        <div className="stat-label">This week done</div>
      </div>
      <div className="stat">
        <div className="stat-accent" style={{ background: "var(--text-muted)" }} />
        <div className="stat-value">{pct}%</div>
        <div className="stat-label">Weekly goal</div>
      </div>
    </div>
  );
}
