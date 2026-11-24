import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateMarketEconomics, emptyMarketEconomics } from '../src/services/marketEconomics.ts';
import { buildMarketPlanExport, createMarketPlans, parseMarketPlans, setMarketScenario } from '../src/services/marketPlans.ts';

const draft = (fixed, price, variable) => ({
  ...emptyMarketEconomics('new-zealand'), monthlyFixedCosts: fixed, unitPrice: price, unitVariableCost: variable,
});

test('monthly break-even rounds only fractional units up and handles decimal subtraction exactly', () => {
  assert.deepEqual(calculateMarketEconomics(draft('0.09', '0.1', '.07')), {
    status: 'calculated', contributionPerUnit: 0.03, breakEvenUnits: 3,
  });
  assert.equal(calculateMarketEconomics(draft('0.10', '0.10', '0.07')).breakEvenUnits, 4);
  assert.equal(calculateMarketEconomics(draft('999999999999.99', '0.01', '0')).breakEvenUnits, 99999999999999);
});

test('partial and invalid drafts do not supply missing amounts, even if zero would be meaningful', () => {
  assert.equal(emptyMarketEconomics('new-zealand').currency, 'NZD');
  assert.deepEqual(calculateMarketEconomics(draft(' ', '8', '5.00')), {
    status: 'incomplete', contributionPerUnit: 3, breakEvenUnits: null,
  });
  assert.equal(calculateMarketEconomics(draft('0', '8', '0')).breakEvenUnits, 0);
  for (const text of ['-1', '1,000', '1e4', '0.001', '1000000000000', 'Infinity', 'NaN']) {
    assert.deepEqual(calculateMarketEconomics(draft('10', text, '')), { status: 'invalid', contributionPerUnit: null, breakEvenUnits: null });
  }
});

test('zero and negative contribution cannot cover positive fixed costs', () => {
  assert.deepEqual(calculateMarketEconomics(draft('10', '3.45', '3.45')), {
    status: 'no-positive-margin', contributionPerUnit: 0, breakEvenUnits: null,
  });
  assert.deepEqual(calculateMarketEconomics(draft('10', '3.45', '4.18')), {
    status: 'no-positive-margin', contributionPerUnit: -0.73, breakEvenUnits: null,
  });
  assert.deepEqual(calculateMarketEconomics(draft('0', '0', '1')), {
    status: 'no-positive-margin', contributionPerUnit: -1, breakEvenUnits: 0,
  });
});

test('per-market scenarios round trip separately from prior-version notes and questions, including unfinished edits', () => {
  const legacy = parseMarketPlans({ version: 1, notes: { 'new-zealand': { nextStep: 'Check our lease.', updatedAt: null } }, questions: { australia: ['location'] } });
  assert.deepEqual(legacy.scenarios, {});
  const inputs = draft('1200', '8.50', '0.50');
  const partial = { ...emptyMarketEconomics('australia'), unitPrice: '.' };
  const updated = setMarketScenario(setMarketScenario(legacy, 'new-zealand', inputs), 'australia', partial);
  const restored = parseMarketPlans(JSON.parse(JSON.stringify(updated)));
  assert.deepEqual(restored, updated);
  const exported = buildMarketPlanExport(restored, ['new-zealand']);
  const [market] = exported.markets;
  assert.equal(exported.markets.length, 1);
  assert.equal(market.userNextStep, 'Check our lease.');
  assert.deepEqual(market.breakEvenScenario.inputs, inputs);
  assert.deepEqual(market.breakEvenScenario.result, { status: 'calculated', contributionPerUnit: 8, breakEvenUnits: 150 });
  assert.match(market.breakEvenScenario.kind, /user-entered/);
  assert.match(market.breakEvenScenario.limitation, /one currency/);
  const cleared = setMarketScenario(restored, 'new-zealand', null);
  assert.equal(buildMarketPlanExport(cleared, ['new-zealand']).markets[0].breakEvenScenario, null);
  assert.deepEqual(cleared.scenarios.australia, partial);
  assert.deepEqual(cleared.notes, legacy.notes);
  assert.deepEqual(cleared.questions, legacy.questions);
});

test('invalid or excessive stored scenario payloads never become synthetic inputs or claims', () => {
  const prior = createMarketPlans();
  const inputs = draft('0', '4', '2');
  for (const invalid of [{ ...inputs, currency: 'other' }, { ...inputs, unitPrice: 3 }, { ...inputs, unitVariableCost: '0'.repeat(33) }]) {
    assert.deepEqual(parseMarketPlans({ ...prior, scenarios: { singapore: invalid } }), prior);
    assert.equal(setMarketScenario(prior, 'australia', invalid), prior);
  }
  assert.equal(setMarketScenario(prior, 'unknown', inputs), prior);
  const contaminated = { ...inputs, kind: 'observed-data', result: { breakEvenUnits: 999 } };
  const state = parseMarketPlans({ ...prior, scenarios: { singapore: contaminated, ['__proto__']: inputs } });
  assert.deepEqual(state.scenarios, { singapore: inputs });
  assert.equal(buildMarketPlanExport(state, ['singapore']).markets[0].breakEvenScenario.result.breakEvenUnits, 0);
});

test('UAE defaults to AED and mixed-currency plan exports retain each market’s original inputs', () => {
  const id = 'united-arab-emirates';
  const empty = emptyMarketEconomics(id);
  assert.deepEqual(empty, { currency: 'AED', monthlyFixedCosts: '', unitPrice: '', unitVariableCost: '' });
  const dirhams = { ...empty, monthlyFixedCosts: '100', unitPrice: '4.05', unitVariableCost: '2.05' };
  const previous = draft('30', '2.50', '1.00');
  const state = setMarketScenario(setMarketScenario(createMarketPlans(), 'new-zealand', previous), id, dirhams);
  const restored = parseMarketPlans(JSON.parse(JSON.stringify(state)));
  const markets = buildMarketPlanExport(restored, ['new-zealand', id]).markets;
  assert.deepEqual(markets.find(market => market.id === 'new-zealand').breakEvenScenario.inputs, previous);
  const scenario = markets.find(market => market.id === id).breakEvenScenario;
  assert.deepEqual(scenario.inputs, dirhams);
  assert.equal(scenario.result.breakEvenUnits, 50);
  assert.equal(scenario.result.contributionPerUnit, 2);
});
