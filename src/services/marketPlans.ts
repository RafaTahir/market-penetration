import { MARKETS, type MarketGuide } from '../data/marketCatalog.ts';
import { CITY_RESEARCH_GUIDES, type CityResearchLens } from '../data/cityResearchGuides.ts';

/** Personal planning notes are independent of the scored city notebook. */
export const MARKET_PLANS_KEY = 'flow-market-plans-v1';
export const MAX_NEXT_STEP_LENGTH = 2000;

export interface MarketNextStep {
  nextStep: string;
  /** The user's edit time, never a source observation/publication date. */
  updatedAt: string | null;
}

export interface MarketPlansState {
  version: 1;
  notes: Partial<Record<string, MarketNextStep>>;
  questions: Partial<Record<string, CityResearchLens[]>>;
}

const supportedMarkets = new Set(MARKETS.map(market => market.id));

export function createMarketPlans(): MarketPlansState {
  return { version: 1, notes: {}, questions: {} };
}

function isSupportedQuestion(marketId: string, lens: unknown): lens is CityResearchLens {
  if (!supportedMarkets.has(marketId) || typeof lens !== 'string') return false;
  const guide = CITY_RESEARCH_GUIDES[marketId];
  return Boolean(guide && Object.prototype.hasOwnProperty.call(guide.prompts, lens));
}

export function getCityQuestionSources(market: MarketGuide, lens: CityResearchLens) {
  if (lens === 'customers') return [market.statistics];
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
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) return result;
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
  return result;
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
  const previous = state.questions[marketId] ?? [];
  if (previous.includes(lens) === saved) return state;
  const next = saved ? [...previous, lens] : previous.filter(item => item !== lens);
  const questions = { ...state.questions };
  if (next.length) questions[marketId] = next;
  else delete questions[marketId];
  return { ...state, questions };
}

export function buildMarketPlanExport(state: MarketPlansState, selectedCountries: readonly string[], exportedAt = new Date().toISOString()) {
  const markets = MARKETS.filter(market => selectedCountries.includes(market.id));
  const plans = parseMarketPlans(state);
  return {
    version: 1,
    contentType: 'user-market-plan-and-source-directory',
    exportedAt,
    limitation: 'Personal next steps are user-entered, unverified planning notes, not observed market facts, legal advice or a business-fit assessment. Official links are curated research starting points; source contents, publication dates and current applicability have not been verified. Edit and export times are not source observation dates. No preparation score or survival probability is supplied for these market plans.',
    detailedNotebookCoverage: ['Jakarta province, excluding Greater Jakarta', 'City of Manila, excluding the rest of Metro Manila'],
    markets: markets.map(market => ({
      id: market.id,
      country: market.name,
      countryCode: market.countryCode,
      cityResearchStartingPoint: market.city,
      userNextStep: plans.notes[market.id]?.nextStep ?? '',
      noteEditedAt: plans.notes[market.id]?.updatedAt ?? null,
      savedResearchQuestions: (plans.questions[market.id] ?? []).map(lens => ({
        lens,
        kind: 'unverified-research-prompt' as const,
        question: CITY_RESEARCH_GUIDES[market.id].prompts[lens].question,
        sources: getCityQuestionSources(market, lens),
      })),
      sources: {
        businessSetup: market.setup,
        countryStatistics: market.statistics,
        cityAndLocation: market.cityPortal,
        sourcePublicationDate: null,
        sourceContentsVerified: false,
      },
    })),
  };
}
