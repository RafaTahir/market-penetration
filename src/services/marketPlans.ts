import { MARKETS, type MarketGuide } from '../data/marketCatalog.ts';
import { CITY_RESEARCH_GUIDES, type CityResearchLens } from '../data/cityResearchGuides.ts';

import { calculateMarketEconomics, ECONOMICS_LIMITATION, ECONOMICS_METHOD, parseMarketEconomics, type MarketEconomicsInputs } from './marketEconomics.ts';

/** Personal planning notes are independent of the scored city notebook. */
export const MARKET_PLANS_KEY = 'flow-market-plans-v1';
export const MAX_NEXT_STEP_LENGTH = 2000;
export const MAX_FINDING_TEXT_LENGTH = 1600;
export const MAX_FINDING_SOURCE_LENGTH = 400;

/** User-entered research with an optional citation and observation date. No verification or score is implied. */
export interface ResearchFinding {
  text: string;
  source: string;
  observedOn: string | null;
}

type MarketFindings = Partial<Record<CityResearchLens, ResearchFinding>>;

export function parseResearchFinding(value: unknown): ResearchFinding | null {
  if (!value || typeof value !== 'object' || !('text' in value) || typeof value.text !== 'string') return null;
  const text = value.text.trim().slice(0, MAX_FINDING_TEXT_LENGTH).trimEnd();
  if (!text) return null;
  const rawSource = 'source' in value ? value.source : '';
  if (typeof rawSource !== 'string') return null;
  const source = rawSource.trim().slice(0, MAX_FINDING_SOURCE_LENGTH).trimEnd();
  const date = 'observedOn' in value ? value.observedOn : null;
  if (date === null || date === '') return { text, source, observedOn: null };
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith('0000')) return null;
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) return null;
  return { text, source, observedOn: date };
}

export function sameResearchFinding(left?: ResearchFinding, right?: ResearchFinding): boolean {
  if (!left || !right) return left === right;
  return left.text === right.text && left.source === right.source && left.observedOn === right.observedOn;
}

export interface MarketNextStep {
  nextStep: string;
  /** The user's edit time, never a source observation/publication date. */
  updatedAt: string | null;
}

export interface MarketPlansState {
  version: 1;
  notes: Partial<Record<string, MarketNextStep>>;
  scenarios: Partial<Record<string, MarketEconomicsInputs>>;
  questions: Partial<Record<string, CityResearchLens[]>>;
  findings: Partial<Record<string, MarketFindings>>;
}

const supportedMarkets = new Set(MARKETS.map(market => market.id));

export function createMarketPlans(): MarketPlansState {
  return { version: 1, notes: {}, questions: {}, scenarios: {}, findings: {} };
}

function isSupportedQuestion(marketId: string, lens: unknown): lens is CityResearchLens {
  if (!supportedMarkets.has(marketId) || typeof lens !== 'string') return false;
  const guide = CITY_RESEARCH_GUIDES[marketId];
  return Boolean(guide && Object.prototype.hasOwnProperty.call(guide.prompts, lens));
}

export function getCityQuestionSources(market: MarketGuide, lens: CityResearchLens) {
  if (lens === 'customers') return market.cityStatistics ? [market.statistics, market.cityStatistics] : [market.statistics];
  if (lens === 'location') return [market.cityPortal];
  return [market.setup, market.cityPortal];
}

function editDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) return null;
  const canonical = new Date(value).toISOString();
  return canonical === value || canonical.replace('.000Z', 'Z') === value ? value : null;
}

export function parseMarketPlans(value: unknown): MarketPlansState {
  const result = createMarketPlans();
  if (!value || typeof value !== 'object' || !('version' in value) || (value.version !== 1 && value.version !== 2)) return result;
  const notes = 'notes' in value && value.notes && typeof value.notes === 'object' ? value.notes : {};
  for (const [id, note] of Object.entries(notes)) {
    if (!supportedMarkets.has(id) || !note || typeof note !== 'object' || !('nextStep' in note) || typeof note.nextStep !== 'string' || !note.nextStep) continue;
    result.notes[id] = {
      nextStep: note.nextStep.slice(0, MAX_NEXT_STEP_LENGTH),
      updatedAt: 'updatedAt' in note ? editDate(note.updatedAt) : null,
    };
  }
  if ('questions' in value && value.questions && typeof value.questions === 'object') {
    for (const [marketId, stored] of Object.entries(value.questions)) {
      if (!supportedMarkets.has(marketId) || !Array.isArray(stored)) continue;
      const lenses = stored.filter((lens): lens is CityResearchLens => isSupportedQuestion(marketId, lens));
      if (lenses.length) result.questions[marketId] = [...new Set(lenses)];
    }
  }
  if ('findings' in value && value.findings && typeof value.findings === 'object') {
    for (const [marketId, stored] of Object.entries(value.findings)) {
      if (!supportedMarkets.has(marketId) || !stored || typeof stored !== 'object') continue;
      for (const [lens, raw] of Object.entries(stored)) {
        if (!isSupportedQuestion(marketId, lens) || !result.questions[marketId]?.includes(lens)) continue;
        const finding = parseResearchFinding(raw);
        if (finding) (result.findings[marketId] ??= {})[lens] = finding;
      }
    }
  }
  if ('scenarios' in value && value.scenarios && typeof value.scenarios === 'object') {
    for (const [marketId, raw] of Object.entries(value.scenarios)) {
      if (!supportedMarkets.has(marketId)) continue;
      const inputs = parseMarketEconomics(raw);
      if (inputs) result.scenarios[marketId] = inputs;
    }
  }
  return result;
}

