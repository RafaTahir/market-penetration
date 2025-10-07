# Finnhub API Setup Instructions

This application now uses the Finnhub API to fetch real-time stock market data for Southeast Asian exchanges.

## Getting Your Finnhub API Key

1. Visit [Finnhub.io](https://finnhub.io/) and create a free account
2. After signing up, you'll be redirected to your dashboard
3. Your API key will be displayed on the dashboard page
4. Copy the API key

## Configuring the Application

1. Open the `.env` file in the project root
2. Find the line: `VITE_FINNHUB_API_KEY=your_finnhub_api_key_here`
3. Replace `your_finnhub_api_key_here` with your actual Finnhub API key
4. Save the file

Example:
```
VITE_FINNHUB_API_KEY=abc123xyz456yourkey
```

## Free Tier Limitations

The Finnhub free tier includes:
- 60 API calls per minute
- Access to real-time stock quotes
- Basic market data

This application is optimized to work within these limits by:
- Only fetching data during market trading hours
- Updating data every 5 minutes (not every second)
- Caching data in Supabase database
- Automatically serving cached data when markets are closed

## Market Trading Hours

The application automatically tracks trading hours for:
- **Thailand (SET)**: 10:00 - 16:30 ICT
- **Singapore (SGX)**: 09:00 - 17:00 SGT
- **Malaysia (MYX)**: 09:00 - 17:00 MYT
- **Indonesia (IDX)**: 09:00 - 16:15 WIB
- **Philippines (PSE)**: 09:30 - 15:30 PHT
- **Vietnam (HOSE)**: 09:00 - 15:00 ICT

Data fetching only occurs during these hours to minimize API usage.

## Features

### Market Hours Display
Each exchange shows a countdown timer indicating:
- Time until market closes (when open)
- Time until market opens (when closed)
- Current market status with visual indicators

### Data Freshness Indicators
- **Fresh**: Data is less than 5 minutes old (green)
- **Recent**: Data is 5-15 minutes old (blue)
- **Stale**: Data is more than 15 minutes old (amber)

### Smart Caching
All market data is cached in Supabase, allowing the app to:
- Show historical data when markets are closed
- Reduce API calls during high-traffic periods
- Provide fallback data if API quota is exceeded

## Troubleshooting

**Problem**: No data is loading
- Check that your API key is correctly configured in `.env`
- Verify the API key is valid on Finnhub dashboard
- Check browser console for error messages

**Problem**: "Using Cached Data" message
- This is normal when all markets are closed
- Markets don't trade on weekends or holidays
- Check individual market clocks for next opening time

**Problem**: API rate limit errors
- The free tier has 60 calls/minute limit
- The app throttles requests to stay within limits
- If you need higher limits, consider upgrading to a paid Finnhub plan

## Support

For Finnhub API issues, visit: https://finnhub.io/docs/api
For application issues, check the browser console for detailed error messages.
