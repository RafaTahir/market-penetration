import { ArrowDownToLine, ArrowRight, ArrowUpRight, Info, MoveHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import './MarketComparison.css';
import { MARKETS } from '../data/marketCatalog';
import {
  GDP_PER_PERSON, gdpPerPerson, HISTORY_YEARS, historicalMetricAtYear, NOMINAL_GDP_CHANGE,
  nominalGdpChangePercent, POPULATION_CHANGE, populationChangePercent,
} from '../services/marketComparison';
import { MARKET_FUNDAMENTALS, MARKET_SNAPSHOT_META } from '../data/marketSnapshot';

const populationFormat = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const gdpFormat = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const perPersonFormat = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const changeFormat = new Intl.NumberFormat('en', { signDisplay: 'exceptZero', maximumFractionDigits: 1 });

function formatObservation(value: number | undefined, format: Intl.NumberFormat) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? format.format(value) : 'Unavailable';
}

interface MarketComparisonProps {
  selectedCountries: string[];
  onClose: () => void;
  onChooseMarkets: () => void;
  onReference: () => void;
  referenceMode: boolean;
  children?: ReactNode;
}

export default function MarketComparison({ selectedCountries, onClose, onChooseMarkets, onReference, referenceMode, children }: MarketComparisonProps) {
  const markets = MARKETS.filter(market => selectedCountries.includes(market.id));
  const columns = markets.map(market => {
    const snapshot = MARKET_FUNDAMENTALS[market.countryCode];
    return {
      market, snapshot, perPerson: gdpPerPerson(snapshot),
      gdpChange: nominalGdpChangePercent(snapshot?.gdpSeries),
      populationChange: populationChangePercent(snapshot?.populationSeries),
    };
  });
  const tableScroll = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const element = tableScroll.current;
    if (!element) { setOverflows(false); return; }
    const update = () => setOverflows(element.scrollWidth > element.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [markets.length]);
  function exportShortlist() {
    const payload = {
      exportedAt: new Date().toISOString(),
      contentType: 'historical-country-snapshot-and-source-directory',
      limitation: 'Historical 2014–2023 national series and 2023 headlines via pinned DataHub mirrors, not live/current observations, city statistics, market demand or business-fit rankings. Primary World Bank API was not cross-checked. Curated discovery links are not verified current business requirements.',
      historicalSnapshot: {
        provenance: MARKET_SNAPSHOT_META,
        gdpPerPerson: GDP_PER_PERSON,
        annualGdpPerPerson: {
          fromYear: HISTORY_YEARS[0], toYear: MARKET_SNAPSHOT_META.observationYear,
          unit: GDP_PER_PERSON.unit, method: GDP_PER_PERSON.method, limitation: GDP_PER_PERSON.limitation,
        },
        nominalGdpChange: NOMINAL_GDP_CHANGE,
        populationChange: POPULATION_CHANGE,
        observations: columns.map(({ market, snapshot, perPerson, gdpChange, populationChange }) => ({
          country: market.name,
          countryCode: market.countryCode,
          region: market.region,
          ...snapshot,
          gdpPerPersonUsd: perPerson,
          annualGdpPerPerson: HISTORY_YEARS.map(year => ({
            year, value: historicalMetricAtYear(snapshot, 'gdpPerPerson', year),
          })),
          nominalGdpChangePercent: gdpChange,
          populationChangePercent: populationChange,
        })),
      },
      markets,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'flow-market-shortlist.json'; anchor.click(); URL.revokeObjectURL(url);
  }
  return <section className="explorer-comparison" id="market-comparison" aria-labelledby="comparison-title" tabIndex={-1}>
    <div className="explorer-comparison-heading"><div><span className="explorer-eyebrow">YOUR SHORTLIST</span><h2 id="comparison-title">Your markets, side by side.</h2></div><button aria-label="Close market comparison" onClick={onClose}><X size={20} /></button></div>
    <p className="explorer-comparison-intro">Compare where to start your research. Follow each country's own sources before making an entry decision.</p>
    {overflows && <p className="comparison-scroll-hint"><MoveHorizontal size={16} aria-hidden="true" />{markets.length} markets · scroll sideways to compare. Research labels stay in view.</p>}
    {markets.length ? (
      <div className="explorer-comparison-scroll" ref={tableScroll} role="region" aria-label="Selected markets comparison table" tabIndex={0}>
        <table>
          <caption className="sr-only">Selected markets, historical national figures and official research starting points.</caption>
          <thead>
            <tr><th scope="col">Research lens</th>{markets.map(market => <th scope="col" key={market.id}><span>{market.flag}</span>{market.name}</th>)}</tr>
          </thead>
          <tbody>
            <tr><th scope="row">Region</th>{markets.map(market => <td key={market.id}>{market.region}</td>)}</tr>
            <tr><th scope="row">Population · 2023</th>{columns.map(({ market, snapshot }) =>
              <td key={market.id}>{formatObservation(snapshot?.population, populationFormat)}</td>
            )}</tr>
            <tr><th scope="row">GDP · 2023 · current US$</th>{columns.map(({ market, snapshot }) =>
              <td key={market.id}>{formatObservation(snapshot?.gdpUsd, gdpFormat)}</td>
            )}</tr>
            <tr><th scope="row" aria-describedby="gdp-per-person-scope">GDP per person · {GDP_PER_PERSON.year} · US$</th>{columns.map(({ market, perPerson }) =>
              <td key={market.id}>{perPerson === null ? 'Unavailable' : perPersonFormat.format(perPerson)}</td>
            )}</tr>
            <tr><th scope="row" aria-describedby="period-change-scope">Nominal GDP change · 2014–2023</th>{columns.map(({ market, gdpChange }) =>
              <td key={market.id}>{gdpChange === null ? 'Unavailable' : `${changeFormat.format(gdpChange)}%`}</td>
            )}</tr>
            <tr><th scope="row" aria-describedby="period-change-scope">Population change · 2014–2023</th>{columns.map(({ market, populationChange }) =>
              <td key={market.id}>{populationChange === null ? 'Unavailable' : `${changeFormat.format(populationChange)}%`}</td>
            )}</tr>
            <tr><th scope="row">City to explore</th>{markets.map(market => <td key={market.id}>{market.city}</td>)}</tr>
            <tr><th scope="row">Default worksheet currency</th>{markets.map(market => <td key={market.id}>{market.worksheetCurrency}</td>)}</tr>
            {([
              ['Business setup', 'setup'],
              ['Province or state registration', 'regionalSetup'],
              ['Country statistics', 'statistics'],
              ['City & location', 'cityPortal'],
              ['City statistics', 'cityStatistics'],
            ] as const).filter(([, field]) => markets.some(market => market[field])).map(([label, field]) =>
              <tr key={field}><th scope="row">{label}</th>{markets.map(market => {
                const source = market[field];
                return <td key={market.id}>{source ? <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.name}<ArrowUpRight size={13} aria-hidden="true" />
                </a> : 'No directory listed'}</td>;
              })}</tr>
            )}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="explorer-comparison-empty">
        <Info size={20} aria-hidden="true" />
        <p>Choose markets to start your plan. Select two or more to compare them.</p>
        <button className="market-comparison-choose" onClick={onChooseMarkets}>
          Choose markets <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    )}
    {markets.length > 0 && <p className="explorer-comparison-intro">
      <span id="gdp-per-person-scope">Flow divides GDP by population to show output per resident. Household income and spending power require separate evidence.</span>{' '}
      <span id="period-change-scope">Both changes cover the full 2014–2023 period. Prices and exchange rates affect nominal GDP.</span>
    </p>}
    <div className="explorer-comparison-footer">
      <span><Info size={14} aria-hidden="true" />2023 historical snapshot · 2014–2023 changes · World Bank series via DataHub · not a market ranking</span>
      {markets.length > 0 && (
        <div className="market-comparison-actions">
          <a className="market-comparison-plan" href="#/plan">
            {markets.length === 1 ? 'Plan this market' : 'Plan these markets'} <ArrowRight size={16} aria-hidden="true" />
          </a>
          <button className="market-comparison-export" onClick={exportShortlist}>
            <ArrowDownToLine size={15} aria-hidden="true" />Export shortlist
          </button>
        </div>
      )}
    </div>
    {markets.length === 1 && <p className="explorer-comparison-intro">Add another country above for a side-by-side view.</p>}
    <details className="explorer-comparison-limits">
      <summary>About market figures & comparison limits</summary>
      <p>The headlines use 2023 national observations. The shortlist export includes annual population and nominal GDP from 2014 through 2023, plus GDP per person calculated from each year's pair. The GDP series uses current US dollars. City demand and household purchasing power require separate evidence.</p>
      <p>Each pinned DataHub file has its own retrieval time and revision in the export. Publication dates are unknown. The primary World Bank API and the current applicability of government directories have not been independently checked.</p>
      <p><a href={MARKET_SNAPSHOT_META.gdp.downloadUrl} target="_blank" rel="noopener noreferrer">Pinned GDP source</a> · <a href={MARKET_SNAPSHOT_META.population.downloadUrl} target="_blank" rel="noopener noreferrer">Pinned population source</a></p>
      {!referenceMode && <button onClick={onReference}>View unverified reference examples <ArrowRight size={14} /></button>}
    </details>
    {children}
  </section>;
}
