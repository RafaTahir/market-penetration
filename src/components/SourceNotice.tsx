import type { ReactNode } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import './SourceNotice.css';

interface SourceNoticeProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Keep the source status visible while making the full limits available on demand. */
export default function SourceNotice({ title, children, className = '' }: SourceNoticeProps) {
  return (
    <div className={`source-warning source-notice ${className}`} role="note">
      <details className="source-notice-disclosure">
        <summary className="source-notice-summary">
          <Info className="source-notice-icon" size={17} aria-hidden="true" />
          <span className="source-notice-title">{title}</span>
          <span className="source-notice-action">Sources &amp; limits <ChevronDown size={15} aria-hidden="true" /></span>
        </summary>
        <div className="source-notice-body">{children}</div>
      </details>
    </div>
  );
}
