import { useId, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, CircleDollarSign, Info, Users, Wallet } from 'lucide-react';
import { MARKETS } from '../data/marketCatalog';
import { MARKET_FUNDAMENTALS, MARKET_SNAPSHOT_META } from '../data/marketSnapshot';
import { GDP_PER_PERSON, gdpPerPerson, historicalGdpAtYear, NOMINAL_GDP_CHANGE } from '../services/marketComparison';
import './MarketFundamentals.css';

const metrics = [
  { id: 'gdpUsd', label: 'GDP', listName: 'GDP in current US dollars', unit: 'US$ billions · current prices', valueUnit: 'current US dollars', divisor: 1e9, Icon: Wallet },
  { id: 'population', label: 'Population', listName: 'Total population', unit: 'People · millions', valueUnit: 'people', divisor: 1e6, Icon: Users },
  { id: 'gdpPerPerson', label: 'GDP per person', listName: 'GDP per person', unit: 'US$ per person', valueUnit: GDP_PER_PERSON.unit, divisor: 1, Icon: CircleDollarSign },
] as const;
type Metric = typeof metrics[number];
const latestYear = MARKET_SNAPSHOT_META.observationYear;
const firstYear = NOMINAL_GDP_CHANGE.fromYear;
const gdpYears = Array.from({ length: latestYear - firstYear + 1 }, (_, i) => firstYear + i);

interface MarketFundamentalsProps {
  selectedCountries: string[];
  onCompare?: () => void;
}

function validValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function axisFor(maximum: number) {
  if (maximum <= 0) return { maximum: 1, ticks: [0, 1] };
  const rough = maximum / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const factor = rough / magnitude;
  const step = (factor <= 1 ? 1 : factor <= 2 ? 2 : factor <= 2.5 ? 2.5 : factor <= 5 ? 5 : 10) * magnitude;
  const intervals = Math.ceil(maximum / step);
  return { maximum: intervals * step, ticks: Array.from({ length: intervals + 1 }, (_, index) => index * step) };
}

