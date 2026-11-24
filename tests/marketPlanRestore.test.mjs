import assert from 'node:assert/strict';
import test from 'node:test';
import { MARKETS } from '../src/data/marketCatalog.ts';
import { INDUSTRY_QUESTION_IDS } from '../src/data/industryGuides.ts';
import { MAX_ECONOMICS_INPUT_LENGTH } from '../src/services/marketEconomics.ts';
import { buildMarketPlanExport, createMarketPlans, MAX_NEXT_STEP_LENGTH, MAX_FINDING_TEXT_LENGTH, MAX_FINDING_SOURCE_LENGTH, parseMarketPlans, serializeMarketPlans, setMarketFinding, setMarketQuestionSaved, setMarketScenario, updateMarketNextStep } from '../src/services/marketPlans.ts';
import { MAX_RESTORE_BYTES, parseMarketPlanFile, previewMarketPlanRestore } from '../src/services/marketPlanRestore.ts';

const id = 'new-zealand';
const date = '2026-11-24T01:10:00.000Z';
const scenario = { currency: 'NZD', monthlyFixedCosts: '3.00', unitPrice: '.30', unitVariableCost: '.20' };

function plannedMarket() {
  let plans = updateMarketNextStep(createMarketPlans(), id, 'Check the council boundary.', date);
  plans = setMarketQuestionSaved(plans, id, 'setup', true);
  return setMarketScenario(plans, id, scenario);
}

