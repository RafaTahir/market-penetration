import { MARKETS } from '../data/marketCatalog.ts';
import { CITY_RESEARCH_GUIDES, type CityResearchLens } from '../data/cityResearchGuides.ts';
import { parseMarketEconomics, type MarketEconomicsInputs } from './marketEconomics.ts';
import {
  createMarketPlans, MAX_NEXT_STEP_LENGTH, parseResearchFinding, sameResearchFinding, updateMarketNextStep,
  MAX_FINDING_TEXT_LENGTH, MAX_FINDING_SOURCE_LENGTH, type MarketPlansState, type ResearchFinding,
} from './marketPlans.ts';

export const MAX_RESTORE_BYTES = 1024 * 1024;

export interface RestoreDraft {
  marketIds: string[];
  plans: MarketPlansState;
  warnings: string[];
}

type FieldEffect = 'none' | 'add' | 'same' | 'keep-local';

export interface RestoreEffect {
  marketId: string;
  addToShortlist: boolean;
  note: FieldEffect;
  scenario: FieldEffect;
  addedQuestions: number;
  findings: Partial<Record<CityResearchLens, Exclude<FieldEffect, 'none'>>>;
}

const marketsById = new Map(MARKETS.map(market => [market.id, market]));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readQuestions(value: unknown, marketId: string, name: string, plans: MarketPlansState, warnings: Set<string>) {
  if (value === undefined) return; // Older files predate saved questions.
  const unrecognized = `Skipped unrecognized research questions for ${name}.`;
  if (!Array.isArray(value)) { warnings.add(unrecognized); return; }

  const lenses = new Set<CityResearchLens>();
  const prompts = CITY_RESEARCH_GUIDES[marketId]?.prompts;
  const findings: Partial<Record<CityResearchLens, ResearchFinding>> = {};
  for (const entry of value) {
    if (!isRecord(entry) || entry.kind !== 'unverified-research-prompt' || typeof entry.lens !== 'string'
      || !prompts || !Object.prototype.hasOwnProperty.call(prompts, entry.lens)) {
      warnings.add(unrecognized);
      continue;
    }

    const lens = entry.lens as CityResearchLens;
    lenses.add(lens);
    const raw = entry.userFinding;
    if (raw == null) continue;
    const finding = isRecord(raw) && raw.kind === 'user-entered-research-finding'
      && typeof raw.text === 'string' && raw.text.length <= MAX_FINDING_TEXT_LENGTH
      && !(typeof raw.source === 'string' && raw.source.length > MAX_FINDING_SOURCE_LENGTH)
      ? parseResearchFinding(raw) : null;
    if (!finding) {
      warnings.add(`Skipped an invalid ${name} ${lens} finding. The research question is still included.`);
    } else if (!findings[lens]) {
      findings[lens] = finding;
    } else if (!sameResearchFinding(findings[lens], finding)) {
      warnings.add(`Skipped a conflicting duplicate ${name} ${lens} finding. The first valid finding was used.`);
    }
  }
  if (lenses.size) plans.questions[marketId] = [...lenses];
  if (Object.keys(findings).length) plans.findings[marketId] = findings;
}

