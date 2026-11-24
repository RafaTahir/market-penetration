import assert from 'node:assert/strict';
import { dirname } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { MARKET_PLANS_KEY, MAX_NEXT_STEP_LENGTH, buildMarketPlanExport, createMarketPlans, parseMarketPlans, parseResearchFinding, sameResearchFinding, serializeMarketPlans, setMarketFinding, setMarketQuestionSaved, setMarketScenario, updateMarketNextStep } from '../src/services/marketPlans.ts';
import { parseMarketPlanFile, previewMarketPlanRestore } from '../src/services/marketPlanRestore.ts';

const EDITED = '2026-10-28T09:00:00.000Z';

test('editing one market preserves other market notes through storage round trips', () => {
  let state = updateMarketNextStep(createMarketPlans(), 'malaysia', 'Ask DBKL which address authority applies to our intended premises.', EDITED);
  state = updateMarketNextStep(state, 'singapore', 'Check the source relevant to our activity.', EDITED);
  const restored = parseMarketPlans(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.notes.malaysia.nextStep, state.notes.malaysia.nextStep);
  assert.equal(restored.notes.singapore.nextStep, state.notes.singapore.nextStep);
  const cleared = updateMarketNextStep(restored, 'singapore', '', EDITED);
  assert.deepEqual(cleared.notes.malaysia, state.notes.malaysia);
  assert.equal(cleared.notes.singapore, undefined);
  assert.notEqual(MARKET_PLANS_KEY, 'flow-entry-planner-v1');
  assert.notEqual(MARKET_PLANS_KEY, 'flow-market-shortlist-v1');
});

test('a Malaysia plan export preserves the chosen market without substituting notebook cities', () => {
  let state = updateMarketNextStep(createMarketPlans(), 'malaysia', 'Our user-entered next step for Kuala Lumpur.', EDITED);
  state = updateMarketNextStep(state, 'singapore', 'Private note not selected for this export.', EDITED);
  const payload = buildMarketPlanExport(state, ['malaysia', 'malaysia', 'unsupported'], EDITED);
  assert.equal(payload.markets.length, 1);
  assert.equal(payload.markets[0].country, 'Malaysia');
  assert.equal(payload.markets[0].countryCode, 'MYS');
  assert.equal(payload.markets[0].cityResearchStartingPoint, 'Kuala Lumpur');
  assert.equal(payload.markets[0].userNextStep, state.notes.malaysia.nextStep);
  assert.equal(payload.markets[0].noteEditedAt, EDITED);
  assert.equal(payload.markets[0].sources.cityAndLocation.url, 'https://www.dbkl.gov.my/');
  assert.equal(payload.markets[0].sources.sourcePublicationDate, null);
  assert.equal(payload.markets[0].sources.sourceContentsVerified, false);
  assert.deepEqual(payload.detailedNotebookCoverage, ['Jakarta province, excluding Greater Jakarta', 'City of Manila, excluding the rest of Metro Manila']);
  assert.ok(!JSON.stringify(payload).includes('Private note not selected'));
  assert.ok(!JSON.stringify(payload).includes('"score"'));
  assert.match(payload.limitation, /not source observation dates/);
  assert.deepEqual(buildMarketPlanExport(state, [], EDITED).markets, []);
});

test('malformed storage never manufactures an edit date or reads unrelated workspace fields', () => {
  const parsed = parseMarketPlans({ version: 1, profile: { unrelated: true }, notes: {
    malaysia: { nextStep: 'Keep this user note even when its timestamp is unknown.', updatedAt: 'unknown' },
    singapore: { nextStep: 42, updatedAt: EDITED },
    unsupported: { nextStep: 'Unsupported market', updatedAt: EDITED },
  } });
  assert.equal(parsed.notes.malaysia.updatedAt, null);
  assert.equal(parsed.notes.malaysia.nextStep, 'Keep this user note even when its timestamp is unknown.');
  assert.equal(parsed.notes.singapore, undefined);
  assert.equal(parsed.notes.unsupported, undefined);
  assert.equal(parseMarketPlans({ version: 1, notes: { malaysia: { nextStep: 'Keep the note, not an invalid calendar timestamp.', updatedAt: '2026-02-30T00:00:00.000Z' } } }).notes.malaysia.updatedAt, null);
  assert.equal('profile' in parsed, false);
  assert.equal(updateMarketNextStep(parsed, 'unsupported', 'Do not replace anything.', EDITED), parsed);
});