function planFile(rows, version = 1) {
  return JSON.stringify({ version, contentType: 'user-market-plan-and-source-directory', markets: rows });
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

test('v3 restore rebuilds monthly results from entered figures and ignores supplied results and methods', () => {
  const inputs = { ...scenario, expectedMonthlyUnits: '32' };
  const plans = setMarketScenario(createMarketPlans(), id, inputs);
  const expected = buildMarketPlanExport(plans, [id], date);
  const clean = expected.markets[0].breakEvenScenario;
  assert.equal(expected.version, 3);
  assert.deepEqual(clean.monthlySales.result, {
    status: 'calculated', revenue: '9.60', totalCosts: '9.40', netResult: '0.20',
  });
  const editedFile = structuredClone(expected);
  const supplied = editedFile.markets[0].breakEvenScenario;
  supplied.result.breakEvenUnits = 999999;
  supplied.monthlySales = { result: { status: 'calculated', revenue: '1.00', totalCosts: '0.00', netResult: '1.00' },
    method: 'Supplied calculation', limitation: 'Supplied assessment' };
  supplied.inputs.claimedRevenue = '1.00';
  const draft = parseMarketPlanFile(JSON.stringify(editedFile));
  assert.deepEqual(draft.warnings, []);
  const restored = previewMarketPlanRestore(createMarketPlans(), [], draft);
  assert.equal(restored.effects[0].scenario, 'add');
  assert.deepEqual(restored.plans.scenarios[id], inputs);
  assert.deepEqual(buildMarketPlanExport(restored.plans, restored.countries, date), expected);
});

test('a blank volume stays absent on export and a v3 file can carry a v2 finding too', () => {
  const finding = { text: 'Check the distributor quote.', source: '', observedOn: null };
  const previous = setMarketFinding(plannedMarket(), id, 'setup', finding);
  for (const volume of ['', '  ']) {
    const plans = setMarketScenario(previous, id, { ...scenario, expectedMonthlyUnits: volume });
    const file = buildMarketPlanExport(plans, [id], date);
    assert.equal(file.version, 2);
    assert.equal(Object.hasOwn(file.markets[0].breakEvenScenario.inputs, 'expectedMonthlyUnits'), false);
    assert.deepEqual(parseMarketPlanFile(JSON.stringify(file)).plans, previous);
  }
  const withBoth = setMarketScenario(previous, id, { ...scenario, expectedMonthlyUnits: '0' });
  const file = buildMarketPlanExport(withBoth, [id], date);
  assert.equal(file.version, 3);
  assert.equal(buildMarketPlanExport(withBoth, ['singapore'], date).version, 1);
  assert.deepEqual(parseMarketPlanFile(JSON.stringify(file)).plans, withBoth);
});

test('matching worksheets can gain a missing sales volume, including zero and unfinished input, exactly once', () => {
  const local = setMarketScenario(createMarketPlans(), id, scenario);
  for (const [volume, result] of [
    ['0', { status: 'calculated', revenue: '0.00', totalCosts: '3.00', netResult: '-3.00' }],
    ['1.', { status: 'invalid-volume', revenue: null, totalCosts: null, netResult: null }],
  ]) {
    const inputs = { ...scenario, expectedMonthlyUnits: volume };
    const incoming = setMarketScenario(createMarketPlans(), id, inputs);
    const file = buildMarketPlanExport(incoming, [id], date);
    assert.equal(file.version, 3);
    const draft = parseMarketPlanFile(JSON.stringify(file));
    const merged = previewMarketPlanRestore(local, [id], draft);
    assert.deepEqual(draft.warnings, []);
    assert.equal(merged.changed, true);
    assert.equal(merged.effects[0].scenario, 'add-volume');
    assert.deepEqual(merged.plans.scenarios[id], inputs);
    assert.deepEqual(local.scenarios[id], scenario);
    const exported = buildMarketPlanExport(merged.plans, [id], date);
    assert.deepEqual(exported.markets[0].breakEvenScenario.monthlySales.result, result);
    const again = previewMarketPlanRestore(merged.plans, merged.countries, draft);
    assert.equal(again.effects[0].scenario, 'same');
    assert.equal(again.changed, false);
    assert.equal(again.plans, merged.plans);
  }
});

test('volume imports preserve conflicting local inputs and older files cannot clear a volume', () => {
  const incoming = setMarketScenario(createMarketPlans(), id, { ...scenario, expectedMonthlyUnits: '40' });
  const draft = parseMarketPlanFile(JSON.stringify(buildMarketPlanExport(incoming, [id], date)));
  for (const different of [
    { currency: 'USD' }, { monthlyFixedCosts: '3.0' }, { unitPrice: '0.30' }, { unitVariableCost: '0.20' },
    { expectedMonthlyUnits: '0' }, { expectedMonthlyUnits: '4.' },
  ]) {
    const inputs = { ...scenario, ...different };
    const local = setMarketScenario(createMarketPlans(), id, inputs);
    const merged = previewMarketPlanRestore(local, [id], draft);
    assert.equal(merged.effects[0].scenario, 'keep-local');
    assert.equal(merged.changed, false);
    assert.equal(merged.plans, local);
    assert.deepEqual(merged.plans.scenarios[id], inputs);
  }
  for (const version of [1, 2]) {
    const legacy = planFile([{ id, breakEvenScenario: { kind: 'user-entered-break-even-scenario', inputs: scenario } }], version);
    const merged = previewMarketPlanRestore(incoming, [id], parseMarketPlanFile(legacy));
    assert.equal(merged.effects[0].scenario, 'same');
    assert.equal(merged.changed, false);
    assert.equal(merged.plans, incoming);
    assert.equal(merged.plans.scenarios[id].expectedMonthlyUnits, '40');
  }
});

test('rejects an oversized or non-text sales volume without replacing local work', () => {
  const local = setMarketScenario(createMarketPlans(), id, scenario);
  for (const value of ['1'.repeat(MAX_ECONOMICS_INPUT_LENGTH + 1), 0, null]) {
    const file = planFile([{ id, userNextStep: 'Imported note', breakEvenScenario: {
      kind: 'user-entered-break-even-scenario', inputs: { ...scenario, expectedMonthlyUnits: value },
    } }], 3);
    const draft = parseMarketPlanFile(file);
    assert.equal(draft.plans.scenarios[id], undefined);
    assert.match(draft.warnings.join(' '), /invalid.*worksheet/);
    const merged = previewMarketPlanRestore(local, [id], draft);
    assert.equal(merged.plans.notes[id].nextStep, 'Imported note');
    assert.deepEqual(merged.plans.scenarios[id], scenario);
  }
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
  for (const version of [5, '4', '3', '2', null]) {
    assert.throws(() => parseMarketPlanFile(JSON.stringify({ version, contentType: 'user-market-plan-and-source-directory', markets: [{id}] })), /unsupported/);
  }
  const oversized = 'ä'.repeat(MAX_RESTORE_BYTES / 2 + 1);
  assert.ok(oversized.length < MAX_RESTORE_BYTES);
  assert.throws(() => parseMarketPlanFile(oversized), /8 MiB/);
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

test('every market and question with maximum JSON-escaped content fits the restore limit', () => {
  // Control characters require six UTF-8 bytes per stored UTF-16 code unit in JSON.
  const text = limit => '\u0000'.repeat(limit);
  const amount = text(MAX_ECONOMICS_INPUT_LENGTH);
  assert.equal(INDUSTRY_QUESTION_IDS.length, 36);
  let plans = createMarketPlans();
  for (const market of MARKETS) {
    plans = updateMarketNextStep(plans, market.id, text(MAX_NEXT_STEP_LENGTH), date);
    plans = setMarketScenario(plans, market.id, {
      currency: market.worksheetCurrency, monthlyFixedCosts: amount, unitPrice: amount,
      unitVariableCost: amount, expectedMonthlyUnits: amount,
    });
    for (const questionId of ['customers', 'location', 'setup', ...INDUSTRY_QUESTION_IDS]) {
      plans = setMarketQuestionSaved(plans, market.id, questionId, true);
      plans = setMarketFinding(plans, market.id, questionId, {
        text: text(MAX_FINDING_TEXT_LENGTH), source: text(MAX_FINDING_SOURCE_LENGTH), observedOn: '2026-11-24',
      });
    }
  }
  const ids = MARKETS.map(m => m.id);
  const file = buildMarketPlanExport(plans, ids, date);
  assert.equal(file.version, 4);
  for (const row of file.markets) assert.equal(row.savedIndustryQuestions.length, INDUSTRY_QUESTION_IDS.length);
  const exported = JSON.stringify(file, null, 2);
  assert.ok(Buffer.byteLength(exported) > 1024 * 1024);
  assert.ok(Buffer.byteLength(exported) <= MAX_RESTORE_BYTES);
  const draft = parseMarketPlanFile(exported);
  assert.deepEqual(draft.warnings, []);
  assert.deepEqual(draft.plans, plans);
});

test('v4 industry questions and findings round trip by canonical ID, with local conflicts protected', () => {
  const [first, second] = INDUSTRY_QUESTION_IDS;
  const finding = { text: 'The buyer requested a second interview.', source: 'Private meeting notes', observedOn: '2026-11-22' };
  let original = plannedMarket();
  original = setMarketQuestionSaved(original, id, first, true);
  original = setMarketQuestionSaved(original, id, second, true);
  original = setMarketFinding(original, id, first, finding);
  original = setMarketScenario(original, id, { ...scenario, expectedMonthlyUnits: '32' });
  const expected = buildMarketPlanExport(original, [id], date);
  assert.equal(expected.version, 4);
  const supplied = structuredClone(expected);
  for (const question of supplied.markets[0].savedIndustryQuestions) {
    Object.assign(question, {
      industryId: 'unknown', industryName: 'File-supplied name', angle: 'untrusted', question: 'File-provided wording',
      evidence: 'File-provided evidence', decision: 'File-provided advice', sources: [{ url: 'https://untrusted.invalid/' }],
    });
  }
  const draft = parseMarketPlanFile(JSON.stringify(supplied));
  assert.deepEqual(draft.warnings, []);
  const restored = previewMarketPlanRestore(createMarketPlans(), [], draft);
  assert.deepEqual(restored.plans, original);
  assert.deepEqual(buildMarketPlanExport(restored.plans, restored.countries, date), expected);
  const local = setMarketFinding(restored.plans, id, first, { ...finding, source: 'A later interview' });
  const conflict = previewMarketPlanRestore(local, restored.countries, draft);
  assert.equal(conflict.effects[0].findings[first], 'keep-local');
  assert.equal(conflict.changed, false);
  assert.equal(conflict.plans, local);
  const retry = previewMarketPlanRestore(restored.plans, restored.countries, draft);
  assert.equal(retry.effects[0].findings[first], 'same');
  assert.equal(retry.changed, false);
  assert.equal(retry.plans, restored.plans);
});

test('only valid v4 industry IDs restore and duplicate entries keep the first valid finding', () => {
  const [first] = INDUSTRY_QUESTION_IDS;
  const question = { id: first, kind: 'unverified-industry-research-prompt' };
  const finding = { kind: 'user-entered-research-finding', text: 'First interview', source: '', observedOn: null };
  const row = { id, savedResearchQuestions: [{ kind: 'unverified-research-prompt', lens: 'setup' }], savedIndustryQuestions: [
    { ...question, userFinding: { ...finding, text: '' } },
    { ...question, userFinding: finding }, { ...question, userFinding: finding },
    { ...question, userFinding: { ...finding, text: 'Conflicting interview' } },
    { ...question, kind: 'unverified-research-prompt' }, { ...question, id: 'setup' },
    { ...question, id: '__proto__' }, { ...question, id: 'unknown' }, null,
  ] };
  const draft = parseMarketPlanFile(planFile([row], 4));
  assert.deepEqual(draft.plans.questions[id], ['setup', first]);
  assert.deepEqual(draft.plans.findings[id], { [first]: { text: finding.text, source: '', observedOn: null } });
  assert.match(draft.warnings.join(' '), /unrecognized industry questions/);
  assert.match(draft.warnings.join(' '), /invalid.*finding/);
  assert.match(draft.warnings.join(' '), /conflicting duplicate/);
  for (const version of [1, 2, 3]) {
    const legacy = parseMarketPlanFile(planFile([row], version));
    assert.deepEqual(legacy.plans.questions[id], ['setup']);
    assert.deepEqual(legacy.plans.findings, {});
    assert.match(legacy.warnings.join(' '), /older plan format/);
  }
});

test('KES volume drafts survive v3 storage and restore without converting amounts or replacing other markets', () => {
  for (const [quantity, expected] of [
    ['0', { status: 'calculated', revenue: '0.00', totalCosts: '12000.00', netResult: '-12000.00' }],
    ['50', { status: 'calculated', revenue: '50000.00', totalCosts: '42000.00', netResult: '8000.00' }],
    ['.', { status: 'invalid-volume', revenue: null, totalCosts: null, netResult: null }],
  ]) {
    const inputs = { currency: 'KES', monthlyFixedCosts: '12000', unitPrice: '1000', unitVariableCost: '600', expectedMonthlyUnits: quantity };
    const original = setMarketScenario(createMarketPlans(), 'kenya', inputs);
    const stored = serializeMarketPlans(original);
    assert.equal(stored.version, 3);
    const file = buildMarketPlanExport(parseMarketPlans(JSON.parse(JSON.stringify(stored))), ['kenya'], date);
    assert.equal(file.version, 3);
    assert.deepEqual(file.markets[0].breakEvenScenario.monthlySales.result, expected);
    const draft = parseMarketPlanFile(JSON.stringify(file));
    assert.deepEqual(draft.warnings, []);
    const local = plannedMarket();
    const restored = previewMarketPlanRestore(local, [id], draft);
    assert.deepEqual(restored.countries, [id, 'kenya']);
    assert.deepEqual(restored.plans.scenarios.kenya, inputs);
    assert.deepEqual(restored.plans.scenarios[id], local.scenarios[id]);
    assert.deepEqual(restored.plans.notes, local.notes);
    assert.deepEqual(buildMarketPlanExport(restored.plans, ['kenya'], date), file);
  }
});

test('restoring a Canadian v3 worksheet rebuilds its CAD totals and Ontario link while preserving an older NZD plan', () => {
  const inputs = { currency: 'CAD', monthlyFixedCosts: '120.00', unitPrice: '12.50', unitVariableCost: '7.25', expectedMonthlyUnits: '24' };
  let canada = setMarketScenario(createMarketPlans(), 'canada', inputs);
  canada = setMarketQuestionSaved(canada, 'canada', 'setup', true);
  const file = buildMarketPlanExport(canada, ['canada'], date);
  assert.equal(file.version, 3);
  const [market] = file.markets;
  assert.equal(market.breakEvenScenario.result.breakEvenUnits, 23);
  assert.deepEqual(market.breakEvenScenario.monthlySales.result, {
    status: 'calculated', revenue: '300.00', totalCosts: '294.00', netResult: '6.00',
  });
  const imported = structuredClone(file);
  imported.markets[0].sources.regionalSetup.url = 'https://untrusted.invalid/registry';
  imported.markets[0].breakEvenScenario.monthlySales.result.netResult = '9999.99';
  const draft = parseMarketPlanFile(JSON.stringify(imported));
  assert.deepEqual(draft.warnings, []);
  const local = plannedMarket();
  const merged = previewMarketPlanRestore(local, [id], draft);
  assert.deepEqual(merged.countries, [id, 'canada']);
  assert.deepEqual(merged.plans.scenarios[id], local.scenarios[id]);
  assert.deepEqual(merged.plans.notes, local.notes);
  assert.deepEqual(buildMarketPlanExport(merged.plans, ['canada'], date), file);
  const old = buildMarketPlanExport(merged.plans, [id], date);
  assert.equal(old.version, 1);
  assert.equal(Object.hasOwn(old.markets[0].sources, 'regionalSetup'), false);
});
