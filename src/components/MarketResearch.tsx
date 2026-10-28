import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, BarChart3, BookOpen, Building2, Check, ChevronRight, Compass, Database, Factory, Globe2, MapPin, Package, Scale, Search, ShieldCheck, ShoppingBag, Smartphone, Truck, Users, UtensilsCrossed, Wallet } from 'lucide-react';
import { MARKETS, type MarketGuide } from '../data/marketCatalog';
import MarketFundamentals from './MarketFundamentals';
import MarketScene from './visual/MarketScene';
import './MarketResearch.css';

export type ResearchMode = 'overview' | 'cities' | 'industries' | 'insights' | 'cases' | 'data';

interface MarketResearchProps {
  mode: ResearchMode;
  selectedCountries: string[];
  onPlan: () => void;
  onReference: () => void;
  onCompare: () => void;
  onOpenData: () => void;
  onOpenReports: () => void;
}

type ResearchAngle = 'demand' | 'costs' | 'setup';
type CityLens = 'customers' | 'location' | 'setup';
type InsightLens = 'setup' | 'demand' | 'operations';

interface IndustryGuide {
  id: string;
  name: string;
  shortName: string;
  icon: typeof Smartphone;
  question: string;
  subtitle: string;
  angles: Record<ResearchAngle, [string, string]>;
}

const INDUSTRIES: readonly IndustryGuide[] = [
  {
    id: 'technology', name: 'Technology & software', shortName: 'Technology', icon: Smartphone,
    question: 'Who will buy first—and what needs to work locally?',
    subtitle: 'Look beyond adoption headlines to customers, distribution and delivery.',
    angles: {
      demand: ['Which customer has a problem they will pay to solve?', 'Which language, sales channel and support model do they expect?'],
      costs: ['What will local sales, support and cloud delivery cost?', 'Can the same product and payment flow serve both markets?'],
      setup: ['Which data, payment or sector rules apply to the actual service?', 'Does selling remotely differ from employing or operating locally?'],
    },
  },
  {
    id: 'food-beverage', name: 'Food & beverage', shortName: 'Food & beverage', icon: UtensilsCrossed,
    question: 'Does the location work as well as the concept?',
    subtitle: 'Research the customer occasion, supply chain and specific premises together.',
    angles: {
      demand: ['Who buys, on which occasions and at what price?', 'What do nearby alternatives reveal about menu, format and demand?'],
      costs: ['What do rent, fit-out, ingredients and delivery actually cost?', 'How do cold storage, wastage and staffing change the margin?'],
      setup: ['Which food, premises and activity approvals need checking?', 'Which import, labelling and employment requirements fit this model?'],
    },
  },
  {
    id: 'retail', name: 'Retail & commerce', shortName: 'Retail', icon: ShoppingBag,
    question: 'Where will customers find you—and what brings them back?',
    subtitle: 'Compare a real route to the customer, not just the size of the market.',
    angles: {
      demand: ['Is the first route a store, marketplace, distributor or direct sales?', 'Which local competitors set expectations on price and service?'],
      costs: ['What are the landed cost, fulfilment cost and return rate?', 'How do leases, inventory and payment terms affect cash needs?'],
      setup: ['Which product, consumer and import requirements need review?', 'Do store operations and online sales have different obligations?'],
    },
  },
  {
    id: 'manufacturing', name: 'Manufacturing', shortName: 'Manufacturing', icon: Factory,
    question: 'Can the operating site support the whole production model?',
    subtitle: 'Bring demand, supplier access and site requirements into the same comparison.',
    angles: {
      demand: ['Who is the anchor customer, and where is the demand served?', 'What quality, certification and delivery standards do buyers need?'],
      costs: ['What do site, power, labour and logistics quotes include?', 'Which imported inputs or supplier dependencies affect lead times?'],
      setup: ['Which site, environmental and industrial approvals need review?', 'What customs, workforce and activity conditions fit the project?'],
    },
  },
  {
    id: 'professional-services', name: 'Professional services', shortName: 'Services', icon: Users,
    question: 'How will trust turn into a repeatable client pipeline?',
    subtitle: 'Test the buying relationship, delivery team and scope of the service.',
    angles: {
      demand: ['Which client segment buys the service, and who approves it?', 'Do clients expect a local team, partner or professional credential?'],
      costs: ['What does the delivery team cost at the intended utilisation?', 'How do sales cycles, collections and travel affect working capital?'],
      setup: ['Is the service or professional title subject to local regulation?', 'Which contracting, employment and tax questions need an adviser?'],
    },
  },
  {
    id: 'logistics', name: 'Logistics & delivery', shortName: 'Logistics', icon: Truck,
    question: 'Where does the route make operational and commercial sense?',
    subtitle: 'Research the actual lane, customer density and delivery commitments.',
    angles: {
      demand: ['Which route and customer segment have a clear service gap?', 'What delivery speed, reliability and returns service do buyers need?'],
      costs: ['What do warehouse, vehicle, labour and last-mile quotes include?', 'How do utilisation, empty trips and border delays affect the model?'],
      setup: ['Which transport, storage and cross-border permissions need review?', 'Are any goods subject to additional handling or customs conditions?'],
    },
  },
];

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

function SourceLink({ url, children, className = '' }: { url: string; children: ReactNode; className?: string }) {
  return <a className={`mr-source-link ${className}`} href={url} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={15} aria-hidden="true" /></a>;
}

function Scope({ markets, all }: { markets: readonly MarketGuide[]; all: boolean }) {
  return <div className="mr-scope"><span>{all ? 'All markets' : 'Your shortlist'}</span><div>{markets.map(market => <span key={market.id} title={market.name} aria-label={market.name}>{market.flag}</span>)}</div></div>;
}