test('bounded personal notes retain line breaks and remain separate from evidence', () => {
  const text = 'First next step.\nSecond next step. ' + 'a'.repeat(MAX_NEXT_STEP_LENGTH);
  const state = updateMarketNextStep(createMarketPlans(), 'vietnam', text, EDITED);
  assert.equal(state.notes.vietnam.nextStep.length, MAX_NEXT_STEP_LENGTH);
  assert.ok(state.notes.vietnam.nextStep.includes('\n'));
  assert.deepEqual(state.questions, {});
  for (const input of [null, undefined, false, [], { version: 4, notes: { vietnam: { nextStep: 'Unsupported format' } } }]) assert.deepEqual(parseMarketPlans(input), createMarketPlans());
});

test('legacy notes survive adding and removing city research questions, including after reload', () => {
  const legacyNote = { nextStep: 'Request a current premises quote.', updatedAt: EDITED };
  let plans = parseMarketPlans({ version: 1, notes: { singapore: legacyNote } });
  assert.deepEqual(plans.questions, {});
  plans = setMarketQuestionSaved(plans, 'singapore', 'location', true);
  plans = setMarketQuestionSaved(plans, 'singapore', 'setup', true);
  plans = setMarketQuestionSaved(plans, 'malaysia', 'customers', true);
  plans = updateMarketNextStep(plans, 'malaysia', 'Follow up with interviews.', EDITED);
  plans = parseMarketPlans(JSON.parse(JSON.stringify(plans)));
  assert.deepEqual(plans.notes.singapore, legacyNote);
  assert.deepEqual(plans.questions.singapore, ['location', 'setup']);
  const singaporeOnly = buildMarketPlanExport(plans, ['singapore'], EDITED);
  assert.equal(singaporeOnly.markets.length, 1);
  const singapore = singaporeOnly.markets[0];
  assert.equal(singapore.userNextStep, legacyNote.nextStep);
  assert.deepEqual(singapore.savedResearchQuestions.map(q => q.question), [
    'Does the intended Singapore premises fit the activity?',
    'Which ACRA and premises questions fit this business?',
  ]);
  assert.deepEqual(singapore.savedResearchQuestions[1].sources.map(source => source.url), ['https://www.acra.gov.sg/', 'https://www.ura.gov.sg/']);
  assert.equal(singapore.savedResearchQuestions[0].kind, 'unverified-research-prompt');
  const malaysiaOnly = buildMarketPlanExport(plans, ['malaysia'], EDITED);
  assert.equal(malaysiaOnly.markets[0].savedResearchQuestions[0].sources[0].url, 'https://www.dosm.gov.my/');
  plans = setMarketQuestionSaved(plans, 'singapore', 'setup', false);
  plans = setMarketQuestionSaved(plans, 'singapore', 'location', false);
  assert.deepEqual(plans.questions, { malaysia: ['customers'] });
  assert.deepEqual(plans.notes.singapore, legacyNote);
});

test('stored question IDs are deduplicated and restricted to supported markets and their guide lenses', () => {
  const plans = parseMarketPlans(JSON.parse('{"version":1,"notes":{},"questions":{"malaysia":["setup","bogus","setup","__proto__",null],"__proto__":["setup"],"toString":["customers"],"singapore":"setup","other":["location"]}}'));
  assert.deepEqual(plans.questions, { malaysia: ['setup'] });
  assert.equal(setMarketQuestionSaved(plans, '__proto__', 'setup', true), plans);
  assert.equal(setMarketQuestionSaved(plans, 'singapore', 'toString', true), plans);
});

test('repeating save or remove preserves other research questions and personal notes', () => {
  let state = updateMarketNextStep(createMarketPlans(), 'singapore', 'Remember to verify the address.', EDITED);
  state = setMarketQuestionSaved(state, 'singapore', 'setup', true);
  state = setMarketQuestionSaved(state, 'malaysia', 'customers', true);
  const saved = setMarketQuestionSaved(state, 'singapore', 'location', true);
  assert.equal(setMarketQuestionSaved(saved, 'singapore', 'location', true), saved);
  const removed = setMarketQuestionSaved(saved, 'singapore', 'location', false);
  assert.equal(setMarketQuestionSaved(removed, 'singapore', 'location', false), removed);
  assert.deepEqual(removed, state);
});

