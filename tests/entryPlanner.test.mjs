import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CITIES,
  FACTORS,
  METHODOLOGY,
  createPlannerState,
  evaluateCity,
  getProfileContext,
  parsePlannerState,
} from '../src/services/entryPlanner.ts';

const TODAY = '2026-10-25';

function filledState(value = 3) {
  const state = createPlannerState();
  for (const city of CITIES) {
    for (const factor of FACTORS) {
      state.evidence[city.id][factor.id] = {
        rating: value,
        note: `Our dated research records specific findings for ${factor.id}.`,
        sourceUrl: 'https://example.org/research',
        observedOn: TODAY,
        profileContext: getProfileContext(state.profile),
      };
    }
  }
  return state;
}

test('unknown data and incompatible versions return a safe, independent default', () => {
  for (const input of [undefined, null, false, 42, 'invalid', [], {}, { version: 2 }]) {
    assert.deepEqual(parsePlannerState(input), createPlannerState());
  }
  const state = createPlannerState();
  state.evidence.jakarta.demand.note = 'Changed';
  assert.equal(state.evidence.manila.demand.note, '');
  assert.equal(state.evidence.jakarta.competition.note, '');
  assert.equal(createPlannerState().evidence.jakarta.demand.note, '');
  const result = evaluateCity(createPlannerState(), 'jakarta', TODAY);
  assert.equal(result.score, null);
  assert.equal(result.coverage, 0);
  assert.equal(result.confidence, 'none');
  assert.equal(result.ratedCount, 0);
  assert.equal(result.qualifiedCount, 0);
  assert.equal(result.gaps.length, 5);
  assert.ok(result.factors.every((factor) => !factor.qualified));
});

test('all factors are required: missing demand or regulation cannot produce an index', () => {
  for (const factor of FACTORS) {
    const state = filledState(5);
    state.evidence.jakarta[factor.id].rating = null;
    const result = evaluateCity(state, 'jakarta', TODAY);
    assert.equal(result.score, null, `${factor.id} must block the index`);
    assert.equal(result.qualifiedCount, 4);
    assert.equal(result.ratedCount, 4);
    assert.equal(result.coverage, 0.8);
    assert.equal(result.confidence, 'low');
    assert.match(result.gaps[0], new RegExp(factor.label));
  }
});

test('transparent weights normalize complete preparation ratings without blending runway', () => {
  assert.equal(FACTORS.reduce((sum, factor) => sum + factor.weight, 0), 100);
  for (const [value, expected] of [[1, 0], [3, 50], [5, 100]]) {
    const result = evaluateCity(filledState(value), 'jakarta', TODAY);
    assert.equal(result.score, expected);
    assert.equal(result.coverage, 1);
    assert.equal(result.confidence, 'self-reported');
    assert.equal(result.qualifiedCount, 5);
    assert.equal(result.gaps.length, value <= 2 ? 5 : 0);
  }
  const state = filledState(1);
  state.evidence.jakarta.demand.rating = 5;
  assert.equal(evaluateCity(state, 'jakarta', TODAY).score, 30);
  state.profile.runwayMonths = 0;
  assert.equal(evaluateCity(state, 'jakarta', TODAY).score, 30);
  state.profile.runwayMonths = 120;
  assert.equal(evaluateCity(state, 'jakarta', TODAY).score, 30);
  assert.equal(evaluateCity(state, 'manila', TODAY).score, 0);
});

