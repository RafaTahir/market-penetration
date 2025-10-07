import axios from 'axios';

export interface IMFEconomicData {
  country: string;
  indicator: string;
  value: number;
  year: number;
  unit: string;
  source: string;
  lastUpdated: string;
}

export interface IMFReport {
  title: string;
  organization: string;
  country: string;
  summary: string;
  publicationDate: string;
  url: string;
  type: string;
}

export class IMFService {
  private static instance: IMFService;
  private readonly BASE_URL = 'https://www.imf.org/external/datamapper/api/v1';

  private readonly COUNTRY_CODES = {
    indonesia: 'IDN',
    thailand: 'THA',
    singapore: 'SGP',
    malaysia: 'MYS',
    philippines: 'PHL',
    vietnam: 'VNM'
  };

  public static getInstance(): IMFService {
    if (!IMFService.instance) {
      IMFService.instance = new IMFService();
    }
    return IMFService.instance;
  }

  async getGDPGrowth(countries: string[] = []): Promise<IMFEconomicData[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/NGDP_RPCH`,
        {
          timeout: 10000
        }
      );

      if (response.data && response.data.values && response.data.values.NGDP_RPCH) {
        const growthData = response.data.values.NGDP_RPCH;
        const results: IMFEconomicData[] = [];

        const targetCountries = countries.length > 0
          ? countries.map(c => this.COUNTRY_CODES[c.toLowerCase() as keyof typeof this.COUNTRY_CODES]).filter(Boolean)
          : Object.values(this.COUNTRY_CODES);

        for (const countryCode of targetCountries) {
          if (growthData[countryCode]) {
            const countryData = growthData[countryCode];
            const years = Object.keys(countryData).sort().reverse();

            years.slice(0, 6).forEach(year => {
              if (countryData[year] !== null && countryData[year] !== undefined) {
                results.push({
                  country: this.getCountryName(countryCode),
                  indicator: 'GDP Growth Rate',
                  value: parseFloat(countryData[year]),
                  year: parseInt(year),
                  unit: 'Percent',
                  source: 'IMF World Economic Outlook',
                  lastUpdated: new Date().toISOString()
                });
              }
            });
          }
        }

        return results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching IMF GDP growth data:', error);
      return [];
    }
  }

  async getCurrentAccountBalance(countries: string[] = []): Promise<IMFEconomicData[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/BCA_NGDPD`,
        {
          timeout: 10000
        }
      );