test('finding requires meaningful text, preserves user-entered citation and refuses corrupt date or source', () => {
  assert.deepEqual(parseResearchFinding({ text: '  Follow up with the supplier.  ' }), {
    text: 'Follow up with the supplier.', source: '', observedOn: null,
  });
  const finding = parseResearchFinding({ text: 'a'.repeat(1601), source: 'z'.repeat(401), observedOn: '2024-02-29' });
  assert.equal(finding.text.length, 1600);
  assert.equal(finding.source.length, 400);
  assert.equal(finding.observedOn, '2024-02-29');
  for (const date of ['2023-02-29', '2024-02-30', '0000-12-01', '2024-3-1', 1709251200000]) {
    assert.equal(parseResearchFinding({ text: 'Call notes', observedOn: date }), null);
  }
  for (const raw of [{ text: '  \n ' }, { source: 'Site visit' }, { text: 'Call', source: [] }, { text: 'Call', source: null }]) {
    assert.equal(parseResearchFinding(raw), null);
  }
  assert.deepEqual(parseResearchFinding({ text: 'Quote\nvalid for seven days', source: ' Jess, in person ', observedOn: '' }), {
    text: 'Quote\nvalid for seven days', source: 'Jess, in person', observedOn: null,
  });
  assert.equal(sameResearchFinding(finding, { ...finding }), true);
  assert.equal(sameResearchFinding(finding, { ...finding, observedOn: null }), false);
});

test('a saved finding survives reload and blocks question removal until explicitly cleared', () => {
  const note = 'Compare the lease terms before committing.';
  let plans = updateMarketNextStep(createMarketPlans(), 'singapore', note, EDITED);
  const finding = { text: 'Received a dated quote for the pilot site.', source: 'Site manager, written quote', observedOn: '2024-11-05' };
  assert.equal(setMarketFinding(plans, 'singapore', 'location', finding), plans);
  plans = setMarketQuestionSaved(plans, 'singapore', 'location', true);
  plans = setMarketFinding(plans, 'singapore', 'location', finding);
  const reloaded = parseMarketPlans(JSON.parse(JSON.stringify(plans)));
  assert.deepEqual(reloaded, plans);
  assert.equal(setMarketFinding(reloaded, 'singapore', 'location', { ...finding, observedOn: '2024-04-31' }), reloaded);
  assert.equal(setMarketFinding(reloaded, 'singapore', 'location', finding), reloaded);
  assert.equal(setMarketQuestionSaved(reloaded, 'singapore', 'location', false), reloaded);

  const exportRow = buildMarketPlanExport(reloaded, ['singapore'], EDITED).markets[0];
  assert.deepEqual(exportRow.savedResearchQuestions[0].userFinding, { kind: 'user-entered-research-finding', ...finding });
  assert.equal(exportRow.userNextStep, note);
  assert.equal(exportRow.sources.sourceContentsVerified, false);
  const cleared = setMarketFinding(reloaded, 'singapore', 'location', null);
  assert.deepEqual(cleared.findings, {});
  assert.deepEqual(cleared.questions.singapore, ['location']);
  assert.equal(buildMarketPlanExport(cleared, ['singapore'], EDITED).markets[0].savedResearchQuestions[0].userFinding, null);
  assert.deepEqual(setMarketQuestionSaved(cleared, 'singapore', 'location', false).questions, {});
});

test('storage retains only known, saved questions and exports findings only for selected markets', () => {
  const oldState = { version: 1, questions: { thailand: ['customers', 'setup'], malaysia: ['location'] } };
  const restored = parseMarketPlans(oldState);
  assert.deepEqual(restored.findings, {});
  const market = buildMarketPlanExport(restored, ['thailand'], EDITED).markets[0];
  assert.ok(market.savedResearchQuestions.every(q => q.userFinding === null));

  const siteVisit = { text: 'Site notes', source: '', observedOn: null };
  const privateNote = { text: 'Separate confidential visit', source: 'my notes', observedOn: null };
  const malformed = parseMarketPlans({ ...oldState, findings: {
    thailand: { customers: siteVisit, setup: {text: 'Bad date', observedOn: '2023-02-31'}, bogus: siteVisit, location: privateNote },
    malaysia: { location: privateNote },
    unsupported: { setup: siteVisit },
    indonesia: { setup: siteVisit },
  } });
  assert.deepEqual(malformed.findings, { thailand: { customers: siteVisit }, malaysia: { location: privateNote } });
  const onlyThailand = buildMarketPlanExport(malformed, ['thailand'], EDITED);
  assert.equal(JSON.stringify(onlyThailand).includes(privateNote.text), false);
  assert.match(onlyThailand.limitation, /citations and observation dates are user-entered/);
});

