# 🚀 Quick Start Guide - Flow Intelligence Platform

## Get Up and Running in 3 Steps

### Step 1: Start the Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

---

### Step 2: Populate Intelligence Data

Open your browser and navigate to:

```
http://localhost:5173/populate-data.html
```

Click the **"📊 Populate Data"** button and wait ~30 seconds for completion.

**What this does:**
- Populates 63 records across 17 intelligence tables
- Adds competitor profiles, market data, regulatory info, and more
- Makes the Enterprise Intelligence Dashboard fully functional

---

### Step 3: Explore the Platform

#### 🏠 Main Dashboard
Start here: `http://localhost:5173`
- Select countries (Singapore, Thailand, Malaysia, etc.)
- Browse market overview, city analysis, industry deep dives

#### 📊 Live Market Data
Navigate: Click "Live Data" in header or press `Ctrl+L`
- Real-time stock prices for 6 SEA exchanges
- Trading hours with countdown timers (**Malaysia now working!**)
- Currency exchange rates
- Economic indicators

#### 🏢 Enterprise Intelligence
Navigate: Click "Enterprise Intelligence" or press `Ctrl+E`

**5 Intelligence Modules:**
1. **Competitive Intelligence** - Select filters to see competitors, market share, pricing
2. **Regulatory Compliance** - Browse business registration requirements by country
3. **Risk Assessment** - View political, economic, and operational risks
4. **Real Estate & Location** - Explore commercial properties and economic zones
5. **Labor & Talent** - Check salary benchmarks and labor market data

---

## ✅ Verification Checklist

After completing the steps above, verify:

### Live Market Data Works
- [ ] All 6 market clocks are displayed (Thailand, Singapore, **Malaysia**, Indonesia, Philippines, Vietnam)
- [ ] Market status shows correct open/closed state
- [ ] Stock indices display with prices

### Enterprise Intelligence Has Data
- [ ] Competitive Intelligence: Select "Singapore" + "Technology" → Should show 2+ competitors
- [ ] Regulatory Compliance: Browse business requirements → Should show 6 countries
- [ ] Risk Assessment: View risks → Should show multiple risk entries
- [ ] Real Estate: See properties → Should show 4+ listings
- [ ] Labor & Talent: Check salaries → Should show 7+ benchmark records

---

## 🔑 Key Features to Try

### Keyboard Shortcuts
- `Ctrl+K` - Advanced search
- `Ctrl+C` - Comparison mode
- `Ctrl+L` - Live market data
- `Ctrl+H` - Home
- `Ctrl+E` - Enterprise intelligence
- `?` - Show all shortcuts

### Market Features
- **Market Clocks**: See when each market opens/closes with countdown
- **Data Freshness**: Check how old the data is (Fresh/Recent/Stale indicators)
- **Currency Rates**: Real-time forex rates for SEA currencies

### Intelligence Features
- **Filter by Country/Industry**: Narrow down to specific markets
- **Detailed Profiles**: Click through to see full competitor profiles
- **Risk Analysis**: View probability scores and mitigation strategies
- **Salary Data**: Compare salaries across countries and roles

---

## 🐛 Troubleshooting

### "No data available" in Intelligence modules?
**Solution**: Run the data population step again. Open `populate-data.html` and click "📊 Populate Data"

### Malaysia trading hours not showing?
**Solution**: This has been fixed! If still not visible, do a hard refresh (`Ctrl+F5`)

### Market data not loading?
**Solution**:
1. Check that Finnhub API key is in `.env` file (already configured)
2. Verify you have internet connection
3. Check browser console for errors

### Build errors?
**Solution**:
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 📁 Important Files

- **`.env`** - API keys (Finnhub + Supabase) - Already configured ✅
- **`populate-data.html`** - Data population interface
- **`DATA_POPULATION_GUIDE.md`** - Detailed population instructions
- **`FIXES_IMPLEMENTED.md`** - Complete list of fixes applied
- **`FINNHUB_SETUP.md`** - Finnhub API documentation

---

## 🎯 What's Different After the Fixes?

### ✅ Before → After

| Feature | Before | After |
|---------|--------|-------|
| Finnhub API | ❌ Placeholder key | ✅ Working API key |
| Malaysia Trading Hours | ❌ Never displayed | ✅ Always displays correctly |
| Enterprise Intelligence | ❌ Empty, no data | ✅ 63 seed records populated |
| Competitive Intel | ❌ "No data available" | ✅ 5 competitors + activities |
| Regulatory Info | ❌ "No data available" | ✅ 6 countries + policies |
| Risk Assessment | ❌ "No data available" | ✅ 8 risk records |
| Real Estate | ❌ "No data available" | ✅ 10 property listings |
| Labor Data | ❌ "No data available" | ✅ 14 salary benchmarks |

---

## 🎉 You're Ready!

Everything is now configured and ready to use. Enjoy exploring the Flow intelligence platform!

**Quick Links:**
- 🏠 Main App: `http://localhost:5173`
- 📊 Data Population: `http://localhost:5173/populate-data.html`
- 📈 Live Data: Click "Live Data" in header
- 🏢 Intelligence: Click "Enterprise Intelligence" in header

---

**Need Help?**
- Check `DATA_POPULATION_GUIDE.md` for detailed instructions
- Review `FIXES_IMPLEMENTED.md` for technical details
- Check browser console for error messages

**Last Updated**: November 13, 2024
