import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, BarChart3, Bookmark, BookOpen, Building2, Check, ChevronRight, Compass, Database, Factory, Globe2, MapPin, Package, Scale, Search, ShieldCheck, ShoppingBag, Smartphone, Truck, Users, UtensilsCrossed, Wallet } from 'lucide-react';
import { MARKETS, type MarketGuide } from '../data/marketCatalog';
import { INDUSTRIES, type ResearchAngle } from '../data/industryGuides';
import { CITY_RESEARCH_GUIDES, type CityResearchLens } from '../data/cityResearchGuides';
import type { MarketPlanSession } from '../hooks/useMarketPlans';
import { getCityQuestionDirectories } from '../services/marketPlans';
import MarketFundamentals from './MarketFundamentals';
import MarketScene from './visual/MarketScene';
import './MarketResearch.css';

export type ResearchMode = 'overview' | 'cities' | 'industries' | 'insights' | 'cases' | 'data';

interface MarketResearchProps {
  mode: ResearchMode;
  selectedCountries: string[];
  onPlan: () => void;
  planSession: MarketPlanSession;
  onIncludeMarket: (id: string) => void;
  onReference: () => void;
  onCompare: () => void;
  onOpenData: () => void;
  onOpenReports: () => void;
}

type CityLens = CityResearchLens;
type InsightLens = 'setup' | 'demand' | 'operations';

const INDUSTRY_ICONS = {
  technology: Smartphone,
  'food-beverage': UtensilsCrossed,
  retail: ShoppingBag,
  manufacturing: Factory,
  'professional-services': Users,
  logistics: Truck,
};

const ANGLES: readonly { id: ResearchAngle; title: string; icon: typeof Users; subtitle: string }[] = [
  { id: 'demand', title: 'Customer & demand', icon: Users, subtitle: 'Find the first reason to buy' },
  { id: 'costs', title: 'Cost & delivery', icon: Wallet, subtitle: 'Price a workable operating model' },
  { id: 'setup', title: 'Setup & regulation', icon: Scale, subtitle: 'Identify what needs local review' },
];

const CITY_LENSES: readonly { id: CityLens; label: string; icon: typeof Users; question: string; detail: string }[] = [
  { id: 'customers', label: 'Customers', icon: Users, question: 'Where are the customers you need to reach?', detail: 'Map the customer catchment, local alternatives and route to market.' },
  { id: 'location', label: 'Location', icon: MapPin, question: 'Which operating area fits the business?', detail: 'Compare premises, delivery access, hiring reach and actual local quotes.' },
  { id: 'setup', label: 'Setup', icon: Building2, question: 'Which authority covers the intended activity and address?', detail: 'Check city boundaries, premises requirements and relevant approval paths.' },
];

const INSIGHT_LENSES: readonly { id: InsightLens; label: string; icon: typeof Building2; question: string; description: string }[] = [
  { id: 'setup', label: 'Business setup', icon: Building2, question: 'What will it take to operate?', description: 'Start with the activity, ownership structure and local operating footprint.' },
  { id: 'demand', label: 'Market demand', icon: BarChart3, question: 'What evidence supports the opportunity?', description: 'Look for the right geography, customer segment and observation period.' },
  { id: 'operations', label: 'Operating context', icon: MapPin, question: 'What changes at city level?', description: 'Explore local planning and operating context; obtain commercial quotes separately.' },
];

const DATASETS = [
  { name: 'Population', code: 'SP.POP.TOTL', unit: 'People', icon: Users },
  { name: 'GDP', code: 'NY.GDP.MKTP.CD', unit: 'Current US$', icon: Globe2 },
  { name: 'Internet use', code: 'IT.NET.USER.ZS', unit: '% of population', icon: Smartphone },
  { name: 'Consumer inflation', code: 'FP.CPI.TOTL.ZG', unit: 'Annual %', icon: Wallet },
] as const;

