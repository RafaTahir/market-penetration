import assert from 'node:assert/strict';
import test from 'node:test';
import { historicalGdpAtYear, nominalGdpChangePercent } from '../src/services/marketComparison.ts';

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
