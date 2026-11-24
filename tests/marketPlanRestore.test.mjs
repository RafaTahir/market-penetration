import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMarketPlanExport, createMarketPlans, MAX_NEXT_STEP_LENGTH, setMarketQuestionSaved, setMarketScenario, updateMarketNextStep } from '../src/services/marketPlans.ts';
import { MAX_RESTORE_BYTES, parseMarketPlanFile, previewMarketPlanRestore } from '../src/services/marketPlanRestore.ts';

const id = 'new-zealand';
const date = '2026-11-24T01:10:00.000Z';
const scenario = { currency: 'NZD', monthlyFixedCosts: '3.00', unitPrice: '.30', unitVariableCost: '.20' };

function plannedMarket() {
  let plans = updateMarketNextStep(createMarketPlans(), id, 'Check the council boundary.', date);
  plans = setMarketQuestionSaved(plans, id, 'setup', true);
  return setMarketScenario(plans, id, scenario);
}

function planFile(rows) {
  return JSON.stringify({ version: 1, contentType: 'user-market-plan-and-source-directory', markets: rows });
}

test('a full market plan file round trips using catalog links, canonical questions and recalculated results', () => {
  const original = plannedMarket();
  const file = buildMarketPlanExport(original, [id, 'singapore'], date);
  const row = file.markets.find(m => m.id === id);
  row.country = 'File-provided country label';
  row.sources.businessSetup = { name: 'Untrusted', url: 'https://untrusted.invalid' };
  row.savedResearchQuestions[0].question = 'File-provided wording';
  row.savedResearchQuestions[0].sources = [];
  row.breakEvenScenario.result.breakEvenUnits = -500;
  row.breakEvenScenario.method = 'File-provided calculation';
  const draft = parseMarketPlanFile(JSON.stringify(file));
  const restored = previewMarketPlanRestore(createMarketPlans(), [], draft);
  assert.deepEqual(draft.warnings, []);
  assert.equal(restored.changed, true);
  assert.deepEqual(restored.plans, original);
  assert.deepEqual(restored.effects.find(x => x.marketId === id), {
    marketId: id, addToShortlist: true, note: 'add', scenario: 'add', addedQuestions: 1,
  });
  const output = buildMarketPlanExport(restored.plans, restored.countries, date);
  assert.deepEqual(output, buildMarketPlanExport(original, [id, 'singapore'], date));
  assert.equal(output.markets.find(x => x.id === id).breakEvenScenario.result.breakEvenUnits, 30);
  assert.equal(JSON.stringify(output).includes('untrusted.invalid'), false);
});

test('restore preserves local notes and worksheets, unions saved lenses and can run twice', () => {
  const draft = parseMarketPlanFile(JSON.stringify(buildMarketPlanExport(plannedMarket(), [id, 'singapore'])));
  let local = updateMarketNextStep(createMarketPlans(), id, 'Already edited in this browser.', date);
  local = updateMarketNextStep(local, 'thailand', 'Unselected market note.', date);
  local = setMarketScenario(local, id, { ...scenario, currency: 'USD', unitPrice: '' });
  local = setMarketQuestionSaved(local, id, 'customers', true);
  const before = structuredClone(local);
  const result = previewMarketPlanRestore(local, ['thailand', id], draft);
  assert.deepEqual(local, before);
  assert.deepEqual(result.countries, ['thailand', id, 'singapore']);
  assert.deepEqual(result.plans.notes, local.notes);
  assert.deepEqual(result.plans.scenarios, local.scenarios);
  assert.deepEqual(result.plans.questions[id], ['customers', 'setup']);
  assert.deepEqual(result.effects.find(x => x.marketId === id), {
    marketId: id, addToShortlist: false, note: 'keep-local', scenario: 'keep-local', addedQuestions: 1,
  });
  const again = previewMarketPlanRestore(result.plans, result.countries, draft);
  assert.equal(again.changed, false);
  assert.equal(again.plans, result.plans);
  assert.deepEqual(again.countries, result.countries);
});

test('accepts original v1 export rows without newer fields and preserves unknown dates and incomplete drafts', () => {
  const draft = parseMarketPlanFile('\ufeff' + planFile([
    { id, userNextStep: 'Early note', noteEditedAt: '2026-02-30T00:00:00Z' },
    { id: 'thailand', userNextStep: '', noteEditedAt: null,
      breakEvenScenario: { kind: 'user-entered-break-even-scenario', inputs: { ...scenario, monthlyFixedCosts: '' } } },
  ]));
  assert.deepEqual(draft.plans.notes[id], { nextStep: 'Early note', updatedAt: null });
  assert.equal(draft.plans.scenarios[id], undefined);
  assert.equal(draft.plans.scenarios.thailand.monthlyFixedCosts, '');
  assert.deepEqual(draft.plans.questions, {});
  assert.equal(draft.warnings.length, 1);
});

test('skips duplicate, unsupported and malformed entries and invalid fields without trusting pasted source data', () => {
  const draft = parseMarketPlanFile(planFile([
    null, { id: '__proto__' }, { id: 'constructor' }, { id: 'later-market' },
    { id, userNextStep: 'a'.repeat(MAX_NEXT_STEP_LENGTH + 1), breakEvenScenario: { inputs: scenario },
      savedResearchQuestions: [
        { kind: 'unverified-research-prompt', lens: 'setup' }, { kind: 'unverified-research-prompt', lens: 'setup' },
        { lens: '__proto__', kind: 'unverified-research-prompt' }, { lens: 'customers', kind: 'evidence' },
      ] },
    { id, userNextStep: 'Ambiguous duplicate row' },
  ]));
  assert.deepEqual(draft.marketIds, [id]);
  assert.deepEqual(draft.plans.questions[id], ['setup']);
  assert.deepEqual(draft.plans.notes, {});
  assert.deepEqual(draft.plans.scenarios, {});
  assert.equal(draft.warnings.length, 5);
});

test('rejects unsupported documents and enforces the file limit in UTF-8 bytes', () => {
  for (const text of ['not json', 'null', '{}', '[]', '{"version":1,"contentType":"historical-country-snapshot-and-source-directory","markets":[]}',
    '{"version":2,"contentType":"user-market-plan-and-source-directory","markets":[]}', planFile(null), planFile([]), planFile([{ id: 'missing' }])]) {
    assert.throws(() => parseMarketPlanFile(text));
  }
  const oversized = 'ä'.repeat(MAX_RESTORE_BYTES / 2 + 1);
  assert.ok(oversized.length < MAX_RESTORE_BYTES);
  assert.throws(() => parseMarketPlanFile(oversized), /256 KiB/);
});
