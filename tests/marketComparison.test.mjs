import assert from 'node:assert/strict';
import test from 'node:test';
import { gdpPerPerson, historicalGdpAtYear, nominalGdpChangePercent } from '../src/services/marketComparison.ts';

function series(start, end) {
  return [{ year: 2014, value: start }, { year: 2023, value: end }];
}

test('nominal GDP change uses the named years regardless of order and reports a whole-period percent', () => {
  assert.equal(nominalGdpChangePercent([...series(300, 400).reverse(), { year: 2024, value: 9999 }]), 33.3);
  assert.equal(nominalGdpChangePercent(series(400, 300)), -25);
  assert.equal(nominalGdpChangePercent(series(400, 400)), 0);
  assert.equal(nominalGdpChangePercent(series(400, 0)), -100);
});

test('a different year, absent endpoint, invalid observation or zero base cannot imply a percent', () => {
  for (const input of [undefined, [], [{ year: 2014, value: 56 }, { year: 2022, value: 200 }],
    series(0, 0), series(0, 100), series(NaN, 100), series(-10, 100), series(10, Infinity), series(10, -1)]) {
    assert.equal(nominalGdpChangePercent(input), null);
  }
});

test('annual GDP selects only the requested observation and preserves zero', () => {
  const snapshot = { population: 100, gdpUsd: 27, gdpSeries: [
    { year: 2017, value: 0 }, { year: 2014, value: 9 }, { year: 2015, value: NaN }, { year: 2019, value: -7 },
  ] };
  assert.equal(historicalGdpAtYear(snapshot, 2014), 9);
  assert.equal(historicalGdpAtYear(snapshot, 2017), 0);
  assert.equal(historicalGdpAtYear(snapshot, 2023), 27);
  for (const year of [2013, 2015, 2016, 2019, 2024, 2017.5]) assert.equal(historicalGdpAtYear(snapshot, year), null);
  assert.equal(historicalGdpAtYear(undefined, 2014), null);
});

test('GDP per person divides the same-period national observations without display rounding', () => {
  assert.equal(gdpPerPerson({ gdpUsd: 10, population: 3 }), 10 / 3);
  assert.equal(gdpPerPerson({ gdpUsd: 3340032380668.0356, population: 68526000 }), 3340032380668.0356 / 68526000);
  assert.equal(gdpPerPerson({ gdpUsd: 0, population: 100 }), 0);
  assert.equal(gdpPerPerson({ gdpUsd: 100, population: 10, gdpSeries: [{ year: 2014, value: 999 }] }), 10);
});

test('GDP per person never coerces missing or malformed observations and rejects overflow', () => {
  for (const input of [undefined, null, false, 0, 'snapshot', {},
    { gdpUsd: 100 }, { population: 10 }, { gdpUsd: '100', population: 10 },
    { gdpUsd: 100, population: '10' }, { gdpUsd: null, population: 10 },
    { gdpUsd: 100, population: null }, { gdpUsd: false, population: 10 },
    { gdpUsd: -1, population: 10 }, { gdpUsd: 100, population: -1 },
    { gdpUsd: 100, population: 0 }, { gdpUsd: 0, population: 0 },
    { gdpUsd: NaN, population: 10 }, { gdpUsd: Infinity, population: 10 },
    { gdpUsd: 100, population: NaN }, { gdpUsd: 100, population: Infinity },
    { gdpUsd: Number.MAX_VALUE, population: Number.MIN_VALUE }]) {
    assert.equal(gdpPerPerson(input), null, `Rejected observation: ${JSON.stringify(input)}`);
  }
});