export function parseMarketPlanFile(text: string): RestoreDraft {
  if (text.length > MAX_RESTORE_BYTES || new TextEncoder().encode(text).length > MAX_RESTORE_BYTES) {
    throw new Error('Choose a market plan smaller than or equal to 1 MiB.');
  }
  let payload: unknown;
  try { payload = JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { throw new Error('This file could not be read as JSON. Choose a Flow market plan export.'); }
  if (!isRecord(payload) || payload.contentType !== 'user-market-plan-and-source-directory') {
    throw new Error('Choose a JSON file created with Export market plan.');
  }
  if (payload.version !== 1 && payload.version !== 2) throw new Error('This version of the market plan format is unsupported.');
  if (!Array.isArray(payload.markets)) throw new Error('The file is missing its list of markets.');

  const marketIds: string[] = [];
  const warnings = new Set<string>();
  let plans = createMarketPlans();
  let skipped = 0;
  for (const row of payload.markets) {
    if (!isRecord(row) || typeof row.id !== 'string' || !marketsById.has(row.id)) {
      skipped++;
      continue;
    }
    const id = row.id;
    const name = marketsById.get(id)!.name;
    if (marketIds.includes(id)) {
      warnings.add(`Skipped duplicate entries for ${name}. The first entry was used.`);
      continue;
    }
    marketIds.push(id);

    if (typeof row.userNextStep === 'string' && row.userNextStep.length <= MAX_NEXT_STEP_LENGTH) {
      if (row.userNextStep) {
        // A missing or invalid edit date stays unknown, including in older files.
        const edited = typeof row.noteEditedAt === 'string' ? row.noteEditedAt : '';
        plans = updateMarketNextStep(plans, id, row.userNextStep, edited);
        if (row.noteEditedAt != null && !plans.notes[id]?.updatedAt) {
          warnings.add(`The edit date for the ${name} note is unknown.`);
        }
      }
    } else if (row.userNextStep !== undefined) {
      warnings.add(`Skipped the invalid or oversized ${name} note.`);
    }

    readQuestions(row.savedResearchQuestions, id, name, plans, warnings);

    const scenario = row.breakEvenScenario;
    if (scenario != null) {
      const inputs = isRecord(scenario) && scenario.kind === 'user-entered-break-even-scenario'
        ? parseMarketEconomics(scenario.inputs) : null;
      if (inputs) plans.scenarios[id] = inputs;
      else warnings.add(`Skipped the invalid ${name} worksheet.`);
    }
  }
  if (!marketIds.length) throw new Error('This file contains no supported markets to restore.');
  if (skipped) warnings.add(`Skipped ${skipped} unknown or malformed market ${skipped === 1 ? 'entry' : 'entries'}.`);
  return { marketIds, plans, warnings: [...warnings] };
}

function sameScenario(left: MarketEconomicsInputs, right: MarketEconomicsInputs): boolean {
  return left.currency === right.currency && left.unitPrice === right.unitPrice
    && left.monthlyFixedCosts === right.monthlyFixedCosts && left.unitVariableCost === right.unitVariableCost;
}

/** Pure preview and merge. Call against current local state again when the user confirms. */
export function previewMarketPlanRestore(local: MarketPlansState, shortlist: readonly string[], draft: RestoreDraft) {
  const countries = [...shortlist];
  const plans = { ...local, notes: { ...local.notes }, scenarios: { ...local.scenarios }, questions: { ...local.questions }, findings: { ...local.findings } };
  const effects: RestoreEffect[] = [];
  let dataChanged = false;

  for (const marketId of draft.marketIds) {
    const effect: RestoreEffect = {
      marketId, addToShortlist: !countries.includes(marketId), note: 'none', scenario: 'none', addedQuestions: 0, findings: {},
    };
    if (effect.addToShortlist) countries.push(marketId);

    const note = draft.plans.notes[marketId];
    if (note) {
      const previous = local.notes[marketId];
      if (!previous) { plans.notes[marketId] = note; effect.note = 'add'; }
      else effect.note = previous.nextStep === note.nextStep ? 'same' : 'keep-local';
    }

    const scenario = draft.plans.scenarios[marketId];
    if (scenario) {
      const previous = local.scenarios[marketId];
      if (!previous) { plans.scenarios[marketId] = scenario; effect.scenario = 'add'; }
      else effect.scenario = sameScenario(previous, scenario) ? 'same' : 'keep-local';
    }

    const previousQuestions = local.questions[marketId] ?? [];
    const newQuestions = (draft.plans.questions[marketId] ?? []).filter(lens => !previousQuestions.includes(lens));
    if (newQuestions.length) {
      plans.questions[marketId] = [...previousQuestions, ...newQuestions];
      effect.addedQuestions = newQuestions.length;
    }
    for (const lens of draft.plans.questions[marketId] ?? []) {
      const finding = draft.plans.findings[marketId]?.[lens];
      if (!finding) continue;
      const previous = local.findings[marketId]?.[lens];
      if (previous) {
        effect.findings[lens] = sameResearchFinding(previous, finding) ? 'same' : 'keep-local';
      } else {
        effect.findings[lens] = 'add';
        plans.findings[marketId] = { ...plans.findings[marketId], [lens]: finding };
        dataChanged = true;
      }
    }
    if (effect.note === 'add' || effect.scenario === 'add' || effect.addedQuestions) dataChanged = true;
    effects.push(effect);
  }
  return { plans: dataChanged ? plans : local, countries, effects, changed: dataChanged || countries.length !== shortlist.length };
}
