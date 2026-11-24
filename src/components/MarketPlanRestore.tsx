import { useId, useRef, useState, type ChangeEvent } from 'react';
import { ChevronDown, Upload } from 'lucide-react';
import { MARKETS } from '../data/marketCatalog';
import { CITY_RESEARCH_GUIDES } from '../data/cityResearchGuides';
import type { MarketPlansState, ResearchFinding } from '../services/marketPlans';
import {
  MAX_RESTORE_BYTES, parseMarketPlanFile, previewMarketPlanRestore, type RestoreDraft, type RestoreEffect,
} from '../services/marketPlanRestore';
import './MarketPlanRestore.css';

interface RestoreProps {
  plans: MarketPlansState;
  selectedCountries: readonly string[];
  onRestore: (draft: RestoreDraft) => void;
}

function disposition(action: RestoreEffect['note'], name: string) {
  switch (action) {
    case 'add': return `Add ${name}`;
    case 'same': return `Matching ${name}`;
    case 'keep-local': return `Keep local ${name}`;
    default: return null;
  }
}

function FindingDetails({ label, finding }: { label: string; finding: ResearchFinding }) {
  return <div className="mpr-finding">
    <strong>{label}</strong>
    <p className="mpr-note">{finding.text}</p>
    <dl>
      <div><dt>Personal source</dt><dd>{finding.source || 'Unknown'}</dd></div>
      <div><dt>Observation date</dt><dd>{finding.observedOn
        ? <time dateTime={finding.observedOn}>{finding.observedOn}</time> : 'Unknown'}</dd></div>
    </dl>
  </div>;
}

function MarketPreview({ effect, draft, local }: { effect: RestoreEffect; draft: RestoreDraft; local: MarketPlansState }) {
  const market = MARKETS.find(item => item.id === effect.marketId);
  if (!market) return null;
  const note = draft.plans.notes[market.id];
  const scenario = draft.plans.scenarios[market.id];
  const questions = draft.plans.questions[market.id] ?? [];
  const matchingQuestions = questions.length - effect.addedQuestions;
  const findingActions = Object.values(effect.findings);
  const findingCounts = (['add', 'same', 'keep-local'] as const).map(action => {
    const count = findingActions.filter(value => value === action).length;
    if (!count) return null;
    const noun = count === 1 ? 'finding' : 'findings';
    if (action === 'keep-local') return `Keep ${count} local ${noun}`;
    return action === 'same' ? `${count} matching ${noun}` : `Add ${count} ${noun}`;
  });
  const actions = [
    ...findingCounts, disposition(effect.note, 'note'), disposition(effect.scenario, 'worksheet'),
    effect.addedQuestions ? `Add ${effect.addedQuestions} ${effect.addedQuestions === 1 ? 'question' : 'questions'}` : null,
    matchingQuestions ? `${matchingQuestions} ${matchingQuestions === 1 ? 'question' : 'questions'} already saved` : null,
  ].filter(Boolean);
  return <li className="mpr-market">
    <div className="mpr-market-title">
      <h4><span aria-hidden="true">{market.flag}</span>{market.name}</h4>
      <small>{effect.addToShortlist ? 'Add to shortlist' : 'Already shortlisted'}</small>
    </div>
    {actions.length > 0 && <p className="mpr-actions">{actions.join(' · ')}</p>}
    {(note || scenario || questions.length > 0) && <details>
      <summary>View file details <ChevronDown size={14} aria-hidden="true" /></summary>
      {note && <div className="mpr-field"><strong>Note in file</strong><p className="mpr-note">{note.nextStep}</p></div>}
      {questions.length > 0 && <div className="mpr-field"><strong>Research questions in file</strong>
        <ul>{questions.map(lens => {
          const incoming = draft.plans.findings[market.id]?.[lens];
          const previous = local.findings[market.id]?.[lens];
          const action = effect.findings[lens];
          return <li key={lens}>
            <p>{CITY_RESEARCH_GUIDES[market.id].prompts[lens].question}</p>
            {incoming && action && <>
              <span className="mpr-finding-action">{disposition(action, 'finding')}</span>
              <FindingDetails label="Personal finding in file" finding={incoming} />
              {action === 'keep-local' && previous && <FindingDetails label="Local finding to keep" finding={previous} />}
            </>}
          </li>;
        })}</ul>
      </div>}
      {scenario && <div className="mpr-field"><strong>Worksheet in file · {scenario.currency}</strong>
        <dl>{[
          ['Monthly fixed costs', scenario.monthlyFixedCosts],
          ['Price per unit', scenario.unitPrice],
          ['Variable cost per unit', scenario.unitVariableCost],
        ].map(([label, amount]) => <div key={label}><dt>{label}</dt><dd>{amount.trim() || 'Blank'}</dd></div>)}</dl>
      </div>}
    </details>}
  </li>;
}

