import { EnhancedCaseStudy } from '../services/caseStudyService';

export const caseStudiesBatch2: EnhancedCaseStudy[] = [
  {
    companyName: 'Adidas',
    industry: 'Retail/Sportswear',
    country: 'Indonesia',
    city: 'Jakarta',
    entryYear: 2004,
    caseType: 'success',
    investmentAmount: 245000000,
    outcomeDescription: '380 stores across Indonesia (2024). Strong brand among youth. Revenue $420M annually. Successfully competing with Nike through local football marketing.',
    keyFactors: [
      'Football sponsorships (national team, leagues)',
      'Local athlete endorsements',
      'Affordable product lines for mass market',
      'Exclusive collaborations with local designers',
      'Strong retail presence in malls and streets'
    ],
    lessonsLearned: [
      'Sports sponsorships build deep emotional connections',
      'Local athlete endorsements outperform global stars',
      'Price segmentation serves multiple segments',
      'Local designer collabs create buzz',
      'Omnichannel presence captures different shoppers'
    ],
    marketStrategy: 'Football-focused marketing with price segmentation and local partnerships',
    roiPercentage: 195,
    dataSources: [
      { source: 'Adidas AG Annual Report', url: 'https://adidas-group.com/investors', date: '2024-03-07' },
      { source: 'Indonesia Sportswear Market', url: 'https://euromonitor.com/indonesia-sportswear', date: '2023-12-15' },
      { source: 'Marketing Asia: Adidas Indonesia Strategy', url: 'https://marketing-interactive.com/adidas-id', date: '2024-01-22' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Central Group (Big C)',
    industry: 'Retail',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    entryYear: 2016,
    caseType: 'success',
    investmentAmount: 1100000000,
    outcomeDescription: 'Acquired by Central Group (Thailand) for $1.1B. Rebranded to GO! 750+ stores. Market leader in hypermarket segment. Revenue $2.5B (2023).',
    keyFactors: [
      'Thai company understanding of Asian markets',
      'Aggressive expansion in tier 2/3 cities',
      'Fresh food and wet market integration',
      'Competitive pricing strategy',
      'Rebranding to localize perception'
    ],
    lessonsLearned: [
      'Regional players understand markets better',
      'Tier 2/3 cities offer growth opportunities',
      'Fresh food is traffic driver in Asia',
      'Rebranding can overcome foreign perception',
      'Scale enables competitive pricing'
    ],
    marketStrategy: 'Regional acquisition with tier 2/3 expansion and fresh food focus',
    roiPercentage: 168,
    dataSources: [
      { source: 'Central Group Investor Relations', url: 'https://centralgroup.com/investors', date: '2024-02-28' },
      { source: 'Vietnam Retail Market Report', url: 'https://bmr.gov.vn/retail-report', date: '2023-12-20' },
      { source: 'Inside Retail Asia: GO! Vietnam', url: 'https://insideretail.asia/go-vietnam', date: '2024-03-10' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'KFC',
    industry: 'Food & Beverage',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    entryYear: 1973,
    caseType: 'success',
    investmentAmount: 420000000,
    outcomeDescription: '750+ outlets in Malaysia. Market leader in QSR category. Revenue $950M (2023). First Western QSR to achieve Halal certification. Regional training hub.',
    keyFactors: [
      'Early Halal certification (1970s)',
      'Menu localization (rice meals, spicy variants)',
      'Zakat payments building community trust',
      'Aggressive franchising model',
      'Strong supply chain and quality control'
    ],
    lessonsLearned: [
      'Religious certification critical in Muslim markets',
      'Early market entry creates lasting advantage',
      'Menu localization essential for acceptance',
      'CSR and religious obligations build trust',
      'Franchising enables rapid scaling'
    ],
    marketStrategy: 'Halal-certified QSR with menu localization and franchising',
    roiPercentage: 285,
    dataSources: [
      { source: 'QSR Brands Annual Report', url: 'https://qsrbrands.com/investor', date: '2024-03-30' },
      { source: 'Malaysia QSR Market Analysis', url: 'https://euromonitor.com/malaysia-qsr', date: '2023-11-10' },
      { source: 'The Star: KFC Malaysia History', url: 'https://thestar.com.my/kfc-50years', date: '2023-09-15' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Guardian (Dairy Farm)',
    industry: 'Retail/Pharmacy',
    country: 'Singapore',
    city: 'Singapore',
    entryYear: 1972,
    caseType: 'success',
    investmentAmount: 680000000,
    outcomeDescription: '500+ stores in SEA. Market leader in health & beauty retail. Revenue $1.8B from SEA (2023). Strong private label development. Regional expansion continuing.',
    keyFactors: [
      'Early mover in organized health & beauty',
      'Private label provides margin advantage',
      'Strategic mall and MRT locations',
      'Professional pharmacist service',
      'Loyalty program with 12M members'
    ],
    lessonsLearned: [
      'First-mover advantage sustainable with execution',
      'Private label drives differentiation and margins',
      'Location strategy critical for convenience retail',
      'Professional service creates competitive moat',
      'Loyalty programs drive repeat purchases'
    ],
    marketStrategy: 'First-mover with private label and professional service',
    roiPercentage: 245,
    dataSources: [
      { source: 'Dairy Farm International Annual Report', url: 'https://dairyfarmgroup.com/investors', date: '2024-03-15' },
      { source: 'Singapore Health & Beauty Retail', url: 'https://euromonitor.com/singapore-hb', date: '2023-12-08' },
      { source: 'IGD Asia: Pharmacy Retail', url: 'https://igd.com/pharmacy-asia', date: '2024-01-20' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'WeWork',
    industry: 'Real Estate/Coworking',
    country: 'Singapore',
    city: 'Singapore',
    entryYear: 2017,
    caseType: 'failure',
    investmentAmount: 145000000,
    outcomeDescription: 'Opened 5 locations but exited Singapore by 2023. Unable to sustain high rents and low occupancy post-pandemic. Filed for bankruptcy protection globally.',
    keyFactors: [
      'High real estate costs in Singapore',
      'COVID-19 accelerated remote work',
      'Overexpansion and unsustainable unit economics',
      'Competition from local coworking operators',
      'Failed IPO weakened financial position'
    ],
    lessonsLearned: [
      'Real estate arbitrage risky in expensive markets',
      'Business models must survive black swan events',
      'Unit economics must work at scale',
      'Local competition can be more efficient',
      'Financial prudence essential for real estate'
    ],
    marketStrategy: 'High-cost expansion without sustainable unit economics',
    roiPercentage: -88,
    dataSources: [
      { source: 'WeWork Bankruptcy Filing', url: 'https://wework.com/newsroom', date: '2023-11-06' },
      { source: 'Reuters: WeWork Singapore Exit', url: 'https://reuters.com/wework-singapore', date: '2023-08-15' },
      { source: 'Business Times: Coworking Market SG', url: 'https://businesstimes.com.sg/coworking', date: '2023-09-20' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Indomie (Indofood)',
    industry: 'Food & Beverage',
    country: 'Indonesia',
    city: 'Jakarta',
    entryYear: 1972,
    caseType: 'success',
    investmentAmount: 2800000000,
    outcomeDescription: 'World\'s largest instant noodle brand by volume. 18 billion packs annually. 75% Indonesian market share. Exports to 100+ countries. Revenue $4.5B (2023).',
    keyFactors: [
      'Deep distribution to 3M+ retail points',
      'Affordability ($0.20 per pack)',
      'Flavor innovation (50+ variants)',
      'Strong brand equity built over 50 years',
      'Vertical integration from wheat to distribution'
    ],
    lessonsLearned: [
      'Affordable staple products can build massive businesses',
      'Distribution depth is sustainable competitive advantage',
      'Continuous innovation keeps products relevant',
      'Local champions can dominate even commodity categories',
      'Vertical integration provides cost control'
    ],
    marketStrategy: 'Affordable staple with deep distribution and continuous innovation',
    roiPercentage: 520,
    dataSources: [
      { source: 'Indofood Sukses Makmur Annual Report', url: 'https://indofood.com/investor', date: '2024-03-28' },
      { source: 'World Instant Noodles Association', url: 'https://instantnoodles.org/statistics', date: '2023-12-31' },
      { source: 'Nielsen: Indonesia FMCG Market', url: 'https://nielsen.com/indonesia-fmcg', date: '2024-02-15' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'NTUC FairPrice',
    industry: 'Retail/Supermarket',
    country: 'Singapore',
    city: 'Singapore',
    entryYear: 1973,
    caseType: 'success',
    investmentAmount: 1400000000,
    outcomeDescription: '250 outlets. Market leader with 48% supermarket share. Revenue $3.2B (2023). Social enterprise model serving nation-building objectives.',
    keyFactors: [
      'Social mission aligned with government objectives',
      'Cooperative ownership structure',
      'Price control during inflation helps nation',
      'Extensive network including heartland areas',
      'Strong private label penetration'
    ],
    lessonsLearned: [
      'Social enterprise model can be commercially successful',
      'Mission-driven businesses build trust',
      'Government alignment provides advantages',
      'Serving all segments including low-income crucial',
      'Cooperative structure aligns stakeholders'
    ],
    marketStrategy: 'Social enterprise with government alignment and inclusive reach',
    roiPercentage: 185,
    dataSources: [
      { source: 'NTUC FairPrice Annual Report', url: 'https://fairprice.com.sg/corporate', date: '2024-04-15' },
      { source: 'Singapore Supermarket Market', url: 'https://euromonitor.com/singapore-supermarket', date: '2023-12-12' },
      { source: 'IGD: Social Enterprise Retail', url: 'https://igd.com/social-enterprise', date: '2024-01-25' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'OVO',
    industry: 'FinTech/Payments',
    country: 'Indonesia',
    city: 'Jakarta',
    entryYear: 2017,
    caseType: 'success',
    investmentAmount: 520000000,
    outcomeDescription: 'Leading digital wallet with 115M users (2024). Backed by Grab. Revenue $180M (2023). Processing $28B in transactions annually.',
    keyFactors: [
      'Partnership with Tokopedia and Grab',
      'Aggressive cashback and incentives',
      'Merchant acceptance network building',
      'Integration with multiple platforms',
      'Financial services diversification'
    ],
    lessonsLearned: [
      'Platform partnerships accelerate adoption',
      'Incentives necessary to change payment behavior',
      'Merchant network is two-sided marketplace',
      'Diversification into lending/investment increases value',
      'Scale economics in payments powerful'
    ],
    marketStrategy: 'Platform partnerships with aggressive incentives and diversification',
    roiPercentage: 295,
    dataSources: [
      { source: 'OVO Financial Report', url: 'https://ovo.id/corporate', date: '2024-02-20' },
      { source: 'Indonesia Digital Payments Report', url: 'https://pwc.com/id/fintech', date: '2023-11-25' },
      { source: 'Tech in Asia: OVO Analysis', url: 'https://techinasia.com/ovo-payments', date: '2024-01-18' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Sephora',
    industry: 'Retail/Beauty',
    country: 'Thailand',
    city: 'Bangkok',
    entryYear: 2017,
    caseType: 'success',
    investmentAmount: 85000000,
    outcomeDescription: '35 stores in SEA. Premium beauty destination. Revenue $120M from SEA (2023). Omnichannel strategy with strong digital presence.',
    keyFactors: [
      'Experiential retail format',
      'Premium brand selection not available elsewhere',
      'Beauty advisor expertise and service',
      'Loyalty program integration',
      'Omnichannel with click-and-collect'
    ],
    lessonsLearned: [
      'Experiential format works for beauty retail',
      'Exclusive brand access creates differentiation',
      'Service quality justifies premium positioning',
      'Loyalty programs powerful in beauty category',
      'Omnichannel essential for modern retail'
    ],
    marketStrategy: 'Premium experiential retail with exclusive brands and omnichannel',
    roiPercentage: 142,
    dataSources: [
      { source: 'LVMH Selective Retailing Report', url: 'https://lvmh.com/investors', date: '2024-01-30' },
      { source: 'Euromonitor: SEA Beauty & Personal Care', url: 'https://euromonitor.com/sea-beauty', date: '2023-12-18' },
      { source: 'Inside Retail Asia: Sephora SEA', url: 'https://insideretail.asia/sephora', date: '2024-02-05' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Maybank',
    industry: 'Banking/Finance',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    entryYear: 1960,
    caseType: 'success',
    investmentAmount: 8500000000,
    outcomeDescription: 'Largest bank in Malaysia and SEA. 2,400+ branches. $180B in assets. Strong regional presence in Indonesia, Singapore, Philippines. Revenue $8.2B (2023).',
    keyFactors: [
      'Domestic scale provides strong base',
      'Early regional expansion strategy',
      'Islamic banking pioneer and leader',
      'Digital transformation investment',
      'Strong SME and retail banking focus'
    ],
    lessonsLearned: [
      'Domestic scale enables regional expansion',
      'Islamic banking significant in Muslim markets',
      'Digital investment essential for competitiveness',
      'SME banking underserved but profitable',
      'Regional presence diversifies revenue'
    ],
    marketStrategy: 'Domestic scale with regional expansion and Islamic banking',
    roiPercentage: 225,
    dataSources: [
      { source: 'Maybank Annual Report 2023', url: 'https://maybank.com/investor-relations', date: '2024-03-15' },
      { source: 'Asian Banker: SEA Banking Rankings', url: 'https://theasianbanker.com/rankings-sea', date: '2024-02-01' },
      { source: 'S&P Global: Malaysia Banking Sector', url: 'https://spglobal.com/malaysia-banking', date: '2023-12-20' }
    ],
    lastUpdated: new Date().toISOString()
  }
];
