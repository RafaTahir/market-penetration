import assert from 'node:assert/strict';
import test from 'node:test';
import { nominalGdpChangePercent } from '../src/services/marketComparison.ts';

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
