import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import type { buildMarketPlanExport } from '../services/marketPlans';
import MarketPlanBrief from './MarketPlanBrief';
import './MarketPlanBrief.css';

export interface BriefPreview {
  plan: ReturnType<typeof buildMarketPlanExport>;
  hasUnsavedFindings: boolean;
}

export default function PlanBriefDialog({ preview, onClose }: { preview: BriefPreview; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
    const previousTitle = document.title;
    document.title = `Flow market plan brief · ${preview.plan.exportedAt.slice(0, 10)}`;
    return () => { document.title = previousTitle; };
  }, [preview]);

  return createPortal(<dialog ref={dialog} className="mpb-dialog" aria-label="Market plan brief" onClose={onClose}>
    <div className="mpb-toolbar">
      <button type="button" className="mpb-close" onClick={() => dialog.current?.close()}><X size={16} aria-hidden="true" />Close brief</button>
      <button type="button" className="mpb-print" onClick={() => window.print()}><Printer size={16} aria-hidden="true" />Print brief</button>
    </div>
    {preview.hasUnsavedFindings && <p className="mpb-draft-notice" role="status">
      This brief uses your saved findings. Close the preview to finish editing, then open it again to include those changes.
    </p>}
    <MarketPlanBrief plan={preview.plan} />
  </dialog>, document.body);
}
