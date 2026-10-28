import { MARKETS } from '../data/marketCatalog.ts';

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
}

const supportedMarkets = new Set(MARKETS.map(market => market.id));

export function createMarketPlans(): MarketPlansState {
  return { version: 1, notes: {} };
}

function editDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) return null;
  const canonical = new Date(value).toISOString();
  return canonical === value || canonical.replace('.000Z', 'Z') === value ? value : null;
}

export function parseMarketPlans(value: unknown): MarketPlansState {
  const result = createMarketPlans();
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('notes' in value) || !value.notes || typeof value.notes !== 'object') return result;
  for (const [id, note] of Object.entries(value.notes)) {
    if (!supportedMarkets.has(id) || !note || typeof note !== 'object' || !('nextStep' in note) || typeof note.nextStep !== 'string' || !note.nextStep) continue;
    result.notes[id] = {
      nextStep: note.nextStep.slice(0, MAX_NEXT_STEP_LENGTH),
      updatedAt: 'updatedAt' in note ? editDate(note.updatedAt) : null,
    };
  }
  return result;
}

export function updateMarketNextStep(state: MarketPlansState, marketId: string, text: string, updatedAt = new Date().toISOString()): MarketPlansState {
  if (!supportedMarkets.has(marketId)) return state;
  const notes = { ...state.notes };
  const nextStep = text.slice(0, MAX_NEXT_STEP_LENGTH);
  if (nextStep) notes[marketId] = { nextStep, updatedAt: editDate(updatedAt) };
  else delete notes[marketId];
  return { version: 1, notes };
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
