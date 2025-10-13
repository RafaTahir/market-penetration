export interface Country {
  id: string;
  name: string;
  flag: string;
  gdp: string;
  population: string;
  growth: string;
  currency: string;
  exchange: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  timestamp: string;
}

export interface MarketHours {
  id: string;
  exchange: string;
  country: string;
  timezone: string;
  open_time: string;
  close_time: string;
  is_weekend_trading: boolean;
}

export interface CurrencyRate {
  id: string;
  pair: string;
  rate: number;
  change: number;
  change_percent: number;
  timestamp: string;
}

export interface EconomicIndicator {
  id: string;
  country: string;
  gdp: number;
  inflation: number;
  unemployment: number;
  interest_rate: number;
  exchange_rate: number;
  timestamp: string;
}

export interface MarketInsight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  country: string;
}