      if (response.data && response.data.values && response.data.values.BCA_NGDPD) {
        const caData = response.data.values.BCA_NGDPD;
        const results: IMFEconomicData[] = [];

        const targetCountries = countries.length > 0
          ? countries.map(c => this.COUNTRY_CODES[c.toLowerCase() as keyof typeof this.COUNTRY_CODES]).filter(Boolean)
          : Object.values(this.COUNTRY_CODES);

        for (const countryCode of targetCountries) {
          if (caData[countryCode]) {
            const countryData = caData[countryCode];
            const latestYear = Object.keys(countryData).sort().reverse()[0];

            if (countryData[latestYear] !== null && countryData[latestYear] !== undefined) {
              results.push({
                country: this.getCountryName(countryCode),
                indicator: 'Current Account Balance',
                value: parseFloat(countryData[latestYear]),
                year: parseInt(latestYear),
                unit: 'Percent of GDP',
                source: 'IMF World Economic Outlook',
                lastUpdated: new Date().toISOString()
              });
            }
          }
        }

        return results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching IMF current account data:', error);
      return [];
    }
  }

  async getInflationRate(countries: string[] = []): Promise<IMFEconomicData[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/PCPIPCH`,
        {
          timeout: 10000
        }
      );

      if (response.data && response.data.values && response.data.values.PCPIPCH) {
        const inflationData = response.data.values.PCPIPCH;
        const results: IMFEconomicData[] = [];

        const targetCountries = countries.length > 0
          ? countries.map(c => this.COUNTRY_CODES[c.toLowerCase() as keyof typeof this.COUNTRY_CODES]).filter(Boolean)
          : Object.values(this.COUNTRY_CODES);

        for (const countryCode of targetCountries) {
          if (inflationData[countryCode]) {
            const countryData = inflationData[countryCode];
            const years = Object.keys(countryData).sort().reverse();

            years.slice(0, 3).forEach(year => {
              if (countryData[year] !== null && countryData[year] !== undefined) {
                results.push({
                  country: this.getCountryName(countryCode),
                  indicator: 'Inflation Rate',
                  value: parseFloat(countryData[year]),
                  year: parseInt(year),
                  unit: 'Percent',
                  source: 'IMF World Economic Outlook',
                  lastUpdated: new Date().toISOString()
                });
              }
            });
          }
        }

        return results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching IMF inflation data:', error);
      return [];
    }
  }

  async getGDPPerCapita(countries: string[] = []): Promise<IMFEconomicData[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/NGDPDPC`,
        {
          timeout: 10000
        }
      );

      if (response.data && response.data.values && response.data.values.NGDPDPC) {
        const gdppcData = response.data.values.NGDPDPC;
        const results: IMFEconomicData[] = [];

        const targetCountries = countries.length > 0
          ? countries.map(c => this.COUNTRY_CODES[c.toLowerCase() as keyof typeof this.COUNTRY_CODES]).filter(Boolean)
          : Object.values(this.COUNTRY_CODES);

        for (const countryCode of targetCountries) {
          if (gdppcData[countryCode]) {
            const countryData = gdppcData[countryCode];
            const latestYear = Object.keys(countryData).sort().reverse()[0];

            if (countryData[latestYear] !== null && countryData[latestYear] !== undefined) {
              results.push({
                country: this.getCountryName(countryCode),
                indicator: 'GDP per Capita',
                value: parseFloat(countryData[latestYear]),
                year: parseInt(latestYear),
                unit: 'USD',
                source: 'IMF World Economic Outlook',
                lastUpdated: new Date().toISOString()
              });
            }
          }
        }

        return results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching IMF GDP per capita data:', error);
      return [];
    }
  }

  async getAllEconomicData(countries: string[] = []): Promise<{ [country: string]: any }> {
    try {
      const [gdpGrowth, inflation, gdpPerCapita, currentAccount] = await Promise.all([
        this.getGDPGrowth(countries),
        this.getInflationRate(countries),
        this.getGDPPerCapita(countries),
        this.getCurrentAccountBalance(countries)
      ]);

      const countryMap: { [country: string]: any } = {};

      const processData = (data: IMFEconomicData[], field: string) => {
        data.forEach(item => {
          if (!countryMap[item.country]) {
            countryMap[item.country] = {
              country: item.country,
              source: 'IMF World Economic Outlook',
              lastUpdated: item.lastUpdated
            };
          }

          if (field === 'gdpGrowthHistory') {
            if (!countryMap[item.country][field]) {
              countryMap[item.country][field] = [];
            }
            countryMap[item.country][field].push({
              year: item.year,
              value: item.value
            });
          } else {
            const latest = data
              .filter(d => d.country === item.country && d.indicator === item.indicator)
              .sort((a, b) => b.year - a.year)[0];

            if (item === latest) {
              countryMap[item.country][field] = item.value;
              countryMap[item.country][`${field}Year`] = item.year;
            }
          }
        });
      };

      processData(gdpGrowth, 'gdpGrowthHistory');
      processData(inflation, 'inflation');
      processData(gdpPerCapita, 'gdpPerCapita');
      processData(currentAccount, 'currentAccount');

      return countryMap;
    } catch (error) {
      console.error('Error fetching all IMF economic data:', error);
      return {};
    }
  }

  getIMFReports(): IMFReport[] {
    return [
      {
        title: 'Regional Economic Outlook: Asia and Pacific',
        organization: 'International Monetary Fund',
        country: 'Southeast Asia',
        summary: 'The latest Regional Economic Outlook for Asia and Pacific provides comprehensive analysis of economic trends, growth prospects, and policy challenges facing Southeast Asian economies. The report emphasizes structural reforms potential with output gains of 1.5-3% over 2-4 years.',
        publicationDate: '2024-10-15',
        url: 'https://www.imf.org/en/Publications/REO/APAC',
        type: 'Economic Outlook'
      },
      {
        title: 'World Economic Outlook Database',
        organization: 'International Monetary Fund',
        country: 'Global',
        summary: 'Comprehensive database of economic indicators including GDP, inflation, unemployment, and fiscal balances for 190+ countries. Updated twice yearly with historical data and forecasts through 2029.',
        publicationDate: '2024-10-01',
        url: 'https://www.imf.org/en/Publications/WEO',
        type: 'Statistical Database'
      },
      {
        title: 'Southeast Asia Economies: Navigating External Shocks',
        organization: 'International Monetary Fund',
        country: 'ASEAN-4',
        summary: 'Analysis of Indonesia, Malaysia, Philippines, and Thailand responses to external economic shocks. Covers monetary policy effectiveness, fiscal space, and structural reform opportunities.',
        publicationDate: '2024-03-25',
        url: 'https://www.imf.org/en/Publications/Departmental-Papers-Policy-Papers',
        type: 'Policy Paper'
      },
      {
        title: 'Asia Pacific Economic Outlook Q4 2024',
        organization: 'International Monetary Fund',
        country: 'Asia Pacific',
        summary: 'Quarterly update on economic developments in Asia Pacific region including growth revisions, inflation trends, and risk assessments for major Southeast Asian economies.',
        publicationDate: '2024-12-01',
        url: 'https://www.imf.org/en/Publications/REO',
        type: 'Quarterly Outlook'
      }
    ];
  }

  private getCountryName(code: string): string {
    const names: { [key: string]: string } = {
      'IDN': 'Indonesia',
      'THA': 'Thailand',
      'SGP': 'Singapore',
      'MYS': 'Malaysia',
      'PHL': 'Philippines',
      'VNM': 'Vietnam'
    };
    return names[code] || code;
  }
}
