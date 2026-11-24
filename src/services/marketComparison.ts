import { MARKET_SNAPSHOT_META, type MarketFundamental } from '../data/marketSnapshot.ts';

export const NOMINAL_GDP_CHANGE = {
  fromYear: 2014,
  toYear: MARKET_SNAPSHOT_META.observationYear,
  unit: 'percent',
  method: '100 × (ending nominal GDP − starting nominal GDP) / starting nominal GDP, rounded to one decimal. Missing endpoints or a zero starting value yield null.',
  limitation: 'The percentage covers the whole period in current US dollars. Prices and exchange rates affect it. It does not measure inflation-adjusted growth or local customer demand.',
} as const;

export function nominalGdpChangePercent(series: MarketFundamental['gdpSeries'] | undefined): number | null {
  const start = series?.find(point => point.year === NOMINAL_GDP_CHANGE.fromYear)?.value;
  const end = series?.find(point => point.year === NOMINAL_GDP_CHANGE.toYear)?.value;
  if (start === undefined || end === undefined || !Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end < 0) return null;
  const change = ((end - start) / start) * 100;
  return Number.isFinite(change) ? Number(change.toFixed(1)) : null;
}