test('storage and exports use v2 only when the persisted or selected content includes a finding', () => {
  const legacy = { version: 1, notes: { thailand: { nextStep: 'Ask for current quotes.', updatedAt: EDITED } } };
  let plans = parseMarketPlans(legacy);
  assert.equal(serializeMarketPlans(plans).version, 1);
  plans = setMarketQuestionSaved(plans, 'singapore', 'location', true);
  assert.equal(buildMarketPlanExport(plans, ['singapore'], EDITED).version, 1);

  plans = setMarketFinding(plans, 'singapore', 'location', { text: 'Site visit notes', source: 'Visit', observedOn: null });
  const persisted = serializeMarketPlans(plans);
  assert.equal(persisted.version, 2);
  const restored = parseMarketPlans(JSON.parse(JSON.stringify(persisted)));
  assert.deepEqual(restored, plans);
  assert.equal(buildMarketPlanExport(restored, ['thailand', 'singapore'], EDITED).version, 2);
  assert.equal(buildMarketPlanExport(restored, ['thailand'], EDITED).version, 1);
  assert.equal(buildMarketPlanExport(restored, [], EDITED).version, 1);

  const cleared = setMarketFinding(restored, 'singapore', 'location', null);
  const backToV1 = serializeMarketPlans(cleared);
  assert.equal(backToV1.version, 1);
  assert.deepEqual(parseMarketPlans(backToV1).notes, legacy.notes);
  assert.equal(serializeMarketPlans({ ...cleared, findings: { thailand: { setup: { text: 'Orphan' } } } }).version, 1);
});

const costDraft = { currency: 'GBP', monthlyFixedCosts: '0.10', unitPrice: '0.10', unitVariableCost: '0.07' };

test('monthly volume drafts use storage v3 without losing notes, findings, or invalid typed text', () => {
  let existing = updateMarketNextStep(createMarketPlans(), 'uk', 'Check our actual delivery costs.', EDITED);
  existing = setMarketQuestionSaved(existing, 'singapore', 'location', true);
  existing = setMarketFinding(existing, 'singapore', 'location', { text: 'Personal site notes.', source: 'Visit', observedOn: null });
  for (const quantity of ['3', '0', '.', '1.5', ' 2 ', 'unknown']) {
    const inputs = { ...costDraft, expectedMonthlyUnits: quantity };
    const plans = setMarketScenario(existing, 'uk', inputs);
    const stored = serializeMarketPlans(plans);
    assert.equal(stored.version, 3);
    assert.deepEqual(stored.scenarios.uk, inputs);
    const restored = parseMarketPlans(JSON.parse(JSON.stringify(stored)));
    assert.deepEqual(restored, plans);
    assert.deepEqual(restored.notes, existing.notes);
    assert.deepEqual(restored.findings, existing.findings);
    assert.deepEqual(restored.questions, existing.questions);
  }
});

test('absent or cleared volume retains exact legacy shapes and selected exports choose their own version', () => {
  let plans = setMarketScenario(createMarketPlans(), 'uk', costDraft);
  const legacy = buildMarketPlanExport(plans, ['uk'], EDITED);
  assert.equal(legacy.version, 1);
  assert.equal('monthlySales' in legacy.markets[0].breakEvenScenario, false);
  for (const quantity of [undefined, '', '   ']) {
    const cleared = setMarketScenario(plans, 'uk', { ...costDraft, expectedMonthlyUnits: quantity });
    assert.deepEqual(serializeMarketPlans(cleared), serializeMarketPlans(plans));
    assert.deepEqual(buildMarketPlanExport(cleared, ['uk'], EDITED), legacy);
  }
  plans = setMarketScenario(plans, 'uk', { ...costDraft, expectedMonthlyUnits: '0' });
  plans = setMarketQuestionSaved(plans, 'singapore', 'setup', true);
  plans = setMarketFinding(plans, 'singapore', 'setup', { text: 'User note.', source: '', observedOn: null });
  assert.equal(buildMarketPlanExport(plans, ['uk'], EDITED).version, 3);
  assert.equal(buildMarketPlanExport(plans, ['uk', 'singapore'], EDITED).version, 3);
  assert.equal(buildMarketPlanExport(plans, ['singapore'], EDITED).version, 2);
  assert.equal(buildMarketPlanExport(plans, ['thailand'], EDITED).version, 1);
  assert.equal(buildMarketPlanExport(plans, [], EDITED).version, 1);
  assert.equal(serializeMarketPlans(setMarketScenario(plans, 'uk', costDraft)).version, 2);
  assert.equal(serializeMarketPlans(setMarketFinding(setMarketScenario(plans, 'uk', costDraft), 'singapore', 'setup', null)).version, 1);
});