function SourceScope() {
  return <details className="mr-source-scope"><summary><ShieldCheck size={14} aria-hidden="true" /><span>Discovery guides · sources & scope</span><ChevronRight size={13} aria-hidden="true" /></summary><p>Research questions and curated government-domain links are discovery guides, not current market findings or legal requirements. Historical snapshots carry their own source and observation-year details. Portal content, reachability, publication dates and applicability have not been verified here. Check the relevant authority and qualified local advisers before acting. Numeric reference examples are separate and require an explicit choice.</p></details>;
}

export default function MarketResearch({ mode, selectedCountries, onPlan, onReference, onCompare, onOpenData, onOpenReports }: MarketResearchProps) {
  const [industryId, setIndustryId] = useState('technology');
  const [cityLens, setCityLens] = useState<CityLens>('customers');
  const [insightLens, setInsightLens] = useState<InsightLens>('setup');
  const markets = selectedCountries.length ? MARKETS.filter(market => selectedCountries.includes(market.id)) : MARKETS;
  const industry = INDUSTRIES.find(item => item.id === industryId)!;
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
      <div className="mr-city-grid">{markets.map(market => <article className="mr-city" id={`city-research-${market.id}`} tabIndex={-1} aria-labelledby={`city-name-${market.id}`} key={market.id}><div className="mr-city-scene"><MarketScene marketId={market.id} /></div><div className="mr-city-top"><span className="mr-flag" aria-hidden="true">{market.flag}</span><span>{market.name}</span><MapPin size={17} aria-hidden="true" /></div><div className="mr-city-name"><h3 id={`city-name-${market.id}`}>{market.city}</h3>{market.id === 'indonesia' || market.id === 'philippines' ? <small>{market.id === 'indonesia' ? 'Province scope in your plan' : 'City of Manila scope in your plan'}</small> : <small>City research starting point</small>}</div><div className="mr-city-question"><currentCityLens.icon size={18} aria-hidden="true" /><div><strong>{currentCityLens.question}</strong><p>{currentCityLens.detail}</p></div></div><SourceLink url={market.cityPortal.url}>{market.cityPortal.name}</SourceLink></article>)}</div>
      <div className="mr-inline-action"><span>Working through Jakarta or Manila?</span><button className="mr-text-button" onClick={onPlan}>Keep your research in an entry plan <ArrowRight size={14} aria-hidden="true" /></button></div>
    </>}

    {mode === 'industries' && <>
      <div className="mr-section-heading"><div><span className="mr-eyebrow">START WITH YOUR BUSINESS MODEL</span><h2>Different industries. Different questions.</h2></div><Scope markets={markets} all={!selectedCountries.length} /></div>
      <div className="mr-industry-tabs" role="group" aria-label="Choose an industry">{INDUSTRIES.map(item => <button key={item.id} aria-pressed={industry.id === item.id} onClick={() => setIndustryId(item.id)}><item.icon size={17} aria-hidden="true" />{item.shortName}</button>)}</div>
      <div className="mr-industry-intro"><span className="mr-industry-icon"><industry.icon size={27} aria-hidden="true" /></span><div><span className="mr-eyebrow">{industry.name}</span><h3>{industry.question}</h3><p>{industry.subtitle}</p></div></div>
      <div className="mr-angle-grid">{ANGLES.map((angle, index) => <details className="mr-angle" key={angle.id}><summary><span className="mr-angle-step" aria-hidden="true">0{index + 1}</span><span className="mr-angle-icon"><angle.icon size={19} aria-hidden="true" /></span><span className="mr-angle-summary-text"><strong>{angle.title}</strong><small>{angle.subtitle}</small></span><ChevronRight size={15} aria-hidden="true" /></summary><ul>{industry.angles[angle.id].map(question => <li key={question}><span aria-hidden="true" /><span>{question}</span></li>)}</ul></details>)}</div>
      <div className="mr-inline-action"><span>Turn these questions into a market comparison.</span><button className="mr-text-button" onClick={onCompare}>Compare your shortlist <ArrowRight size={14} aria-hidden="true" /></button></div>
    </>}

    {mode === 'insights' && <>
      <div className="mr-section-heading"><div><span className="mr-eyebrow">MARKET INTELLIGENCE STARTS WITH A GOOD QUESTION</span><h2>Find a source for the next decision.</h2></div><Scope markets={markets} all={!selectedCountries.length} /></div>
      <div className="mr-lens-tabs" role="group" aria-label="Intelligence topic">{INSIGHT_LENSES.map(lens => <button key={lens.id} aria-pressed={insightLens === lens.id} onClick={() => setInsightLens(lens.id)}><lens.icon size={15} aria-hidden="true" />{lens.label}</button>)}</div>
      <div className="mr-insight-intro"><currentInsightLens.icon size={22} aria-hidden="true" /><div><h3>{currentInsightLens.question}</h3><p>{currentInsightLens.description}</p></div></div>
      <div className="mr-portal-grid">{markets.map(market => {
        const portal = insightLens === 'setup' ? market.setup : insightLens === 'demand' ? market.statistics : market.cityPortal;
        return <article className="mr-portal" key={market.id}><div><span className="mr-flag" aria-hidden="true">{market.flag}</span><span className="mr-portal-country">{market.name}</span><ArrowUpRight size={18} aria-hidden="true" /></div><h3>{portal.name}</h3><p>{insightLens === 'setup' ? 'Explore activity, registration and operating questions.' : insightLens === 'demand' ? 'Look for relevant datasets, definitions and observation periods.' : `Explore the city context around ${market.city}.`}</p><SourceLink url={portal.url}>Open source directory</SourceLink></article>;
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