test('profile scope changes preserve evidence but require review before a new index', () => {
  for (const [field, changed] of [
    ['segment', 'enterprise'], ['phase', 'expanding'], ['industry', 'logistics'],
    ['businessDescription', 'A new delivery service for restaurant owners.'],
  ]) {
    const state = filledState(5);
    const before = structuredClone(state.evidence);
    state.profile[field] = changed;
    const result = evaluateCity(state, 'jakarta', TODAY);
    assert.equal(result.score, null, field);
    assert.equal(result.ratedCount, 5);
    assert.equal(result.qualifiedCount, 0);
    assert.match(result.factors[0].reason, /Business profile changed/);
    assert.deepEqual(parsePlannerState(state).evidence, before);
    state.evidence.jakarta.demand.profileContext = getProfileContext(state.profile);
    assert.equal(evaluateCity(state, 'jakarta', TODAY).qualifiedCount, 1);
  }
  const state = filledState();
  delete state.evidence.jakarta.regulation.profileContext;
  assert.equal(evaluateCity(state, 'jakarta', TODAY).score, null);
  assert.equal(parsePlannerState(state).evidence.jakarta.regulation.profileContext, undefined);
  assert.doesNotMatch(evaluateCity(createPlannerState(), 'jakarta', TODAY).factors[0].reason, /Business profile changed/);
  const trimmed = { ...state.profile, businessDescription: '  Food delivery.  ' };
  assert.equal(getProfileContext(trimmed), getProfileContext({ ...trimmed, businessDescription: 'Food delivery.' }));
  assert.equal(getProfileContext(trimmed), getProfileContext({ ...trimmed, runwayMonths: 42 }));
});

test('complete but weak preparation retains concrete action gaps', () => {
  const state = filledState(2);
  const result = evaluateCity(state, 'jakarta', TODAY);
  assert.equal(result.score, 25);
  assert.equal(result.qualifiedCount, 5);
  assert.equal(result.gaps.length, 5);
  assert.match(result.gaps[0], /Preparation rated 2\/5/);
  assert.match(result.gaps[0], /customer interviews/);
});

test('strict UTC calendar dates reject invalid dates, future dates, and stale evidence', () => {
  for (const date of ['', '2026-02-29', '2026-02-31', '2026-13-01', '2026-1-01', '2026-10-25T00:00:00Z', 'tomorrow']) {
    const state = filledState();
    state.evidence.jakarta.regulation.observedOn = date;
    assert.equal(evaluateCity(state, 'jakarta', TODAY).score, null, date);
    assert.match(evaluateCity(state, 'jakarta', TODAY).factors[2].reason, /valid observation date/);
  }
  for (const [date, reason] of [['2026-10-26', /future/], ['2025-10-24', /older than 365/]]) {
    const state = filledState();
    state.evidence.jakarta.regulation.observedOn = date;
    const result = evaluateCity(state, 'jakarta', TODAY);
    assert.equal(result.score, null);
    assert.match(result.factors[2].reason, reason);
  }
  const boundary = filledState();
  boundary.evidence.jakarta.regulation.observedOn = '2025-10-25';
  assert.equal(evaluateCity(boundary, 'jakarta', TODAY).score, 50);
  boundary.evidence.jakarta.regulation.observedOn = '2024-02-29';
  assert.equal(evaluateCity(boundary, 'jakarta', '2024-03-01').factors[2].qualified, true);
  assert.throws(() => evaluateCity(boundary, 'jakarta', '2026-02-31'), RangeError);
});

test('a high rating alone or an insufficient note does not qualify as preparation evidence', () => {
  const state = createPlannerState();
  state.evidence.jakarta.demand.rating = 5;
  assert.equal(evaluateCity(state, 'jakarta', TODAY).ratedCount, 1);
  assert.equal(evaluateCity(state, 'jakarta', TODAY).qualifiedCount, 0);
  for (const note of [' ', 'short finding', ' '.repeat(50)]) {
    const populated = filledState();
    populated.evidence.jakarta.demand.note = note;
    assert.equal(evaluateCity(populated, 'jakarta', TODAY).score, null);
  }
  const populated = filledState();
  populated.evidence.jakarta.demand.note = 'x'.repeat(20);
  assert.equal(evaluateCity(populated, 'jakarta', TODAY).score, 50);
});

