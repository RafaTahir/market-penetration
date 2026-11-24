import { Suspense, type ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface ToolPanelProps {
  name: string;
  children: ReactNode;
  onReturn?: () => void;
  onExportPlan?: () => void;
}

export default function ToolPanel({ name, children, onReturn, onExportPlan }: ToolPanelProps) {
  const fallback = <section className="flow-tool-message" role="alert">
    <h2>Couldn’t open {name}</h2>
    <p>Check your connection and reload to try again. Reloading clears work saved only for this session.</p>
    <div>
      {onExportPlan && <button type="button" onClick={onExportPlan}>Export market plan</button>}
      <a href="#/research" onClick={onReturn}>Return to explorer</a>
      <button type="button" onClick={() => window.location.reload()}>Reload Flow</button>
    </div>
  </section>;
  return <ErrorBoundary key={name} fallback={fallback}>
    <Suspense fallback={<p className="flow-tool-message" role="status">Loading {name}…</p>}>{children}</Suspense>
  </ErrorBoundary>;
}
