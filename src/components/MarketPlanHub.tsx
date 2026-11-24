import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, FileText, Globe2, Info, MapPin, PenLine, X } from 'lucide-react';
import { MARKETS, getMarketDirectories } from '../data/marketCatalog';
import { buildMarketPlanExport, MAX_NEXT_STEP_LENGTH, getCityQuestionSources } from '../services/marketPlans';
import { downloadMarketPlan } from '../services/downloadMarketPlan';
import type { RestoreDraft } from '../services/marketPlanRestore';
import MarketPlanRestore from './MarketPlanRestore';
import PlanBriefDialog, { type BriefPreview } from './PlanBriefDialog';
import MarketEconomicsWorksheet from './MarketEconomicsWorksheet';
import MonthlySalesComparison from './MonthlySalesComparison';
import QuestionFinding from './QuestionFinding';
import MarketScene from './visual/MarketScene';
import type { MarketPlanSession } from '../hooks/useMarketPlans';
import { CITY_RESEARCH_GUIDES } from '../data/cityResearchGuides';
import './MarketPlanHub.css';

interface MarketPlanHubProps {
  planSession: MarketPlanSession;
  onRestore: (draft: RestoreDraft) => boolean;
  shortlistSaved: boolean;
  focusTarget: string | null;
  selectedCountries: string[];
}

function focusPlanItem(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (target instanceof HTMLDetailsElement) {
    target.open = true;
    target.querySelector('summary')?.focus({ preventScroll: true });
  } else {
    target.focus({ preventScroll: true });
  }
  target.scrollIntoView({ behavior: 'instant', block: 'start' });
}