test('unsafe or invalid source URLs do not qualify and embedded credentials are not retained', () => {
  for (const url of [
    '', 'http://example.org', 'javascript:alert(1)', 'data:text/html,hello',
    'https://user:secret@example.org', 'https://secret@example.org', '//example.org',
    'https://', 'https://example.org/' + 'x'.repeat(2048),
  ]) {
    const state = filledState();
    state.evidence.jakarta.regulation.sourceUrl = url;
    assert.equal(parsePlannerState(state).evidence.jakarta.regulation.sourceUrl, '');
    assert.equal(evaluateCity(state, 'jakarta', TODAY).score, null, url.slice(0, 70));
  }
  const state = filledState();
  state.evidence.jakarta.regulation.sourceUrl = ' https://example.org/a?query=b#section ';
  assert.equal(parsePlannerState(state).evidence.jakarta.regulation.sourceUrl, 'https://example.org/a?query=b#section');
  assert.equal(evaluateCity(state, 'jakarta', TODAY).score, 50);
});

test('persisted profile and evidence enforce enums, numeric limits, and bounded text', () => {
  const state = filledState();
  const hostile = {
    ...state,
    profile: {
      segment: '__proto__', phase: 'launching', industry: 'unknown',
      businessDescription: 'x'.repeat(9000), runwayMonths: Infinity, token: 'ignored',
    },
    evidence: {
      jakarta: {
        ...state.evidence.jakarta,
        demand: { rating: '5', note: 'x'.repeat(9000), sourceUrl: {}, observedOn: ['2026-10-25'], profileContext: 'x'.repeat(9000), extra: true },
      },
      manila: [],
      constructor: { malicious: true },
    },
  };
  const clean = parsePlannerState(hostile);
  assert.equal(clean.profile.segment, 'founder');
  assert.equal(clean.profile.phase, 'exploring');
  assert.equal(clean.profile.industry, 'technology');
  assert.equal(clean.profile.businessDescription.length, 1200);
  assert.equal(clean.profile.runwayMonths, null);
  assert.equal(clean.evidence.jakarta.demand.rating, null);
  assert.equal(clean.evidence.jakarta.demand.note.length, 2000);
  assert.equal(clean.evidence.jakarta.demand.sourceUrl, '');
  assert.equal(clean.evidence.jakarta.demand.observedOn, '');
  assert.equal(clean.evidence.jakarta.demand.profileContext, undefined);
  assert.deepEqual(Object.keys(clean.profile), ['segment', 'phase', 'industry', 'businessDescription', 'runwayMonths']);
  assert.deepEqual(Object.keys(clean.evidence), ['jakarta', 'manila']);
  for (const invalid of [-1, 121, NaN, Infinity, '12', null]) {
    state.profile.runwayMonths = invalid;
    assert.equal(parsePlannerState(state).profile.runwayMonths, null);
  }
  for (const invalid of [0, 6, -1, 2.5, NaN, Infinity, '5']) {
    state.evidence.jakarta.demand.rating = invalid;
    assert.equal(parsePlannerState(state).evidence.jakarta.demand.rating, null);
  }
});

test('prototype keys, inherited fields, and throwing accessors cannot alter defaults or prototypes', () => {
  const data = JSON.parse('{"version":1,"__proto__":{"polluted":true},"profile":{"__proto__":{"segment":"enterprise"}},"evidence":{"__proto__":{"demand":{"rating":5}}}}');
  assert.deepEqual(parsePlannerState(data), createPlannerState());
  assert.equal({}.polluted, undefined);
  assert.deepEqual(parsePlannerState(Object.create({ version: 1, profile: { segment: 'enterprise' } })), createPlannerState());
  const broken = { version: 1, get profile() { throw new Error('untrusted getter'); } };
  assert.deepEqual(parsePlannerState(broken), createPlannerState());
});

test('evaluation is pure and published methodology distinguishes preparation from prediction', () => {
  const state = filledState();
  const before = structuredClone(state);
  evaluateCity(state, 'jakarta', TODAY);
  assert.deepEqual(state, before);
  assert.match(METHODOLOGY, /not a survival probability/);
  assert.match(METHODOLOGY, /self-reported/);
  assert.match(METHODOLOGY, /Runway is a separate/);
  for (const city of CITIES) {
    for (const source of city.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert.ok(source.scope);
    }
  }
  assert.match(CITIES.find((city) => city.id === 'manila').sources.at(-1).scope, /not all Metro Manila/);
});
