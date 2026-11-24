import { MARKET_SNAPSHOT_META, type MarketFundamental } from '../data/marketSnapshot.ts';

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
  fromYear: 2014,
  toYear: MARKET_SNAPSHOT_META.observationYear,
  unit: 'percent',
  method: '100 × (ending nominal GDP − starting nominal GDP) / starting nominal GDP, rounded to one decimal. Missing endpoints or a zero starting value yield null.',
  limitation: 'The percentage covers the whole period in current US dollars. Prices and exchange rates affect it. It does not measure inflation-adjusted growth or local customer demand.',
} as const;

export function historicalGdpAtYear(snapshot: MarketFundamental | undefined, year: number): number | null {
  if (!Number.isInteger(year) || year < NOMINAL_GDP_CHANGE.fromYear || year > MARKET_SNAPSHOT_META.observationYear) return null;
  const value = year === MARKET_SNAPSHOT_META.observationYear
    ? snapshot?.gdpUsd
    : snapshot?.gdpSeries.find(point => point.year === year)?.value;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

export function nominalGdpChangePercent(series: MarketFundamental['gdpSeries'] | undefined): number | null {
  const start = series?.find(point => point.year === NOMINAL_GDP_CHANGE.fromYear)?.value;
  const end = series?.find(point => point.year === NOMINAL_GDP_CHANGE.toYear)?.value;
  if (start === undefined || end === undefined || !Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end < 0) return null;
  const change = ((end - start) / start) * 100;
  return Number.isFinite(change) ? Number(change.toFixed(1)) : null;
}
