# Flow - Southeast Asian Market Intelligence Platform

**Your guide to penetrating markets. Comprehensive market research and analysis for Southeast Asia.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 🎯 What is Flow?

Flow is a comprehensive market intelligence platform designed for businesses looking to enter or expand in Southeast Asian markets. It combines real-time market data, enterprise intelligence, and actionable insights to help you make informed decisions.

### Key Capabilities

- **📊 Real-Time Market Data** - Live stock prices, currency rates, and economic indicators for 6 SEA countries
- **🏢 Enterprise Intelligence** - Competitive analysis, regulatory guidance, risk assessment, real estate, and labor market data
- **📈 Data Visualization** - Interactive charts and comparisons across markets
- **📱 Progressive Web App** - Installable on desktop and mobile with offline support
- **🔐 Secure & Authenticated** - User accounts with personalized dashboards

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Internet connection (for API data)

### Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   App will be available at: `http://localhost:5173`

3. **Populate intelligence data** (Required for Enterprise Intelligence):
   - Navigate to: `http://localhost:5173/populate-data.html`
   - Click "📊 Populate Data"
   - Wait ~30 seconds for completion

4. **Start exploring!**
   - Main dashboard: `http://localhost:5173`
   - Live market data: Click "Live Data" or press `Ctrl+L`
   - Enterprise intelligence: Click "Enterprise Intelligence" or press `Ctrl+E`

📖 **Detailed guide**: See [`QUICK_START.md`](./QUICK_START.md)

---

## 🌏 Market Coverage

Flow provides comprehensive data for 6 Southeast Asian markets:

| Country | Market Code | Trading Hours (Local) | Key Features |
|---------|-------------|----------------------|--------------|
| 🇹🇭 Thailand | SET | 10:00 - 16:30 ICT | Tourism, Manufacturing |
| 🇸🇬 Singapore | SGX | 09:00 - 17:00 SGT | Financial Hub, Technology |
| 🇲🇾 Malaysia | MYX | 09:00 - 17:00 MYT | Manufacturing, Commodities |
| 🇮🇩 Indonesia | IDX | 09:00 - 16:15 WIB | Largest Economy, E-commerce |
| 🇵🇭 Philippines | PSE | 09:30 - 15:30 PHT | BPO, Services |
| 🇻🇳 Vietnam | HOSE | 09:00 - 15:00 ICT | Manufacturing, Technology |

---

## 📊 Features

### Live Market Data
- Real-time stock indices from 6 exchanges via Finnhub API
- Currency exchange rates (THB, SGD, MYR, IDR, PHP, VND)
- Economic indicators (GDP, inflation, unemployment)
- Market trading hours with countdown timers
- Data freshness indicators

### Enterprise Intelligence Dashboard

#### 1. Competitive Intelligence
- Competitor profiles (revenue, market share, business model)
- Recent competitive activities (funding, M&A, launches)
- Market share tracking by industry
- Pricing intelligence across products
- Market entry barriers analysis

#### 2. Regulatory Compliance
- Business registration requirements by country
- Tax incentive programs and benefits
- Regulatory policy changes and updates
- Foreign ownership rules
- Compliance timelines and costs

#### 3. Risk Assessment
- Political risk indicators and stability metrics
- Economic risks (currency, trade, exposure)
- Operational risks (infrastructure, logistics)
- Probability and impact scores
- Mitigation strategies

#### 4. Real Estate & Location
- Commercial property listings (office, warehouse)
- Special economic zones and innovation districts
- Major infrastructure projects
- Connectivity and amenities
- Pricing per sqm by location

#### 5. Labor & Talent
- Salary benchmarks by role, level, and country
- Labor market statistics
- Skills shortage analysis
- Recruitment partner directory
- Benefits and employment trends

### Additional Features
- **Advanced Search** - Multi-criteria filtering (`Ctrl+K`)
- **Comparison Mode** - Side-by-side market comparison (`Ctrl+C`)
- **Export Tools** - PDF, Excel, PowerPoint exports
- **Dark/Light Theme** - Customizable interface
- **Keyboard Shortcuts** - Power user features
- **User Dashboard** - Personalized analytics
- **Collaboration** - Comments and real-time presence
- **Data Playground** - SQL query interface

---

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast builds
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend & Data
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - Enterprise-grade security
- **Finnhub API** - Real-time market data
- **Exchange Rate API** - Currency rates
- **World Bank / IMF APIs** - Economic indicators

### Infrastructure
- **Progressive Web App** - Installable and offline-capable
- **Service Worker** - Caching and offline support
- **TypeScript** - Type safety throughout
- **ESLint** - Code quality

---

## 📁 Project Structure

