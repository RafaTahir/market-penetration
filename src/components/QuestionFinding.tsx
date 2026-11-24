import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { PenLine, Plus } from 'lucide-react';
import {
  MAX_FINDING_SOURCE_LENGTH, MAX_FINDING_TEXT_LENGTH, parseResearchFinding, sameResearchFinding, type ResearchFinding,
} from '../services/marketPlans';
import './QuestionFinding.css';

interface QuestionFindingProps {
  finding?: ResearchFinding;
  onSave: (expected: ResearchFinding | undefined, next: ResearchFinding | null) => boolean;
}

interface FindingSession {
  mode: 'edit' | 'delete';
  expected?: ResearchFinding;
  draft: ResearchFinding;
}

const emptyFinding: ResearchFinding = { text: '', source: '', observedOn: null };

function localCalendarDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function FindingDetails({ finding, today }: { finding: ResearchFinding; today: string }) {
  return <>
    <div className="qf-heading"><h4>Your finding</h4><small>User-entered · Unverified</small></div>
    <p className="qf-text">{finding.text}</p>
    <dl className="qf-citation">
      <div><dt>Source</dt><dd>{finding.source || 'Not recorded'}</dd></div>
      <div><dt>Observation date</dt><dd>{finding.observedOn
        ? <><time dateTime={finding.observedOn}>{finding.observedOn}</time>
          {finding.observedOn > today && <span className="qf-date-note">future date · check source</span>}</>
        : 'Unknown'}</dd></div>
    </dl>
  </>;
}

export default function QuestionFinding({ finding, onSave }: QuestionFindingProps) {
  const id = useId();
  const [session, setSession] = useState<FindingSession | null>(null);
  const [conflict, setConflict] = useState(false);
  const [feedback, setFeedback] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const cancelDelete = useRef<HTMLButtonElement>(null);
  const mode = session?.mode;
  const previousMode = useRef(mode);
  const dirty = session?.mode === 'edit' && !sameResearchFinding(session.draft, session.expected ?? emptyFinding);
  const today = localCalendarDate();
  const futureDate = session?.draft.observedOn && session.draft.observedOn > today;

  useEffect(() => {
    if (mode === 'edit') editor.current?.focus();
    else if (mode === 'delete') cancelDelete.current?.focus();
    else if (previousMode.current) trigger.current?.focus();
    previousMode.current = mode;
  }, [mode]);

  function open(nextMode: FindingSession['mode']) {
    setConflict(false);
    setFeedback('');
    setSession({ mode: nextMode, expected: finding, draft: finding ?? emptyFinding });
    if (mode === 'edit' && nextMode === 'edit') editor.current?.focus();
  }

  function close(message = '') {
    setSession(null);
    setConflict(false);
    setFeedback(message);
  }

  function updateDraft(fields: Partial<ResearchFinding>) {
    setSession(current => current && { ...current, draft: { ...current.draft, ...fields } });
    setFeedback('');
  }

  function apply(next: ResearchFinding | null) {
    if (!session || conflict) return;
    if (onSave(session.expected, next)) close(next ? 'Finding saved.' : 'Finding deleted.');
    else setConflict(true);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const next = parseResearchFinding(session.draft);
    if (!next) {
      setFeedback('Enter finding text and a valid observation date, or leave the date empty.');
      return;
    }
    apply(next);
  }

  return <div className="question-finding" data-dirty={dirty}>
    {!session && <>
      {finding && <FindingDetails finding={finding} today={today} />}
      <div className="qf-actions">
        <button ref={trigger} type="button" className="qf-link" onClick={() => open('edit')}>
          {finding ? <PenLine size={14} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
          {finding ? 'Edit finding' : 'Add finding'}
        </button>
        {finding && <button type="button" className="qf-secondary" onClick={() => open('delete')}>Delete finding</button>}
      </div>
    </>}

    {session?.mode === 'edit' && <form className="qf-form" onSubmit={save} aria-labelledby={`${id}-title`}>
      <div className="qf-heading"><h4 id={`${id}-title`}>Your finding</h4><small>User-entered · Unverified</small></div>
      <label htmlFor={`${id}-text`}>Finding</label>
      <textarea id={`${id}-text`} ref={editor} rows={3} required maxLength={MAX_FINDING_TEXT_LENGTH}
        value={session.draft.text} onChange={event => updateDraft({ text: event.target.value })} />
      <label htmlFor={`${id}-source`}>Source (optional)</label>
      <input id={`${id}-source`} type="text" maxLength={MAX_FINDING_SOURCE_LENGTH} placeholder="A document, URL or conversation"
        value={session.draft.source} onChange={event => updateDraft({ source: event.target.value })} />
      <label htmlFor={`${id}-date`}>Observation date (optional)</label>
      <input id={`${id}-date`} type="date" min="0001-01-01" max={today}
        aria-describedby={futureDate ? `${id}-date-help` : undefined}
        value={session.draft.observedOn ?? ''} onChange={event => updateDraft({ observedOn: event.target.value || null })} />
      {futureDate && <small className="qf-date-note" id={`${id}-date-help`}>Choose today or an earlier date, or leave it blank.</small>}
      <div className="qf-actions">
        <button type="submit" className="qf-primary" disabled={conflict || !session.draft.text.trim()}>Save finding</button>
        <button type="button" className="qf-secondary" onClick={() => close()}>Cancel</button>
      </div>
    </form>}

    {session?.mode === 'delete' && <div className="qf-removal" role="group" aria-labelledby={`${id}-confirm`}>
      {session.expected && <FindingDetails finding={session.expected} today={today} />}
      <h4 id={`${id}-confirm`}>Delete this finding?</h4>
      <div className="qf-actions">
        <button type="button" className="qf-delete" disabled={conflict} onClick={() => apply(null)}>Confirm delete</button>
        <button ref={cancelDelete} type="button" className="qf-secondary" onClick={() => close()}>Cancel</button>
      </div>
    </div>}

    {conflict && <div className="qf-conflict">
      <p role="alert">The saved finding changed in another tab.</p>
      {mode === 'edit' && <small>Opening the latest version replaces this draft.</small>}
      <button type="button" className="qf-link" onClick={() => open('edit')}>Open latest version</button>
    </div>}
    <span role="status" className="qf-feedback">{feedback || (dirty ? 'Unsaved changes' : '')}</span>
  </div>;
}
