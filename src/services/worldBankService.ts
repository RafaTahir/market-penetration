import axios from 'axios';

export interface WorldBankIndicator {
  country: string;
  countryCode: string;
  indicator: string;
  value: number;
  year: number;
  /** Annual observations have a year, not a known publication/update day. */
  lastUpdated: string;
  observationPeriod?: string;
  retrievedAt?: string;
  source?: string;
  sourceStatus?: 'reported';
}

type WorldBankField = 'gdp' | 'inflation' | 'unemployment' | 'population' | 'internetUsers';
export type WorldBankEconomicData = {
  country: string;
  countryCode: string;
  source: string;
  sourceStatus: 'reported';
  lastUpdated: string;
} & Partial<Record<WorldBankField, number>>
  & Partial<Record<`${WorldBankField}Year`, number>>
  & Partial<Record<`${WorldBankField}ObservationPeriod` | `${WorldBankField}RetrievedAt`, string>>
  & Partial<Record<`${WorldBankField}SourceStatus`, 'reported'>>;

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
    indonesia: 'IDN', thailand: 'THA', singapore: 'SGP',
    malaysia: 'MYS', philippines: 'PHL', vietnam: 'VNM'
  };

  public static getInstance(): WorldBankService {
    if (!WorldBankService.instance) WorldBankService.instance = new WorldBankService();
    return WorldBankService.instance;
  }

  private async getIndicator(
    countries: string[], code: string, indicator: string, scale = 1, years = 5
  ): Promise<WorldBankIndicator[]> {
    const targetCountries = countries.length > 0
      ? countries.map(country => Object.entries(this.COUNTRIES).find(([name]) => name === country.trim().toLowerCase())?.[1]).filter((code): code is string => typeof code === 'string')
      : Object.values(this.COUNTRIES);
    if (targetCountries.length === 0) return [];

    try {
      const currentYear = new Date().getUTCFullYear();
      const response = await axios.get<unknown>(
        `${this.BASE_URL}/country/${[...new Set(targetCountries)].join(';')}/indicator/${code}`,
        { params: { format: 'json', per_page: 100, date: `${currentYear - years}:${currentYear}` }, timeout: 10000 }
      );
      const retrievedAt = new Date().toISOString();
      if (!Array.isArray(response.data) || !Array.isArray(response.data[1])) return [];
      const records: unknown[] = response.data[1];
      return records.flatMap(record => {
        if (!record || typeof record !== 'object') return [];
        const item = record as Record<string, unknown>;
        const country = item.country && typeof item.country === 'object'
          ? item.country as Record<string, unknown> : {};
        if (typeof item.value !== 'number' || !Number.isFinite(item.value) ||
          !/^\d{4}$/.test(String(item.date)) || typeof item.countryiso3code !== 'string' ||
          !targetCountries.includes(item.countryiso3code) ||
          typeof country.value !== 'string' || !country.value.trim()) return [];
        return [{
          country: country.value, countryCode: item.countryiso3code, indicator,
          value: item.value / scale, year: Number(item.date),
          lastUpdated: '', observationPeriod: String(item.date), retrievedAt,
          source: 'World Bank', sourceStatus: 'reported' as const
        }];
      });
    } catch (error) {
      console.error(`Error fetching World Bank ${indicator} data:`, error);
      return [];
    }
  }

  async getGDPData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    return this.getIndicator(countries, 'NY.GDP.MKTP.CD', 'GDP', 1e9);
  }

  async getInflationData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    return this.getIndicator(countries, 'FP.CPI.TOTL.ZG', 'Inflation');
  }

  async getUnemploymentData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    return this.getIndicator(countries, 'SL.UEM.TOTL.ZS', 'Unemployment');
  }

  async getPopulationData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    return this.getIndicator(countries, 'SP.POP.TOTL', 'Population', 1e6);
  }

  async getInternetUsersData(countries: string[] = []): Promise<WorldBankIndicator[]> {
    return this.getIndicator(countries, 'IT.NET.USER.ZS', 'Internet Users', 1, 10);
  }

  async getAllEconomicIndicators(countries: string[] = []): Promise<Record<string, WorldBankEconomicData>> {
    const series = await Promise.all([
      this.getGDPData(countries), this.getInflationData(countries),
      this.getUnemploymentData(countries), this.getPopulationData(countries),
      this.getInternetUsersData(countries)
    ]);
    const fields: WorldBankField[] = ['gdp', 'inflation', 'unemployment', 'population', 'internetUsers'];
    const countryMap: Record<string, WorldBankEconomicData> = {};
    series.forEach((data, index) => {
      const field = fields[index];
      data.forEach(item => {
        const country = countryMap[item.country] ||= {
          country: item.country, countryCode: item.countryCode,
          source: 'World Bank', sourceStatus: 'reported', lastUpdated: ''
        };
        const previousYear = country[`${field}Year`];
        if (previousYear !== undefined && previousYear >= item.year) return;
        country[field] = item.value;
        country[`${field}Year`] = item.year;
        country[`${field}ObservationPeriod`] = item.observationPeriod;
        country[`${field}RetrievedAt`] = item.retrievedAt;
        country[`${field}SourceStatus`] = item.sourceStatus;
      });
    });
    return countryMap;
  }
}
