import { useId, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Info, Users, Wallet } from 'lucide-react';
import { MARKETS } from '../data/marketCatalog';
import { MARKET_FUNDAMENTALS, MARKET_SNAPSHOT_META } from '../data/marketSnapshot';
import './MarketFundamentals.css';

type Metric = 'gdpUsd' | 'population';

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

function compactValue(value: number, metric: Metric) {
  if (metric === 'population') return value >= 1e6 ? `${(value / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 })}M` : value.toLocaleString('en-US');
  if (value >= 1e12) return `$${(value / 1e12).toLocaleString('en-US', { maximumFractionDigits: 2 })}T`;
  if (value >= 1e9) return `$${(value / 1e9).toLocaleString('en-US', { maximumFractionDigits: 2 })}B`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export default function MarketFundamentals({ selectedCountries, onCompare }: MarketFundamentalsProps) {
  const [metric, setMetric] = useState<Metric>('gdpUsd');
  const id = useId().replace(/:/g, '');
  const markets = selectedCountries.length ? MARKETS.filter(market => selectedCountries.includes(market.id)) : MARKETS;
  const rows = markets.map(market => {
    const candidate = MARKET_FUNDAMENTALS[market.countryCode]?.[metric];
    return { market, value: validValue(candidate) ? candidate : null };
  });
  const divisor = metric === 'gdpUsd' ? 1e9 : 1e6;
  const axis = axisFor(Math.max(0, ...rows.flatMap(row => row.value === null ? [] : [row.value / divisor])));
  const unit = metric === 'gdpUsd' ? 'US$ billions · current prices' : 'People · millions';
  const metricName = metric === 'gdpUsd' ? 'GDP in current US dollars' : 'Total population';
  const year = MARKET_SNAPSHOT_META.observationYear;

  return <figure className="market-fundamentals" aria-labelledby={`${id}-title`}>
    <figcaption className="mf-heading">
      <div><div className="mf-snapshot-label"><CalendarDays size={13} aria-hidden="true" />{year} historical snapshot</div><h2 id={`${id}-title`}>Compare country fundamentals.</h2></div>
      <div className="mf-metric-switch" role="group" aria-label="Compare country fundamentals by metric"><button type="button" aria-pressed={metric === 'gdpUsd'} onClick={() => setMetric('gdpUsd')}><Wallet size={14} aria-hidden="true" />GDP</button><button type="button" aria-pressed={metric === 'population'} onClick={() => setMetric('population')}><Users size={14} aria-hidden="true" />Population</button></div>
    </figcaption>
    <div className="mf-chart-context"><span>{unit}</span><span><span>{selectedCountries.length ? `${markets.length} selected markets` : 'All six markets'}</span><i aria-hidden="true" /><span>Shared linear scale</span></span></div>
    <div className="mf-axis" aria-hidden="true"><span /><div>{axis.ticks.map(tick => <span key={tick} style={{ left: `${tick / axis.maximum * 100}%` }}>{tick.toLocaleString('en-US', { maximumFractionDigits: 1 })}</span>)}</div><span /></div>
    <ul className="mf-rows" aria-label={`${year} ${metricName} comparison`}>
      {rows.map(({ market, value }) => <li className={`mf-row${value === null ? ' mf-row-missing' : ''}`} key={market.id} data-market={market.id}>
        <div className="mf-country"><span aria-hidden="true">{market.flag}</span><strong>{market.name}</strong></div>
        <div className="mf-track" aria-hidden="true">{axis.ticks.map(tick => <i key={tick} style={{ left: `${tick / axis.maximum * 100}%` }} />)}{value !== null ? <span className="mf-bar" data-zero={value === 0 || undefined} style={{ width: `${value / divisor / axis.maximum * 100}%` }} /> : <span className="mf-missing-mark">Unavailable</span>}</div>
        <span className="mf-value">{value === null ? <span aria-label={`${market.name} ${metricName} unavailable`}>—</span> : <data value={String(value)} title={`${value.toLocaleString('en-US', { maximumFractionDigits: 20 })} ${metric === 'gdpUsd' ? 'current US dollars' : 'people'}, ${year}`} aria-label={`${value.toLocaleString('en-US', { maximumFractionDigits: 20 })} ${metric === 'gdpUsd' ? 'current US dollars' : 'people'}, ${year}`}>{compactValue(value, metric)}</data>}</span>
      </li>)}
    </ul>
    {!rows.length && <p className="mf-empty">No matching markets in this snapshot. Choose one of the six supported countries.</p>}
    <div className="mf-chart-footer"><span>World Bank via DataHub <i /> {year} observations</span>{onCompare && <button type="button" onClick={onCompare}>Compare research paths <ArrowRight size={13} aria-hidden="true" /></button>}</div>
    <div className="mf-limit"><Info size={13} aria-hidden="true" /><span>Country totals show scale, not customer demand, business fit or legal requirements.</span></div>
    <details className="mf-source-details"><summary>Sources, dates & limits <ChevronDown size={13} aria-hidden="true" /></summary><div>
      <p><strong>Historical observations, not a live feed.</strong> Both metrics use {year} so periods match. GDP is nominal, in current US dollars; it is not addressable market size, a forecast, an entry recommendation or legal advice.</p>
      <p>Attribution: World Bank population series; World Bank and OECD GDP series, republished by the DataHub / datasets mirrors. The downloaded mirror files were pinned and hash-checked. Their values were not independently cross-checked against the primary World Bank endpoint.</p>
      <dl><div><dt>Observation year</dt><dd>{year}</dd></div><div><dt>Retrieved</dt><dd><time dateTime={MARKET_SNAPSHOT_META.retrievedAt}>{MARKET_SNAPSHOT_META.retrievedAt.replace('T', ' ').replace('Z', ' UTC')}</time></dd></div><div><dt>Upstream publication date</dt><dd>Unknown</dd></div></dl>
      <div className="mf-source-files">{([['Population', MARKET_SNAPSHOT_META.population], ['GDP', MARKET_SNAPSHOT_META.gdp]] as const).map(([label, source]) => <section key={label}><div><strong>{label}</strong><span>{source.indicator}</span></div><a href={source.downloadUrl} target="_blank" rel="noopener noreferrer">Pinned DataHub CSV <ArrowUpRight size={13} aria-hidden="true" /></a><a href={source.upstreamUrl} target="_blank" rel="noopener noreferrer">World Bank indicator directory <ArrowUpRight size={13} aria-hidden="true" /></a><p>Units: {source.unit}. <a href={source.license.url} target="_blank" rel="noopener noreferrer">Mirror licence: {source.license.name}</a></p><small>Commit <code>{source.commit}</code></small><small>SHA-256 <code>{source.sha256}</code></small></section>)}</div>
      <p>Display labels are abbreviated; each value exposes its full numeric total. Missing values stay unavailable and genuine zeroes stay zero. These national observations do not describe city-level markets or supply points to your entry plan.</p>
    </div></details>
  </figure>;
}
