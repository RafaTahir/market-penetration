import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowLeftRight, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronRight, Info, Layers3, LayoutDashboard, MapPin, Plus, Settings2, ShieldCheck, X } from 'lucide-react';
import { CITIES, FACTORS, METHODOLOGY, createPlannerState, evaluateCity, getProfileContext, parsePlannerState, type CityId, type Evidence, type FactorId, type PlannerState, type Profile } from '../services/entryPlanner';
import { CityEvidenceMap } from './visual/CityEvidenceMap';
import { EvidenceComparison } from './visual/EvidenceComparison';
import './EntryPlanner.css';

const STORAGE_KEY = 'flow-entry-planner-v1';
type WorkspaceView = 'overview' | 'compare' | 'evidence';
type Drawer = 'profile' | 'evidence' | 'methodology' | null;
const industries = [['technology', 'Technology'], ['food-beverage', 'Food & beverage'], ['retail', 'Retail'], ['manufacturing', 'Manufacturing'], ['professional-services', 'Professional services'], ['logistics', 'Logistics']] as const;
const segments = { founder: 'Founder', sme: 'SME', enterprise: 'Enterprise' };
const phases = { exploring: 'Exploring', validating: 'Validating', operating: 'Operating', expanding: 'Expanding' };
const factorLabels = { demand: 'Demand', competition: 'Competition', regulation: 'Regulation', costs: 'Operating costs', talent: 'Talent & delivery' };
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
function sourceHost(value: string) { try { return new URL(value).hostname; } catch { return 'No source'; } }

