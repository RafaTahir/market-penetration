import assert from 'node:assert/strict';
import test from 'node:test';
import { MARKET_PLANS_KEY, MAX_NEXT_STEP_LENGTH, buildMarketPlanExport, createMarketPlans, parseMarketPlans, updateMarketNextStep } from '../src/services/marketPlans.ts';

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
  assert.deepEqual(Object.keys(state), ['version', 'notes']);
  for (const input of [null, undefined, false, [], { version: 2, notes: {} }]) assert.deepEqual(parseMarketPlans(input), createMarketPlans());
});