test('monthly sales exports recalculate exact money strings and never accept stored derived amounts', () => {
  const plans = parseMarketPlans({ ...createMarketPlans(), version: 3, scenarios: { uk: {
    ...costDraft, expectedMonthlyUnits: '3', monthlySales: { result: { netResult: '99999.99' } }, result: { breakEvenUnits: -100 },
  } } });
  const scenario = buildMarketPlanExport(plans, ['uk'], EDITED).markets[0].breakEvenScenario;
  assert.deepEqual(scenario.inputs, { ...costDraft, expectedMonthlyUnits: '3' });
  assert.deepEqual(scenario.result, { status: 'calculated', contributionPerUnit: 0.03, breakEvenUnits: 4 });
  assert.deepEqual(scenario.monthlySales.result, { status: 'calculated', revenue: '0.30', totalCosts: '0.31', netResult: '-0.01' });
  assert.match(scenario.monthlySales.method, /revenue/i);
  assert.match(scenario.monthlySales.limitation, /user-entered assumptions/);
  const zero = buildMarketPlanExport(setMarketScenario(plans, 'uk', { ...costDraft, expectedMonthlyUnits: '0' }), ['uk'], EDITED).markets[0].breakEvenScenario;
  assert.deepEqual(zero.monthlySales.result, { status: 'calculated', revenue: '0.00', totalCosts: '0.10', netResult: '-0.10' });
  const invalid = buildMarketPlanExport(setMarketScenario(plans, 'uk', { ...costDraft, expectedMonthlyUnits: '1.5' }), ['uk'], EDITED).markets[0].breakEvenScenario;
  assert.deepEqual(invalid.monthlySales.result, { status: 'invalid-volume', revenue: null, totalCosts: null, netResult: null });
});

test('volume plan files round trip as v3 and clearing quantity removes derived sales fields', () => {
  for (const quantity of ['0', '3', '.']) {
    const plans = setMarketScenario(createMarketPlans(), 'uk', { ...costDraft, expectedMonthlyUnits: quantity });
    const file = buildMarketPlanExport(plans, ['uk'], EDITED);
    file.markets[0].breakEvenScenario.monthlySales.result = { status: 'calculated', revenue: '999', totalCosts: '0', netResult: '999' };
    const draft = parseMarketPlanFile(JSON.stringify(file));
    const restored = previewMarketPlanRestore(createMarketPlans(), [], draft);
    assert.deepEqual(restored.plans, plans);
    assert.deepEqual(buildMarketPlanExport(restored.plans, ['uk'], EDITED), buildMarketPlanExport(plans, ['uk'], EDITED));
    const cleared = setMarketScenario(restored.plans, 'uk', { ...costDraft, expectedMonthlyUnits: '' });
    assert.equal(buildMarketPlanExport(cleared, ['uk'], EDITED).version, 1);
    assert.equal('monthlySales' in buildMarketPlanExport(cleared, ['uk'], EDITED).markets[0].breakEvenScenario, false);
  }
});

let hookBundle;
async function planHook(storage) {
  hookBundle ??= build({
    stdin: { contents: "export { useMarketPlans } from './src/hooks/useMarketPlans.ts';", resolveDir: dirname(dirname(fileURLToPath(import.meta.url))), loader: 'ts' },
    bundle: true, platform: 'node', format: 'cjs', write: false,
    plugins: [{ name: 'plan-hook-boundary', setup(builder) {
      builder.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents:
        'export const { useState, useRef, useEffect } = fixtureReact;' }));
    } }],
  });
  const slots = [], effects = [], listeners = new Map();
  let cursor = 0;
  const fixtureReact = {
    useState(initial) {
      const index = cursor++;
      slots[index] ??= { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, next => { slots[index].value = next; }];
    },
    useRef(current) { return slots[cursor++] ??= { current }; },
    useEffect(effect) {
      const index = cursor++;
      if (!slots[index]) { slots[index] = {}; effects.push(effect); }
    },
  };
  const window = { addEventListener: (key, listener) => listeners.set(key, listener), removeEventListener: key => listeners.delete(key) };
  const module = { exports: {} };
  new Function('module', 'exports', 'localStorage', 'window', 'fixtureReact', (await hookBundle).outputFiles[0].text)(module, module.exports, storage, window, fixtureReact);
  function render() { cursor = 0; const state = module.exports.useMarketPlans(); while (effects.length) effects.shift()(); return state; }
  return { render, storageChanged() { listeners.get('storage')?.({ key: MARKET_PLANS_KEY }); } };
}