export default function MarketPlanHub({ selectedCountries, planSession, focusTarget, onRestore, shortlistSaved }: MarketPlanHubProps) {
  const { plans, savedLocally, saveNote, saveScenario, setQuestionSaved } = planSession;
  const [exportMessage, setExportMessage] = useState('');
  const [brief, setBrief] = useState<BriefPreview | null>(null);
  const briefButton = useRef<HTMLButtonElement>(null);
  const hub = useRef<HTMLElement>(null);
  const markets = MARKETS.filter(market => selectedCountries.includes(market.id));
  const hasNotes = Object.keys(plans.notes).length > 0;
  const hasQuestions = Object.keys(plans.questions).length > 0;

  let saveStatus = 'Next steps save on this browser';
  if (Object.keys(plans.scenarios).length) saveStatus = 'Worksheets saved on this browser';
  if (hasQuestions) saveStatus = 'Research questions saved on this browser';
  if (hasNotes) saveStatus = 'Next steps saved on this browser';
  if (Object.keys(plans.findings).length) saveStatus = 'Research findings saved on this browser';

  useEffect(() => {
    const hasDraft = () => hub.current?.querySelector('.question-finding[data-dirty="true"]');
    function beforeNavigate(event: Event) {
      const destination = (event as CustomEvent<string>).detail;
      if ((destination === '#/plan' || destination.startsWith('#/plan/question/') || destination.startsWith('#/plan/worksheet/')) || !hasDraft()) return;
      if (!window.confirm('Leave without saving your finding edits?')) event.preventDefault();
    }
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!hasDraft()) return;
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('flow:before-navigate', beforeNavigate);
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('flow:before-navigate', beforeNavigate);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);

  useEffect(() => {
    if (focusTarget) focusPlanItem(focusTarget);
  }, [focusTarget]);

  function openWorksheet(id: string) {
    const destination = `#/plan/worksheet/${id}`;
    if (window.location.hash === destination) focusPlanItem(`break-even-${id}`);
    else window.location.hash = destination;
  }

  function exportPlan() {
    downloadMarketPlan(plans, selectedCountries);
    setExportMessage(hub.current?.querySelector('.question-finding[data-dirty="true"]')
      ? 'Exported the saved version. Save your open finding edits to include them in the next export.'
      : 'Market plan exported with your selected markets, notes, saved questions, findings and worksheets.');
  }

  function applyRestore(draft: RestoreDraft) {
    const saved = onRestore(draft);
    setExportMessage(saved
      ? 'Plan restored on this browser. Your existing work was kept.'
      : 'Plan restored for this session. Export your plan before reloading.');
  }

  return <main className="market-plan-hub" ref={hub} tabIndex={-1}>
    <a className="mph-back" href="#/research"><ArrowLeft size={16} aria-hidden="true" />Explore markets</a>
    <header className="mph-heading">
      <div><span className="mph-eyebrow">YOUR SHORTLIST · YOUR NEXT MOVE</span><h1>Your market plan.</h1><p>Keep the markets you chose, follow their sources and decide your next step.</p></div>
      <div className="mph-file-actions">
        {markets.length > 0 && <button ref={briefButton} className="mph-primary" type="button" aria-haspopup="dialog" onClick={() => {
          setBrief({ plan: buildMarketPlanExport(plans, selectedCountries), hasUnsavedFindings: Boolean(hub.current?.querySelector('.question-finding[data-dirty="true"]')) });
        }}><FileText size={17} aria-hidden="true" />Preview plan brief</button>}
        <MarketPlanRestore plans={plans} selectedCountries={selectedCountries} onRestore={applyRestore} />
        <button className="mph-export" onClick={exportPlan}><ArrowDownToLine size={17} aria-hidden="true" />Export market plan</button>
      </div>
    </header>
    {brief && <PlanBriefDialog preview={brief} onClose={() => {
      setBrief(null);
      (briefButton.current ?? hub.current)?.focus({ preventScroll: true });
    }} />}
    <div className="mph-plan-status">
      <span><Globe2 size={16} aria-hidden="true" />{markets.length} {markets.length === 1 ? 'market' : 'markets'} in your shortlist</span>
      <span role="status">{savedLocally && shortlistSaved ? <><Check size={15} aria-hidden="true" />{saveStatus}</> : <><Info size={15} aria-hidden="true" />Session only · export before reloading</>}</span>
    </div>
    <div role="status">{exportMessage && <p className="mph-file-feedback">{exportMessage}</p>}</div>
    {markets.length > 0 && <p className="mph-directory-status"><Info size={14} aria-hidden="true" />Official-source directory · contents unverified · publication dates unknown</p>}

    {markets.length ? <section className="mph-market-grid" aria-label="Selected market plans">
      {markets.map(market => {
        const note = plans.notes[market.id];
        const questions = plans.questions[market.id] ?? [];
        const directory = <div className="mph-source-links">
              {getMarketDirectories(market).map(({ label, source }) => <a key={label} href={source.url} target="_blank" rel="noopener noreferrer"><span><small>{label}</small>{source.name}</span><ArrowUpRight size={16} aria-hidden="true" /></a>)}
            </div>;
        return <article className="mph-market" key={market.id} aria-labelledby={`market-plan-${market.id}`} data-market={market.id}>
          <MarketScene marketId={market.id} />
          <div className="mph-market-body">
            <div className="mph-market-title"><span className="mph-flag" aria-hidden="true">{market.flag}</span><div><h2 id={`market-plan-${market.id}`} tabIndex={-1}>{market.name}</h2><p><MapPin size={13} aria-hidden="true" />{market.city} · research starting point</p></div></div>
            {questions.length > 0 && <section className="mph-questions" aria-labelledby={`saved-questions-${market.id}`}>
              <h3 id={`saved-questions-${market.id}`}>Saved research questions</h3>
              <ul>{questions.map(lens => {
                const prompt = CITY_RESEARCH_GUIDES[market.id].prompts[lens];
                const finding = plans.findings[market.id]?.[lens];
                return <li key={lens} id={`question-${market.id}-${lens}`} tabIndex={-1} aria-label={prompt.question}>
                  <div className="mph-question-heading">
                    <span>{lens === 'customers' ? 'Customers' : lens === 'location' ? 'Location' : 'Setup'}</span>
                    {!finding && <button type="button" aria-label={`Remove question: ${prompt.question}`} onClick={() => {
                      const result = setQuestionSaved(market.id, lens, false);
                      if (result.plans.findings[market.id]?.[lens]) {
                        setExportMessage('This question has a finding. Clear the finding first to remove the question.');
                      } else {
                        setExportMessage('Question removed from your plan.');
                        document.getElementById(`market-plan-${market.id}`)?.focus({ preventScroll: true });
                      }
                    }}><X size={15} aria-hidden="true" /></button>}
                  </div>
                  <p>{prompt.question}</p>
                  <div className="mph-question-sources">{getCityQuestionSources(market, lens).map(source =>
                    <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.name}<ArrowUpRight size={13} aria-hidden="true" /></a>
                  )}</div>
                  <QuestionFinding finding={finding} onSave={(expected, next) => planSession.saveFinding(market.id, lens, expected, next)} />
                </li>;
              })}</ul>
            </section>}
            {questions.length ? <details className="mph-source-directory">
              <summary>All research sources<ChevronDown size={15} aria-hidden="true" /></summary>
              {directory}
            </details> : directory}
            <MarketEconomicsWorksheet
              market={market}
              scenario={plans.scenarios[market.id]}
              onChange={(expected, next) => {
                setExportMessage('');
                return saveScenario(market.id, expected, next);
              }}
            />
            <details className="mph-next-step">
              <summary><PenLine size={16} aria-hidden="true" /><span>Your next step{note && <small>Note saved</small>}</span><ChevronDown size={15} aria-hidden="true" /></summary>
              <label htmlFor={`next-step-${market.id}`}>Your next step for {market.name}</label>
              <textarea id={`next-step-${market.id}`} maxLength={MAX_NEXT_STEP_LENGTH} rows={4} value={note?.nextStep ?? ''} onChange={event => { saveNote(market.id, event.target.value); setExportMessage(''); }} placeholder={`What will you check or do next in ${market.name}?`} />
              <div className="mph-note-meta"><span>Your note · unverified</span><span>{note?.nextStep.length ?? 0}/{MAX_NEXT_STEP_LENGTH}</span></div>
              {note?.updatedAt && <p className="mph-edit-time">Edited <time dateTime={note.updatedAt}>{note.updatedAt.slice(0, 10)}</time> · edit date, not a source date</p>}
            </details>
          </div>
        </article>;
      })}
    </section> : <section className="mph-empty" aria-labelledby="market-plan-empty-title"><Globe2 size={36} aria-hidden="true" /><h2 id="market-plan-empty-title">Choose the markets for your plan.</h2><p>Your shortlist is empty. Explore the region and select the markets you want to research.</p><a className="mph-primary" href="#/research">Choose markets<ArrowRight size={17} aria-hidden="true" /></a></section>}

    <MonthlySalesComparison markets={markets} scenarios={plans.scenarios} onOpenWorksheet={openWorksheet} />

    <details className="mph-source-details"><summary><Info size={16} aria-hidden="true" />About these research links & notes<ChevronDown size={15} aria-hidden="true" /></summary><p>These are curated official-directory links, not verified current requirements. Page contents, publication dates and applicability to your activity or address have not been verified. Source publication dates are unknown. You supply the findings, citations and observation dates in your plan. The city notebook calculates its scores separately.</p><p>Notes, questions, findings and worksheet assumptions stay with their market when you change your shortlist. Select the market again to see them. Session-only notes survive navigation in this app but require an export before a page reload. Export includes the currently selected markets.</p></details>

    <section className="mph-notebook" aria-labelledby="city-notebook-title"><span className="mph-notebook-icon"><BookOpen size={27} aria-hidden="true" /></span><div><span className="mph-eyebrow">DETAILED PREPARATION</span><h2 id="city-notebook-title">Your city notebook is still here.</h2><p>Documented preparation assessments currently cover <strong>Jakarta province and the City of Manila</strong>. Existing research, scores and exports stay in that notebook; opening it does not change your market shortlist.</p></div><a className="mph-primary" href="#/plan/notebook">Open city notebook<ArrowRight size={17} aria-hidden="true" /></a></section>

  </main>;
}
