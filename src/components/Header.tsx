type Props = { onAdd: () => void };

export function Header({ onAdd }: Props) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-mark">🔥</div>
          <div>
            <div className="brand-name">Streak</div>
            <div className="brand-tag">Build habits that stick</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          + New habit
        </button>
      </div>
    </header>
  );
}
