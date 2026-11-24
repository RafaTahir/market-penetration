import assert from 'node:assert/strict';
import test from 'node:test';
import { MARKET_FUNDAMENTALS } from '../src/data/marketSnapshot.ts';
import {
  GDP_PER_PERSON, HISTORY_YEARS, POPULATION_CHANGE, gdpPerPerson, historicalGdpAtYear, historicalMetricAtYear,
  nominalGdpChangePercent, populationChangePercent,
} from '../src/services/marketComparison.ts';

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

test('annual GDP per person requires observations for the same year and keeps full precision', () => {
  const snapshot = {
    gdpUsd: 200, population: 50,
    gdpSeries: [{ year: 2015, value: 0 }, { year: 2014, value: 20 }, { year: 2016, value: 25 }],
    populationSeries: [{ year: 2017, value: 5 }, { year: 2015, value: 3 }, { year: 2016, value: 7 }],
  };
  assert.equal(historicalMetricAtYear(snapshot, 'gdpUsd', 2014), 20);
  assert.equal(historicalMetricAtYear(snapshot, 'population', 2017), 5);
  assert.equal(historicalMetricAtYear(snapshot, 'gdpPerPerson', 2015), 0);
  assert.equal(historicalMetricAtYear(snapshot, 'gdpPerPerson', 2016), 25 / 7);
  for (const year of [2014, 2017, 2018]) assert.equal(historicalMetricAtYear(snapshot, 'gdpPerPerson', year), null);
  assert.equal(historicalMetricAtYear(snapshot, 'population', 2014), null);
  assert.equal(historicalMetricAtYear(snapshot, 'gdpUsd', 2017), null);
});

test('the headline year supports older snapshots with scalars and no history arrays', () => {
  const snapshot = { gdpUsd: 330, population: 11 };
  assert.deepEqual(['gdpUsd', 'population', 'gdpPerPerson'].map(metric =>
    historicalMetricAtYear(snapshot, metric, GDP_PER_PERSON.year)), [330, 11, 30]);
  for (const metric of ['gdpUsd', 'population', 'gdpPerPerson']) {
    assert.equal(historicalMetricAtYear(snapshot, metric, 2014), null);
    for (const year of [2013, 2016.5, 2024, Infinity, NaN, '2023']) assert.equal(historicalMetricAtYear(snapshot, metric, year), null);
  }
});

test('annual levels preserve measured population zero and reject invalid values, shapes and overflowing ratios', () => {
  const snapshot = { gdpSeries: series(10, 20), populationSeries: series(0, 10) };
  assert.equal(historicalMetricAtYear(snapshot, 'population', 2014), 0);
  assert.equal(historicalMetricAtYear(snapshot, 'gdpPerPerson', 2014), null);
  for (const value of [-1, null, '5', NaN, Infinity]) {
    const malformed = { ...snapshot, populationSeries: [null, { year: 2014, value }] };
    assert.equal(historicalMetricAtYear(malformed, 'population', 2014), null);
    assert.equal(historicalMetricAtYear(malformed, 'gdpPerPerson', 2014), null);
  }
  assert.equal(historicalMetricAtYear({ populationSeries: {} }, 'population', 2015), null);
  assert.equal(historicalMetricAtYear({ gdpSeries: series(Number.MAX_VALUE, 0), populationSeries: series(Number.MIN_VALUE, 10) }, 'gdpPerPerson', 2014), null);
  assert.equal(historicalMetricAtYear(undefined, 'population', 2015), null);
  assert.equal(historicalMetricAtYear(snapshot, 'unknown', 2015), null);
});

test('national population change uses only the two named endpoints and rounds the whole-period percent once', () => {
  assert.equal(POPULATION_CHANGE.fromYear, 2014);
  assert.equal(POPULATION_CHANGE.toYear, 2023);
  assert.equal(POPULATION_CHANGE.unit, 'percent');
  assert.equal(populationChangePercent([{ year: 2023, value: 160 }, { year: 2019, value: 0 }, { year: 2014, value: 101 }]), 58.4);
  assert.equal(populationChangePercent(series(123, 70)), -43.1);
  assert.equal(populationChangePercent(series(42, 0)), -100);
  assert.equal(populationChangePercent(series(42, 42)), 0);
  assert.equal(populationChangePercent(series(100000, 99999)), 0);
  for (const input of [null, {}, [], series(0, 7), series(-1, 1), series(25, -1), series(15, '20'),
    series(Infinity, 30), series(Number.MIN_VALUE, Number.MAX_VALUE), [{ year: 2015, value: 10 }, { year: 2023, value: 100 }]]) {
    assert.equal(populationChangePercent(input), null);
  }
});

test('annual lookups and previous GDP API agree with the bundled observations and matching headline year', () => {
  assert.deepEqual(HISTORY_YEARS, [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]);
  for (const [country, snapshot] of Object.entries(MARKET_FUNDAMENTALS)) {
    for (const year of HISTORY_YEARS) {
      const headlineYear = year === GDP_PER_PERSON.year;
      const gdp = snapshot.gdpSeries.find(point => point.year === year)?.value ?? (headlineYear ? snapshot.gdpUsd : null);
      const population = snapshot.populationSeries.find(point => point.year === year)?.value ?? (headlineYear ? snapshot.population : null);
      assert.equal(historicalGdpAtYear(snapshot, year), gdp, `${country} GDP ${year}`);
      assert.equal(historicalMetricAtYear(snapshot, 'population', year), population, `${country} population ${year}`);
      const perPerson = gdp !== null && population > 0 ? gdp / population : null;
      assert.equal(historicalMetricAtYear(snapshot, 'gdpPerPerson', year), perPerson, `${country} output per resident ${year}`);
    }
  }
});
