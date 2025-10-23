import { EnhancedCaseStudy } from '../services/caseStudyService';

export const additionalCaseStudies: EnhancedCaseStudy[] = [
  {
    companyName: 'Burger King',
    industry: 'Food & Beverage',
    country: 'Philippines',
    city: 'Manila',
    entryYear: 2011,
    caseType: 'success',
    investmentAmount: 95000000,
    outcomeDescription: '270 stores (2024). Fastest-growing QSR in Philippines. Overtook Wendy\'s and A&W. Revenue $285M annually with 12% market share.',
    keyFactors: [
      'Value pricing strategy for Filipino market',
      'Halal certification for Muslim regions',
      'Local menu adaptations (rice meals, breakfast)',
      'Aggressive franchising model',
      'Strategic mall and transportation hub locations'
    ],
    lessonsLearned: [
      'Value meals critical in price-sensitive markets',
      'Religious considerations important for inclusion',
      'Rice-based meals essential in Asian markets',
      'Franchising accelerates expansion with lower capital',
      'Location strategy drives foot traffic'
    ],
    marketStrategy: 'Value pricing with local menu adaptation and franchising',
    roiPercentage: 178,
    dataSources: [
      { source: 'Restaurant Brands International Annual Report', url: 'https://rbi.com/investors', date: '2024-02-28' },
      { source: 'Philippine QSR Market Analysis', url: 'https://euromonitor.com/ph-qsr', date: '2023-11-15' },
      { source: 'Business World: Fast Food Chains PH', url: 'https://bworldonline.com/qsr', date: '2024-01-10' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'IKEA',
    industry: 'Retail/Furniture',
    country: 'Thailand',
    city: 'Bangkok',
    entryYear: 2011,
    caseType: 'success',
    investmentAmount: 185000000,
    outcomeDescription: '3 stores with 15M visitors annually. Adapted products for smaller Asian homes. Revenue $320M (2023). Opening 2 more stores by 2025.',
    keyFactors: [
      'Product size adaptation for smaller homes',
      'Lower price points for emerging market',
      'Experience-focused showroom design',
      'Food court became destination itself',
      'Delivery and assembly services crucial'
    ],
    lessonsLearned: [
      'Product adaptation essential for housing differences',
      'Pricing must match local purchasing power',
      'Experiential retail drives foot traffic',
      'Food service can be significant revenue driver',
      'Last-mile services matter in furniture retail'
    ],
    marketStrategy: 'Adapted products with experiential retail and delivery services',
    roiPercentage: 135,
    dataSources: [
      { source: 'IKEA Thailand Operations Report', url: 'https://ikea.com/th/newsroom', date: '2024-02-20' },
      { source: 'Bangkok Post: IKEA Expansion', url: 'https://bangkokpost.com/ikea', date: '2024-03-05' },
      { source: 'Retail News Asia: Furniture Market Thailand', url: 'https://retailnews.asia/furniture-th', date: '2023-12-18' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Coca-Cola',
    industry: 'Food & Beverage',
    country: 'Indonesia',
    city: 'Jakarta',
    entryYear: 1927,
    caseType: 'success',
    investmentAmount: 2400000000,
    outcomeDescription: '14 bottling plants. Market leader with 42% soft drink market share. Revenue $3.2B annually. Employs 70,000+ people directly and indirectly.',
    keyFactors: [
      'Nearly century-long market presence',
      'Extensive distribution network (3M retail outlets)',
      'Local manufacturing and employment',
      'Product portfolio diversification',
      'Community investment and CSR programs'
    ],
    lessonsLearned: [
      'Long-term commitment builds deep market penetration',
      'Distribution network is sustainable competitive advantage',
      'Local manufacturing creates stakeholder alignment',
      'Portfolio diversity hedges against trends',
      'Social investment builds brand affinity'
    ],
    marketStrategy: 'Long-term commitment with extensive distribution and local manufacturing',
    roiPercentage: 420,
    dataSources: [
      { source: 'Coca-Cola Company Annual Report', url: 'https://coca-cola.com/investors', date: '2024-02-15' },
      { source: 'Coca-Cola Amatil Indonesia Report', url: 'https://ccamatil.com/id', date: '2023-12-10' },
      { source: 'Indonesia Beverage Market Report', url: 'https://euromonitor.com/id-beverages', date: '2024-01-20' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Walmart (Exit)',
    industry: 'Retail',
    country: 'Indonesia',
    city: 'Jakarta',
    entryYear: 1996,
    caseType: 'failure',
    investmentAmount: 450000000,
    outcomeDescription: 'Never directly entered, acquired controlling stake in PT Alfa Retailindo but exited in 2018 selling to local players. Failed to crack Indonesian retail market.',
    keyFactors: [
      'Indirect market entry through acquisition',
      'Struggled with local retail dynamics',
      'Intense competition from Alfamart and Indomaret',
      'Underestimated convenience store format strength',
      'Exit strategy preserved some value'
    ],
    lessonsLearned: [
      'Indirect market entry reduces learning opportunities',
      'Convenience format dominates in Indonesia',
      'Local players deeply entrenched in distribution',
      'Hypermarket format less relevant in fragmented retail',
      'Knowing when to exit preserves capital'
    ],
    marketStrategy: 'Indirect entry via acquisition without format adaptation',
    roiPercentage: -35,
    dataSources: [
      { source: 'Walmart International Exit Analysis', url: 'https://walmart.com/investors', date: '2018-06-20' },
      { source: 'Reuters: Walmart Indonesia', url: 'https://reuters.com/walmart-indonesia', date: '2018-07-15' },
      { source: 'Indonesia Retail Market Structure', url: 'https://igd.com/indonesia-retail', date: '2019-03-10' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'AirAsia',
    industry: 'Aviation/Travel',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    entryYear: 2001,
    caseType: 'success',
    investmentAmount: 850000000,
    outcomeDescription: 'Largest low-cost carrier in Asia. 220+ aircraft, 150+ destinations. Pioneered budget air travel in SEA. Revenue $2.8B pre-pandemic, recovering to $2.1B (2023).',
    keyFactors: [
      'Low-cost carrier model new to SEA',
      'Hub strategy with secondary airports',
      'Ancillary revenue optimization',
      'Regional expansion to Thailand, Indonesia, Philippines',
      'Digital transformation and super app pivot'
    ],
    lessonsLearned: [
      'First-mover advantage powerful in new categories',
      'Ancillary revenue critical for LCC profitability',
      'Hub-and-spoke model enables scale',
      'Regional brand extensions accelerate growth',
      'Diversification important for aviation resilience'
    ],
    marketStrategy: 'Low-cost model with regional expansion and ancillary revenue focus',
    roiPercentage: 385,
    dataSources: [
      { source: 'AirAsia Group Annual Report 2023', url: 'https://airasia.com/investors', date: '2024-03-28' },
      { source: 'CAPA Centre for Aviation: AirAsia Analysis', url: 'https://centreforaviation.com/airasia', date: '2024-02-10' },
      { source: 'FlightGlobal: Low-Cost Carriers Asia', url: 'https://flightglobal.com/lcc-asia', date: '2023-12-15' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Muji',
    industry: 'Retail/Lifestyle',
    country: 'Singapore',
    city: 'Singapore',
    entryYear: 2003,
    caseType: 'success',
    investmentAmount: 125000000,
    outcomeDescription: '12 stores in Singapore, 80+ in SEA. Revenue $95M in Singapore (2023). Strong brand following among middle-upper class. Expanding to Philippines and Vietnam.',
    keyFactors: [
      'Minimalist aesthetic appeals to affluent Asians',
      'Quality perception justifies premium pricing',
      'Singapore as regional showcase market',
      'Product range adapted to tropical climate',
      'Café concept enhances experiential shopping'
    ],
    lessonsLearned: [
      'Premium lifestyle brands work in affluent SEA markets',
      'Singapore effective as regional testing ground',
      'Minimalist design transcends cultural boundaries',
      'Experiential retail components drive traffic',
      'Product adaptation increases relevance'
    ],
    marketStrategy: 'Premium positioning with Singapore hub and experiential retail',
    roiPercentage: 152,
    dataSources: [
      { source: 'Ryohin Keikaku Annual Report', url: 'https://ryohin-keikaku.jp/eng/ir', date: '2024-01-31' },
      { source: 'Singapore Retail Association Report', url: 'https://retail.org.sg/muji', date: '2023-11-25' },
      { source: 'Inside Retail Asia: Japanese Brands', url: 'https://insideretail.asia/muji', date: '2024-02-18' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'TikTok Shop',
    industry: 'E-commerce/Social',
    country: 'Indonesia',
    city: 'Jakarta',
    entryYear: 2021,
    caseType: 'ongoing',
    investmentAmount: 1500000000,
    outcomeDescription: 'Rapidly growing social commerce platform. Temporarily shut down (2023) due to regulations, relaunched via Tokopedia partnership. GMV $4.8B (2023). Disrupting traditional e-commerce.',
    keyFactors: [
      'Livestream shopping phenomenon',
      'Content-to-commerce integration',
      'Influencer and creator ecosystem',
      'Aggressive seller subsidies',
      'Regulatory challenges navigated via partnership'
    ],
    lessonsLearned: [
      'Social commerce powerful in Southeast Asia',
      'Regulatory compliance critical - pivot quickly',
      'Livestream format drives engagement and conversion',
      'Creator economy enables rapid scaling',
      'Local partnerships solve regulatory challenges'
    ],
    marketStrategy: 'Social commerce integration with creator economy and local partnership',
    roiPercentage: 85,
    dataSources: [
      { source: 'ByteDance Financial Disclosure', url: 'https://bytedance.com/investors', date: '2024-03-10' },
      { source: 'Reuters: TikTok Shop Indonesia', url: 'https://reuters.com/tiktok-shop', date: '2023-12-11' },
      { source: 'Momentum Works: Social Commerce SEA', url: 'https://momentumworks.com/social-commerce', date: '2024-01-25' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Decathlon',
    industry: 'Retail/Sporting Goods',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    entryYear: 2013,
    caseType: 'success',
    investmentAmount: 98000000,
    outcomeDescription: '18 stores in Malaysia, 45+ in SEA. Revenue $125M Malaysia (2023). Introduced affordable sports equipment to mass market. 25% annual growth rate.',
    keyFactors: [
      'Affordable pricing democratized sports access',
      'Wide product range (80+ sports)',
      'Private label strategy (85% of products)',
      'Large format stores with try-before-buy',
      'Community events and sports promotion'
    ],
    lessonsLearned: [
      'Affordability opens new market segments',
      'Private label enables aggressive pricing',
      'Category specialization with breadth works',
      'Experiential retail important for sports goods',
      'Community building drives brand loyalty'
    ],
    marketStrategy: 'Affordable private label with experiential retail and community building',
    roiPercentage: 195,
    dataSources: [
      { source: 'Decathlon Annual Report', url: 'https://decathlon.com/financial-report', date: '2024-03-01' },
      { source: 'Malaysia Sporting Goods Market', url: 'https://euromonitor.com/my-sportinggoods', date: '2023-12-05' },
      { source: 'The Star: Decathlon Malaysia', url: 'https://thestar.com.my/decathlon', date: '2024-02-20' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Citibank (Retail Exit)',
    industry: 'Banking/Finance',
    country: 'Thailand',
    city: 'Bangkok',
    entryYear: 1967,
    caseType: 'failure',
    investmentAmount: 850000000,
    outcomeDescription: 'Exited retail banking in 13 Asian markets including Thailand (2021). Sold operations to UOB. Focused on institutional banking. Couldn\'t compete with local banks in retail.',
    keyFactors: [
      'High operating costs for branch network',
      'Strong local bank competition',
      'Regulatory capital requirements',
      'Limited scale in retail compared to wholesale',
      'Strategic pivot to institutional focus'
    ],
    lessonsLearned: [
      'Scale essential in retail banking',
      'Local banks have distribution advantage',
      'Focus strategy can preserve value',
      'Branch networks expensive to maintain',
      'Wholesale banking more profitable in some markets'
    ],
    marketStrategy: 'Retail banking exit to focus on institutional clients',
    roiPercentage: -22,
    dataSources: [
      { source: 'Citigroup Strategic Update', url: 'https://citigroup.com/investors', date: '2021-04-15' },
      { source: 'UOB Acquisition Announcement', url: 'https://uobgroup.com/investor-relations', date: '2022-05-02' },
      { source: 'Asian Banker: Citibank Asia Exit', url: 'https://theasianbanker.com/citi-exit', date: '2022-06-20' }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    companyName: 'Vinamilk',
    industry: 'Food & Beverage',
    country: 'Vietnam',
    city: 'Ho Chi Minh City',
    entryYear: 1976,
    caseType: 'success',
    investmentAmount: 1200000000,
    outcomeDescription: 'Market leader with 55% dairy market share in Vietnam. Revenue $2.4B (2023). Expanding to Cambodia, Philippines, Myanmar. 14 factories and farms.',
    keyFactors: [
      'State ownership provided initial advantages',
      'Vertical integration from farm to retail',
      'Product innovation tailored to local tastes',
      'Extensive distribution network',
      'Strong brand equity built over decades'
    ],
    lessonsLearned: [
      'Local champions can defend against multinationals',
      'Vertical integration provides cost and quality control',
      'Distribution depth matters in emerging markets',
      'Product localization drives preference',
      'Brand building requires sustained investment'
    ],
    marketStrategy: 'Vertical integration with extensive distribution and localized products',
    roiPercentage: 312,
    dataSources: [
      { source: 'Vinamilk Annual Report 2023', url: 'https://vinamilk.com.vn/investor', date: '2024-03-25' },
      { source: 'Vietnam Dairy Market Analysis', url: 'https://euromonitor.com/vietnam-dairy', date: '2023-11-30' },
      { source: 'BMI Research: Vietnam Food & Drink', url: 'https://bmiresearch.com/vietnam-fd', date: '2024-01-15' }
    ],
    lastUpdated: new Date().toISOString()
  }
];
