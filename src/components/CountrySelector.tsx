import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Globe2, MapPin, MoveHorizontal, Plus, X } from 'lucide-react';
import { MARKETS } from '../data/marketCatalog';
import { MARKET_FUNDAMENTALS, MARKET_SNAPSHOT_META, type MarketFundamental } from '../data/marketSnapshot';
import MarketScene from './visual/MarketScene';
import './CountrySelector.css';

const populationFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const gdpFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const fullNumberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 });

function isObservation(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function GDPHistory({ country, id, series }: { country: string; id: string; series: MarketFundamental['gdpSeries'] | undefined }) {
  const observations = (series ?? []).filter(point => Number.isInteger(point.year) && point.year >= 2014 && point.year <= MARKET_SNAPSHOT_META.observationYear && isObservation(point.value)).sort((first, last) => first.year - last.year);
  if (!observations.length) return <div className="market-gdp-trend"><span>GDP history</span><small>Unavailable</small></div>;

  const values = observations.map(point => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum;
  const points = observations.map(point => ({
    ...point,
    x: 3 + ((point.year - 2014) / (MARKET_SNAPSHOT_META.observationYear - 2014)) * 134,
    y: range === 0 ? 16 : 29 - ((point.value - minimum) / range) * 26,
  }));
  // Leave a genuine gap when a year is missing; never interpolate an observation.
  const path = points.map((point, index) => `${index === 0 || point.year !== points[index - 1].year + 1 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
  const last = points[points.length - 1];

  return (
    <div className="market-gdp-trend">
      <span>Nominal GDP<small>2014–{MARKET_SNAPSHOT_META.observationYear} · US$</small></span>
      <div className="market-gdp-plot">
        <svg className="market-gdp-sparkline" viewBox="0 0 140 32" role="img" aria-labelledby={`gdp-title-${id}`} aria-describedby={`gdp-description-${id}`}>
          <title id={`gdp-title-${id}`}>{country} nominal GDP, 2014–{MARKET_SNAPSHOT_META.observationYear}</title>
          <desc id={`gdp-description-${id}`}>Historical current US dollar observations from World Bank series via DataHub. This line uses its own vertical range and does not show real growth or a forecast. {observations.map(point => `${point.year}: ${fullNumberFormat.format(point.value)} US dollars`).join('; ')}. Missing years are not connected.</desc>
          <path className="market-gdp-baseline" d="M3 30H137" />
          <path className="market-gdp-line" d={path} />
          <circle className="market-gdp-endpoint" cx={last.x} cy={last.y} r="2.5" />
        </svg>
        <small className="market-gdp-scale-note">Own scale</small>
      </div>
    </div>
  );
}

interface CountrySelectorProps {
  selectedCountries: string[];
  onCountryToggle: (countryId: string) => void;
  referenceMode?: boolean;
  searchQuery?: string;
  onExploreCountry?: (countryId: string) => void;
  showHeading?: boolean;
}

export default function CountrySelector({
  selectedCountries,
  onCountryToggle,
  referenceMode = false,
  searchQuery = '',
  onExploreCountry,
  showHeading = true,
}: CountrySelectorProps) {
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [railPosition, setRailPosition] = useState({ overflow: false, start: true, end: false });
  const query = searchQuery.trim().toLocaleLowerCase();
  const visibleMarkets = MARKETS.filter(market =>
    !query || [market.name, market.city, market.id, market.countryCode].some(value => value.toLocaleLowerCase().includes(query))
  );

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => setRailPosition({
      overflow: element.scrollWidth > element.clientWidth + 2,
      start: element.scrollLeft <= 2,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
    });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [query]);

  function moveRail(direction: number) {
    const element = rail.current;
    const card = element?.querySelector('article');
    if (!element || !card) return;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function exploreMarket(id: string) {
    if (onExploreCountry) onExploreCountry(id);
    else setExpandedMarket(previous => previous === id ? null : id);
  }

  return (
    <section className="market-selector" aria-labelledby={showHeading ? 'market-selection-title' : undefined} aria-label={showHeading ? undefined : 'Select markets'}>
      {showHeading && <div className="market-selector-bar">
        <div><h2 id="market-selection-title">Select markets</h2><span>{selectedCountries.length} selected</span></div>
      </div>}
      {railPosition.overflow && visibleMarkets.length > 1 && <div className="market-rail-controls">
        <span className="market-swipe-hint"><MoveHorizontal size={15} aria-hidden="true" />Swipe to explore</span>
        <div><button type="button" aria-label="Previous markets" disabled={railPosition.start} onClick={() => moveRail(-1)}><ArrowLeft size={17} aria-hidden="true" /></button><button type="button" aria-label="Next markets" disabled={railPosition.end} onClick={() => moveRail(1)}><ArrowRight size={17} aria-hidden="true" /></button></div>
      </div>}
      {visibleMarkets.length === 0 ? (
        <div className="market-no-results" role="status"><Globe2 size={23} aria-hidden="true" /><strong>No markets match “{searchQuery}”</strong><span>Try a country or city, such as Thailand or Bangkok.</span></div>
      ) : (
        <div className="market-country-grid" aria-label="Southeast Asian markets" ref={rail}>
          {visibleMarkets.map(market => {
            const selected = selectedCountries.includes(market.id);
            const expanded = expandedMarket === market.id;
            const fundamentals = MARKET_FUNDAMENTALS[market.countryCode];
            const population = fundamentals?.population;
            const gdp = fundamentals?.gdpUsd;
            const panelId = `market-sources-${market.id}`;
            const addsToShortlist = Boolean(onExploreCountry) && !selected;
            const exploreLabel = onExploreCountry
              ? addsToShortlist ? `Add ${market.name} to shortlist and explore` : `Explore ${market.name}`
              : `Explore sources for ${market.name}`;
            return (
              <article className={`market-country-card${selected ? ' is-selected' : ''}`} key={market.id} data-market={market.id} aria-labelledby={`market-name-${market.id}`}>
                <MarketScene marketId={market.id} />
                <div className="market-country-heading">
                  <div className="market-country-identity"><span className="market-country-flag" aria-hidden="true">{market.flag}</span><div><h3 id={`market-name-${market.id}`}>{market.name}</h3><span className="market-country-city"><MapPin size={10} aria-hidden="true" />{market.city}</span></div></div>
                  <button type="button" className="market-country-toggle" aria-label={`${selected ? 'Deselect' : 'Select'} ${market.name}`} title={selected ? 'Remove from shortlist' : 'Add to shortlist'} aria-pressed={selected} onClick={() => onCountryToggle(market.id)}>{selected ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}</button>
                </div>

                <div className="market-snapshot">
                  <p className="market-snapshot-label"><span />{MARKET_SNAPSHOT_META.observationYear} historical snapshot</p>
                  <dl className="market-snapshot-metrics">
                    <div><dt>Population</dt><dd data-unavailable={!isObservation(population) || undefined} aria-label={isObservation(population) ? `${fullNumberFormat.format(population)} people, ${MARKET_SNAPSHOT_META.observationYear}` : 'Population unavailable'}>{isObservation(population) ? populationFormat.format(population) : 'Unavailable'}</dd></div>
                    <div><dt>Nominal GDP · US$</dt><dd data-unavailable={!isObservation(gdp) || undefined} aria-label={isObservation(gdp) ? `${fullNumberFormat.format(gdp)} current US dollars, ${MARKET_SNAPSHOT_META.observationYear}` : 'GDP unavailable'}>{isObservation(gdp) ? gdpFormat.format(gdp) : 'Unavailable'}</dd></div>
                  </dl>
                  <GDPHistory country={market.name} id={market.id} series={fundamentals?.gdpSeries} />
                </div>

                <div className="market-country-actions">
                  <button type="button" className="market-explore-button" aria-label={exploreLabel} title={exploreLabel} onClick={() => exploreMarket(market.id)}>{onExploreCountry ? addsToShortlist ? 'Add & explore' : 'Explore market' : 'Explore sources'} <ArrowRight size={13} aria-hidden="true" /></button>
                  <button type="button" className="market-source-button" aria-label={`Sources for ${market.name}`} aria-expanded={expanded} aria-controls={expanded ? panelId : undefined} onClick={() => setExpandedMarket(previous => previous === market.id ? null : market.id)}>Sources {expanded ? <X size={11} aria-hidden="true" /> : <ChevronDown size={11} aria-hidden="true" />}</button>
                </div>
                {expanded && (
                  <div className="market-source-panel" id={panelId}>
                    <div className="market-snapshot-provenance">
                      <strong>{MARKET_SNAPSHOT_META.source}</strong>
                      <p>Historical observations, not current conditions or market-demand estimates. Display figures are rounded. GDP lines use each country's own vertical range.</p>
                      <dl><div><dt>Card observations</dt><dd>{MARKET_SNAPSHOT_META.observationYear}</dd></div><div><dt>GDP history</dt><dd>2014–{MARKET_SNAPSHOT_META.observationYear} · current US dollars</dd></div><div><dt>Mirror retrieved</dt><dd><time dateTime={MARKET_SNAPSHOT_META.retrievedAt}>{MARKET_SNAPSHOT_META.retrievedAt.replace('T', ' ').replace('Z', ' UTC')}</time></dd></div><div><dt>Publication date</dt><dd>Unknown</dd></div></dl>
                      <p>Not cross-checked against the primary World Bank API. Mirror package metadata may lag the observation rows.</p>
                      {referenceMode && <p>Reference mode applies to the research examples below. These card figures remain the sourced historical snapshot.</p>}
                    </div>
                    {[
                      { label: 'Population', value: population, source: MARKET_SNAPSHOT_META.population },
                      { label: 'Nominal GDP', value: gdp, source: MARKET_SNAPSHOT_META.gdp },
                    ].map(({ label, value, source }) => <div className="market-dataset-source" key={label}>
                      <a href={source.downloadUrl} target="_blank" rel="noopener noreferrer" aria-label={`Pinned ${label.toLocaleLowerCase()} CSV, mirror commit ${source.commit}`}><span>{label} CSV <small>{source.commit.slice(0, 7)}</small></span><ArrowUpRight size={12} aria-hidden="true" /></a>
                      <a href={source.upstreamUrl} target="_blank" rel="noopener noreferrer">World Bank · {source.indicator}<ArrowUpRight size={12} aria-hidden="true" /></a>
                      <details className="market-dataset-details">
                        <summary>{label} · units & file details<ChevronDown size={12} aria-hidden="true" /></summary>
                        <dl><div><dt>Indicator</dt><dd>{source.indicator}</dd></div><div><dt>Unit</dt><dd>{source.unit}</dd></div><div><dt>{MARKET_SNAPSHOT_META.observationYear} value</dt><dd>{isObservation(value) ? fullNumberFormat.format(value) : 'Unavailable'}</dd></div><div><dt>Mirror version</dt><dd>{source.commit}</dd></div><div><dt>SHA-256</dt><dd>{source.sha256}</dd></div></dl>
                        <a href={source.license.url} target="_blank" rel="noopener noreferrer">Mirror metadata licence: {source.license.name}<ArrowUpRight size={12} aria-hidden="true" /></a>
                      </details>
                    </div>)}
                    <p className="market-directory-label">Government starting points</p>
                    <p>Curated discovery links. Page content, dates and local applicability have not been verified.</p>
                    {[
                      { label: 'Business setup', source: market.setup },
                      { label: 'Country statistics', source: market.statistics },
                      { label: 'City & locations', source: market.cityPortal },
                    ].map(({ label, source }) => <a key={label} href={source.url} target="_blank" rel="noopener noreferrer"><span><small>{label}</small>{source.name}</span><ArrowUpRight size={13} aria-hidden="true" /></a>)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
