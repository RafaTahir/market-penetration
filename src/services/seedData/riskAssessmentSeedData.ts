export const politicalRisksData = [
  {
    country: 'Thailand',
    risk_category: 'Political Stability',
    risk_title: 'Political Uncertainty',
    risk_description: 'Ongoing political tensions and frequent government changes may impact business environment',
    risk_level: 'Medium',
    probability_score: 60,
    impact_score: 65,
    timeframe: 'Short-term (0-12 months)',
    affected_sectors: ['All sectors', 'Tourism', 'Real Estate'],
    indicators_monitored: ['Government stability index', 'Protest activity', 'Policy consistency'],
    mitigation_recommendations: ['Maintain political neutrality', 'Build relationships across political spectrum', 'Diversify operations geographically'],
    recent_events: ['New government formed Q3 2024'],
    data_sources: ['Political Risk Services', 'World Bank Governance Indicators']
  },
  {
    country: 'Indonesia',
    risk_category: 'Regulatory',
    risk_title: 'Changing Investment Regulations',
    risk_description: 'Frequent changes to foreign investment regulations and ownership requirements',
    risk_level: 'Medium',
    probability_score: 70,
    impact_score: 75,
    timeframe: 'Medium-term (1-3 years)',
    affected_sectors: ['Technology', 'E-commerce', 'Financial Services'],
    indicators_monitored: ['Negative investment list updates', 'Presidential regulations', 'Ministry circulars'],
    mitigation_recommendations: ['Work with local partners', 'Engage legal advisors', 'Join industry associations', 'Participate in policy consultations'],
    recent_events: ['Updated negative investment list 2024'],
    data_sources: ['BKPM announcements', 'Legal databases']
  },
  {
    country: 'Singapore',
    risk_category: 'Economic',
    risk_title: 'High Cost Environment',
    risk_description: 'Rising costs of labor, real estate, and operations may impact profitability',
    risk_level: 'Low',
    probability_score: 85,
    impact_score: 50,
    timeframe: 'Long-term (3+ years)',
    affected_sectors: ['Retail', 'Hospitality', 'Manufacturing'],
    indicators_monitored: ['Wage growth', 'Commercial real estate prices', 'Operating cost indices'],
    mitigation_recommendations: ['Automate operations', 'Consider regional hub model', 'Focus on high-margin business', 'Leverage government grants'],
    recent_events: ['Continued wage pressure in Q4 2024'],
    data_sources: ['Singapore Department of Statistics', 'URA data']
  },
  {
    country: 'Malaysia',
    risk_category: 'Political Stability',
    risk_title: 'Coalition Government Stability',
    risk_description: 'Multi-party coalition government may face stability challenges',
    risk_level: 'Medium',
    probability_score: 55,
    impact_score: 60,
    timeframe: 'Short-term (0-12 months)',
    affected_sectors: ['Infrastructure', 'Energy', 'Government contracting'],
    indicators_monitored: ['Coalition cohesion', 'By-election results', 'Policy implementation speed'],
    mitigation_recommendations: ['Maintain multi-party relationships', 'Focus on long-term projects', 'Build public-private partnerships'],
    recent_events: ['Stable coalition government since 2023'],
    data_sources: ['Political analysis', 'News monitoring']
  }
];

export const economicRisksData = [
  {
    country: 'Singapore',
    risk_category: 'Economic Exposure',
    risk_title: 'Global Trade Dependency',
    risk_description: 'Heavy reliance on global trade makes economy vulnerable to international disruptions',
    risk_level: 'Medium',
    probability_score: 60,
    impact_score: 70,
    timeframe: 'Ongoing',
    affected_sectors: ['Trade', 'Logistics', 'Manufacturing', 'Financial Services'],
    exposure_metrics: { trade_to_gdp_ratio: 325, export_concentration: 'High' },
    hedging_strategies: ['Diversify trade partners', 'Develop domestic consumption', 'Strengthen regional trade agreements'],
    stress_test_scenarios: ['Global recession', 'Trade war escalation', 'Supply chain disruption'],
    contingency_plans: ['Government economic support packages', 'Business continuity planning'],
    data_sources: ['MAS reports', 'MTI economic surveys']
  },
  {
    country: 'Indonesia',
    risk_category: 'Currency',
    risk_title: 'Rupiah Volatility',
    risk_description: 'Indonesian Rupiah subject to periodic volatility affecting import costs and foreign debt',
    risk_level: 'Medium',
    probability_score: 65,
    impact_score: 65,
    timeframe: 'Short to Medium-term',
    affected_sectors: ['Import/Export', 'Manufacturing', 'Retail'],
    exposure_metrics: { currency_volatility: '8-12% annually', foreign_debt_exposure: 'Moderate' },
    hedging_strategies: ['Natural hedging', 'Forward contracts', 'Multi-currency operations', 'Local sourcing'],
    stress_test_scenarios: ['10% currency depreciation', '20% currency depreciation', 'Capital flight'],
    contingency_plans: ['Price adjustment mechanisms', 'Supplier diversification'],
    data_sources: ['Bank Indonesia', 'Currency market data']
  }
];

export const operationalRisksData = [
  {
    country: 'Thailand',
    risk_category: 'Infrastructure',
    risk_title: 'Flooding Risks',
    risk_description: 'Seasonal flooding in central Thailand can disrupt supply chains and operations',
    risk_level: 'Medium',
    probability_score: 70,
    impact_score: 65,
    timeframe: 'Seasonal (Annual)',
    affected_areas: ['Central Thailand', 'Industrial estates', 'Bangkok suburbs'],
    affected_sectors: ['Manufacturing', 'Logistics', 'Agriculture'],
    disruption_duration_days: 30,
    business_continuity_requirements: ['Elevated storage', 'Backup facilities', 'Flood insurance', 'Emergency response plan'],
    insurance_availability: 'Available but expensive in high-risk zones',
    case_studies: ['2011 Thailand floods disrupted global electronics supply chain'],
    data_sources: ['Thai Meteorological Department', 'Historical incident data']
  },
  {
    country: 'Indonesia',
    risk_category: 'Infrastructure',
    risk_title: 'Logistics Challenges',
    risk_description: 'Archipelago geography creates complex and costly logistics operations',
    risk_level: 'Medium',
    probability_score: 85,
    impact_score: 60,
    timeframe: 'Ongoing',
    affected_areas: ['Outer islands', 'Eastern Indonesia', 'Remote areas'],
    affected_sectors: ['E-commerce', 'Retail', 'FMCG'],
    disruption_duration_days: 0,
    business_continuity_requirements: ['Multiple distribution centers', 'Local partnerships', 'Inventory management systems'],
    insurance_availability: 'Standard cargo insurance available',
    case_studies: ['E-commerce companies built extensive logistics networks'],
    data_sources: ['Industry reports', 'Logistics provider data']
  }
];
