import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Globe, Activity, Clock, Loader2 } from 'lucide-react';
import { MarketData, EconomicIndicator, CurrencyRate } from '../services/marketDataService';
import { UnifiedDataService } from '../services/unifiedDataService';
import { MarketHoursService, MarketStatus } from '../services/marketHoursService';
import { BrowserCacheService } from '../services/browserCacheService';
import MarketClock from './MarketClock';

const LiveMarketData: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [economicData, setEconomicData] = useState<EconomicIndicator[]>([]);
  const [currencyData, setCurrencyData] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState({ market: true, economic: true, currency: true });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dataAge, setDataAge] = useState<number>(0);
  const [marketStatuses, setMarketStatuses] = useState<MarketStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unifiedService = UnifiedDataService.getInstance();
  const marketHoursService = MarketHoursService.getInstance();
  const browserCache = BrowserCacheService.getInstance();

  useEffect(() => {
    loadCachedDataFirst();
    fetchMarketData();
    updateMarketStatuses();

    const stopRealTimeUpdates = unifiedService.startRealTimeUpdates();

    const ageInterval = setInterval(() => {
      setDataAge(Date.now() - lastUpdated.getTime());
    }, 1000);

    const statusInterval = setInterval(() => {
      updateMarketStatuses();
    }, 60000);

    const refreshInterval = setInterval(() => {
      fetchMarketData();
    }, 300000);

    return () => {
      stopRealTimeUpdates();
      clearInterval(ageInterval);
      clearInterval(statusInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const updateMarketStatuses = () => {
    const statuses = marketHoursService.getAllMarketStatuses();
    setMarketStatuses(statuses);
  };

  const loadCachedDataFirst = () => {
    const symbols = ['SET.BK', 'STI.SI', 'KLCI.KL', 'JKSE.JK', 'PSEI.PS', 'VN-INDEX.HM'];
    const marketKey = `market_${symbols.sort().join('_')}`;
    const economicKey = 'economic_';
    const currencyKey = 'currency_rates';

    const cachedMarket = browserCache.getStale<MarketData[]>(marketKey);
    if (cachedMarket) {
      setMarketData(cachedMarket.data);
      setLoading(prev => ({ ...prev, market: false }));
    }

    const cachedEconomic = browserCache.getStale<any[]>(economicKey);
    if (cachedEconomic) {
      setEconomicData(cachedEconomic.data.map(e => ({
        country: e.country,
        gdp: e.gdp,
        inflation: e.inflation,
        unemployment: e.unemployment,
        interestRate: e.interestRate,
        exchangeRate: e.exchangeRate,
        lastUpdated: e.lastUpdated
      })));
      setLoading(prev => ({ ...prev, economic: false }));
    }

    const cachedCurrency = browserCache.getStale<CurrencyRate[]>(currencyKey);
    if (cachedCurrency) {
      setCurrencyData(cachedCurrency.data);
      setLoading(prev => ({ ...prev, currency: false }));
    }
  };

  const fetchMarketData = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const symbols = ['SET.BK', 'STI.SI', 'KLCI.KL', 'JKSE.JK', 'PSEI.PS', 'VN-INDEX.HM'];

      await Promise.allSettled([
        unifiedService.getMarketData(symbols)
          .then(stocks => {
            setMarketData(stocks);
            setLoading(prev => ({ ...prev, market: false }));
          })
          .catch(err => {
            console.error('Error fetching market data:', err);
            setLoading(prev => ({ ...prev, market: false }));
          }),
        unifiedService.getUnifiedEconomicData()
          .then(economic => {
            setEconomicData(economic.map(e => ({
              country: e.country,
              gdp: e.gdp,
              inflation: e.inflation,
              unemployment: e.unemployment,
              interestRate: e.interestRate,
              exchangeRate: e.exchangeRate,
              lastUpdated: e.lastUpdated
            })));
            setLoading(prev => ({ ...prev, economic: false }));
          })
          .catch(err => {
            console.error('Error fetching economic data:', err);
            setLoading(prev => ({ ...prev, economic: false }));
          }),
        unifiedService.getCurrencyRates()
          .then(currency => {
            setCurrencyData(currency);
            setLoading(prev => ({ ...prev, currency: false }));
          })
          .catch(err => {
            console.error('Error fetching currency data:', err);
            setLoading(prev => ({ ...prev, currency: false }));
          })
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error in fetchMarketData:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getDataFreshnessStatus = () => {
    const ageInMinutes = dataAge / 60000;

    if (ageInMinutes < 5) {
      return { label: 'Fresh', color: 'text-emerald-400', bgColor: 'bg-emerald-400/20' };
    } else if (ageInMinutes < 15) {
      return { label: 'Recent', color: 'text-blue-400', bgColor: 'bg-blue-400/20' };
    } else {
      return { label: 'Stale', color: 'text-amber-400', bgColor: 'bg-amber-400/20' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Live Market Data</h1>
                <p className="text-sm text-slate-400">Southeast Asian Financial Markets</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  marketHoursService.isAnyMarketOpen() ? 'bg-green-400 animate-pulse' : 'bg-slate-400'
                }`}></div>
                <span className="text-sm text-slate-400">
                  {marketHoursService.isAnyMarketOpen() ? 'Markets Open' : 'Markets Closed'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getDataFreshnessStatus().bgColor} ${getDataFreshnessStatus().color}`}>
                  {getDataFreshnessStatus().label}
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Last Updated</div>
                  <div className="text-sm text-white flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{lastUpdated.toLocaleTimeString()}</span>
                    {dataAge > 0 && <span className="text-xs text-slate-500">({Math.floor(dataAge / 1000)}s ago)</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Status Clocks with Indices */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Markets Up</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {marketData.filter(stock => stock.change > 0).length}
            </div>
            <div className="text-xs text-slate-400">out of {marketData.length} indices</div>
          </div>
          
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Markets Down</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {marketData.filter(stock => stock.change < 0).length}
            </div>
            <div className="text-xs text-slate-400">out of {marketData.length} indices</div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Avg Change</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {marketData.length > 0 ? formatNumber(marketData.reduce((acc, stock) => acc + stock.changePercent, 0) / marketData.length, 2) : '0.00'}%
            </div>
            <div className="text-xs text-slate-400">across all markets</div>
          </div>

          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Total Volume</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(marketData.reduce((acc, stock) => acc + stock.volume, 0))}
            </div>
            <div className="text-xs text-slate-400">combined trading volume</div>
          </div>
        </div>

        {/* Stock Market Indices */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Stock Market Indices</h2>
            <div className="ml-auto flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                marketHoursService.isAnyMarketOpen() ? 'bg-green-400 animate-pulse' : 'bg-slate-400'
              }`}></div>
              <span className="text-xs text-slate-400">
                {marketHoursService.isAnyMarketOpen() ? 'Live from Finnhub' : 'Using Cached Data'}
              </span>
              <span className="text-xs text-slate-500">• Updates every 5 min</span>
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
            ) : (
              marketData.map((stock, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-white text-sm">{stock.symbol}</div>
                    <div className="text-xs text-slate-400 truncate">{stock.name}</div>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stock.change >= 0 ? 
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
                    stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stock.change >= 0 ? '+' : ''}{formatNumber(stock.change)} 
                    ({stock.change >= 0 ? '+' : ''}{formatNumber(stock.changePercent)}%)
                  </div>
                  <div className="text-xs text-slate-400">
                    Vol: {formatNumber(stock.volume, 0)}
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Currency Exchange Rates */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Currency Exchange Rates</h2>
            <div className="ml-auto flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Real-time Rates</span>
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
            ) : (
              currencyData.map((currency, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <div className="text-sm font-medium text-white mb-1">{currency.pair}</div>
                <div className="text-lg font-bold text-white">{formatNumber(currency.rate, currency.pair.includes('IDR') || currency.pair.includes('VND') ? 0 : 4)}</div>
                <div className={`text-xs font-medium ${
                  currency.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {currency.change >= 0 ? '+' : ''}{formatNumber(currency.change, 3)} 
                  ({currency.change >= 0 ? '+' : ''}{formatNumber(currency.changePercent, 2)}%)
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Economic Indicators */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-6">
            <Globe className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Economic Indicators</h2>
            <div className="ml-auto flex items-center space-x-2">
              <span className="text-xs text-slate-400">Source:</span>
              <span className="text-xs text-slate-500">World Bank • IMF</span>
            </div>
          </div>
          
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
                ) : (
                  economicData.map((country, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{country.country}</td>
                      <td className="py-4 px-4 text-right text-slate-300">${formatNumber(country.gdp, 1)}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatNumber(country.inflation, 1)}%</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatNumber(country.unemployment, 1)}%</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatNumber(country.interestRate, 2)}%</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatNumber(country.exchangeRate, country.exchangeRate > 1000 ? 0 : 4)}</td>
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