/** Persist v2 when an older client would lose findings on its next save. */
export function serializeMarketPlans(state: MarketPlansState) {
  const plans = parseMarketPlans(state);
  const version: 1 | 2 = Object.keys(plans.findings).length ? 2 : 1;
  return { ...plans, version };
}

export function updateMarketNextStep(state: MarketPlansState, marketId: string, text: string, updatedAt = new Date().toISOString()): MarketPlansState {
  if (!supportedMarkets.has(marketId)) return state;
  const notes = { ...state.notes };
  const nextStep = text.slice(0, MAX_NEXT_STEP_LENGTH);
  if (nextStep) notes[marketId] = { nextStep, updatedAt: editDate(updatedAt) };
  else delete notes[marketId];
  return { ...state, notes };
}

export function setMarketQuestionSaved(state: MarketPlansState, marketId: string, lens: CityResearchLens, saved: boolean): MarketPlansState {
  if (!isSupportedQuestion(marketId, lens)) return state;
  if (!saved && state.findings[marketId]?.[lens]) return state;
  const previous = state.questions[marketId] ?? [];
  if (previous.includes(lens) === saved) return state;
  const next = saved ? [...previous, lens] : previous.filter(item => item !== lens);
  const questions = { ...state.questions };
  if (next.length) questions[marketId] = next;
  else delete questions[marketId];
  return { ...state, questions };
}

export function setMarketFinding(state: MarketPlansState, marketId: string, lens: CityResearchLens, finding: ResearchFinding | null): MarketPlansState {
  if (!isSupportedQuestion(marketId, lens) || !state.questions[marketId]?.includes(lens)) return state;
  const next = finding === null ? undefined : parseResearchFinding(finding);
  if (next === null || sameResearchFinding(state.findings[marketId]?.[lens], next)) return state;
  const forMarket = { ...state.findings[marketId] };
  if (next) forMarket[lens] = next;
  else delete forMarket[lens];
  const findings = { ...state.findings };
  if (Object.keys(forMarket).length) findings[marketId] = forMarket;
  else delete findings[marketId];
  return { ...state, findings };
}

export function setMarketScenario(state: MarketPlansState, marketId: string, inputs: MarketEconomicsInputs | null): MarketPlansState {
  if (!supportedMarkets.has(marketId)) return state;
  const scenarios = { ...state.scenarios };
  if (inputs === null) {
    if (!scenarios[marketId]) return state;
    delete scenarios[marketId];
  } else {
    const draft = parseMarketEconomics(inputs);
    if (!draft) return state;
    scenarios[marketId] = draft;
  }
  return { ...state, scenarios };
}

function exportFinding(finding: ResearchFinding | undefined) {
  return finding ? { kind: 'user-entered-research-finding' as const, ...finding } : null;
}

function exportScenario(inputs: MarketEconomicsInputs | undefined) {
  if (!inputs) return null;
  return {
    kind: 'user-entered-break-even-scenario',
    inputs,
    result: calculateMarketEconomics(inputs),
    method: ECONOMICS_METHOD,
    limitation: ECONOMICS_LIMITATION,
  };
}

export function buildMarketPlanExport(state: MarketPlansState, selectedCountries: readonly string[], exportedAt = new Date().toISOString()) {
  const markets = MARKETS.filter(market => selectedCountries.includes(market.id));
  const plans = parseMarketPlans(state);
  const version: 1 | 2 = markets.some(market => plans.findings[market.id]) ? 2 : 1;
  return {
    version,
    contentType: 'user-market-plan-and-source-directory',
    exportedAt,
    limitation: 'Personal next steps are user-entered, unverified planning notes, not observed market facts, legal advice or a business-fit assessment. Saved findings, citations and observation dates are user-entered, unverified and excluded from scores. Official links are curated research starting points; source contents, publication dates and current applicability have not been verified. Edit and export times are not source observation dates. No preparation score or survival probability is supplied for these market plans.',
    detailedNotebookCoverage: ['Jakarta province, excluding Greater Jakarta', 'City of Manila, excluding the rest of Metro Manila'],
    markets: markets.map(market => ({
      id: market.id,
      country: market.name,
      region: market.region,
      countryCode: market.countryCode,
      cityResearchStartingPoint: market.city,
      userNextStep: plans.notes[market.id]?.nextStep ?? '',
      breakEvenScenario: exportScenario(plans.scenarios[market.id]),
      noteEditedAt: plans.notes[market.id]?.updatedAt ?? null,
      savedResearchQuestions: (plans.questions[market.id] ?? []).map(lens => ({
        lens,
        kind: 'unverified-research-prompt' as const,
        question: CITY_RESEARCH_GUIDES[market.id].prompts[lens].question,
        sources: getCityQuestionSources(market, lens),
        userFinding: exportFinding(plans.findings[market.id]?.[lens]),
      })),
      sources: {
        businessSetup: market.setup,
        countryStatistics: market.statistics,
        cityAndLocation: market.cityPortal,
        ...(market.cityStatistics && { cityStatistics: market.cityStatistics }),
        sourcePublicationDate: null,
        sourceContentsVerified: false,
      },
    })),
  };
}