function SourceLink({ url, children, className = '', label }: { url: string; children: ReactNode; className?: string; label?: string }) {
  return <a className={`mr-source-link ${className}`} aria-label={label} href={url} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={15} aria-hidden="true" /></a>;
}

function IndustryDirectories({ markets }: { markets: readonly MarketGuide[] }) {
  const [chosenId, setChosenId] = useState('');
  const market = markets.find(item => item.id === chosenId) ?? markets[0];
  if (!market) return null;
  return <details className="mr-industry-directories">
    <summary>Official sources by market <ChevronRight size={15} aria-hidden="true" /></summary>
    <label>Research in
      <select value={market.id} onChange={event => setChosenId(event.target.value)}>
        {markets.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <div className="mr-directory-grid">
      <div><small>Customer and industry statistics</small><SourceLink url={market.statistics.url}>{market.statistics.name}</SourceLink></div>
      {market.cityStatistics && <div><small>City datasets and geography</small><SourceLink url={market.cityStatistics.url}>{market.cityStatistics.name}</SourceLink></div>}
      <div><small>Business setup enquiries</small><SourceLink url={market.setup.url}>{market.setup.name}</SourceLink></div>
      {market.regionalSetup && <div><small>Province or state registration</small><SourceLink url={market.regionalSetup.url}>{market.regionalSetup.name}</SourceLink></div>}
      <div><small>Location and premises enquiries</small><SourceLink url={market.cityPortal.url}>{market.cityPortal.name}</SourceLink></div>
    </div>
    <p>Directory contents and publication dates are unverified. Check the activity, geography and period covered by each source.</p>
  </details>;
}

function CostWorksheetLink({ markets, shortlisted, onIncludeMarket }: {
  markets: readonly MarketGuide[];
  shortlisted: readonly string[];
  onIncludeMarket: (id: string) => void;
}) {
  const [choice, setChoice] = useState('');
  const market = markets.find(item => item.id === choice) ?? markets[0];
  if (!market) return null;
  const included = shortlisted.includes(market.id);
  return <div className="mr-worksheet-start">
    <label>Model costs for
      <select value={market.id} onChange={event => setChoice(event.target.value)}>
        {markets.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <button type="button" className="mr-text-button" onClick={() => {
      if (!included) onIncludeMarket(market.id);
      window.location.hash = `/plan/worksheet/${market.id}`;
    }}>{included ? 'Open break-even worksheet' : 'Shortlist & open worksheet'} <ArrowRight size={14} aria-hidden="true" /></button>
  </div>;
}

function Scope({ markets, all }: { markets: readonly MarketGuide[]; all: boolean }) {
  return <div className="mr-scope"><span>{all ? 'All markets' : 'Your shortlist'}</span><div>{markets.map(market => <span key={market.id} title={market.name} aria-label={market.name}>{market.flag}</span>)}</div></div>;
}

function SourceScope() {
  return <details className="mr-source-scope"><summary><ShieldCheck size={14} aria-hidden="true" /><span>Discovery guides · sources & scope</span><ChevronRight size={13} aria-hidden="true" /></summary><p>Research questions and curated government-domain links are discovery guides, not current market findings or legal requirements. Historical snapshots carry their own source and observation-year details. Portal content, reachability, publication dates and applicability have not been verified here. Check the relevant authority and qualified local advisers before acting. Numeric reference examples are separate and require an explicit choice.</p></details>;
}

export default function MarketResearch({ mode, selectedCountries, planSession, onIncludeMarket, onPlan, onReference, onCompare, onOpenData, onOpenReports }: MarketResearchProps) {
  const [industryId, setIndustryId] = useState('technology');
  const [cityLens, setCityLens] = useState<CityLens>('customers');
  const [insightLens, setInsightLens] = useState<InsightLens>('setup');
  const markets = selectedCountries.length ? MARKETS.filter(market => selectedCountries.includes(market.id)) : MARKETS;
  const industry = INDUSTRIES.find(item => item.id === industryId)!;
  const IndustryIcon = INDUSTRY_ICONS[industry.id];
  const currentCityLens = CITY_LENSES.find(item => item.id === cityLens)!;
  const currentInsightLens = INSIGHT_LENSES.find(item => item.id === insightLens)!;

  return <div className={`market-research market-research-${mode}`}>
    {mode === 'overview' && <>
      <MarketFundamentals selectedCountries={selectedCountries} onCompare={onCompare} />
      <section className="mr-starting-points" aria-labelledby="mr-starting-title">
        <div className="mr-section-heading"><div><span className="mr-eyebrow">A USEFUL PLACE TO START</span><h3 id="mr-starting-title">Go closer to the source.</h3></div><button className="mr-text-button" onClick={onOpenReports}>Source library <ArrowUpRight size={14} aria-hidden="true" /></button></div>
        <div className="mr-source-rows">{markets.map(market => <div className="mr-source-row" key={market.id}><div><span className="mr-flag" aria-hidden="true">{market.flag}</span><strong>{market.name}</strong></div><SourceLink url={market.setup.url}>{market.setup.name}</SourceLink><SourceLink url={market.statistics.url} className="mr-statistics-link">Statistics</SourceLink></div>)}</div>
      </section>
    </>}

    {mode === 'cities' && <>
      <div className="mr-section-heading"><div><span className="mr-eyebrow">ZOOM IN ON THE OPERATING AREA</span><h2>Find the right city conversation.</h2><p>A city name starts the search. The customer catchment and operating address make it specific.</p></div><Scope markets={markets} all={!selectedCountries.length} /></div>
      <div className="mr-lens-tabs" role="group" aria-label="City research lens">{CITY_LENSES.map(lens => <button key={lens.id} aria-pressed={cityLens === lens.id} onClick={() => setCityLens(lens.id)}><lens.icon size={15} aria-hidden="true" />{lens.label}</button>)}</div>
      <p className="mr-city-guide-note"><BookOpen size={14} aria-hidden="true" /><span>Research guidance, not verified findings. Source publication dates unknown.</span></p>
      <div className="mr-city-grid">{markets.map(market => {
        const guide = CITY_RESEARCH_GUIDES[market.id];
        const prompt = guide?.prompts[cityLens] ?? currentCityLens;
        const directories = getCityQuestionDirectories(market, cityLens);
        const selected = selectedCountries.includes(market.id);
        const saved = planSession.plans.questions[market.id]?.includes(cityLens) ?? false;
        const hasFinding = Boolean(planSession.plans.findings[market.id]?.[cityLens]);
        let saveLabel = saved ? 'Saved to plan' : 'Save question';
        if (!selected) saveLabel = saved ? 'Restore market to plan' : 'Shortlist & save';
        return <article className="mr-city" id={`city-research-${market.id}`} tabIndex={-1} aria-labelledby={`city-name-${market.id}`} key={market.id}>
          <div className="mr-city-scene"><MarketScene marketId={market.id} /></div>
          <div className="mr-city-top"><span className="mr-flag" aria-hidden="true">{market.flag}</span><span>{market.name}</span><MapPin size={17} aria-hidden="true" /></div>
          <div className="mr-city-name"><h3 id={`city-name-${market.id}`}>{market.city}</h3><small>{guide?.scope ?? 'City research starting point'}</small></div>
          <div className="mr-city-question"><currentCityLens.icon size={18} aria-hidden="true" /><div><strong>{prompt.question}</strong><p>{prompt.detail}</p></div></div>
          <div className="mr-city-sources">
            {directories.map(({ source, label }) => <SourceLink key={source.url} url={source.url} label={source.name}>
              <span>{source.name}<small>{label} · discovery link</small></span>
            </SourceLink>)}
          </div>
          {guide && <div className="mr-question-actions">
            {!(selected && hasFinding) && <button type="button" className="mr-save-question" aria-pressed={selected && saved} onClick={() => {
              if (!selected) onIncludeMarket(market.id);
              planSession.setQuestionSaved(market.id, cityLens, !selected || !saved);
            }}>
              {saved && selected ? <Check size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
              {saveLabel}
            </button>}
            {selected && saved && <a href={`#/plan/question/${market.id}/${cityLens}`} className="mr-text-button">{hasFinding ? 'View finding in plan' : 'Add finding in plan'} <ArrowRight size={14} aria-hidden="true" /></a>}
          </div>}
        </article>;
      })}</div>
      {!planSession.savedLocally && <p className="mr-city-guide-note" role="status">Your plan is available in this session. Export it before reloading.</p>}
      <div className="mr-inline-action"><span>Keep the next step for your shortlisted markets.</span><button className="mr-text-button" onClick={onPlan}>Open your market plan <ArrowRight size={14} aria-hidden="true" /></button></div>
    </>}

    {mode === 'industries' && <>
      <div className="mr-section-heading"><div><span className="mr-eyebrow">START WITH YOUR BUSINESS MODEL</span><h2>Different industries. Different questions.</h2></div><Scope markets={markets} all={!selectedCountries.length} /></div>
      <div className="mr-industry-tabs" role="group" aria-label="Choose an industry">
        {INDUSTRIES.map(item => {
          const Icon = INDUSTRY_ICONS[item.id];
          return <button key={item.id} aria-pressed={industry.id === item.id} onClick={() => setIndustryId(item.id)}>
            <Icon size={17} aria-hidden="true" />{item.shortName}
          </button>;
        })}
      </div>
      <div className="mr-industry-intro"><span className="mr-industry-icon"><IndustryIcon size={27} aria-hidden="true" /></span><div><span className="mr-eyebrow">{industry.name}</span><h3>{industry.question}</h3><p>{industry.subtitle}</p></div></div>
      <div className="mr-angle-grid">{ANGLES.map(angle => {
        const fieldwork = industry.angles[angle.id];
        return <details className="mr-angle" key={angle.id}>
          <summary>
            <span className="mr-angle-icon"><angle.icon size={19} aria-hidden="true" /></span>
            <span className="mr-angle-summary-text"><strong>{angle.title}</strong><small>{angle.subtitle}</small></span>
            <ChevronRight size={15} aria-hidden="true" />
          </summary>
          <ul>{fieldwork.questions.map(question => <li key={question}><span aria-hidden="true" /><span>{question}</span></li>)}</ul>
          <dl className="mr-fieldwork">
            <dt>Evidence to collect</dt><dd>{fieldwork.evidence}</dd>
            <dt>Decision to make</dt><dd>{fieldwork.decision}</dd>
          </dl>
          {angle.id === 'costs' && <CostWorksheetLink markets={markets} shortlisted={selectedCountries} onIncludeMarket={onIncludeMarket} />}
        </details>;
      })}</div>
      <IndustryDirectories markets={markets} />
      <div className="mr-inline-action"><span>Turn these questions into a market comparison.</span><button className="mr-text-button" onClick={onCompare}>Compare your shortlist <ArrowRight size={14} aria-hidden="true" /></button></div>
    </>}

    {mode === 'insights' && <>
      <div className="mr-section-heading"><div><span className="mr-eyebrow">MARKET INTELLIGENCE STARTS WITH A GOOD QUESTION</span><h2>Find a source for the next decision.</h2></div><Scope markets={markets} all={!selectedCountries.length} /></div>
      <div className="mr-lens-tabs" role="group" aria-label="Intelligence topic">{INSIGHT_LENSES.map(lens => <button key={lens.id} aria-pressed={insightLens === lens.id} onClick={() => setInsightLens(lens.id)}><lens.icon size={15} aria-hidden="true" />{lens.label}</button>)}</div>
      <div className="mr-insight-intro"><currentInsightLens.icon size={22} aria-hidden="true" /><div><h3>{currentInsightLens.question}</h3><p>{currentInsightLens.description}</p></div></div>
      <div className="mr-portal-grid">{markets.map(market => {
        const portal = insightLens === 'setup' ? market.setup : insightLens === 'demand' ? market.statistics : market.cityPortal;
        const regional = insightLens === 'setup' && market.regionalSetup;
        return <article className="mr-portal" key={market.id}>
          <div><span className="mr-flag" aria-hidden="true">{market.flag}</span><span className="mr-portal-country">{market.name}</span><ArrowUpRight size={18} aria-hidden="true" /></div>
          <h3>{portal.name}</h3>
          <p>{insightLens === 'setup' ? 'Explore activity, registration and operating questions.' : insightLens === 'demand' ? 'Look for relevant datasets, definitions and observation periods.' : `Explore the city context around ${market.city}.`}</p>
          <SourceLink url={portal.url}>{regional ? 'National registration directory' : 'Open source directory'}</SourceLink>
          {regional && <SourceLink url={regional.url}>{regional.name}</SourceLink>}
        </article>;
      })}</div>
    </>}

    {mode === 'cases' && <>
      <div className="mr-section-heading"><div><span className="mr-eyebrow">LEARN FROM THE MODEL, NOT JUST THE HEADLINE</span><h2>Make a case study useful to your business.</h2><p>Separate what happened, why it happened and what would need to be true for you.</p></div><BookOpen size={28} className="mr-heading-icon" aria-hidden="true" /></div>
      <div className="mr-case-grid">{[
        { icon: Compass, label: 'The entry', title: 'How did the business get in?', items: ['Customer and route to market', 'Partner, channel or local team', 'Starting assumptions and timing'] },
        { icon: Package, label: 'The operating model', title: 'What made delivery work?', items: ['Pricing and customer retention', 'Cost, supply chain and execution', 'Local adaptation and constraints'] },
        { icon: Search, label: 'The evidence', title: 'What can you actually verify?', items: ['Source and observation period', 'Geographic and industry scope', 'Outcomes versus company claims'] },
      ].map(item => <section className="mr-case" key={item.label}><span><item.icon size={23} aria-hidden="true" /></span><small>{item.label}</small><h3>{item.title}</h3><ul>{item.items.map(value => <li key={value}><Check size={13} aria-hidden="true" />{value}</li>)}</ul></section>)}</div>
      <div className="mr-reference-invitation"><div><span className="mr-eyebrow">OPTIONAL REFERENCE LIBRARY</span><h3>Explore the existing case-study examples.</h3><p>Unverified company narratives and figures are labelled as reference material, not current benchmarks.</p></div><button className="mr-secondary" onClick={onReference}>View unverified case examples <ArrowUpRight size={16} aria-hidden="true" /></button></div>
    </>}

    {mode === 'data' && <>
      <MarketFundamentals selectedCountries={selectedCountries} onCompare={onCompare} />
      <div className="mr-data-actions"><div><span className="mr-eyebrow">FOLLOW THE SERIES</span><h3>Explore the source datasets.</h3></div><div><button className="mr-primary" onClick={onOpenData}>Open data explorer <ArrowRight size={16} aria-hidden="true" /></button><button className="mr-text-button" onClick={onOpenReports}>Browse source library <ArrowUpRight size={14} aria-hidden="true" /></button></div></div>
      <div className="mr-dataset-grid">{DATASETS.map(dataset => <a className="mr-dataset" key={dataset.code} href={`https://data.worldbank.org/indicator/${dataset.code}`} target="_blank" rel="noopener noreferrer"><div><dataset.icon size={21} aria-hidden="true" /><ArrowUpRight size={15} aria-hidden="true" /></div><h3>{dataset.name}</h3><span>Annual country series</span><strong>{dataset.unit}</strong><small>World Bank · indicator directory</small></a>)}</div>
      <div className="mr-data-legend"><span><Database size={14} aria-hidden="true" /> Source</span><ChevronRight size={12} aria-hidden="true" /><span>Observation period</span><ChevronRight size={12} aria-hidden="true" /><span>Available coverage</span><p>Dataset links are discovery resources. They are not retrieved observations or a connected live feed.</p></div>
    </>}
    <SourceScope />
  </div>;
}
