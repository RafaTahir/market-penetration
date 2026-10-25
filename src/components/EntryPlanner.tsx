import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, CheckCircle2, ClipboardList, Download, Info, MapPin, ShieldCheck } from 'lucide-react';
import {
  CITIES, FACTORS, METHODOLOGY, createPlannerState, evaluateCity, parsePlannerState, getProfileContext,
  type CityId, type Evidence, type FactorId, type PlannerState, type Profile,
} from '../services/entryPlanner';
import './EntryPlanner.css';

const STORAGE_KEY = 'flow-entry-planner-v1';
const industries = [
  ['technology', 'Technology'], ['food-beverage', 'Food & beverage'], ['retail', 'Retail'],
  ['manufacturing', 'Manufacturing'], ['professional-services', 'Professional services'], ['logistics', 'Logistics'],
] as const;
const phaseGuidance: Record<Profile['phase'], string> = {
  exploring: 'Start with customer interviews and an initial ownership and licensing check before committing capital.',
  validating: 'Test willingness to pay, map direct competitors, and obtain scoped operating-cost quotes.',
  operating: 'Use actual unit economics and customer retention to test whether this city fits your operating model.',
  expanding: 'Validate local delivery capacity, entity structure, and governance before transferring a proven model.',
};

function loadWorkspace(): PlannerState {
  try { return parsePlannerState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
  catch { return createPlannerState(); }
}

export default function EntryPlanner() {
  const [state, setState] = useState<PlannerState>(loadWorkspace);
  const [storageStatus, setStorageStatus] = useState('Stored on this browser only');
  const [activeCity, setActiveCity] = useState<CityId>('jakarta');
  const [activeFactor, setActiveFactor] = useState<FactorId>('demand');
  const [draft, setDraft] = useState<Evidence>(() => state.evidence.jakarta.demand);
  const [message, setMessage] = useState('');
  const editor = useRef<HTMLElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const evaluations = CITIES.map(city => ({ city, result: evaluateCity(state, city.id, today) }));
  const totalQualified = evaluations.reduce((sum, item) => sum + item.result.qualifiedCount, 0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageStatus('Saved on this browser');
    } catch { setStorageStatus('Browser storage unavailable — export to keep your work'); }
  }, [state]);

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setState(previous => ({ ...previous, profile: { ...previous.profile, [key]: value } }));
  }

  const savedEvidence = state.evidence[activeCity][activeFactor];
  const dirty = draft.rating !== savedEvidence.rating || draft.note !== savedEvidence.note || draft.sourceUrl !== savedEvidence.sourceUrl || draft.observedOn !== savedEvidence.observedOn;
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const beforeNavigate = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (link && !link.getAttribute('href')?.startsWith('#') && link.getAttribute('target') !== '_blank' && !window.confirm('You have unsaved evidence changes. Discard them and follow this link?')) event.preventDefault();
    };
    const beforeAppNavigate = (event: Event) => {
      if ((event as CustomEvent<string>).detail.startsWith('#/research') && !window.confirm('You have unsaved evidence changes. Discard them and leave the planner?')) event.preventDefault();
    };
    window.addEventListener('flow:before-navigate', beforeAppNavigate);
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', beforeNavigate, true);
    return () => { window.removeEventListener('flow:before-navigate', beforeAppNavigate); window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', beforeNavigate, true); };
  }, [dirty]);

  function openEvidence(city: CityId, factor: FactorId, scroll = true) {
    if (dirty && !window.confirm('Discard unsaved changes to this evidence record?')) return;
    setActiveCity(city);
    setActiveFactor(factor);
    setDraft({ ...state.evidence[city][factor] });
    setMessage('');
    if (scroll) {
      editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('evidence-city')?.focus({ preventScroll: true });
    }
  }

  function exportWorkspace() {
    if (dirty && !window.confirm('Export the last saved research? Your unsaved evidence changes will not be included.')) return;
    const payload = {
      methodologyVersion: 'entry-preparation-v1',
      methodology: METHODOLOGY,
      factors: FACTORS,
      assessmentDate: today,
      geography: { jakarta: 'Jakarta province, excluding Greater Jakarta', manila: 'City of Manila, excluding the rest of Metro Manila' },
      exportedAt: new Date().toISOString(),
      limitation: 'User-entered research and heuristic preparation indicators. Sources have not been independently verified. No survival probability or legal advice.',
      workspace: state,
      assessments: evaluations.map(({ city, result }) => ({ city: city.name, ...result })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'flow-entry-research.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const factorDefinition = FACTORS.find(factor => factor.id === activeFactor)!;
  const currentAssessment = evaluateCity(state, activeCity, today).factors.find(factor => factor.id === activeFactor)!;

  return (
    <main className="entry-planner">
      <div className="planner-topline">
        <span><span className="status-dot" /> SOUTHEAST ASIA <span className="planner-divider">/</span> ENTRY WORKSPACE</span>
        <span className="planner-save-status">{storageStatus}</span>
      </div>

      <section className="planner-hero" aria-labelledby="planner-title">
        <div>
          <p className="planner-eyebrow">A clearer path into your next market</p>
          <h1 id="planner-title">Find your foothold.<br /><span>Build with evidence.</span></h1>
          <p className="planner-intro">Bring your business into focus. Compare Jakarta and Manila, uncover the questions that matter, and turn research into your next move.</p>
          <div className="planner-hero-actions">
            <a className="planner-primary" href="#business-profile">Define your business <ArrowRight size={16} /></a>
            <a className="planner-text-link" href="#/research">Explore the research library <ArrowUpRight size={16} /></a>
          </div>
        </div>
        <div className="planner-hero-card" aria-label="Research coverage">
          <div className="planner-hero-icon"><ClipboardList size={22} /></div>
          <span className="planner-eyebrow">YOUR RESEARCH, MADE VISIBLE</span>
          <div className="planner-coverage-number">{totalQualified}<span> / 10</span></div>
          <p>evidence checks complete across two cities</p>
          <div className="planner-progress"><span style={{ width: `${totalQualified * 10}%` }} /></div>
          <small>Coverage measures documentation, not market certainty.</small>
        </div>
      </section>

      <div className="planner-scope-note"><ShieldCheck size={19} /><p><strong>A research workspace, with clear limits.</strong> No connected AI consultant or live regulatory verification. Indicators use your documented assessments; unknowns stay visible.</p></div>

      <div className="planner-workspace-grid">
        <aside className="planner-panel planner-profile" id="business-profile" aria-labelledby="profile-title">
          <div className="planner-section-kicker">01 / YOUR STARTING POINT</div>
          <h2 id="profile-title">The business behind the move</h2>
          <p className="planner-muted">A first venture and a regional expansion need different questions.</p>
          <label htmlFor="business-segment">Business profile</label>
          <select id="business-segment" value={state.profile.segment} onChange={event => updateProfile('segment', event.target.value as Profile['segment'])}>
            <option value="founder">Founder / new venture</option><option value="sme">Small or medium business</option><option value="enterprise">Enterprise</option>
          </select>
          <label htmlFor="business-phase">Business phase</label>
          <select id="business-phase" value={state.profile.phase} onChange={event => updateProfile('phase', event.target.value as Profile['phase'])}>
            <option value="exploring">Exploring an idea</option><option value="validating">Validating demand</option><option value="operating">Operating a business</option><option value="expanding">Expanding into a new market</option>
          </select>
          <label htmlFor="business-industry">Industry</label>
          <select id="business-industry" value={state.profile.industry} onChange={event => updateProfile('industry', event.target.value as Profile['industry'])}>
            {industries.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label htmlFor="business-description">What are you building?</label>
          <textarea id="business-description" rows={3} maxLength={1200} placeholder="Your offer, customer, and operating model…" value={state.profile.businessDescription} onChange={event => updateProfile('businessDescription', event.target.value)} />
          <label htmlFor="business-runway">Planned cash runway <span>(months, optional)</span></label>
          <input id="business-runway" type="number" min="0" max="120" step="1" placeholder="Not yet estimated" value={state.profile.runwayMonths ?? ''} onChange={event => updateProfile('runwayMonths', event.target.value === '' ? null : Math.max(0, Math.min(120, Number(event.target.value))))} />
          <div className="planner-profile-guidance"><Info size={17} /><p>{phaseGuidance[state.profile.phase]} {state.profile.segment === 'enterprise' ? 'Document group governance, local accountability, and procurement constraints.' : state.profile.segment === 'sme' ? 'Check whether the move can be funded without putting the existing business at risk.' : 'Separate founder assumptions from evidence gathered with prospective customers.'}</p></div>
          <p className="planner-small">Profile changes require an evidence review. Existing notes are kept, but re-save each assessment for your updated business profile.</p>
        </aside>

        <section className="planner-comparison" aria-labelledby="comparison-title">
          <div className="planner-section-heading"><div><div className="planner-section-kicker">02 / COMPARE YOUR OPTIONS</div><h2 id="comparison-title">Two cities. The questions that count.</h2></div><span className="planner-badge">Initial city coverage</span></div>
          <div className="planner-city-grid">
            {evaluations.map(({ city, result }) => (
              <article className="planner-panel planner-city-card" key={city.id} aria-labelledby={`${city.id}-title`}>
                <div className={`planner-city-banner planner-city-${city.id}`}><MapPin size={42} aria-hidden="true" /><span>{city.flag}</span><p>{city.country}</p></div>
                <div className="planner-city-body">
                  <div className="planner-city-title"><h3 id={`${city.id}-title`}>{city.name}</h3><span className="planner-badge">{result.qualifiedCount}/5 documented</span></div>
                  <p className="planner-geography">{city.id === 'jakarta' ? 'Jakarta province scope; not Greater Jakarta.' : 'City of Manila scope; not all Metro Manila.'} Country sources need local checks.</p>
                  <div className="planner-score"><span>{result.score === null ? '—' : result.score}<small>{result.score === null ? 'Awaiting evidence' : '/ 100'}</small></span><p>Entry preparation<br /><strong>{result.score === null ? 'Not assessed' : 'Self-reported heuristic'}</strong></p></div>
                  <p className="planner-small">Confidence: {result.confidence === 'none' ? 'Not assessed' : result.confidence === 'low' ? 'Low · partial documentation' : 'Self-reported · sources unverified'}</p>
                  <div className="planner-factor-list">
                    {FACTORS.map(factor => {
                      const assessment = result.factors.find(item => item.id === factor.id)!;
                      return <button key={factor.id} onClick={() => openEvidence(city.id, factor.id)} className="planner-factor-row" aria-label={`Edit ${factor.label} for ${city.name}. ${assessment.qualified ? `Self-reported rating ${assessment.rating} out of 5` : 'Evidence needed'}`} ><span>{assessment.qualified ? <CheckCircle2 size={15} /> : <span className="planner-empty-dot" />}{factor.label}</span><span>{assessment.qualified ? `${assessment.rating}/5` : 'Evidence needed'}<ArrowUpRight size={13} /></span></button>;
                    })}
                  </div>
                  <div className="planner-city-indicators"><p><strong>Competitive position</strong><span>{result.factors.find(factor => factor.id === 'competition')?.qualified ? `${state.evidence[city.id].competition.rating}/5 · your assessment` : 'Not assessed'}</span></p><p><strong>Survivability preparation</strong><span>{state.profile.runwayMonths === null ? 'Cash runway not estimated' : `${state.profile.runwayMonths} months runway · your estimate`}</span></p></div>
                  <button className="planner-outline" onClick={() => openEvidence(city.id, 'demand')}>Build the evidence <ArrowDown size={15} /></button>
                </div>
              </article>
            ))}
          </div>
          <p className="planner-small">No city is ranked until all five factors have recent, documented assessments. Entry preparation and runway are planning indicators, not a probability of business survival.</p>
        </section>
      </div>

      <section ref={editor} className="planner-panel planner-evidence" aria-labelledby="evidence-title">
        <div className="planner-section-heading"><div><div className="planner-section-kicker">03 / BUILD YOUR CASE</div><h2 id="evidence-title">Evidence before conviction.</h2><p className="planner-muted">Record what you know, where it came from, and what still needs checking.</p></div><button className="planner-outline planner-export" onClick={exportWorkspace}><Download size={16} /> Export research</button></div>
        <div className="planner-evidence-grid">
          <form onSubmit={event => {
            event.preventDefault();
            const next = parsePlannerState({ ...state, evidence: { ...state.evidence, [activeCity]: { ...state.evidence[activeCity], [activeFactor]: { ...draft, profileContext: getProfileContext(state.profile) } } } });
            setState(next);
            setDraft(next.evidence[activeCity][activeFactor]);
            setMessage('Evidence saved locally. Coverage checks assess documentation; Flow has not verified the source or your rating.');
          }}>
            <div className="planner-field-pair"><div><label htmlFor="evidence-city">City</label><select id="evidence-city" value={activeCity} onChange={event => openEvidence(event.target.value as CityId, activeFactor, false)}>{CITIES.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}</select></div><div><label htmlFor="evidence-factor">Factor</label><select id="evidence-factor" value={activeFactor} onChange={event => openEvidence(activeCity, event.target.value as FactorId, false)}>{FACTORS.map(factor => <option key={factor.id} value={factor.id}>{factor.label}</option>)}</select></div></div>
            <p className="planner-question">{factorDefinition.question}</p>
            <label htmlFor="evidence-rating">Your assessment</label>
            <select id="evidence-rating" value={draft.rating ?? ''} onChange={event => setDraft(previous => ({ ...previous, rating: event.target.value ? Number(event.target.value) as Evidence['rating'] : null }))}><option value="">Not assessed</option><option value="1">1 — Major unresolved obstacles</option><option value="2">2 — Significant gaps</option><option value="3">3 — Mixed evidence / manageable gaps</option><option value="4">4 — Mostly supported / few gaps</option><option value="5">5 — Strongly supported / documented plan</option></select>
            <label htmlFor="evidence-note">Evidence and reasoning <span>(at least 20 characters)</span></label>
            <textarea id="evidence-note" rows={3} maxLength={2000} value={draft.note} onChange={event => setDraft(previous => ({ ...previous, note: event.target.value }))} placeholder="What did you find? How does it apply to your business, city boundary, and industry? Include any limitations." />
            <div className="planner-field-pair"><div><label htmlFor="evidence-source">Source URL</label><input maxLength={2048} id="evidence-source" type="url" placeholder="https://…" value={draft.sourceUrl} onChange={event => setDraft(previous => ({ ...previous, sourceUrl: event.target.value }))} /></div><div><label htmlFor="evidence-date">Source observation date</label><input id="evidence-date" type="date" max={today} value={draft.observedOn} onChange={event => setDraft(previous => ({ ...previous, observedOn: event.target.value }))} /></div></div>
            <p className="planner-small">A source must use HTTPS, have no embedded credentials, and cover an observation within the past 365 days. Do not use today as a substitute for an unknown source date.</p>
            <div className="planner-form-bottom"><button className="planner-primary" type="submit">Save evidence <CheckCircle2 size={16} /></button><span className="planner-small">{dirty && <strong>Unsaved changes. </strong>}Current record: {currentAssessment.reason}</span></div>
            <p role="status" className="planner-feedback">{message}</p>
          </form>
          <aside className="planner-next-steps">
            <h3>Close the next gap</h3>
            <p className="planner-muted">{factorDefinition.action}</p>
            <h4>Research starting points</h4>
            {CITIES.find(city => city.id === activeCity)!.sources.map(source => <a className="planner-source" key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.title}<small>{source.scope}</small></span><ArrowUpRight size={16} /></a>)}
            <p className="planner-small">Official source directory only. Linked content and legal requirements have not been verified for your business. Check effective dates, local permits, foreign ownership, and sector rules with the relevant authority or a qualified adviser.</p>
            <h4>What needs attention</h4>
            <ul>{evaluateCity(state, activeCity, today).gaps.map(gap => <li key={gap}>{gap}</li>)}</ul>
          </aside>
        </div>
      </section>

      <details className="planner-methodology planner-panel"><summary><Info size={17} /> How these indicators work</summary><div><p>Entry preparation is a transparent heuristic built from five equally visible research factors. Weights: {FACTORS.map(factor => `${factor.label} ${factor.weight}%`).join(', ')}. Each rating is mapped from 1–5 to 0–100, then weighted. A summary is withheld until every factor passes the documentation checks.</p><p>Coverage is the fraction of factors with a rating, substantive reasoning, an HTTPS source URL, and a valid observation date within 365 days. These checks do not establish source quality, current law, or factual accuracy. Confidence remains self-reported even at full coverage.</p><p>Cash runway is your estimate. Competitive position is your documented assessment, not a measured market share. There is no calibrated survival model, automated legal opinion, or AI consulting response. Changing your business profile does not manufacture new evidence or alter the weights. Review the evidence for your new scope.</p></div></details>
      <footer className="planner-footer"><span>Flow <span className="planner-divider">/</span> Southeast Asia, one informed step at a time.</span><span>Research first. Decisions remain yours.</span></footer>
    </main>
  );
}
