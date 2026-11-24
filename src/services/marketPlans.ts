import { MARKETS, type MarketGuide } from '../data/marketCatalog.ts';
import { CITY_RESEARCH_GUIDES, type CityResearchLens } from '../data/cityResearchGuides.ts';
import { getIndustryQuestion, INDUSTRY_ANGLE_LABELS, type IndustryQuestionId, type ResearchAngle } from '../data/industryGuides.ts';

import { calculateMarketEconomics, calculateMonthlySales, ECONOMICS_LIMITATION, ECONOMICS_METHOD, parseMarketEconomics, SALES_LIMITATION, SALES_METHOD, type MarketEconomicsInputs } from './marketEconomics.ts';

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

export type MarketQuestionId = CityResearchLens | IndustryQuestionId;
type MarketFindings = Partial<Record<MarketQuestionId, ResearchFinding>>;

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
  questions: Partial<Record<string, MarketQuestionId[]>>;
  findings: Partial<Record<string, MarketFindings>>;
}

const supportedMarkets = new Set(MARKETS.map(market => market.id));

export function createMarketPlans(): MarketPlansState {
  return { version: 1, notes: {}, questions: {}, scenarios: {}, findings: {} };
}

export function isCityQuestion(marketId: string, lens: unknown): lens is CityResearchLens {
  if (!supportedMarkets.has(marketId) || typeof lens !== 'string') return false;
  const guide = CITY_RESEARCH_GUIDES[marketId];
  return Boolean(guide && Object.prototype.hasOwnProperty.call(guide.prompts, lens));
}

function isSupportedQuestion(marketId: string, id: unknown): id is MarketQuestionId {
  return isCityQuestion(marketId, id) || (supportedMarkets.has(marketId) && getIndustryQuestion(id) !== undefined);
}

export function getCityQuestionDirectories(market: MarketGuide, lens: CityResearchLens) {
  if (lens === 'customers') {
    const directories = [{ label: 'Dataset geography & dates', source: market.statistics }];
    if (market.cityStatistics) directories.push({ label: 'City datasets & geography', source: market.cityStatistics });
    return directories;
  }
  if (lens === 'location') return [{ label: 'Address & local authority', source: market.cityPortal }];
  const directories = [{ label: 'National setup enquiries', source: market.setup }];
  if (market.regionalSetup) directories.push({ label: 'Province or state registration', source: market.regionalSetup });
  directories.push({ label: 'Premises & address enquiries', source: market.cityPortal });
  return directories;
}

export function getCityQuestionSources(market: MarketGuide, lens: CityResearchLens) {
  return getCityQuestionDirectories(market, lens).map(entry => entry.source);
}

function getIndustryQuestionSources(market: MarketGuide, angle: ResearchAngle) {
  if (angle === 'costs') return [];
  return getCityQuestionSources(market, angle === 'demand' ? 'customers' : 'setup').map(source => ({ ...source }));
}

interface MarketQuestion {
  label: string;
  question: string;
  sources: MarketGuide['setup'][];
  fieldwork?: { evidence: string; decision: string };
}

const cityLensLabels: Record<CityResearchLens, string> = { customers: 'Customers', location: 'Location', setup: 'Setup' };

export function getMarketQuestion(market: MarketGuide, id: unknown): MarketQuestion | undefined {
  if (!supportedMarkets.has(market.id)) return undefined;
  if (isCityQuestion(market.id, id)) {
    return { label: cityLensLabels[id], question: CITY_RESEARCH_GUIDES[market.id].prompts[id].question, sources: getCityQuestionSources(market, id) };
  }
  const prompt = getIndustryQuestion(id);
  if (!prompt) return undefined;
  return {
    label: `${prompt.industryName} · ${INDUSTRY_ANGLE_LABELS[prompt.angle]}`,
    question: prompt.question,
    sources: getIndustryQuestionSources(market, prompt.angle),
    fieldwork: { evidence: prompt.evidence, decision: prompt.decision },
  };
}

function editDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) return null;
  const canonical = new Date(value).toISOString();
  return canonical === value || canonical.replace('.000Z', 'Z') === value ? value : null;
}

