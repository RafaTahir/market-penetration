# Intelligence Data Population Guide

This guide explains how to populate the Enterprise Intelligence Dashboard with seed data.

## 📊 What Data Gets Populated?

The data population script inserts comprehensive seed data into the following modules:

### 1. **Competitive Intelligence**
- **Competitor Profiles**: 5+ major companies across Southeast Asia (Grab, Shopee, Lazada, Gojek, Sea Limited)
- **Competitor Activities**: Recent market moves, funding rounds, mergers, expansions
- **Market Share Data**: Market share by country, industry, and company
- **Pricing Intelligence**: Competitive pricing data across products and services
- **Market Entry Barriers**: Barriers by country and industry with mitigation strategies

### 2. **Regulatory Compliance**
- **Business Registration**: Registration requirements for all 6 countries
- **Tax Incentives**: Government incentive programs and tax benefits
- **Regulatory Policies**: Recent policy changes and compliance requirements

### 3. **Risk Assessment**
- **Political Risks**: Political stability indicators and government changes
- **Economic Risks**: Currency volatility, trade dependencies, economic exposure
- **Operational Risks**: Infrastructure challenges, natural disasters, logistics issues

### 4. **Real Estate & Location**
- **Commercial Properties**: Office spaces and warehouses in major cities
- **Economic Zones**: Special economic zones and innovation districts
- **Infrastructure Projects**: Major transportation and development projects

### 5. **Labor & Talent**
- **Salary Benchmarks**: Salary ranges by role, level, and country
- **Labor Market Statistics**: Employment rates, workforce data, skills shortages
- **Recruitment Partners**: Executive search firms and recruitment agencies

---

## 🚀 How to Populate Data

### Method 1: Using the Web Interface (Recommended)

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the data populator page**:
   Navigate to: `http://localhost:5173/populate-data.html`

3. **Choose an option**:
   - **📊 Populate Data**: Adds seed data to empty tables (recommended for first run)
   - **🗑️ Clear & Populate**: Deletes all existing data first, then repopulates (use with caution!)

4. **Monitor progress**:
   The page will show real-time progress and results for each table

### Method 2: Using Node.js Script

1. **Create a Node.js runner** (if you prefer command line):
   ```typescript
   // scripts/populate.ts
   import { runDataPopulation } from '../src/services/populateIntelligenceData';

   runDataPopulation(false) // false = don't clear first
     .then(() => console.log('Done!'))
     .catch(console.error);
   ```

2. **Run with tsx or ts-node**:
   ```bash
   npx tsx scripts/populate.ts
   ```

---

## ⚠️ Important Notes

### Before Running

1. **Check Supabase Connection**: Ensure your `.env` file has valid Supabase credentials
2. **Database Tables**: All intelligence tables must exist (created via migrations)
3. **Permissions**: Your Supabase anon key should have INSERT permissions on intelligence tables

### After Running

- The Enterprise Intelligence Dashboard will immediately show the populated data
- No app restart required - data is available instantly
- You can re-run the script to add more data (existing records won't be duplicated if you use unique constraints)

### Data Freshness

- The seed data includes realistic dates and timestamps
- Some data is marked with 2024 dates for accuracy
- You can modify seed data files in `src/services/seedData/` to customize

---

## 📝 Seed Data Files

All seed data is organized in modular files:

```
src/services/seedData/
├── competitiveIntelligenceSeedData.ts
├── regulatoryComplianceSeedData.ts
├── riskAssessmentSeedData.ts
├── realEstateLocationSeedData.ts
└── laborTalentSeedData.ts
```

### Customizing Seed Data

To add or modify data:

1. Open the appropriate seed data file
2. Add/modify records in the exported arrays
3. Re-run the population script

Example:
```typescript
// Add a new competitor to competitiveIntelligenceSeedData.ts
export const competitorProfilesData = [
  {
    company_name: 'Your Company',
    country: 'Singapore',
    industry: 'Technology',
    // ... other fields
  },
  // ... existing data
];
```

---

## 🔍 Verifying Data Population

After running the script, verify data in each module:

1. **Navigate to Enterprise Intelligence Dashboard**:
   - Click "Enterprise Intelligence" in the header
   - Or use keyboard shortcut: `Ctrl+E`

2. **Check each module**:
   - ✅ Competitive Intelligence: Select a country and industry
   - ✅ Regulatory Compliance: Browse business registration requirements
   - ✅ Risk Assessment: View political and economic risks
   - ✅ Real Estate: Explore commercial properties
   - ✅ Labor & Talent: Check salary benchmarks

3. **Expected Results**:
   - Competitive Intelligence: 5 competitor profiles, 4 activities, 4 market share records
   - Regulatory Compliance: 6 business registration records, 4 tax incentives, 3 policies
   - Risk Assessment: 4 political risks, 2 economic risks, 2 operational risks
   - Real Estate: 4 commercial properties, 3 economic zones, 3 infrastructure projects
   - Labor & Talent: 7 salary benchmarks, 4 labor statistics, 3 recruitment partners

---

## 🐛 Troubleshooting

### "Error inserting data" messages

**Possible causes**:
1. **Missing tables**: Run Supabase migrations first
2. **Permission issues**: Check RLS policies allow anonymous inserts
3. **Data conflicts**: Some tables may have unique constraints

**Solutions**:
1. Check that all migrations have been applied:
   ```bash
   # Check Supabase dashboard or run migrations again
   ```
2. Review RLS policies in Supabase dashboard
3. Use "Clear & Populate" option to remove conflicting data

### "Cannot connect to Supabase"

**Check**:
- `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Supabase project is active
- Network connection is working

### Data doesn't appear in dashboard

**Verify**:
1. Data was successfully inserted (check console output)
2. Correct filters are selected in the UI
3. RLS policies allow reading the data
4. Browser cache cleared (Ctrl+F5)

---

## 📊 Data Sources

Seed data is based on:
- Publicly available market research reports
- Company filings and announcements
- Government statistics and data
- Industry surveys and benchmarks
- News articles and press releases

All data is for demonstration and research purposes. For production use, connect to real-time data sources and APIs.

---

## 🔄 Keeping Data Updated

### Manual Updates
Edit seed data files and re-run the population script

### Automated Updates (Future Enhancement)
Consider implementing:
- Scheduled data refresh jobs
- API integrations with real-time sources
- Web scraping for public data
- Database triggers for data validation

---

## 📞 Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Review Supabase logs in the dashboard
3. Verify all migrations have been applied
4. Ensure RLS policies are correctly configured

---

**Last Updated**: November 2024
**Version**: 1.0.0