function planStorage(initial) {
  let raw = JSON.stringify(initial), writable = true;
  return {
    getItem: () => raw,
    setItem(key, value) { assert.equal(key, MARKET_PLANS_KEY); if (!writable) throw new Error('Synthetic storage denial'); raw = value; },
    replace(value) { raw = JSON.stringify(value); },
    read() { return JSON.parse(raw); },
    denyWrites() { writable = false; },
  };
}

test('scenario compare-and-set rejects stale changes/clear and retains newer volume, costs and other notes', async () => {
  const initial = setMarketScenario(createMarketPlans(), 'uk', costDraft);
  const storage = planStorage(serializeMarketPlans(initial));
  const hook = await planHook(storage);
  const old = hook.render();
  const expected = old.plans.scenarios.uk;
  const newest = { ...costDraft, monthlyFixedCosts: '9', expectedMonthlyUnits: '7' };
  const elsewhere = updateMarketNextStep(setMarketScenario(initial, 'uk', newest), 'singapore', 'Saved in the other tab.', EDITED);
  storage.replace(serializeMarketPlans(elsewhere));
  assert.equal(old.saveScenario('uk', expected, { ...costDraft, unitPrice: '12' }), false);
  assert.deepEqual(hook.render().plans, elsewhere);
  assert.equal(old.saveScenario('uk', expected, null), false);
  assert.deepEqual(storage.read(), serializeMarketPlans(elsewhere));
  const latest = hook.render();
  assert.equal(latest.saveScenario('uk', latest.plans.scenarios.uk, { ...newest, unitPrice: '12' }), true);
  assert.deepEqual(storage.read().notes, elsewhere.notes);
  assert.equal(storage.read().scenarios.uk.expectedMonthlyUnits, '7');
  assert.equal(storage.read().scenarios.uk.unitPrice, '12');
});

test('valid v3 storage loads while unknown or malformed schemas remain session-only and untouched', async () => {
  const valid = serializeMarketPlans(setMarketScenario(createMarketPlans(), 'uk', { ...costDraft, expectedMonthlyUnits: '0' }));
  const working = await planHook(planStorage(valid));
  assert.equal(working.render().savedLocally, true);
  for (const invalid of [{ ...valid, version: 4 }, { ...valid, version: '3' },
    { ...valid, scenarios: [] }, { ...valid, scenarios: null }, { ...valid, findings: [] }, { ...valid, notes: [] }]) {
    const storage = planStorage(invalid);
    const hook = await planHook(storage);
    const state = hook.render();
    assert.equal(state.savedLocally, false);
    state.saveNote('uk', 'Session-only note');
    assert.equal(hook.render().plans.notes.uk.nextStep, 'Session-only note');
    assert.deepEqual(storage.read(), invalid);
  }
});

test('storage denial preserves local volume drafts and unknown-version events cannot overwrite session edits', async () => {
  const initial = setMarketScenario(createMarketPlans(), 'uk', costDraft);
  const storage = planStorage(serializeMarketPlans(initial));
  const hook = await planHook(storage);
  let state = hook.render();
  storage.denyWrites();
  assert.equal(state.saveScenario('uk', state.plans.scenarios.uk, { ...costDraft, expectedMonthlyUnits: '0' }), true);
  state = hook.render();
  assert.equal(state.savedLocally, false);
  assert.equal(state.plans.scenarios.uk.expectedMonthlyUnits, '0');
  const foreign = { version: 4, notes: { uk: { nextStep: 'Future client data' } } };
  storage.replace(foreign);
  hook.storageChanged();
  assert.equal(hook.render().plans.scenarios.uk.expectedMonthlyUnits, '0');
  state.saveNote('singapore', 'Keep my local next step');
  assert.equal(hook.render().plans.notes.singapore.nextStep, 'Keep my local next step');
  assert.deepEqual(storage.read(), foreign);
});