export default function MarketPlanRestore({ plans, selectedCountries, onRestore }: RestoreProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const readVersion = useRef(0);
  const titleId = useId();
  const [draft, setDraft] = useState<RestoreDraft | null>(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const preview = draft ? previewMarketPlanRestore(plans, selectedCountries, draft) : null;

  function resetFile() {
    readVersion.current++;
    setDraft(null);
    setError('');
    setReading(false);
  }

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    resetFile();
    const version = readVersion.current;
    if (!file) return;
    if (file.size > MAX_RESTORE_BYTES) {
      setError('Choose a plan file of 1 MiB or less.');
      return;
    }
    setReading(true);
    try {
      const text = await file.text();
      if (version !== readVersion.current || !dialog.current?.open) return;
      setDraft(parseMarketPlanFile(text));
    } catch (failure) {
      if (version === readVersion.current && dialog.current?.open) {
        setError(failure instanceof Error ? failure.message : 'Could not read this file. Choose another Flow plan.');
      }
    } finally {
      if (version === readVersion.current) setReading(false);
    }
  }

  function applyRestore() {
    if (!draft || !preview?.changed) return;
    onRestore(draft);
    dialog.current?.close();
  }

  return <>
    <button type="button" className="mph-export" aria-haspopup="dialog" onClick={() => {
      dialog.current?.showModal();
      input.current?.focus();
    }}><Upload size={17} aria-hidden="true" />Restore market plan</button>
    <dialog ref={dialog} className="mpr-dialog" aria-labelledby={titleId} onClose={() => {
      resetFile();
      if (input.current) input.current.value = '';
    }}>
      <h2 id={titleId}>Restore market plan</h2>
      <p className="mpr-intro">Choose an exported Flow market plan to add its markets and saved work. Your existing notes, worksheets and personal findings take priority.</p>
      <label className="mpr-file">Choose a Flow plan file
        <input type="file" accept=".json,application/json" ref={input} onChange={readFile} />
      </label>
      <p role="status" className="mpr-status">{reading ? 'Reading file…' : preview ? (
        preview.changed ? `${preview.effects.length} ${preview.effects.length === 1 ? 'market' : 'markets'} to review.` : 'No changes to apply.'
      ) : ''}</p>
      {error && <p role="alert" className="mpr-error">{error}</p>}
      {draft && preview && <section className="mpr-preview">
        <h3>Review changes</h3>
        {draft.warnings.length > 0 && <ul className="mpr-warnings">{draft.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
        <ul className="mpr-market-list">{preview.effects.map(effect => <MarketPreview key={effect.marketId} effect={effect} draft={draft} local={plans} />)}</ul>
      </section>}
      <footer><button type="button" className="mph-export" onClick={() => dialog.current?.close()}>Cancel</button>
        <button type="button" className="mph-primary" disabled={!preview?.changed || reading} onClick={applyRestore}>Apply restore</button></footer>
    </dialog>
  </>;
}
