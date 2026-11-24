import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateMarketEconomics, calculateMonthlySales, emptyMarketEconomics, formatSalesAmount, parseMarketEconomics, sameMarketEconomics } from '../src/services/marketEconomics.ts';
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

test('Cambodian plans start in KHR and restore deliberately entered USD or KHR amounts exactly', () => {
  const empty = emptyMarketEconomics('cambodia');
  assert.deepEqual(empty, { currency: 'KHR', monthlyFixedCosts: '', unitPrice: '', unitVariableCost: '' });
  for (const [currency, fixed, price, variable, units] of [
    ['KHR', '450000', '3500', '2000', 300],
    ['USD', '123.45', '5.20', '2.70', 50],
  ]) {
    const inputs = {currency, monthlyFixedCosts: fixed, unitPrice: price, unitVariableCost: variable};
    const state = setMarketScenario(createMarketPlans(), 'cambodia', inputs);
    const restored = parseMarketPlans(JSON.parse(JSON.stringify(state)));
    const [market] = buildMarketPlanExport(restored, ['cambodia']).markets;
    assert.deepEqual(market.breakEvenScenario.inputs, inputs);
    assert.equal(market.breakEvenScenario.result.breakEvenUnits, units);
  }
});

test('expected monthly unit drafts preserve zero and omit blank entries from older worksheets', () => {
  const legacy = draft('12.40', '1.50', '.7');
  for (const volume of [undefined, '', '  ']) {
    const parsed = parseMarketEconomics({ ...legacy, expectedMonthlyUnits: volume });
    assert.deepEqual(parsed, legacy);
    assert.equal(Object.hasOwn(parsed, 'expectedMonthlyUnits'), false);
    assert.equal(sameMarketEconomics(legacy, { ...legacy, expectedMonthlyUnits: volume }), true);
  }
  for (const volume of ['0', '42', ' 2 ', 'invalid']) {
    const parsed = parseMarketEconomics({ ...legacy, expectedMonthlyUnits: volume });
    assert.equal(parsed.expectedMonthlyUnits, volume);
    assert.equal(sameMarketEconomics(parsed, { ...parsed }), true);
    assert.equal(sameMarketEconomics(parsed, legacy), false);
  }
  for (const volume of [0, null, [], '9'.repeat(33)]) {
    assert.equal(parseMarketEconomics({ ...legacy, expectedMonthlyUnits: volume }), null);
  }
  assert.equal(sameMarketEconomics(undefined, undefined), true);
  assert.equal(sameMarketEconomics(undefined, legacy), false);
  for (const updated of [{currency: 'GBP'}, {unitPrice: '2'}, {monthlyFixedCosts: '13'}, {unitVariableCost: '0'}]) {
    assert.equal(sameMarketEconomics(legacy, { ...legacy, ...updated }), false);
  }
});

test('one month of sales calculates exact revenue, costs and signed results across contribution margins', () => {
  const examples = [
    // [fixed, price, variable, volume, revenue, total cost, net result]
    ['0.09', '.1', '.07', '3', '0.30', '0.30', '0.00'],
    ['0.09', '.1', '.07', '4', '0.40', '0.37', '0.03'],
    ['100', '4.55', '1.25', '0', '0.00', '100.00', '-100.00'],
    ['0', '3.45', '3.45', '3', '10.35', '10.35', '0.00'],
    ['15', '3.45', '4.18', '3', '10.35', '27.54', '-17.19'],
    ['0', '0', '0.01', '1', '0.00', '0.01', '-0.01'],
    ['999999999999.99', '999999999999.99', '999999999999.98', '999999999999',
      '999999999998990000000000.01', '999999999999980000000000.01', '-990000000000.00'],
  ];
  for (const [fixed, price, variable, volume, revenue, totalCosts, netResult] of examples) {
    const inputs = { ...draft(fixed, price, variable), expectedMonthlyUnits: volume };
    assert.deepEqual(calculateMonthlySales(inputs), { status: 'calculated', revenue, totalCosts, netResult });
    assert.deepEqual(calculateMarketEconomics(inputs), calculateMarketEconomics(draft(fixed, price, variable)));
  }
});

test('missing inputs and malformed sales or cost assumptions produce no estimated amounts', () => {
  const empty = { revenue: null, totalCosts: null, netResult: null };
  const inputs = draft('1', '1', '1');
  for (const volume of [undefined, '', '  ']) {
    assert.deepEqual(calculateMonthlySales({ ...inputs, expectedMonthlyUnits: volume }), { status: 'incomplete', ...empty });
  }
  for (const volume of ['-1', '1.0', '0.5', '1000000000000', '1e3', '+1', '1,000', 0, null]) {
    assert.deepEqual(calculateMonthlySales({ ...inputs, expectedMonthlyUnits: volume }), { status: 'invalid-volume', ...empty });
  }
  for (const field of ['unitPrice', 'unitVariableCost', 'monthlyFixedCosts']) {
    assert.deepEqual(calculateMonthlySales({ ...inputs, expectedMonthlyUnits: '0', [field]: '' }), { status: 'incomplete', ...empty });
    assert.deepEqual(calculateMonthlySales({ ...inputs, expectedMonthlyUnits: '0', [field]: '-1' }), { status: 'invalid-costs', ...empty });
  }
});


test('formatted sales amounts retain every digit and the sign on a loss smaller than one', () => {
  assert.equal(formatSalesAmount('999999999999980000000000.01'), '999,999,999,999,980,000,000,000.01');
  assert.equal(formatSalesAmount('-990000000000.00'), '-990,000,000,000.00');
  assert.equal(formatSalesAmount('-0.01'), '-0.01');
  assert.equal(formatSalesAmount('0.00'), '0.00');
});