function compactValue(value: number, metric: Metric['id']) {
  if (metric === 'population') return value >= 1e6 ? `${(value / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 })}M` : value.toLocaleString('en-US');
  if (metric === 'gdpPerPerson') {
    if (value > 0 && value < 1) return '<$1';
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  if (value >= 1e12) return `$${(value / 1e12).toLocaleString('en-US', { maximumFractionDigits: 2 })}T`;
  if (value >= 1e9) return `$${(value / 1e9).toLocaleString('en-US', { maximumFractionDigits: 2 })}B`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export default function MarketFundamentals({ selectedCountries, onCompare }: MarketFundamentalsProps) {
  const [metric, setMetric] = useState<Metric>(metrics[0]);
  const [gdpYear, setGdpYear] = useState<number>(latestYear);
  const annual = metric.id === 'gdpUsd';
  const derived = metric.id === 'gdpPerPerson';
  const year = annual ? gdpYear : latestYear;
  const id = useId().replace(/:/g, '');
  const markets = selectedCountries.length ? MARKETS.filter(market => selectedCountries.includes(market.id)) : MARKETS;
  const rows = markets.map(market => {
    const snapshot = MARKET_FUNDAMENTALS[market.countryCode];
    let candidate: number | null | undefined = snapshot?.population;
    if (annual) candidate = historicalGdpAtYear(snapshot, year);
    if (derived) candidate = gdpPerPerson(snapshot);
    const value = validValue(candidate) ? candidate : null;
    const axisMaximum = annual
      ? Math.max(...gdpYears.map(observedYear => historicalGdpAtYear(snapshot, observedYear) ?? 0))
      : value ?? 0;
    return { market, value, axisMaximum };
  });
  const axis = axisFor(Math.max(0, ...rows.map(row => row.axisMaximum / metric.divisor)));

  return <figure className="market-fundamentals" aria-labelledby={`${id}-title`}>
    <figcaption className="mf-heading">
      <div><div className="mf-snapshot-label"><CalendarDays size={13} aria-hidden="true" />{year} historical snapshot{derived && ' · Derived'}</div><h2 id={`${id}-title`}>Compare country fundamentals.</h2></div>
      <div className="mf-metric-switch" role="group" aria-label="Compare country fundamentals by metric">
        {metrics.map(option => <button type="button" key={option.id} aria-pressed={metric.id === option.id} onClick={() => setMetric(option)}>
          <option.Icon size={14} aria-hidden="true" />{option.label}
        </button>)}
      </div>
    </figcaption>
    {annual && <div className="mf-year-control">
      <label htmlFor={`${id}-year`}>GDP observation year <strong>{year}</strong></label>
      <div className="mf-timeline"><span aria-hidden="true">{firstYear}</span>
        <input type="range" id={`${id}-year`} aria-label="GDP observation year" min={firstYear} max={latestYear} step={1}
          value={gdpYear} onChange={event => setGdpYear(event.currentTarget.valueAsNumber)} />
        <span aria-hidden="true">{latestYear}</span>
      </div>
    </div>}
    <div className="mf-chart-context"><span>{metric.unit}</span><span><span>{selectedCountries.length ? `${markets.length} selected markets` : `All ${MARKETS.length} markets`}</span><i aria-hidden="true" /><span>Shared linear scale</span></span></div>
    <div className="mf-axis" aria-hidden="true"><span /><div>{axis.ticks.map(tick => <span key={tick} style={{ left: `${tick / axis.maximum * 100}%` }}>{tick.toLocaleString('en-US', { maximumFractionDigits: 1 })}</span>)}</div><span /></div>
    <ul className="mf-rows" aria-label={`${year} ${metric.listName} comparison`}>
      {rows.map(({ market, value }) => <li className={`mf-row${value === null ? ' mf-row-missing' : ''}`} key={market.id} data-market={market.id}>
        <div className="mf-country"><span aria-hidden="true">{market.flag}</span><strong>{market.name}</strong></div>
        <div className="mf-track" aria-hidden="true">{axis.ticks.map(tick => <i key={tick} style={{ left: `${tick / axis.maximum * 100}%` }} />)}{value !== null ? <span className="mf-bar" data-zero={value === 0 || undefined} style={{ width: `${value / metric.divisor / axis.maximum * 100}%` }} /> : <span className="mf-missing-mark">Unavailable</span>}</div>
        <span className="mf-value">{value === null ? <span aria-label={`${market.name} ${metric.listName} unavailable`}>—</span> :
          <data value={String(value)} title={`${value.toLocaleString('en-US', { maximumFractionDigits: 20 })} ${metric.valueUnit}, ${year}`}
            aria-label={`${value.toLocaleString('en-US', { maximumFractionDigits: derived ? 2 : 20 })} ${metric.valueUnit}, ${year}`}>
            {compactValue(value, metric.id)}
          </data>}</span>
      </li>)}
    </ul>
    {!rows.length && <p className="mf-empty">No matching markets in this snapshot. Choose a country from the explorer.</p>}
    <div className="mf-chart-footer"><span>World Bank via DataHub <i /> {year} {derived ? 'inputs' : 'observations'}</span>{onCompare && <button type="button" onClick={onCompare}>Compare research paths <ArrowRight size={13} aria-hidden="true" /></button>}</div>
    <div className="mf-limit"><Info size={13} aria-hidden="true" /><span>{derived
      ? GDP_PER_PERSON.limitation
      : 'Country totals show scale, not customer demand, business fit or legal requirements.'}</span></div>
    <details className="mf-source-details"><summary>Sources, dates & limits <ChevronDown size={13} aria-hidden="true" /></summary><div>
      <p><strong>Historical observations, not a live feed.</strong> Annual nominal GDP is available for {firstYear}–{latestYear}. The scale stays fixed across years for the markets shown. Population uses {latestYear}. Changes in prices and exchange rates can affect nominal GDP.</p>
      {derived && <p>{GDP_PER_PERSON.method}</p>}
      <p>Attribution: World Bank population series; World Bank and OECD GDP series, republished by the DataHub / datasets mirrors. The downloaded mirror files were pinned and hash-checked. Their values were not independently cross-checked against the primary World Bank endpoint.</p>
      <dl><div><dt>Observation year</dt><dd>{year}</dd></div><div><dt>Retrieved</dt><dd><time dateTime={MARKET_SNAPSHOT_META.retrievedAt}>{MARKET_SNAPSHOT_META.retrievedAt.replace('T', ' ').replace('Z', ' UTC')}</time></dd></div><div><dt>Upstream publication date</dt><dd>Unknown</dd></div></dl>
      <div className="mf-source-files">{([['Population', MARKET_SNAPSHOT_META.population], ['GDP', MARKET_SNAPSHOT_META.gdp]] as const).map(([label, source]) => <section key={label}><div><strong>{label}</strong><span>{source.indicator}</span></div><a href={source.downloadUrl} target="_blank" rel="noopener noreferrer">Pinned DataHub CSV <ArrowUpRight size={13} aria-hidden="true" /></a><a href={source.upstreamUrl} target="_blank" rel="noopener noreferrer">World Bank indicator directory <ArrowUpRight size={13} aria-hidden="true" /></a><p>Units: {source.unit}. <a href={source.license.url} target="_blank" rel="noopener noreferrer">Mirror licence: {source.license.name}</a></p><small>Commit <code>{source.commit}</code></small><small>SHA-256 <code>{source.sha256}</code></small></section>)}</div>
      <p>Display labels are rounded. Each value retains its full precision. Missing values stay unavailable and genuine zeroes stay zero. These national figures do not describe city-level markets or supply points to your entry plan.</p>
    </div></details>
  </figure>;
}