```
flow/
├── src/
│   ├── components/          # React components
│   │   ├── LiveMarketData.tsx
│   │   ├── EnterpriseIntelligenceDashboard.tsx
│   │   ├── CompetitiveIntelligence.tsx
│   │   └── ...
│   ├── services/            # API services and data management
│   │   ├── finnhubService.ts
│   │   ├── supabaseClient.ts
│   │   ├── populateIntelligenceData.ts
│   │   └── seedData/        # Seed data for intelligence modules
│   ├── contexts/            # React contexts (Auth, Theme)
│   ├── hooks/               # Custom React hooks
│   └── data/                # Static data files
├── supabase/
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── populate-data.html       # Data population interface
└── docs/
    ├── QUICK_START.md       # Quick start guide
    ├── DATA_POPULATION_GUIDE.md
    ├── FIXES_IMPLEMENTED.md
    └── FINNHUB_SETUP.md
```

---

## 🔑 Environment Variables

The `.env` file contains necessary API keys:

```env
VITE_FINNHUB_API_KEY=ctsmvi1r01qnbgkqbhf0ctsmvi1r01qnbgkqbhfg
VITE_SUPABASE_URL=https://ocimwvuxwzerltvhiaxj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Already configured** - No action needed!

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 3 steps
- **[DATA_POPULATION_GUIDE.md](./DATA_POPULATION_GUIDE.md)** - Detailed data population instructions
- **[FIXES_IMPLEMENTED.md](./FIXES_IMPLEMENTED.md)** - Recent improvements and fixes
- **[FINNHUB_SETUP.md](./FINNHUB_SETUP.md)** - Finnhub API configuration
- **[FEATURE_MANIFEST.md](./FEATURE_MANIFEST.md)** - Complete feature list
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Change log

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open advanced search |
| `Ctrl+C` | Toggle comparison mode |
| `Ctrl+L` | Navigate to live data |
| `Ctrl+H` | Return to home |
| `Ctrl+E` | Open enterprise intelligence |
| `?` | Show all keyboard shortcuts |

---

## 🔧 Build & Deploy

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Build
```bash
npm run build
```

Output will be in `dist/` directory:
- Total bundle: ~2.4 MB (727 KB gzipped)
- Optimized for production
- Ready for static hosting

### Deployment
Deploy to:
- **Vercel**: Connect GitHub repo → Auto-deploy
- **Netlify**: Drag & drop `dist/` folder
- **AWS S3**: Upload `dist/` → Enable static hosting
- **Any static host**: Just serve the `dist/` folder

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Live market data loads for all 6 countries
- [ ] Malaysia trading hours display correctly
- [ ] Enterprise Intelligence shows data in all 5 modules
- [ ] Filters work correctly (country, industry)
- [ ] Dark/light theme toggles properly
- [ ] Export functions work (PDF, Excel, PPTX)
- [ ] Keyboard shortcuts respond

### Automated Testing
```bash
npm run lint         # Run ESLint
npm run build        # Verify build succeeds
```

---

## 🐛 Troubleshooting

### Common Issues

**"No data in Enterprise Intelligence"**
- Solution: Run data population at `populate-data.html`

**"Malaysia trading hours not showing"**
- Solution: Hard refresh browser (`Ctrl+F5`)

**"API rate limit exceeded"**
- Solution: Finnhub free tier has 60 calls/min. Data is cached to minimize calls.

**"Build errors"**
- Solution: Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```

See `QUICK_START.md` for more troubleshooting tips.

---

## 📊 Data Sources

- **Finnhub.io** - Real-time market data
- **Supabase** - Database and real-time sync
- **World Bank** - Economic indicators
- **IMF** - Economic forecasts
- **Public APIs** - Currency rates
- **Company Filings** - Competitor information
- **Government Sources** - Regulatory data

All data is aggregated from publicly available sources and APIs.

---

## 🤝 Contributing

This is a market intelligence tool. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎯 Roadmap

### Completed ✅
- [x] Real-time market data for 6 SEA countries
- [x] Enterprise intelligence dashboard
- [x] Data population system
- [x] Dark/light theme
- [x] Progressive Web App
- [x] Authentication system
- [x] Export functionality

### Planned 🚧
- [ ] Email notifications for market alerts
- [ ] Advanced AI-powered insights
- [ ] Mobile native apps (iOS/Android)
- [ ] Multi-language support (Thai, Bahasa, etc.)
- [ ] Custom report templates
- [ ] API access for developers

---

## 📞 Support

For questions or issues:
1. Check documentation in `docs/` folder
2. Review `QUICK_START.md` and `FIXES_IMPLEMENTED.md`
3. Check browser console for error messages
4. Verify Supabase connection in dashboard

---

## ⭐ Acknowledgments

Built with data from:
- Finnhub.io for market data
- Supabase for backend infrastructure
- World Bank and IMF for economic data
- Open-source community for amazing tools

---

**Version**: 2.0.0
**Last Updated**: November 13, 2024
**Status**: ✅ Production Ready

Made with ❤️ for market intelligence professionals
