import { MARKET_SNAPSHOT_META, type MarketFundamental } from '../data/marketSnapshot.ts';

const firstYear = 2014;
const latestYear = MARKET_SNAPSHOT_META.observationYear;
export const HISTORY_YEARS: readonly number[] = Object.freeze(
  Array.from({ length: latestYear - firstYear + 1 }, (_, offset) => firstYear + offset),
);
export type HistoricalMetric = 'gdpUsd' | 'population' | 'gdpPerPerson';
type Series = ReadonlyArray<MarketFundamental['gdpSeries'][number]>;

export const GDP_PER_PERSON = {
  year: MARKET_SNAPSHOT_META.observationYear,
  unit: 'current US dollars per person',
  method: 'Flow divides annual nominal GDP by the national population for the same year. A missing input or a zero population yields null.',
  limitation: 'Average economic output per resident. Household income, spending and customer demand require separate evidence.',
} as const;

export function gdpPerPerson(snapshot: Pick<MarketFundamental, 'gdpUsd' | 'population'> | undefined): number | null {
  if (!snapshot) return null;
  const { gdpUsd, population } = snapshot;
  if (!Number.isFinite(gdpUsd) || gdpUsd < 0 || !Number.isFinite(population) || population <= 0) return null;
  const perPerson = gdpUsd / population;
  return Number.isFinite(perPerson) ? perPerson : null;
}

export const NOMINAL_GDP_CHANGE = {
  fromYear: firstYear,
  toYear: latestYear,
  unit: 'percent',
  method: '100 × (ending nominal GDP − starting nominal GDP) / starting nominal GDP, rounded to one decimal. Missing endpoints or a zero starting value yield null.',
  limitation: 'The percentage covers the whole period in current US dollars. Prices and exchange rates affect it. It does not measure inflation-adjusted growth or local customer demand.',
} as const;

export const POPULATION_CHANGE = {
  fromYear: firstYear,
  toYear: latestYear,
  unit: 'percent',
  method: '100 × (ending population − starting population) / starting population, rounded to one decimal. Missing endpoints or a zero starting population yield null.',
  limitation: 'The percentage covers the whole period for the national population. City catchments and customer demand require separate evidence.',
} as const;

function validObservation(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function seriesObservation(series: Series | undefined, year: number): number | null {
  if (!Array.isArray(series)) return null;
  return validObservation(series.find(point => point?.year === year)?.value);
}

function observedMetric(snapshot: Partial<MarketFundamental>, metric: 'gdpUsd' | 'population', year: number): number | null {
  // The headline scalars represent the snapshot year and are also present in older snapshots.
  if (year === latestYear) return validObservation(snapshot[metric]);
  return seriesObservation(metric === 'gdpUsd' ? snapshot.gdpSeries : snapshot.populationSeries, year);
}

export function historicalMetricAtYear(snapshot: Partial<MarketFundamental> | undefined, metric: HistoricalMetric, year: number): number | null {
  if (!snapshot || !HISTORY_YEARS.includes(year)) return null;
  if (metric === 'gdpUsd' || metric === 'population') return observedMetric(snapshot, metric, year);
  if (metric !== 'gdpPerPerson') return null;
  const gdpUsd = observedMetric(snapshot, 'gdpUsd', year);
  const population = observedMetric(snapshot, 'population', year);
  return gdpUsd === null || population === null ? null : gdpPerPerson({ gdpUsd, population });
}

export function historicalGdpAtYear(snapshot: Partial<MarketFundamental> | undefined, year: number): number | null {
  return historicalMetricAtYear(snapshot, 'gdpUsd', year);
}

function periodChangePercent(series: Series | undefined): number | null {
  const start = seriesObservation(series, firstYear);
  const end = seriesObservation(series, latestYear);
  if (start === null || start === 0 || end === null) return null;
  const change = ((end - start) / start) * 100;
  if (!Number.isFinite(change)) return null;
  const rounded = Number(change.toFixed(1));
  return rounded === 0 ? 0 : rounded;
}

export function nominalGdpChangePercent(series: Series | undefined): number | null {
  return periodChangePercent(series);
}

export function populationChangePercent(series: Series | undefined): number | null {
  return periodChangePercent(series);
}
