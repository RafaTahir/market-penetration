import assert from 'node:assert/strict';
import test from 'node:test';
import { MARKETS } from '../src/data/marketCatalog.ts';
import { buildMarketPlanExport, createMarketPlans, MAX_NEXT_STEP_LENGTH, MAX_FINDING_TEXT_LENGTH, MAX_FINDING_SOURCE_LENGTH, setMarketFinding, setMarketQuestionSaved, setMarketScenario, updateMarketNextStep } from '../src/services/marketPlans.ts';
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
  assert.equal(file.version, 1);
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
    marketId: id, addToShortlist: true, note: 'add', scenario: 'add', addedQuestions: 1, findings: {},
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
    marketId: id, addToShortlist: false, note: 'keep-local', scenario: 'keep-local', addedQuestions: 1, findings: {},
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
    planFile(null), planFile([]), planFile([{ id: 'missing' }])]) {
    assert.throws(() => parseMarketPlanFile(text));
  }
  for (const version of [3, '2', null]) {
    assert.throws(() => parseMarketPlanFile(JSON.stringify({ version, contentType: 'user-market-plan-and-source-directory', markets: [{id}] })), /unsupported/);
  }
  const oversized = 'ä'.repeat(MAX_RESTORE_BYTES / 2 + 1);
  assert.ok(oversized.length < MAX_RESTORE_BYTES);
  assert.throws(() => parseMarketPlanFile(oversized), /1 MiB/);
});


test('restores personal findings per saved lens and preserves local findings on conflict', () => {
  const fromFile = {text: 'File note A', source: 'Interview A', observedOn: '2026-08-10'};
  const second = {text: 'File note B', source: '', observedOn: null};
  const existing = {...fromFile, source: 'Interview C', observedOn: null};
  let incoming = plannedMarket();
  for (const [lens, finding] of [['setup', fromFile], ['location', second]]) {
    incoming = setMarketQuestionSaved(incoming, id, lens, true);
    incoming = setMarketFinding(incoming, id, lens, finding);
  }
  const file = buildMarketPlanExport(incoming, [id], date);
  assert.equal(file.version, 2);
  assert.equal(buildMarketPlanExport(incoming, ['thailand'], date).version, 1);
  file.markets[0].savedResearchQuestions[0].sources = [{url: 'https://untrusted.invalid/fabricated-directory'}];
  const draft = parseMarketPlanFile(JSON.stringify(file));
  assert.deepEqual(draft.warnings, []);
  assert.deepEqual(draft.plans, incoming);
  const local = setMarketFinding(plannedMarket(), id, 'setup', existing);
  const before = structuredClone(local);
  const merged = previewMarketPlanRestore(local, [id], draft);
  assert.deepEqual(merged.effects[0].findings, {setup: 'keep-local', location: 'add'});
  assert.deepEqual(merged.plans.findings[id], {setup: existing, location: second});
  assert.deepEqual(local, before);
  const again = previewMarketPlanRestore(merged.plans, merged.countries, draft);
  assert.equal(again.changed, false);
  assert.equal(again.plans, merged.plans);
  assert.deepEqual(again.effects[0].findings, {setup: 'keep-local', location: 'same'});
  assert.ok(!JSON.stringify(buildMarketPlanExport(again.plans, [id])).includes('untrusted.invalid'));
});

test('only recognized questions can import tagged, valid findings; old files with no finding stay valid', () => {
  const question = (lens, userFinding) => ({ lens, kind: 'unverified-research-prompt', userFinding });
  const finding = {kind: 'user-entered-research-finding', text: 'A saved answer', source: 'Interview', observedOn: null};
  for (const invalid of [
    { ...finding, kind: 'official-guidance' }, { ...finding, text: '' }, { ...finding, source: {} },
    { ...finding, text: 'x'.repeat(MAX_FINDING_TEXT_LENGTH + 1) }, { ...finding, observedOn: '2026-02-30' },
  ]) {
    const draft = parseMarketPlanFile(planFile([{ id, savedResearchQuestions: [question('setup', invalid)] }]));
    assert.deepEqual(draft.plans.questions[id], ['setup']);
    assert.deepEqual(draft.plans.findings, {});
    assert.match(draft.warnings.join(' '), /invalid.*finding/);
  }
  const draft = parseMarketPlanFile(planFile([{ id, savedResearchQuestions: [
    question('setup'), question('location', null), question('__proto__', finding),
    { ...question('customers', finding), kind: 'unrecognized-prompt' },
  ] }]));
  assert.deepEqual(draft.plans.questions[id], ['setup', 'location']);
  assert.deepEqual(draft.plans.findings, {});
  assert.deepEqual(parseMarketPlanFile(planFile([{ id, savedResearchQuestions: [question('setup')] }])).warnings, []);
});

test('all markets with full-size international and JSON-escaped personal entries fit the restore limit', () => {
  const text = limit => '\u0000界'.repeat(Math.ceil(limit / 2)).slice(0, limit);
  let plans = createMarketPlans();
  for (const market of MARKETS) {
    plans = updateMarketNextStep(plans, market.id, text(MAX_NEXT_STEP_LENGTH), date);
    for (const lens of ['customers', 'location', 'setup']) {
      plans = setMarketQuestionSaved(plans, market.id, lens, true);
      plans = setMarketFinding(plans, market.id, lens, {
        text: text(MAX_FINDING_TEXT_LENGTH), source: text(MAX_FINDING_SOURCE_LENGTH), observedOn: null,
      });
    }
  }
  const ids = MARKETS.map(m => m.id);
  const exported = JSON.stringify(buildMarketPlanExport(plans, ids, date), null, 2);
  assert.ok(Buffer.byteLength(exported) > 256 * 1024);
  assert.ok(Buffer.byteLength(exported) <= MAX_RESTORE_BYTES);
  const draft = parseMarketPlanFile(exported);
  assert.deepEqual(draft.warnings, []);
  assert.deepEqual(draft.plans, plans);
});
