import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Globe2, Info, MapPin, PenLine, X } from 'lucide-react';
import { MARKETS } from '../data/marketCatalog';
import { MAX_NEXT_STEP_LENGTH, buildMarketPlanExport, getCityQuestionSources } from '../services/marketPlans';
import type { RestoreDraft } from '../services/marketPlanRestore';
import MarketPlanRestore from './MarketPlanRestore';
import MarketEconomicsWorksheet from './MarketEconomicsWorksheet';
import MarketScene from './visual/MarketScene';
import type { MarketPlanSession } from '../hooks/useMarketPlans';
import { CITY_RESEARCH_GUIDES } from '../data/cityResearchGuides';
import './MarketPlanHub.css';

interface MarketPlanHubProps {
  planSession: MarketPlanSession;
  onRestore: (draft: RestoreDraft) => boolean;
  shortlistSaved: boolean;
  worksheetId?: string;
  selectedCountries: string[];
}

export default function MarketPlanHub({ selectedCountries, planSession, worksheetId, onRestore, shortlistSaved }: MarketPlanHubProps) {
  const { plans, savedLocally, saveNote, saveScenario, setQuestionSaved } = planSession;
  const [exportMessage, setExportMessage] = useState('');
  const markets = MARKETS.filter(market => selectedCountries.includes(market.id));
  const hasNotes = Object.keys(plans.notes).length > 0;
  const hasQuestions = Object.keys(plans.questions).length > 0;

  let saveStatus = 'Next steps save on this browser';
  if (Object.keys(plans.scenarios).length) saveStatus = 'Worksheets saved on this browser';
  if (hasQuestions) saveStatus = 'Research questions saved on this browser';
  if (hasNotes) saveStatus = 'Next steps saved on this browser';

  useEffect(() => {
    if (!worksheetId) return;
    const target = document.getElementById(`break-even-${worksheetId}`);
    if (!(target instanceof HTMLDetailsElement)) return;
    target.open = true;
    target.querySelector('summary')?.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [worksheetId]);

  function exportPlan() {
    const payload = buildMarketPlanExport(plans, selectedCountries);
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'flow-market-plan.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setExportMessage('Market plan exported with your selected markets, notes, saved questions, worksheets and source limitations.');
  }

  function applyRestore(draft: RestoreDraft) {
    const saved = onRestore(draft);
    setExportMessage(saved
      ? 'Plan restored on this browser. Your existing work was kept.'
      : 'Plan restored for this session. Export your plan before reloading.');
  }

  return <main className="market-plan-hub">
    <a className="mph-back" href="#/research"><ArrowLeft size={16} aria-hidden="true" />Explore markets</a>
    <header className="mph-heading">
      <div><span className="mph-eyebrow">YOUR SHORTLIST · YOUR NEXT MOVE</span><h1>Your market plan.</h1><p>Keep the markets you chose, follow their sources and decide your next step.</p></div>
      <div className="mph-file-actions">
        <MarketPlanRestore plans={plans} selectedCountries={selectedCountries} onRestore={applyRestore} />
        <button className="mph-export" onClick={exportPlan}><ArrowDownToLine size={17} aria-hidden="true" />Export market plan</button>
      </div>
    </header>
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
              {[
                { label: 'Business setup', source: market.setup },
                { label: 'Country statistics', source: market.statistics },
                { label: 'City & premises', source: market.cityPortal },
              ].map(({ label, source }) => <a key={label} href={source.url} target="_blank" rel="noopener noreferrer"><span><small>{label}</small>{source.name}</span><ArrowUpRight size={16} aria-hidden="true" /></a>)}
            </div>;
        return <article className="mph-market" key={market.id} aria-labelledby={`market-plan-${market.id}`} data-market={market.id}>
          <MarketScene marketId={market.id} />
          <div className="mph-market-body">
            <div className="mph-market-title"><span className="mph-flag" aria-hidden="true">{market.flag}</span><div><h2 id={`market-plan-${market.id}`} tabIndex={-1}>{market.name}</h2><p><MapPin size={13} aria-hidden="true" />{market.city} · research starting point</p></div></div>
            {questions.length > 0 && <section className="mph-questions" aria-labelledby={`saved-questions-${market.id}`}>
              <h3 id={`saved-questions-${market.id}`}>Saved research questions</h3>
              <ul>{questions.map(lens => {
                const prompt = CITY_RESEARCH_GUIDES[market.id].prompts[lens];
                return <li key={lens}>
                  <div className="mph-question-heading">
                    <span>{lens === 'customers' ? 'Customers' : lens === 'location' ? 'Location' : 'Setup'}</span>
                    <button type="button" aria-label={`Remove question: ${prompt.question}`} onClick={() => {
                      setQuestionSaved(market.id, lens, false);
                      setExportMessage('Question removed from your plan.');
                      document.getElementById(`market-plan-${market.id}`)?.focus({ preventScroll: true });
                    }}><X size={15} aria-hidden="true" /></button>
                  </div>
                  <p>{prompt.question}</p>
                  <div className="mph-question-sources">{getCityQuestionSources(market, lens).map(source =>
                    <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.name}<ArrowUpRight size={13} aria-hidden="true" /></a>
                  )}</div>
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
              onChange={next => {
                saveScenario(market.id, next);
                setExportMessage('');
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

    <details className="mph-source-details"><summary><Info size={16} aria-hidden="true" />About these research links & notes<ChevronDown size={15} aria-hidden="true" /></summary><p>These are curated official-directory links, not verified current requirements. Page contents, publication dates and applicability to your activity or address have not been verified. Source publication dates are unknown. Your next-step notes are personal planning notes; they do not become evidence or preparation scores in the city notebook.</p><p>Notes, saved questions and worksheet assumptions stay with their market when you change your shortlist. Select the market again to see them. Session-only notes survive navigation in this app but require an export before a page reload. Export includes the currently selected markets.</p></details>

    <section className="mph-notebook" aria-labelledby="city-notebook-title"><span className="mph-notebook-icon"><BookOpen size={27} aria-hidden="true" /></span><div><span className="mph-eyebrow">DETAILED PREPARATION</span><h2 id="city-notebook-title">Your city notebook is still here.</h2><p>Documented preparation assessments currently cover <strong>Jakarta province and the City of Manila</strong>. Existing research, scores and exports stay in that notebook; opening it does not change your market shortlist.</p></div><a className="mph-primary" href="#/plan/notebook">Open city notebook<ArrowRight size={17} aria-hidden="true" /></a></section>

  </main>;
}
