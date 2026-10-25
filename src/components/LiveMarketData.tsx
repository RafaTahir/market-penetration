import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Globe, Activity, Clock } from 'lucide-react';
import { MarketData, CurrencyRate } from '../services/marketDataService';
import { UnifiedDataService, UnifiedEconomicData, EconomicMetric } from '../services/unifiedDataService';
import { MarketHoursService, MarketStatus } from '../services/marketHoursService';
import MarketClock from './MarketClock';

const LiveMarketData: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [economicData, setEconomicData] = useState<UnifiedEconomicData[]>([]);
  const [currencyData, setCurrencyData] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState({ market: true, economic: true, currency: true });
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [marketStatuses, setMarketStatuses] = useState<MarketStatus[]>([]);

  const unifiedService = UnifiedDataService.getInstance();
  const marketHoursService = MarketHoursService.getInstance();

  useEffect(() => {
    let cancelled = false;
    let refreshing = false;
    const symbols = ['SET.BK', 'STI.SI', 'KLCI.KL', 'JKSE.JK', 'PSEI.PS', 'VN-INDEX.HM'];
    const updateMarketStatuses = () => setMarketStatuses(marketHoursService.getAllMarketStatuses());
    const fetchMarketData = async () => {
      if (refreshing) return;
      refreshing = true;
      await Promise.allSettled([
        unifiedService.getMarketData(symbols).then(stocks => {
          if (!cancelled) {
            setMarketData(stocks);
            setLoading(previous => ({ ...previous, market: false }));
          }
        }).catch(() => {
          if (!cancelled) setLoading(previous => ({ ...previous, market: false }));
        }),
        unifiedService.getUnifiedEconomicData().then(economic => {
          if (!cancelled) {
            setEconomicData(economic);
            setLoading(previous => ({ ...previous, economic: false }));
          }
        }).catch(() => {
          if (!cancelled) setLoading(previous => ({ ...previous, economic: false }));
        }),
        unifiedService.getCurrencyRates().then(currency => {
          if (!cancelled) {
            setCurrencyData(currency);
            setLoading(previous => ({ ...previous, currency: false }));
          }
        }).catch(() => {
          if (!cancelled) setLoading(previous => ({ ...previous, currency: false }));
        })
      ]);
      if (!cancelled) setLastChecked(new Date());
      refreshing = false;
    };

    void fetchMarketData();
    updateMarketStatuses();
    const statusInterval = setInterval(updateMarketStatuses, 60000);
    const refreshInterval = setInterval(() => void fetchMarketData(), 300000);
    return () => {
      cancelled = true;
      clearInterval(statusInterval);
      clearInterval(refreshInterval);
    };
  }, [unifiedService, marketHoursService]);

  const formatObservationDate = (value?: string) => {
    const timestamp = Date.parse(value || '');
    return Number.isFinite(timestamp) ? new Date(timestamp).toLocaleDateString() : 'Date unavailable';
  };

  const formatNumber = (num: number | null, decimals: number = 2) => {
    if (num === null || !Number.isFinite(num)) return 'Unavailable';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const knownChanges = marketData.filter(stock => stock.change !== null);
  const knownPercentChanges = marketData.map(stock => stock.changePercent).filter((value): value is number => value !== null);
  const economicCell = (row: UnifiedEconomicData, metric: EconomicMetric, decimals = 1, prefix = '', suffix = '', scale = 1) => {
    const value = row[metric];
    const evidence = row.metricEvidence?.[metric];
    return <><span>{value === null ? 'Unavailable' : `${prefix}${formatNumber(value / scale, decimals)}${suffix}`}</span><small className="block text-xs text-slate-400 mt-1">{evidence?.observationPeriod ? `Period: ${evidence.observationPeriod}` : 'Observation period unavailable'}</small></>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Market & Economic Reference</h1>
                <p className="text-sm text-slate-400">Southeast Asian financial markets · coverage varies by source</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  marketHoursService.isAnyMarketOpen() ? 'bg-green-400 animate-pulse' : 'bg-slate-400'
                }`}></div>
                <span className="text-sm text-slate-400">
                  {marketHoursService.isAnyMarketOpen() ? 'Markets Open' : 'Markets Closed'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-2 py-1 rounded text-xs font-medium bg-amber-400/20 text-amber-400">
                  Reference coverage
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-slate-400">Last checked on this device</div>
                  <div className="text-sm text-white flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{lastChecked ? lastChecked.toLocaleTimeString() : 'Checking…'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-700/50 bg-amber-900/10 p-4 text-sm text-amber-100">
          Quotes are stored observations when a connected source is available. Economic rows contain available provider-reported series or explicitly derived values; missing records are not filled with reference estimates. A successful check does not verify
          freshness; observation dates and source limitations are shown below.
        </div>

        {/* Market Status Clocks with Indices */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Trading Hours & Market Indices</h2>
            <div className="ml-auto flex items-center space-x-2">
              <span className="text-xs text-slate-400">
                {marketStatuses.filter(s => s.isOpen).length} of {marketStatuses.length} markets open
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketStatuses.map((status) => {
              let matchingMarketData: MarketData | undefined;

              if (status.exchange.includes('SET')) {
                matchingMarketData = marketData.find(stock => stock.symbol === 'SET.BK');
              } else if (status.exchange.includes('SGX')) {
                matchingMarketData = marketData.find(stock => stock.symbol === 'STI.SI');
              } else if (status.exchange.includes('MYX') || status.exchange.includes('Bursa')) {
                matchingMarketData = marketData.find(stock => stock.symbol === 'KLCI.KL');
              } else if (status.exchange.includes('IDX')) {
                matchingMarketData = marketData.find(stock => stock.symbol === 'JKSE.JK');
              } else if (status.exchange.includes('PSE')) {
                matchingMarketData = marketData.find(stock => stock.symbol === 'PSEI.PS');
              } else if (status.exchange.includes('HOSE')) {
                matchingMarketData = marketData.find(stock => stock.symbol === 'VN-INDEX.HM');
              }

              return (
                <MarketClock
                  key={status.exchange}
                  status={status}
                  marketData={matchingMarketData}
                />
              );
            })}
          </div>
        </div>

        {/* Market Performance Summary */}
        <p className="text-xs text-slate-400">Trading schedules are indicative and may omit exchange holidays or special sessions. Confirm with the relevant exchange.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Markets Up</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {knownChanges.length ? knownChanges.filter(stock => stock.change !== null && stock.change > 0).length : 'Unavailable'}
            </div>
            <div className="text-xs text-slate-400">out of {knownChanges.length} quotes with a reported change</div>
          </div>
          
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Markets Down</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {knownChanges.length ? knownChanges.filter(stock => stock.change !== null && stock.change < 0).length : 'Unavailable'}
            </div>
            <div className="text-xs text-slate-400">out of {knownChanges.length} quotes with a reported change</div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Avg Change</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {knownPercentChanges.length > 0 ? `${formatNumber(knownPercentChanges.reduce((total, value) => total + value, 0) / knownPercentChanges.length, 2)}%` : 'Unavailable'}
            </div>
            <div className="text-xs text-slate-400">across available stored quotes</div>
          </div>

          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Total Volume</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {marketData.length > 0 && marketData.every(stock => stock.volume !== null) ? formatNumber(marketData.reduce((acc, stock) => acc + (stock.volume ?? 0), 0), 0) : 'Unavailable'}
            </div>
            <div className="text-xs text-slate-400">reported volume where available</div>
          </div>
        </div>

        {/* Stock Market Indices */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Stock Market Indices</h2>
            <div className="ml-auto flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                marketHoursService.isAnyMarketOpen() ? 'bg-green-400 animate-pulse' : 'bg-slate-400'
              }`}></div>
              <span className="text-xs text-slate-400">
                {marketData.length ? 'Stored quotes · provenance requires review' : 'Quotes unavailable'}
              </span>
              <span className="text-xs text-slate-500">• Checks every 5 min</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading.market && marketData.length === 0 ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-600 rounded w-20"></div>
                      <div className="h-3 bg-slate-600 rounded w-32"></div>
                    </div>
                    <div className="h-3 w-3 bg-slate-600 rounded"></div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="h-6 bg-slate-600 rounded w-24"></div>
                    <div className="h-4 bg-slate-600 rounded w-20"></div>
                    <div className="h-3 bg-slate-600 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : marketData.length === 0 ? (
              <p className="col-span-full text-sm text-slate-400">No stored quotes are available. Legacy rows without source and observation metadata are withheld. Live quotes need a separately configured provider integration.</p>
            ) : (
              marketData.map((stock, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-white text-sm">{stock.symbol}</div>
                    <div className="text-xs text-slate-400 truncate">{stock.name}</div>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    stock.change === null ? 'text-slate-400' : stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stock.change === null ? <span>—</span> : stock.change >= 0 ?
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    }
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-lg font-bold text-white">
                    {formatNumber(stock.price)}
                  </div>
                  <div className={`text-sm font-medium ${
                    stock.change === null ? 'text-slate-400' : stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stock.change !== null && stock.change >= 0 ? '+' : ''}{formatNumber(stock.change)}
                    ({stock.change !== null && stock.change >= 0 ? '+' : ''}{formatNumber(stock.changePercent)}%)
                  </div>
                  <div className="text-xs text-slate-400">
                    Volume: {formatNumber(stock.volume, 0)}
                  </div>
                  <div className="text-xs text-slate-400">
                    Record timestamp: {formatObservationDate(stock.storedAt)}
                  </div>
                  <div className="text-xs text-amber-200">
                    Provider and observation date unverified
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Currency Exchange Rates */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Currency Exchange Rates</h2>
            <div className="ml-auto flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <span className="text-xs text-slate-400">Provider reference rates</span>
              <span className="text-xs text-slate-500">• exchangerate-api.com</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading.currency && currencyData.length === 0 ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 animate-pulse">
                  <div className="h-3 bg-slate-600 rounded w-16 mb-2"></div>
                  <div className="h-5 bg-slate-600 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-slate-600 rounded w-12"></div>
                </div>
              ))
            ) : currencyData.length === 0 ? (
              <p className="col-span-full text-sm text-slate-400">Currency rates are unavailable from the public provider. No estimated rate has been substituted.</p>
            ) : (
              currencyData.map((currency, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <div className="text-sm font-medium text-white mb-1">{currency.pair}</div>
                <div className="text-lg font-bold text-white">{formatNumber(currency.rate, currency.pair.includes('IDR') || currency.pair.includes('VND') ? 0 : 4)}</div>
                <div className={`text-xs font-medium ${
                  currency.change === null ? 'text-slate-400' : currency.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {currency.hasPreviousRate
                    ? `${currency.change !== null && currency.change >= 0 ? '+' : ''}${formatNumber(currency.change, 3)} (${formatNumber(currency.changePercent, 2)}%) since prior check`
                    : 'No prior rate for comparison'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Provider date: {formatObservationDate(currency.lastUpdated)}
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Economic Indicators */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Economic Indicators</h2>
            <div className="ml-auto flex items-center space-x-2">
              <span className="text-xs text-slate-400">Source:</span>
              <span className="text-xs text-slate-500">Provider-reported series; missing fields unavailable</span>
            </div>
          </div>
          
          <p className="text-sm text-amber-200 mb-4">
            Periods shown are source-reported annual periods, not retrieval dates or proof of current conditions. Missing metrics remain unavailable; no macroeconomic constants are substituted.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Country</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">GDP (B)</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Inflation</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Unemployment</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Interest Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">USD Exchange</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading.economic && economicData.length === 0 ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 bg-slate-600 rounded w-24"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-600 rounded w-16 ml-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-600 rounded w-12 ml-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-600 rounded w-12 ml-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-600 rounded w-12 ml-auto"></div></td>
                      <td className="py-4 px-4"><div className="h-4 bg-slate-600 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : economicData.length === 0 ? (
                  <tr><td colSpan={6} className="py-4 px-4 text-slate-400">Economic reference data is unavailable.</td></tr>
                ) : (
                  economicData.map((country, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">
                        {country.country}
                        <div className="mt-1 max-w-sm text-xs font-normal text-slate-400">{country.source}</div>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-300">{economicCell(country, 'gdp', 1, '$', '', 1e9)}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{economicCell(country, 'inflation', 1, '', '%')}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{economicCell(country, 'unemployment', 1, '', '%')}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{economicCell(country, 'interestRate', 2, '', '%')}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{economicCell(country, 'exchangeRate', country.exchangeRate !== null && country.exchangeRate > 1000 ? 0 : 4)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMarketData;