function normalizeMarketPlans(value: unknown, input: 'storage' | 'memory'): MarketPlansState {
  const result = createMarketPlans();
  if (!value || typeof value !== 'object' || !('version' in value) || (value.version !== 1 && value.version !== 2 && value.version !== 3 && value.version !== 4)) return result;
  const notes = 'notes' in value && value.notes && typeof value.notes === 'object' ? value.notes : {};
  for (const [id, note] of Object.entries(notes)) {
    if (!supportedMarkets.has(id) || !note || typeof note !== 'object' || !('nextStep' in note) || typeof note.nextStep !== 'string' || !note.nextStep) continue;
    result.notes[id] = {
      nextStep: note.nextStep.slice(0, MAX_NEXT_STEP_LENGTH),
      updatedAt: 'updatedAt' in note ? editDate(note.updatedAt) : null,
    };
  }
  if ('questions' in value && value.questions && typeof value.questions === 'object') {
    const supported = input === 'memory' || value.version === 4 ? isSupportedQuestion : isCityQuestion;
    for (const [marketId, stored] of Object.entries(value.questions)) {
      if (!supportedMarkets.has(marketId) || !Array.isArray(stored)) continue;
      const ids = new Set<MarketQuestionId>();
      for (const id of stored) if (supported(marketId, id)) ids.add(id);
      if (ids.size) result.questions[marketId] = [...ids];
    }
  }
  if ('findings' in value && value.findings && typeof value.findings === 'object') {
    for (const [marketId, stored] of Object.entries(value.findings)) {
      if (!supportedMarkets.has(marketId) || !stored || typeof stored !== 'object') continue;
      for (const id of result.questions[marketId] ?? []) {
        if (!Object.prototype.hasOwnProperty.call(stored, id)) continue;
        const finding = parseResearchFinding(stored[id]);
        if (finding) (result.findings[marketId] ??= {})[id] = finding;
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

export function parseMarketPlans(value: unknown): MarketPlansState {
  return normalizeMarketPlans(value, 'storage');
}

function hasMonthlySalesDraft(inputs: MarketEconomicsInputs | undefined): boolean {
  return inputs?.expectedMonthlyUnits !== undefined;
}

function planFormatVersion(plans: MarketPlansState, marketIds: readonly string[]): 1 | 2 | 3 | 4 {
  if (marketIds.some(id => plans.questions[id]?.some(question => getIndustryQuestion(question) !== undefined))) return 4;
  if (marketIds.some(id => hasMonthlySalesDraft(plans.scenarios[id]))) return 3;
  return marketIds.some(id => plans.findings[id]) ? 2 : 1;
}

/** New fields require a version that older clients refuse to overwrite. */
export function serializeMarketPlans(state: MarketPlansState) {
  const plans = normalizeMarketPlans(state, 'memory');
  return { ...plans, version: planFormatVersion(plans, [...supportedMarkets]) };
}

export function updateMarketNextStep(state: MarketPlansState, marketId: string, text: string, updatedAt = new Date().toISOString()): MarketPlansState {
  if (!supportedMarkets.has(marketId)) return state;
  const notes = { ...state.notes };
  const nextStep = text.slice(0, MAX_NEXT_STEP_LENGTH);
  if (nextStep) notes[marketId] = { nextStep, updatedAt: editDate(updatedAt) };
  else delete notes[marketId];
  return { ...state, notes };
}

export function setMarketQuestionSaved(state: MarketPlansState, marketId: string, id: MarketQuestionId, saved: boolean): MarketPlansState {
  if (!isSupportedQuestion(marketId, id)) return state;
  if (!saved && state.findings[marketId]?.[id]) return state;
  const previous = state.questions[marketId] ?? [];
  if (previous.includes(id) === saved) return state;
  const next = saved ? [...previous, id] : previous.filter(item => item !== id);
  const questions = { ...state.questions };
  if (next.length) questions[marketId] = next;
  else delete questions[marketId];
  return { ...state, questions };
}

export function setMarketFinding(state: MarketPlansState, marketId: string, id: MarketQuestionId, finding: ResearchFinding | null): MarketPlansState {
  if (!isSupportedQuestion(marketId, id) || !state.questions[marketId]?.includes(id)) return state;
  const next = finding === null ? undefined : parseResearchFinding(finding);
  if (next === null || sameResearchFinding(state.findings[marketId]?.[id], next)) return state;
  const forMarket = { ...state.findings[marketId] };
  if (next) forMarket[id] = next;
  else delete forMarket[id];
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

function exportSavedQuestions(plans: MarketPlansState, market: MarketGuide) {
  const ids = plans.questions[market.id] ?? [];
  const savedResearchQuestions = ids.filter((id): id is CityResearchLens => isCityQuestion(market.id, id)).map(lens => ({
    lens,
    kind: 'unverified-research-prompt' as const,
    question: CITY_RESEARCH_GUIDES[market.id].prompts[lens].question,
    sources: getCityQuestionSources(market, lens),
    userFinding: exportFinding(plans.findings[market.id]?.[lens]),
  }));
  const savedIndustryQuestions = ids.flatMap(id => {
    const prompt = getIndustryQuestion(id);
    if (!prompt) return [];
    return [{
      ...prompt,
      kind: 'unverified-industry-research-prompt' as const,
      sources: getIndustryQuestionSources(market, prompt.angle),
      userFinding: exportFinding(plans.findings[market.id]?.[id]),
    }];
  });
  return { savedResearchQuestions, ...(savedIndustryQuestions.length > 0 && { savedIndustryQuestions }) };
}

function exportScenario(inputs: MarketEconomicsInputs | undefined) {
  if (!inputs) return null;
  return {
    kind: 'user-entered-break-even-scenario',
    inputs,
    result: calculateMarketEconomics(inputs),
    method: ECONOMICS_METHOD,
    limitation: ECONOMICS_LIMITATION,
    ...(hasMonthlySalesDraft(inputs) && { monthlySales: {
      result: calculateMonthlySales(inputs),
      method: SALES_METHOD,
      limitation: SALES_LIMITATION,
    } }),
  };
}

export function buildMarketPlanExport(state: MarketPlansState, selectedCountries: readonly string[], exportedAt = new Date().toISOString()) {
  const markets = MARKETS.filter(market => selectedCountries.includes(market.id));
  const plans = normalizeMarketPlans(state, 'memory');
  const version = planFormatVersion(plans, markets.map(market => market.id));
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
      ...exportSavedQuestions(plans, market),
      sources: {
        businessSetup: market.setup,
        ...(market.regionalSetup && { regionalSetup: market.regionalSetup }),
        countryStatistics: market.statistics,
        cityAndLocation: market.cityPortal,
        ...(market.cityStatistics && { cityStatistics: market.cityStatistics }),
        sourcePublicationDate: null,
        sourceContentsVerified: false,
      },
    })),
  };
}
