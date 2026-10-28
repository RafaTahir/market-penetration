import { useState } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Globe2, Info, MapPin, PenLine } from 'lucide-react';
import { MARKETS } from '../data/marketCatalog';
import { MARKET_PLANS_KEY, MAX_NEXT_STEP_LENGTH, buildMarketPlanExport, createMarketPlans, parseMarketPlans, updateMarketNextStep, type MarketPlansState } from '../services/marketPlans';
import MarketScene from './visual/MarketScene';
import './MarketPlanHub.css';

interface MarketPlanHubProps {
  selectedCountries: string[];
}

// Retain session-only edits across route unmounts when browser storage is denied.
// A page reload still needs successful local storage or the user's export.
let sessionPlans: { state: MarketPlansState; savedLocally: boolean } | null = null;

function loadPlans() {
  if (sessionPlans) return sessionPlans;
  try {
    const stored = localStorage.getItem(MARKET_PLANS_KEY);
    sessionPlans = { state: stored ? parseMarketPlans(JSON.parse(stored)) : createMarketPlans(), savedLocally: true };
  } catch {
    sessionPlans = { state: createMarketPlans(), savedLocally: false };
  }
  return sessionPlans;
}

export default function MarketPlanHub({ selectedCountries }: MarketPlanHubProps) {
  const [initial] = useState(loadPlans);
  const [plans, setPlans] = useState(initial.state);
  const [savedLocally, setSavedLocally] = useState(initial.savedLocally);
  const [exportMessage, setExportMessage] = useState('');
  const markets = MARKETS.filter(market => selectedCountries.includes(market.id));
  const hasNotes = Object.keys(plans.notes).length > 0;

  function saveNextStep(marketId: string, text: string) {
    const next = updateMarketNextStep(plans, marketId, text);
    setPlans(next);
    let stored = false;
    try { localStorage.setItem(MARKET_PLANS_KEY, JSON.stringify(next)); stored = true; }
    catch { /* Notes remain available in this app session and through export. */ }
    sessionPlans = { state: next, savedLocally: stored };
    setSavedLocally(stored);
    setExportMessage('');
  }

  function exportPlan() {
    const payload = buildMarketPlanExport(plans, selectedCountries);
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'flow-market-plan.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setExportMessage('Market plan exported with your selected markets, notes and source limitations.');
  }

  return <main className="market-plan-hub">
    <a className="mph-back" href="#/research"><ArrowLeft size={16} aria-hidden="true" />Explore markets</a>
    <header className="mph-heading">
      <div><span className="mph-eyebrow">YOUR SHORTLIST · YOUR NEXT MOVE</span><h1>Your market plan.</h1><p>Keep the markets you chose, follow their sources and decide your next step.</p></div>
      <button className="mph-export" onClick={exportPlan}><ArrowDownToLine size={17} aria-hidden="true" />Export market plan</button>
    </header>
    <div className="mph-plan-status">
      <span><Globe2 size={16} aria-hidden="true" />{markets.length} {markets.length === 1 ? 'market' : 'markets'} in your shortlist</span>
      <span role="status">{savedLocally ? <><Check size={15} aria-hidden="true" />{hasNotes ? 'Next steps saved on this browser' : 'Next steps save on this browser'}</> : <><Info size={15} aria-hidden="true" />Session only · export before reloading</>}</span>
    </div>
    {markets.length > 0 && <p className="mph-directory-status"><Info size={14} aria-hidden="true" />Official-source directory · contents unverified · publication dates unknown</p>}

    {markets.length ? <section className="mph-market-grid" aria-label="Selected market plans">
      {markets.map(market => {
        const note = plans.notes[market.id];
        return <article className="mph-market" key={market.id} aria-labelledby={`market-plan-${market.id}`} data-market={market.id}>
          <MarketScene marketId={market.id} />
          <div className="mph-market-body">
            <div className="mph-market-title"><span className="mph-flag" aria-hidden="true">{market.flag}</span><div><h2 id={`market-plan-${market.id}`}>{market.name}</h2><p><MapPin size={13} aria-hidden="true" />{market.city} · research starting point</p></div></div>
            <div className="mph-source-links">
              {[
                { label: 'Business setup', source: market.setup },
                { label: 'Country statistics', source: market.statistics },
                { label: 'City & premises', source: market.cityPortal },
              ].map(({ label, source }) => <a key={label} href={source.url} target="_blank" rel="noopener noreferrer"><span><small>{label}</small>{source.name}</span><ArrowUpRight size={16} aria-hidden="true" /></a>)}
            </div>
            <details className="mph-next-step">
              <summary><PenLine size={16} aria-hidden="true" /><span>Your next step{note && <small>Note saved</small>}</span><ChevronDown size={15} aria-hidden="true" /></summary>
              <label htmlFor={`next-step-${market.id}`}>Your next step for {market.name}</label>
              <textarea id={`next-step-${market.id}`} maxLength={MAX_NEXT_STEP_LENGTH} rows={4} value={note?.nextStep ?? ''} onChange={event => saveNextStep(market.id, event.target.value)} placeholder={`What will you check or do next in ${market.name}?`} />
              <div className="mph-note-meta"><span>Your note · unverified</span><span>{note?.nextStep.length ?? 0}/{MAX_NEXT_STEP_LENGTH}</span></div>
              {note?.updatedAt && <p className="mph-edit-time">Edited <time dateTime={note.updatedAt}>{note.updatedAt.slice(0, 10)}</time> · edit date, not a source date</p>}
            </details>
          </div>
        </article>;
      })}
    </section> : <section className="mph-empty" aria-labelledby="market-plan-empty-title"><Globe2 size={36} aria-hidden="true" /><h2 id="market-plan-empty-title">Choose the markets for your plan.</h2><p>Your shortlist is empty. Explore the region and select the markets you want to research.</p><a className="mph-primary" href="#/research">Choose markets<ArrowRight size={17} aria-hidden="true" /></a></section>}

    <details className="mph-source-details"><summary><Info size={16} aria-hidden="true" />About these research links & notes<ChevronDown size={15} aria-hidden="true" /></summary><p>These are curated official-directory links, not verified current requirements. Page contents, publication dates and applicability to your activity or address have not been verified. Source publication dates are unknown. Your next-step notes are personal planning notes; they do not become evidence or preparation scores in the city notebook.</p><p>Notes save independently of your shortlist, so removing a country from the shortlist does not delete its notes. Session-only notes survive navigation in this app but require an export before a page reload. Export includes the currently selected markets.</p></details>

    <section className="mph-notebook" aria-labelledby="city-notebook-title"><span className="mph-notebook-icon"><BookOpen size={27} aria-hidden="true" /></span><div><span className="mph-eyebrow">DETAILED PREPARATION</span><h2 id="city-notebook-title">Your city notebook is still here.</h2><p>Documented preparation assessments currently cover <strong>Jakarta province and the City of Manila</strong>. Existing research, scores and exports stay in that notebook; opening it does not change your market shortlist.</p></div><a className="mph-primary" href="#/plan/notebook">Open city notebook<ArrowRight size={17} aria-hidden="true" /></a></section>
    <p className="mph-feedback" role="status">{exportMessage}</p>
  </main>;
}
