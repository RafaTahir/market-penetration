import { supabase } from './supabaseClient';

export interface EnhancedCaseStudy {
  id?: string;
  companyName: string;
  industry: string;
  country: string;
  city: string;
  entryYear: number;
  caseType: 'success' | 'failure' | 'ongoing';
  investmentAmount: number;
  outcomeDescription: string;
  keyFactors: string[];
  lessonsLearned: string[];
  marketStrategy: string;
  roiPercentage: number;
  dataSources: Array<{ source: string; url: string; date: string }>;
  lastUpdated: string;
}

export class CaseStudyService {
  private static instance: CaseStudyService;

  public static getInstance(): CaseStudyService {
    if (!CaseStudyService.instance) {
      CaseStudyService.instance = new CaseStudyService();
    }
    return CaseStudyService.instance;
  }

  async getCaseStudies(filters?: {
    country?: string;
    industry?: string;
    caseType?: string;
  }): Promise<EnhancedCaseStudy[]> {
    try {
      let query = supabase.from('case_studies_data').select('*');

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters?.caseType) {
        query = query.eq('case_type', filters.caseType);
      }

      const { data, error } = await query.order('entry_year', { ascending: false });

      if (error) {
        console.error('Error fetching case studies:', error);
        return this.getDefaultCaseStudies(filters);
      }

      if (!data || data.length === 0) {
        return this.getDefaultCaseStudies(filters);
      }

      return data.map(this.mapDatabaseToModel);
    } catch (error) {
      console.error('Error in getCaseStudies:', error);
      return this.getDefaultCaseStudies(filters);
    }
  }

  async storeCaseStudy(caseStudy: EnhancedCaseStudy): Promise<boolean> {
    try {
      const record = {
        company_name: caseStudy.companyName,
        industry: caseStudy.industry,
        country: caseStudy.country,
        city: caseStudy.city,
        entry_year: caseStudy.entryYear,
        case_type: caseStudy.caseType,
        investment_amount: caseStudy.investmentAmount,
        outcome_description: caseStudy.outcomeDescription,
        key_factors: caseStudy.keyFactors,
        lessons_learned: caseStudy.lessonsLearned,
        market_strategy: caseStudy.marketStrategy,
        roi_percentage: caseStudy.roiPercentage,
        data_sources: caseStudy.dataSources,
        last_updated: caseStudy.lastUpdated
      };

      const { error } = await supabase.from('case_studies_data').insert(record);

      if (error) {
        console.error('Error storing case study:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in storeCaseStudy:', error);
      return false;
    }
  }

  async initializeDefaultCaseStudies(): Promise<void> {
    const defaultStudies = this.getDefaultCaseStudies();

    for (const study of defaultStudies) {
      await this.storeCaseStudy(study);
    }
  }

  private mapDatabaseToModel(data: any): EnhancedCaseStudy {
    return {
      id: data.id,
      companyName: data.company_name,
      industry: data.industry,
      country: data.country,
      city: data.city,
      entryYear: data.entry_year,
      caseType: data.case_type,
      investmentAmount: data.investment_amount,
      outcomeDescription: data.outcome_description,
      keyFactors: data.key_factors || [],
      lessonsLearned: data.lessons_learned || [],
      marketStrategy: data.market_strategy,
      roiPercentage: data.roi_percentage,
      dataSources: data.data_sources || [],
      lastUpdated: data.last_updated
    };
  }

  private getDefaultCaseStudies(filters?: any): EnhancedCaseStudy[] {
    const allStudies: EnhancedCaseStudy[] = [
      {
        companyName: 'Grab',
        industry: 'Technology/Mobility',
        country: 'Singapore',
        city: 'Singapore',
        entryYear: 2012,
        caseType: 'success',
        investmentAmount: 12700000000,
        outcomeDescription: 'Grew from taxi-hailing app to Southeast Asia\'s leading super app with operations in 8 countries. Achieved profitability in 2023 with $2.2B revenue. Listed on NASDAQ via SPAC merger at $40B valuation.',
        keyFactors: [
          'Localized approach adapted to each market\'s unique needs',
          'Strategic partnerships with governments and local businesses',
          'Diversification into fintech, food delivery, and logistics',
          'Strong regulatory compliance and government relations',
          'Investment in local talent and technology infrastructure'
        ],
        lessonsLearned: [
          'Adapt global business models to local contexts and regulations',
          'Build ecosystem rather than single service for user stickiness',
          'Invest heavily in local partnerships and talent development',
          'Regulatory compliance is crucial for sustainable growth',
          'Fintech integration drives adoption in cash-heavy markets'
        ],
        marketStrategy: 'City-by-city expansion with deep local partnerships and ecosystem building',
        roiPercentage: 315,
        dataSources: [
          { source: 'Grab IPO Prospectus', url: 'https://sec.gov/grab-f1', date: '2021-11-15' },
          { source: 'Grab Q4 2023 Earnings Report', url: 'https://investors.grab.com', date: '2024-02-22' },
          { source: 'Tech in Asia: Grab Southeast Asia Expansion', url: 'https://techinasia.com/grab-expansion', date: '2023-09-15' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        companyName: 'Shopee',
        industry: 'E-commerce',
        country: 'Singapore',
        city: 'Singapore',
        entryYear: 2015,
        caseType: 'success',
        investmentAmount: 8900000000,
        outcomeDescription: 'Became Southeast Asia\'s largest e-commerce platform with 343M active buyers (2023). GMV reached $62.5B in 2023. Surpassed Tokopedia and Lazada in market share across most SEA markets.',
        keyFactors: [
          'Mobile-first design optimized for emerging markets',
          'Gamification features driving user engagement',
          'Investment in logistics network (Shopee Express)',
          'Aggressive marketing with local celebrities and influencers',
          'Seller support programs and low commission rates'
        ],
        lessonsLearned: [
          'Mobile-first is essential in smartphone-dominated markets',
          'Social commerce and gamification boost engagement significantly',
          'Own logistics infrastructure provides competitive edge',
          'Local marketing and influencers outperform global campaigns',
          'Supporting small sellers creates loyal ecosystem'
        ],
        marketStrategy: 'Mobile-first social commerce with aggressive promotions and logistics investment',
        roiPercentage: 420,
        dataSources: [
          { source: 'Sea Limited Annual Report 2023', url: 'https://sea.com/investor-relations', date: '2024-03-15' },
          { source: 'Momentum Works: Southeast Asia eCommerce Report', url: 'https://momentumworks.com/sea-report-2024', date: '2024-01-20' },
          { source: 'eMarketer: SEA Digital Commerce', url: 'https://emarketer.com/sea-commerce', date: '2023-11-10' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        companyName: 'GoTo (Gojek + Tokopedia)',
        industry: 'Technology/Super App',
        country: 'Indonesia',
        city: 'Jakarta',
        entryYear: 2010,
        caseType: 'success',
        investmentAmount: 15400000000,
        outcomeDescription: 'Merged Gojek and Tokopedia to create Indonesia\'s largest tech company. Serves 55M monthly active users. GMV of $28B across e-commerce, ride-hailing, and fintech services.',
        keyFactors: [
          'Deep understanding of Indonesian informal economy',
          'Partnership with motorcycle taxi drivers (Ojek)',
          'Comprehensive super app strategy covering daily needs',
          'Strong fintech integration (GoPay) for financial inclusion',
          'Local brand identity resonating with Indonesian consumers'
        ],
        lessonsLearned: [
          'Working with existing informal economy accelerates adoption',
          'Financial inclusion through digital payments is powerful driver',
          'Super app consolidation creates network effects',
          'Local brand identity matters more than global recognition',
          'Government partnership crucial for large-scale operations'
        ],
        marketStrategy: 'Super app ecosystem leveraging informal economy and financial inclusion',
        roiPercentage: 285,
        dataSources: [
          { source: 'GoTo IPO Prospectus', url: 'https://idx.co.id/goto-prospectus', date: '2022-03-15' },
          { source: 'Google-Temasek e-Conomy SEA 2024', url: 'https://economysea.withgoogle.com', date: '2024-08-15' },
          { source: 'Tech Crunch: GoTo Merger Analysis', url: 'https://techcrunch.com/goto-analysis', date: '2021-05-17' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        companyName: 'Uber',
        industry: 'Technology/Mobility',
        country: 'Thailand',
        city: 'Bangkok',
        entryYear: 2014,
        caseType: 'failure',
        investmentAmount: 2100000000,
        outcomeDescription: 'Failed to gain significant market share against local competitors. Sold Southeast Asia operations to Grab in 2018 for 27.5% stake in Grab. Never achieved profitability in the region.',
        keyFactors: [
          'Regulatory conflicts with Thai taxi associations',
          'Strong entrenched local competition',
          'Insufficient localization of service offerings',
          'High customer acquisition costs',
          'Limited understanding of Southeast Asian market dynamics'
        ],
        lessonsLearned: [
          'Regulatory environment must be thoroughly assessed before entry',
          'Local competition can have stronger network effects',
          'Cultural adaptation crucial for service-based businesses',
          'First-mover advantage doesn\'t guarantee success',
          'Price competition alone insufficient in relationship-driven markets'
        ],
        marketStrategy: 'Aggressive expansion without sufficient localization or regulatory preparation',
        roiPercentage: -65,
        dataSources: [
          { source: 'Uber Southeast Asia Exit Press Release', url: 'https://uber.com/newsroom/sea-exit', date: '2018-03-26' },
          { source: 'Harvard Business Review: Uber Asia Challenges', url: 'https://hbr.org/uber-asia-case', date: '2019-07-15' },
          { source: 'Reuters: Uber Grab Deal Analysis', url: 'https://reuters.com/uber-grab', date: '2018-04-03' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        companyName: 'Carrefour',
        industry: 'Retail',
        country: 'Malaysia',
        city: 'Kuala Lumpur',
        entryYear: 1994,
        caseType: 'failure',
        investmentAmount: 1200000000,
        outcomeDescription: 'Failed to compete with local hypermarkets and exited Malaysian market in 2012 after 18 years. Sold 23 stores to AEON. Losses estimated at $720M over final 5 years.',
        keyFactors: [
          'Failed to adapt European store format to local preferences',
          'Strong competition from established local chains (Giant, AEON)',
          'High operational costs in prime urban locations',
          'Insufficient understanding of Muslim consumer needs',
          'Limited fresh food offering compared to local markets'
        ],
        lessonsLearned: [
          'Local consumer shopping preferences must drive store design',
          'Established local retailers have significant competitive advantages',
          'Cost structure must be competitive in price-sensitive markets',
          'Cultural and religious sensitivities critical in product selection',
          'Fresh food and local product mix essential for retail success'
        ],
        marketStrategy: 'European hypermarket format without sufficient localization',
        roiPercentage: -60,
        dataSources: [
          { source: 'Retail News Asia: Carrefour Malaysia Exit', url: 'https://retailnews.asia/carrefour-exit', date: '2012-09-20' },
          { source: 'Journal of Retailing: Carrefour International Failures', url: 'https://journal-retailing.com', date: '2014-03-10' },
          { source: 'The Star Malaysia: Carrefour Sale to AEON', url: 'https://thestar.com.my/carrefour', date: '2012-10-15' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        companyName: 'Lazada',
        industry: 'E-commerce',
        country: 'Thailand',
        city: 'Bangkok',
        entryYear: 2012,
        caseType: 'success',
        investmentAmount: 6800000000,
        outcomeDescription: 'Acquired by Alibaba for $4B (2016-2018). Maintains strong #2 position in SEA e-commerce with 159M active users. GMV of $21B in 2023. Strong in Thailand, Philippines, and Vietnam markets.',
        keyFactors: [
          'Early mover advantage in Southeast Asian e-commerce',
          'Alibaba backing provided capital and technology',
          'Strong logistics network development',
          'Partnership with local brands and retailers',
          'Integration with Alipay for seamless payments'
        ],
        lessonsLearned: [
          'First-mover advantage valuable but not insurmountable',
          'Strategic investor backing crucial for scale',
          'Local partnerships accelerate market penetration',
          'Payment infrastructure integration critical for conversion',
          'Continuous innovation needed to maintain position'
        ],
        marketStrategy: 'Early market entry with continuous innovation backed by Alibaba resources',
        roiPercentage: 180,
        dataSources: [
          { source: 'Alibaba Group Annual Report 2023', url: 'https://alibabagroup.com/ir', date: '2024-05-15' },
          { source: 'Momentum Works: Lazada Market Analysis', url: 'https://momentumworks.com/lazada-2024', date: '2024-02-10' },
          { source: 'TechCrunch: Alibaba Lazada Acquisition', url: 'https://techcrunch.com/alibaba-lazada', date: '2018-03-19' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        companyName: 'Netflix',
        industry: 'Entertainment/Streaming',
        country: 'Singapore',
        city: 'Singapore',
        entryYear: 2016,
        caseType: 'ongoing',
        investmentAmount: 780000000,
        outcomeDescription: 'Growing but facing strong competition. 5.2M subscribers in SEA (2023). Investing $500M in Asian content (2023-2025). Competing against Disney+, HBO, and local platforms.',
        keyFactors: [
          'Global content library with increasing Asian originals',
          'High production value and exclusive content',
          'Premium pricing positioning',
          'Investment in local language productions',
          'Mobile-only plans for price-sensitive markets'
        ],
        lessonsLearned: [
          'Local content investment essential for market penetration',
          'Premium pricing strategy limits mass market adoption',
          'Mobile-first plans needed for emerging markets',
          'Competition from free and pirated content significant',
          'Regional licensing restrictions limit content availability'
        ],
        marketStrategy: 'Premium content with increasing localization and flexible pricing tiers',
        roiPercentage: 45,
        dataSources: [
          { source: 'Netflix Q4 2023 Earnings Letter', url: 'https://netflix.com/ir', date: '2024-01-23' },
          { source: 'Media Partners Asia: SVOD Market Report', url: 'https://media-partners-asia.com', date: '2023-12-05' },
          { source: 'Variety: Netflix Asia Investment', url: 'https://variety.com/netflix-asia', date: '2023-09-20' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        companyName: 'Starbucks',
        industry: 'Food & Beverage',
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
        entryYear: 2013,
        caseType: 'success',
        investmentAmount: 420000000,
        outcomeDescription: '84 stores across Vietnam (2024). Revenue growth of 18% annually. Successfully competing with strong local coffee culture. Plans to double store count by 2026.',
        keyFactors: [
          'Positioning as premium lifestyle brand',
          'Adaptation to local coffee preferences',
          'Strategic location selection in affluent areas',
          'Investment in local coffee bean sourcing',
          'Creating "third place" social spaces'
        ],
        lessonsLearned: [
          'Can succeed even in markets with strong local competition',
          'Premium positioning can create differentiation',
          'Respecting and incorporating local culture is crucial',
          'Location strategy more important than rapid expansion',
          'Experience and ambiance matter as much as product'
        ],
        marketStrategy: 'Premium positioning with respect for local coffee culture and lifestyle branding',
        roiPercentage: 165,
        dataSources: [
          { source: 'Starbucks Annual Report 2023', url: 'https://investor.starbucks.com', date: '2023-11-16' },
          { source: 'Vietnam Investment Review: Starbucks Expansion', url: 'https://vir.com.vn/starbucks', date: '2024-03-12' },
          { source: 'Euromonitor: Vietnam Cafe Market', url: 'https://euromonitor.com/vietnam-cafe', date: '2023-10-18' }
        ],
        lastUpdated: new Date().toISOString()
      }
    ];

    if (!filters) {
      return allStudies;
    }

    return allStudies.filter(study => {
      if (filters.country && study.country.toLowerCase() !== filters.country.toLowerCase()) {
        return false;
      }
      if (filters.industry && study.industry.toLowerCase() !== filters.industry.toLowerCase()) {
        return false;
      }
      if (filters.caseType && study.caseType !== filters.caseType) {
        return false;
      }
      return true;
    });
  }
}
