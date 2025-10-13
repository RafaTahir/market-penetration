import axios from 'axios';

export interface WorldBankIndicator {
  country: string;
  countryCode: string;
  indicator: string;
  value: number;
  year: number;
  lastUpdated: string;
}

export interface WorldBankReport {
  id: string;
  title: string;
  organization: string;
  country: string;
  summary: string;
  publicationDate: string;
  url: string;
  type: string;
}

export class WorldBankService {
  private static instance: WorldBankService;
  private readonly BASE_URL = 'https://api.worldbank.org/v2';
  private readonly COUNTRIES = {
    indonesia: 'IDN',
    thailand: 'THA',
    singapore: 'SGP',
    malaysia: 'MYS',
    philippines: 'PHL',
    vietnam: 'VNM'
  };

  public static getInstance(): WorldBankService {
    if (!WorldBankService.instance) {
      WorldBankService.instance = new WorldBankService();
    }
    return WorldBankService.instance;
  }

  async getGDPData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    try {
      const targetCountries = countries.length > 0
        ? countries.map(c => this.COUNTRIES[c.toLowerCase() as keyof typeof this.COUNTRIES]).filter(Boolean)
        : Object.values(this.COUNTRIES);

      const countryString = targetCountries.join(';');
      const response = await axios.get(
        `${this.BASE_URL}/country/${countryString}/indicator/NY.GDP.MKTP.CD`,
        {
          params: {
            format: 'json',
            per_page: 100,
            date: '2020:2024'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data[1]) {
        return response.data[1]
          .filter((item: any) => item.value !== null)
          .map((item: any) => ({
            country: item.country.value,
            countryCode: item.countryiso3code,
            indicator: 'GDP',
            value: item.value / 1e9,
            year: parseInt(item.date),
            lastUpdated: new Date().toISOString()
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching World Bank GDP data:', error);
      return [];
    }
  }

  async getInflationData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    try {
      const targetCountries = countries.length > 0
        ? countries.map(c => this.COUNTRIES[c.toLowerCase() as keyof typeof this.COUNTRIES]).filter(Boolean)
        : Object.values(this.COUNTRIES);

      const countryString = targetCountries.join(';');
      const response = await axios.get(
        `${this.BASE_URL}/country/${countryString}/indicator/FP.CPI.TOTL.ZG`,
        {
          params: {
            format: 'json',
            per_page: 100,
            date: '2020:2024'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data[1]) {
        return response.data[1]
          .filter((item: any) => item.value !== null)
          .map((item: any) => ({
            country: item.country.value,
            countryCode: item.countryiso3code,
            indicator: 'Inflation',
            value: item.value,
            year: parseInt(item.date),
            lastUpdated: new Date().toISOString()
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching World Bank inflation data:', error);
      return [];
    }
  }

  async getUnemploymentData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    try {
      const targetCountries = countries.length > 0
        ? countries.map(c => this.COUNTRIES[c.toLowerCase() as keyof typeof this.COUNTRIES]).filter(Boolean)
        : Object.values(this.COUNTRIES);

      const countryString = targetCountries.join(';');
      const response = await axios.get(
        `${this.BASE_URL}/country/${countryString}/indicator/SL.UEM.TOTL.ZS`,
        {
          params: {
            format: 'json',
            per_page: 100,
            date: '2020:2024'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data[1]) {
        return response.data[1]
          .filter((item: any) => item.value !== null)
          .map((item: any) => ({
            country: item.country.value,
            countryCode: item.countryiso3code,
            indicator: 'Unemployment',
            value: item.value,
            year: parseInt(item.date),
            lastUpdated: new Date().toISOString()
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching World Bank unemployment data:', error);
      return [];
    }
  }

  async getPopulationData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    try {
      const targetCountries = countries.length > 0
        ? countries.map(c => this.COUNTRIES[c.toLowerCase() as keyof typeof this.COUNTRIES]).filter(Boolean)
        : Object.values(this.COUNTRIES);

      const countryString = targetCountries.join(';');
      const response = await axios.get(
        `${this.BASE_URL}/country/${countryString}/indicator/SP.POP.TOTL`,
        {
          params: {
            format: 'json',
            per_page: 100,
            date: '2020:2024'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data[1]) {
        return response.data[1]
          .filter((item: any) => item.value !== null)
          .map((item: any) => ({
            country: item.country.value,
            countryCode: item.countryiso3code,
            indicator: 'Population',
            value: item.value / 1e6,
            year: parseInt(item.date),
            lastUpdated: new Date().toISOString()
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching World Bank population data:', error);
      return [];
    }
  }

  async getInternetUsersData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    try {
      const targetCountries = countries.length > 0
        ? countries.map(c => this.COUNTRIES[c.toLowerCase() as keyof typeof this.COUNTRIES]).filter(Boolean)
        : Object.values(this.COUNTRIES);

      const countryString = targetCountries.join(';');
      const response = await axios.get(
        `${this.BASE_URL}/country/${countryString}/indicator/IT.NET.USER.ZS`,
        {
          params: {
            format: 'json',
            per_page: 100,
            date: '2015:2024'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data[1]) {
        return response.data[1]
          .filter((item: any) => item.value !== null)
          .map((item: any) => ({
            country: item.country.value,
            countryCode: item.countryiso3code,
            indicator: 'Internet Users',
            value: item.value,
            year: parseInt(item.date),
            lastUpdated: new Date().toISOString()
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching World Bank internet users data:', error);
      return [];
    }
  }

  async getAllEconomicIndicators(countries: string[] = []): Promise<{ [country: string]: any }> {
    try {
      const [gdpData, inflationData, unemploymentData, populationData, internetData] = await Promise.all([
        this.getGDPData(countries),
        this.getInflationData(countries),
        this.getUnemploymentData(countries),
        this.getPopulationData(countries),
        this.getInternetUsersData(countries)
      ]);

      const countryMap: { [country: string]: any } = {};

      const processData = (data: WorldBankIndicator[], field: string) => {
        data.forEach(item => {
          if (!countryMap[item.country]) {
            countryMap[item.country] = {
              country: item.country,
              countryCode: item.countryCode,
              lastUpdated: item.lastUpdated
            };
          }
          const latestYear = Math.max(...data.filter(d => d.country === item.country).map(d => d.year));
          if (item.year === latestYear) {
            countryMap[item.country][field] = item.value;
          }
        });
      };

      processData(gdpData, 'gdp');
      processData(inflationData, 'inflation');
      processData(unemploymentData, 'unemployment');
      processData(populationData, 'population');
      processData(internetData, 'internetUsers');

      return countryMap;
    } catch (error) {
      console.error('Error fetching all economic indicators:', error);
      return {};
    }
  }
}
