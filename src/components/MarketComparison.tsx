import { ArrowDownToLine, ArrowRight, ArrowUpRight, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { MARKETS } from '../data/marketCatalog';
import { MARKET_FUNDAMENTALS, MARKET_SNAPSHOT_META } from '../data/marketSnapshot';

interface MarketComparisonProps {
  selectedCountries: string[];
  onClose: () => void;
  onReference: () => void;
  referenceMode: boolean;
  children?: ReactNode;
}

export default function MarketComparison({ selectedCountries, onClose, onReference, referenceMode, children }: MarketComparisonProps) {
  const markets = MARKETS.filter(market => selectedCountries.includes(market.id));
  function exportShortlist() {
    const payload = {
      exportedAt: new Date().toISOString(),
      contentType: 'historical-country-snapshot-and-source-directory',
      limitation: 'Historical 2023 national series via pinned DataHub mirrors, not live/current observations, city statistics, market demand or business-fit rankings. Primary World Bank API was not cross-checked. Curated discovery links are not verified current business requirements.',
      historicalSnapshot: { provenance: MARKET_SNAPSHOT_META, observations: markets.map(market => ({ country: market.name, countryCode: market.countryCode, ...MARKET_FUNDAMENTALS[market.countryCode] })) },
      markets,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'flow-market-shortlist.json'; anchor.click(); URL.revokeObjectURL(url);
  }
  return <section className="explorer-comparison" id="market-comparison" aria-labelledby="comparison-title" tabIndex={-1}>
    <div className="explorer-comparison-heading"><div><span className="explorer-eyebrow">YOUR SHORTLIST</span><h2 id="comparison-title">Your markets, side by side.</h2></div><button aria-label="Close market comparison" onClick={onClose}><X size={20} /></button></div>
    <p className="explorer-comparison-intro">Compare where to start your research. Follow each country's own sources before making an entry decision.</p>
    {markets.length ? <div className="explorer-comparison-scroll"><table><caption className="sr-only">Selected markets, common-year 2023 historical national figures, and official research starting points. No business-fit ranking.</caption><thead><tr><th scope="col">Research lens</th>{markets.map(market => <th scope="col" key={market.id}><span>{market.flag}</span>{market.name}</th>)}</tr></thead><tbody><tr><th scope="row">Population · 2023</th>{markets.map(market => <td key={market.id}>{MARKET_FUNDAMENTALS[market.countryCode] ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(MARKET_FUNDAMENTALS[market.countryCode].population) : 'Unavailable'}</td>)}</tr><tr><th scope="row">GDP · 2023 · current US$</th>{markets.map(market => <td key={market.id}>{MARKET_FUNDAMENTALS[market.countryCode] ? new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(MARKET_FUNDAMENTALS[market.countryCode].gdpUsd) : 'Unavailable'}</td>)}</tr><tr><th scope="row">City to explore</th>{markets.map(market => <td key={market.id}>{market.city}</td>)}</tr><tr><th scope="row">Business setup</th>{markets.map(market => <td key={market.id}><a href={market.setup.url} target="_blank" rel="noopener noreferrer">{market.setup.name}<ArrowUpRight size={13} /></a></td>)}</tr><tr><th scope="row">Country statistics</th>{markets.map(market => <td key={market.id}><a href={market.statistics.url} target="_blank" rel="noopener noreferrer">{market.statistics.name}<ArrowUpRight size={13} /></a></td>)}</tr><tr><th scope="row">City & location</th>{markets.map(market => <td key={market.id}><a href={market.cityPortal.url} target="_blank" rel="noopener noreferrer">{market.cityPortal.name}<ArrowUpRight size={13} /></a></td>)}</tr></tbody></table></div> : <div className="explorer-comparison-empty"><Info size={20} /><p>Choose two or more country cards above to build your comparison.</p><a href="#explore-markets" onClick={event => { event.preventDefault(); document.getElementById('explore-markets')?.scrollIntoView({ behavior: 'smooth' }); }}>Choose markets <ArrowRight size={15} /></a></div>}
    <div className="explorer-comparison-footer"><span><Info size={14} />2023 historical snapshot · World Bank series via DataHub · not a market ranking</span>{markets.length > 0 && <button onClick={exportShortlist}><ArrowDownToLine size={14} />Export shortlist</button>}</div>
    {markets.length === 1 && <p className="explorer-comparison-intro">Add another country above for a side-by-side view.</p>}
    <details className="explorer-comparison-limits"><summary>About market figures & comparison limits</summary><p>Population and GDP use the same 2023 period from pinned public DataHub mirrors of World Bank series. GDP is in current US dollars, not inflation-adjusted or a measure of customer demand. Source publication dates are unknown; the primary API could not be cross-checked. Linked government directories and current applicability are unverified. The shortlist export preserves exact values, observation year, retrieval time and source revisions without a business-fit ranking.</p><p><a href={MARKET_SNAPSHOT_META.gdp.downloadUrl} target="_blank" rel="noopener noreferrer">Pinned GDP source</a> · <a href={MARKET_SNAPSHOT_META.population.downloadUrl} target="_blank" rel="noopener noreferrer">Pinned population source</a> · Retrieved {MARKET_SNAPSHOT_META.retrievedAt.slice(0, 10)}</p>{!referenceMode && <button onClick={onReference}>View unverified reference examples <ArrowRight size={14} /></button>}</details>
    {children}
  </section>;
}
