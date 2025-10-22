/*
  # Add Performance Indexes for Market Stocks

  1. Indexes
    - Add composite index on (symbol, timestamp DESC) for fast latest data queries
    - Add index on timestamp for time-based queries
    
  2. Purpose
    - Dramatically improve query performance when fetching latest stock data
    - Enable fast batch queries using IN clause on symbol
    - Reduce query time from seconds to milliseconds
*/

CREATE INDEX IF NOT EXISTS idx_market_stocks_symbol_timestamp 
  ON market_stocks(symbol, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_market_stocks_timestamp 
  ON market_stocks(timestamp DESC);

ANALYZE market_stocks;