export default function EntryPlanner() {
  const [state, setState] = useState<PlannerState>(loadWorkspace);
  const [view, setView] = useState<WorkspaceView>('overview');
  const [focusedCity, setFocusedCity] = useState<CityId>('jakarta');
  const [activeCity, setActiveCity] = useState<CityId>('jakarta');
  const [activeFactor, setActiveFactor] = useState<FactorId>('demand');
  const [draft, setDraft] = useState<Evidence>(() => state.evidence.jakarta.demand);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [storageStatus, setStorageStatus] = useState('Stored on this browser only');
  const [message, setMessage] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const evaluations = CITIES.map(city => ({ city, result: evaluateCity(state, city.id, today) }));
  const totalQualified = evaluations.reduce((total, item) => total + item.result.qualifiedCount, 0);
  const savedEvidence = state.evidence[activeCity][activeFactor];
  const dirty = draft.rating !== savedEvidence.rating || draft.note !== savedEvidence.note || draft.sourceUrl !== savedEvidence.sourceUrl || draft.observedOn !== savedEvidence.observedOn;
  const factorDefinition = FACTORS.find(factor => factor.id === activeFactor)!;
  const currentAssessment = evaluateCity(state, activeCity, today).factors.find(factor => factor.id === activeFactor)!;
  const rows = evaluations.flatMap(({ city, result }) => FACTORS.map(factor => ({ city, factor, assessment: result.factors.find(item => item.id === factor.id)!, evidence: state.evidence[city.id][factor.id] })));
  const focusedRows = rows.filter(row => row.city.id === focusedCity);
  const openRows = focusedRows.filter(row => !row.assessment.qualified);
  const industryName = industries.find(([id]) => id === state.profile.industry)![1];

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageStatus('Saved on this browser'); }
    catch { setStorageStatus('Browser storage unavailable — export to keep your work'); }
  }, [state]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (drawer && !element.open) {
      element.showModal();
      requestAnimationFrame(() => element.querySelector<HTMLElement>('select, input, textarea, [data-autofocus]')?.focus());
    } else if (!drawer && element.open) element.close();
  }, [drawer]);

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
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('flow:before-navigate', beforeAppNavigate);
    document.addEventListener('click', beforeNavigate, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('flow:before-navigate', beforeAppNavigate); document.removeEventListener('click', beforeNavigate, true); };
  }, [dirty]);

  function discardDraft() {
    if (dirty && !window.confirm('Discard unsaved changes to this evidence record?')) return false;
    setDraft({ ...savedEvidence });
    return true;
  }
  function openDrawer(next: Drawer) { if (discardDraft()) { setMessage(''); setDrawer(next); } }
  function closeDrawer() { if (discardDraft()) setDrawer(null); }
  function navigate(next: WorkspaceView) { if (discardDraft()) { setDrawer(null); setView(next); } }
  function openEvidence(city: CityId, factor: FactorId) {
    if (!discardDraft()) return;
    setActiveCity(city); setFocusedCity(city); setActiveFactor(factor);
    setDraft({ ...state.evidence[city][factor] }); setMessage(''); setDrawer('evidence');
  }
  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setState(previous => ({ ...previous, profile: { ...previous.profile, [key]: value } }));
  }
  function exportWorkspace() {
    if (dirty && !window.confirm('Export the last saved research? Your unsaved evidence changes will not be included.')) return;
    const payload = {
      methodologyVersion: 'entry-preparation-v1', methodology: METHODOLOGY, factors: FACTORS,
      assessmentDate: today, geography: { jakarta: 'Jakarta province, excluding Greater Jakarta', manila: 'City of Manila, excluding the rest of Metro Manila' },
      exportedAt: new Date().toISOString(), limitation: 'User-entered research and heuristic preparation indicators. Sources have not been independently verified. No survival probability or legal advice.',
      workspace: state, assessments: evaluations.map(({ city, result }) => ({ city: city.name, ...result })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'flow-entry-research.json'; anchor.click(); URL.revokeObjectURL(url);
  }

  return <main className="visual-workspace">
    <aside className="workspace-rail" aria-label="Workspace navigation">
      <div className="rail-label">WORKSPACE</div>
      <nav aria-label="Workspace views">
        <button aria-current={view === 'overview' ? 'page' : undefined} onClick={() => navigate('overview')}><LayoutDashboard size={17} /><span>Overview</span></button>
        <button aria-current={view === 'compare' ? 'page' : undefined} onClick={() => navigate('compare')}><ArrowLeftRight size={17} /><span>Compare cities</span></button>
        <button aria-current={view === 'evidence' ? 'page' : undefined} onClick={() => navigate('evidence')}><Layers3 size={17} /><span>Evidence</span><small>{totalQualified}/10</small></button>
      </nav>
      <div className="rail-bottom">
        <button aria-label="Business profile" onClick={() => openDrawer('profile')}><Settings2 size={17} /><span>Business profile</span></button>
        <button aria-label="Data and methodology" onClick={() => openDrawer('methodology')}><ShieldCheck size={17} /><span>Data & method</span></button>
        <div className="rail-storage"><span className="workspace-dot" /> Local workspace</div>
      </div>
    </aside>

    <div className="workspace-content">
      <div className="workspace-titlebar">
        <div><div className="workspace-breadcrumb"><span>SOUTHEAST ASIA</span><ChevronRight size={12} /> CITY RESEARCH</div><h1>{view === 'overview' ? 'Market workspace' : view === 'compare' ? 'Compare cities' : 'Evidence ledger'}</h1></div>
        <div className="workspace-title-actions"><button className="workspace-status" onClick={() => openDrawer('methodology')}><span className="workspace-dot" /> Your research <Info size={13} /></button><button className="workspace-export" aria-label="Export research" onClick={exportWorkspace}><ArrowDownToLine size={15} /><span>Export research</span></button></div>
      </div>

      <div className="workspace-context">
        <button className="profile-switch" aria-label="Edit business profile" onClick={() => openDrawer('profile')}><span className="profile-initial">{segments[state.profile.segment][0]}</span><span><strong>{industryName}</strong><small>{segments[state.profile.segment]} <span>·</span> {phases[state.profile.phase]}</small></span><Settings2 size={14} /></button>
        <span className="workspace-context-divider" />
        <div className="scope-pair"><span className="city-dot" data-city="jakarta" /> Jakarta <ArrowLeftRight size={12} /><span className="city-dot" data-city="manila" /> Manila</div>
        <button className="runway-chip" onClick={() => openDrawer('profile')}>Runway <strong>{state.profile.runwayMonths === null ? '—' : `${state.profile.runwayMonths} mo`}</strong></button>
      </div>

      <section className="workspace-signals" aria-label="Research summary">
        <div className="coverage-summary"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" className="coverage-track" /><circle cx="22" cy="22" r="18" className="coverage-value" pathLength="100" strokeDasharray={`${totalQualified * 10} 100`} /></svg><div><span className="signal-label">DOCUMENTED CHECKS</span><strong>{totalQualified}<small> / 10</small></strong><span className="signal-caption">Coverage, not certainty</span></div></div>
        {evaluations.map(({ city, result }) => <article key={city.id} className={`city-signal${focusedCity === city.id ? ' city-signal-active' : ''}`} data-city={city.id} aria-labelledby={`${city.id}-summary`}>
          <button className="city-signal-select" onClick={() => setFocusedCity(city.id)} aria-label={`Focus ${city.name} on map`}><span className="city-dot" data-city={city.id} /><h2 id={`${city.id}-summary`}>{city.name}</h2><span className="city-scope">{city.id === 'jakarta' ? 'Province' : 'City'}</span></button>
          <div className="city-signal-values"><div className="signal-preparation planner-score" aria-label={`${city.name} preparation ${result.score === null ? 'not assessed' : `${result.score} out of 100`}`}><strong>{result.score === null ? '—' : result.score}</strong><span>{result.score === null ? 'Not assessed' : '/100 · self-reported'}</span></div><div className="city-signal-coverage"><div className="coverage-checks" aria-hidden="true">{result.factors.map(factor => <span key={factor.id} data-complete={factor.qualified || undefined} />)}</div><span>{result.qualifiedCount}/5 documented</span></div></div>
        </article>)}
      </section>

      {view === 'overview' && <>
        <div className="workspace-visual-grid">
          <section className="workspace-panel workspace-geography"><CityEvidenceMap state={state} activeCity={focusedCity} onSelectCity={setFocusedCity} today={today} /></section>
          <section className="workspace-panel workspace-factor-chart"><EvidenceComparison state={state} today={today} variant="compact" onSelectFactor={openEvidence} /><div className="workspace-chart-note"><Info size={13} /> Self-reported ratings. Missing checks stay unknown.</div></section>
        </div>
        <section className="workspace-next" aria-labelledby="next-title"><div><span className="section-eyebrow">NEXT MOVES</span><h2 id="next-title">{openRows.length ? 'Close the next evidence gap' : 'Review your preparation'}</h2></div><div className="workspace-next-actions">{(openRows.length ? openRows : focusedRows).slice(0, 3).map(row => <button key={`${row.city.id}-${row.factor.id}`} onClick={() => openEvidence(row.city.id, row.factor.id)}><span className="next-icon">{row.assessment.qualified ? <Check size={15} /> : <Plus size={15} />}</span><span><strong>{factorLabels[row.factor.id]}</strong><small>{row.city.name} · {row.assessment.qualified ? 'Review source' : row.evidence.rating !== null ? 'Review required' : 'Add evidence'}</small></span><ArrowUpRight size={15} /></button>)}</div></section>
      </>}

      {view === 'compare' && <section className="workspace-panel workspace-compare-full"><div className="compare-scope"><span><MapPin size={14} /> Jakarta province ↔ City of Manila</span><button onClick={() => openDrawer('methodology')}>Methodology <Info size={13} /></button></div><EvidenceComparison state={state} today={today} onSelectFactor={openEvidence} /><div className="comparison-footnotes"><span>1 Major obstacles</span><span>5 Documented preparation</span><span>All five checks required for a summary</span></div></section>}

      {view === 'evidence' && <section className="workspace-panel evidence-ledger"><div className="ledger-heading"><div><span className="section-eyebrow">SOURCE REGISTER</span><h2>Every check, traceable.</h2></div><button className="workspace-primary" onClick={() => openEvidence(focusedCity, 'demand')}><Plus size={15} /> Add evidence</button></div><div className="ledger-table" role="list" aria-label="Saved city evidence"><div className="ledger-row ledger-table-head" aria-hidden="true"><span>City / factor</span><span>Status</span><span>Observed</span><span>Source</span><span /></div>{rows.map(row => <div role="listitem" key={`${row.city.id}-${row.factor.id}`} ><button className="ledger-row" onClick={() => openEvidence(row.city.id, row.factor.id)} aria-label={`Review ${row.city.name} ${row.factor.label}. ${row.assessment.qualified ? 'Documented' : 'Evidence needed'}`}><span><strong>{factorLabels[row.factor.id]}</strong><small><i className="city-dot" data-city={row.city.id} />{row.city.name}</small></span><span><span className={`record-status ${row.assessment.qualified ? 'documented' : (row.evidence.rating !== null || row.evidence.note || row.evidence.sourceUrl || row.evidence.observedOn) ? 'review' : 'missing'}`}>{row.assessment.qualified ? <CheckCircle2 size={12} /> : null}{row.assessment.qualified ? 'Documented' : (row.evidence.rating !== null || row.evidence.note || row.evidence.sourceUrl || row.evidence.observedOn) ? 'Review' : 'Missing'}</span></span><span className="ledger-date">{row.evidence.observedOn || '—'}</span><span className="ledger-source">{sourceHost(row.evidence.sourceUrl)}</span><ChevronRight size={14} /></button></div>)}</div></section>}

      <footer className="workspace-footer"><span className="workspace-save-status" title={storageStatus}><span className="workspace-dot" />{storageStatus}</span><button onClick={() => openDrawer('methodology')}><ShieldCheck size={13} /> No verified live feeds <ChevronRight size={12} /></button></footer>
    </div>

    <dialog ref={dialog} className="workspace-drawer" aria-labelledby="drawer-title" onCancel={event => { event.preventDefault(); closeDrawer(); }} onClick={event => { const bounds = event.currentTarget.getBoundingClientRect(); if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDrawer(); }}>
      <header className="drawer-heading"><div><span className="section-eyebrow">{drawer === 'evidence' ? `${CITIES.find(city => city.id === activeCity)!.name.toUpperCase()} / RESEARCH` : 'YOUR WORKSPACE'}</span><h2 id="drawer-title">{drawer === 'profile' ? 'Business profile' : drawer === 'evidence' ? factorLabels[activeFactor] : 'Data & methodology'}</h2></div><button className="drawer-close" aria-label="Close details" onClick={closeDrawer}><X size={20} /></button></header>
      {drawer === 'profile' && <><div className="drawer-body profile-form"><label htmlFor="business-segment">Business profile</label><select id="business-segment" value={state.profile.segment} onChange={event => updateProfile('segment', event.target.value as Profile['segment'])}><option value="founder">Founder / new venture</option><option value="sme">Small or medium business</option><option value="enterprise">Enterprise</option></select><label htmlFor="business-phase">Business phase</label><select id="business-phase" value={state.profile.phase} onChange={event => updateProfile('phase', event.target.value as Profile['phase'])}><option value="exploring">Exploring an idea</option><option value="validating">Validating demand</option><option value="operating">Operating a business</option><option value="expanding">Expanding into a new market</option></select><label htmlFor="business-industry">Industry</label><select id="business-industry" value={state.profile.industry} onChange={event => updateProfile('industry', event.target.value as Profile['industry'])}>{industries.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select><label htmlFor="business-description">What are you building?</label><textarea id="business-description" rows={3} maxLength={1200} placeholder="Offer, customer, operating model…" value={state.profile.businessDescription} onChange={event => updateProfile('businessDescription', event.target.value)} /><label htmlFor="business-runway">Planned cash runway <small>(months, optional)</small></label><input id="business-runway" type="number" min="0" max="120" step="1" placeholder="Not yet estimated" value={state.profile.runwayMonths ?? ''} onChange={event => updateProfile('runwayMonths', event.target.value === '' ? null : Math.max(0, Math.min(120, Number(event.target.value))))} /><div className="drawer-callout"><Info size={16} /><p>Profile changes keep your notes and require evidence review. Runway is your estimate, not a survival forecast.</p></div><details className="drawer-details"><summary>What to focus on <ChevronRight size={14} /></summary><p>{phaseGuidance[state.profile.phase]} {state.profile.segment === 'enterprise' ? 'Document group governance, local accountability, and procurement constraints.' : state.profile.segment === 'sme' ? 'Check funding without putting the existing business at risk.' : 'Separate founder assumptions from customer evidence.'}</p></details></div><footer className="drawer-footer"><span><Check size={14} /> {storageStatus.startsWith('Browser storage unavailable') ? 'Session only — export to keep' : 'Saved automatically'}</span><button className="workspace-primary" onClick={closeDrawer}>Done <ArrowRight size={15} /></button></footer></>}

      {drawer === 'evidence' && <form className="drawer-form" id="evidence-form" onSubmit={event => { event.preventDefault(); const next = parsePlannerState({ ...state, evidence: { ...state.evidence, [activeCity]: { ...state.evidence[activeCity], [activeFactor]: { ...draft, profileContext: getProfileContext(state.profile) } } } }); setState(next); setDraft(next.evidence[activeCity][activeFactor]); const assessment = evaluateCity(next, activeCity, today).factors.find(factor => factor.id === activeFactor)!; setMessage(assessment.qualified ? 'Evidence updated. Documented, with source contents unverified.' : `Evidence updated. Not plotted: ${assessment.reason}`); }}><div className="drawer-body"><div className="drawer-field-pair"><div><label htmlFor="evidence-city">City</label><select id="evidence-city" value={activeCity} onChange={event => openEvidence(event.target.value as CityId, activeFactor)}>{CITIES.map(city => <option value={city.id} key={city.id}>{city.name}</option>)}</select></div><div><label htmlFor="evidence-factor">Factor</label><select id="evidence-factor" value={activeFactor} onChange={event => openEvidence(activeCity, event.target.value as FactorId)}>{FACTORS.map(factor => <option value={factor.id} key={factor.id}>{factorLabels[factor.id]}</option>)}</select></div></div><label htmlFor="evidence-rating">Your assessment</label><select id="evidence-rating" value={draft.rating ?? ''} onChange={event => setDraft(previous => ({ ...previous, rating: event.target.value ? Number(event.target.value) as Evidence['rating'] : null }))}><option value="">Unknown / not assessed</option><option value="1">1 — Major unresolved obstacles</option><option value="2">2 — Significant gaps</option><option value="3">3 — Mixed evidence / manageable gaps</option><option value="4">4 — Mostly supported / few gaps</option><option value="5">5 — Strongly supported / documented plan</option></select><div className="rating-guide"><span>1 Obstacles</span><span>5 Prepared</span></div><label htmlFor="evidence-note">Evidence and reasoning <small>(20+ characters)</small></label><textarea id="evidence-note" rows={4} maxLength={2000} value={draft.note} onChange={event => setDraft(previous => ({ ...previous, note: event.target.value }))} placeholder="What supports this rating? Include city scope and limitations." /><label htmlFor="evidence-source">Source URL</label><input id="evidence-source" maxLength={2048} type="url" placeholder="https://…" value={draft.sourceUrl} onChange={event => setDraft(previous => ({ ...previous, sourceUrl: event.target.value }))} /><label htmlFor="evidence-date">Source observation date</label><input id="evidence-date" type="date" max={today} value={draft.observedOn} onChange={event => setDraft(previous => ({ ...previous, observedOn: event.target.value }))} /><p className="drawer-hint">Use the source's observation date, not today's date by default. Documentation must be within 365 days.</p><details className="drawer-details"><summary>{currentAssessment.qualified ? 'Documentation check' : 'Why this check is not plotted'} <ChevronRight size={14} /></summary><p>Current record: {currentAssessment.reason}</p></details><details className="drawer-details"><summary>Research prompts & sources <BookOpen size={14} /></summary><p>{factorDefinition.question}</p><p>{factorDefinition.action}</p>{CITIES.find(city => city.id === activeCity)!.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.title}<small>{source.scope}</small></span><ArrowUpRight size={14} /></a>)}<p>Discovery links only. Verify applicability, effective dates and local requirements; no legal conclusion is provided.</p></details><p role="status" className="drawer-feedback">{message}</p></div><footer className="drawer-footer"><span>{dirty ? <><span className="unsaved-dot" /> Unsaved changes</> : <><ShieldCheck size={14} /> Self-reported research</>}</span><button type="submit" className="workspace-primary">Save evidence <Check size={15} /></button></footer></form>}

      {drawer === 'methodology' && <><div className="drawer-body methodology-body"><div className="method-status"><ShieldCheck size={20} /><div><strong>Your research, not a live feed</strong><span>No connected AI consultant or independently verified market dataset.</span></div></div><h3>Two different measurements</h3><div className="method-measure"><strong>Coverage <span>0–5 checks per city</span></strong><p>Counts documented factors, not market strength or certainty.</p></div><div className="method-measure"><strong>Preparation <span>1–5 per factor</span></strong><p>Your assessment with a note, HTTPS source and valid observation date within 365 days. Missing or invalid checks stay in the Unknown lane.</p></div><h3>Summary weights</h3><div className="method-weights">{FACTORS.map(factor => <div key={factor.id}><span>{factorLabels[factor.id]}</span><i style={{ width: `${factor.weight}%` }} /><strong>{factor.weight}%</strong></div>)}</div><p>All five factors must qualify. The weighted scale maps 1–5 to 0–100. A complete rating of 1 produces a real zero, not missing data.</p><details className="drawer-details"><summary>Limits and geography <ChevronRight size={14} /></summary><p>Ratings and source contents are not independently verified. No survival probability, forecast or legal advice is generated. Profile changes require review; cash runway is separate and does not change the score.</p><p>Jakarta means the province, excluding Greater Jakarta. Manila means the City of Manila, excluding the rest of Metro Manila. Map pins are approximate city anchors, not market boundaries.</p><p>{METHODOLOGY}</p></details></div><footer className="drawer-footer"><span><Info size={14} /> Unknown never means zero</span><button className="workspace-primary" onClick={closeDrawer}>Got it <Check size={15} /></button></footer></>}
    </dialog>
  </main>;
}
