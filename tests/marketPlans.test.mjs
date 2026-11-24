import assert from 'node:assert/strict';
import test from 'node:test';
import { MARKET_PLANS_KEY, MAX_NEXT_STEP_LENGTH, buildMarketPlanExport, createMarketPlans, parseMarketPlans, parseResearchFinding, sameResearchFinding, serializeMarketPlans, setMarketFinding, setMarketQuestionSaved, updateMarketNextStep } from '../src/services/marketPlans.ts';

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
  for (const input of [null, undefined, false, [], { version: 3, notes: { vietnam: { nextStep: 'Unsupported format' } } }]) assert.deepEqual(parseMarketPlans(input), createMarketPlans());
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
