import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MarketGuide } from '../data/marketCatalog';
import { MARKET_FUNDAMENTALS } from '../data/marketSnapshot';
import { HISTORY_YEARS, historicalMetricAtYear, type HistoricalMetric } from '../services/marketComparison';
import './MarketTrend.css';

interface MarketTrendProps {
  markets: readonly MarketGuide[];
  marketId: string;
  onMarketChange: (id: string) => void;
  metric: HistoricalMetric;
  year: number;
  onYearChange: (year: number) => void;
}

const labels = {
  gdpUsd: { name: 'Nominal GDP', unit: 'Current US dollars' },
  population: { name: 'Population', unit: 'People' },
  gdpPerPerson: { name: 'GDP per person', unit: 'Current US dollars per person' },
} as const;
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumSignificantDigits: 4 });
const precise = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 21 });
const firstYear = HISTORY_YEARS[0];
const lastYear = HISTORY_YEARS[HISTORY_YEARS.length - 1];
const yearWidth = 100 / (lastYear - firstYear + 1);
const xFor = (year: number) => (year - firstYear + .5) * yearWidth;

function valueAxis(values: number[]) {
  if (!values.length) return null;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    const margin = Math.max(1, max * .05);
    min = Math.max(0, min - margin);
    max += margin;
  }
  const rough = (max - min) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const multiple = [1, 2, 2.5, 5, 10].find(value => value * magnitude >= rough) ?? 10;
  const step = multiple * magnitude;
  const lower = Math.floor(min / step);
  const upper = Math.ceil(max / step);
  return {
    ticks: Array.from({ length: upper - lower + 1 }, (_, i) => (lower + i) * step),
    yFor: (value: number) => 93 - 86 * ((value / step - lower) / (upper - lower)),
  };
}

export default function MarketTrend({ markets, marketId, onMarketChange, metric, year, onYearChange }: MarketTrendProps) {
  const id = useId().replace(/:/g, '');
  const market = markets.find(item => item.id === marketId) ?? markets[0];
  if (!market) return <p className="mf-empty">Choose a market to explore its annual observations.</p>;

  const { name, unit } = labels[metric];
  const snapshot = MARKET_FUNDAMENTALS[market.countryCode];
  const points = HISTORY_YEARS.map(observedYear => ({
    year: observedYear, value: historicalMetricAtYear(snapshot, metric, observedYear),
  }));
  const current = points.find(point => point.year === year)?.value ?? null;
  const axis = valueAxis(points.flatMap(point => point.value === null ? [] : [point.value]));
  const segments: { x: number; y: number }[][] = [];
  let segment: { x: number; y: number }[] = [];
  for (const point of points) {
    if (point.value === null || !axis) {
      segment = [];
      continue;
    }
    if (!segment.length) segments.push(segment);
    segment.push({ x: xFor(point.year), y: axis.yFor(point.value) });
  }

  return <section className="market-trend" aria-label="Historical market trend">
    <div className="mt-header">
      <div className="mt-market">
        <label htmlFor={`${id}-trend-market`}>Trend market</label>
        <select id={`${id}-trend-market`} value={market.id} onChange={event => onMarketChange(event.target.value)}>
          {markets.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <div className="mt-readout" aria-live="polite" aria-atomic="true">
        <span>{year} · {name}{metric === 'gdpPerPerson' && ' · Derived'}</span>
        {current === null ? <strong>Unavailable</strong> : <data value={current} title={`${precise.format(current)} ${unit.toLowerCase()}`}>
          {metric !== 'population' && 'US$'}{compact.format(current)}
        </data>}
      </div>
    </div>
    {axis ? <>
      <div className="mt-scale-caption"><span>{unit}</span><span>Linear axis · {market.name}’s range</span></div>
      <div className="mt-chart">
        <div className="mt-y-axis" aria-hidden="true">
          {axis.ticks.map(tick => <span key={tick} style={{ top: `${axis.yFor(tick)}%` }}>{compact.format(tick)}</span>)}
        </div>
        <div className="mt-plot">
          <svg role="img" aria-labelledby={`${id}-trend-title`} aria-describedby={`${id}-trend-desc`}>
            <title id={`${id}-trend-title`}>{market.name} · {name}, {firstYear}–{lastYear}</title>
            <desc id={`${id}-trend-desc`}>{unit}. The vertical scale covers this market’s historical range. Connected points are consecutive annual observations. Exact values are available in the annual table below.</desc>
            <defs><linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="var(--mf-teal)" stopOpacity=".22" />
              <stop offset="1" stopColor="var(--mf-teal)" stopOpacity=".025" />
            </linearGradient></defs>
            {axis.ticks.map(tick => <line className="mt-grid-line" key={tick} x1="0%" x2="100%"
              y1={`${axis.yFor(tick)}%`} y2={`${axis.yFor(tick)}%`} />)}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {segments.map(run => {
                const vertices = run.map(point => `${point.x},${point.y}`).join(' ');
                return <g key={run[0].x}>
                  <polygon points={`${run[0].x},93 ${vertices} ${run[run.length - 1].x},93`} fill={`url(#${id}-area)`} />
                  <polyline points={vertices} className="mt-line" vectorEffect="non-scaling-stroke" />
                </g>;
              })}
            </svg>
            <line className="mt-cursor" x1={`${xFor(year)}%`} x2={`${xFor(year)}%`} y1="1%" y2="96%" />
            {points.map(point => point.value !== null && <circle key={point.year} data-year={point.year} data-value={point.value}
              className={point.year === year ? 'mt-point mt-point-selected' : 'mt-point'}
              cx={`${xFor(point.year)}%`} cy={`${axis.yFor(point.value)}%`} r={point.year === year ? 5 : 3} />)}
          </svg>
          <div className="mt-year-targets" role="radiogroup" aria-label="Select a year on the trend">
            {points.map(point => <input key={point.year} type="radio" name={`${id}-trend-year`} value={point.year}
              aria-label={`${point.year} · ${point.value === null ? 'Unavailable' : `${precise.format(point.value)} ${unit.toLowerCase()}`}`}
              checked={point.year === year} onChange={() => onYearChange(point.year)} />)}
          </div>
        </div>
        <div className="mt-x-axis" aria-hidden="true">{[firstYear, Math.floor((firstYear + lastYear) / 2), lastYear].map(tick =>
          <span key={tick} style={{ left: `clamp(1.3em, ${xFor(tick)}%, calc(100% - 1.3em))` }}>{tick}</span>)}</div>
      </div>
    </> : <p className="mt-empty">Annual {name.toLowerCase()} figures are unavailable for {market.name}.</p>}
    <details className="mt-table"><summary>Annual values <ChevronDown size={14} aria-hidden="true" /></summary>
      <table><caption>{market.name} · {name} · {unit}{metric === 'gdpPerPerson' && ' · Derived'}</caption>
        <thead><tr><th scope="col">Year</th><th scope="col">{unit}</th></tr></thead>
        <tbody>{points.map(point => <tr key={point.year} data-year={point.year} aria-current={point.year === year ? 'true' : undefined}>
          <th scope="row">{point.year}</th>
          <td>{point.value === null ? 'Unavailable' : <data value={point.value}>{precise.format(point.value)}</data>}</td>
        </tr>)}</tbody>
      </table>
    </details>
  </section>;
}
