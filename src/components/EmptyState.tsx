type Props = { onAdd: () => void };

export function EmptyState({ onAdd }: Props) {
  return (
    <div className="empty">
      <div className="empty-icon">🎯</div>
      <div className="empty-title">Start your first habit</div>
      <p className="empty-text">
        Track daily habits, build streaks, and watch your consistency grow week over week.
      </p>
      <button className="btn btn-primary" onClick={onAdd}>+ Create a habit</button>
    </div>
  );
}
