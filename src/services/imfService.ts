import axios from 'axios';

export interface IMFEconomicData {
  country: string;
  indicator: string;
  value: number;
  year: number;
  unit: string;
  source: string;
  lastUpdated: string;
  observationPeriod?: string;
  retrievedAt?: string;
  sourceStatus?: 'reported';
  /** DataMapper does not establish whether a past value is an actual or estimate. */
  dataStatus?: 'forecast' | 'estimate-or-forecast' | 'unknown';
}

type IMFScalarField = 'inflation' | 'gdpPerCapita' | 'currentAccount';
export type IMFAggregateData = {
  country: string;
  source: string;
  sourceStatus: 'reported';
  lastUpdated: string;
  gdpGrowthHistory?: Array<Pick<IMFEconomicData,
    'year' | 'value' | 'observationPeriod' | 'retrievedAt' | 'sourceStatus' | 'dataStatus'>>;
} & Partial<Record<IMFScalarField, number>>
  & Partial<Record<`${IMFScalarField}Year`, number>>
  & Partial<Record<`${IMFScalarField}ObservationPeriod` | `${IMFScalarField}RetrievedAt`, string>>
  & Partial<Record<`${IMFScalarField}SourceStatus`, 'reported'>>
  & Partial<Record<`${IMFScalarField}DataStatus`, IMFEconomicData['dataStatus']>>;

interface IMFResponse {
  values?: Record<string, Record<string, Record<string, unknown>>>;
}

export interface IMFReport {
  title: string;
  organization: string;
  country: string;
  summary: string;
  publicationDate: string;
  url: string;
  type: string;
  sourceStatus?: 'reference-directory';
}

export class IMFService {
  private static instance: IMFService;
  private readonly BASE_URL = 'https://www.imf.org/external/datamapper/api/v1';
  private readonly COUNTRY_CODES = {
    indonesia: 'IDN', thailand: 'THA', singapore: 'SGP',
    malaysia: 'MYS', philippines: 'PHL', vietnam: 'VNM'
  };

  public static getInstance(): IMFService {
    if (!IMFService.instance) IMFService.instance = new IMFService();
    return IMFService.instance;
  }

  private async getIndicator(
    countries: string[], code: string, indicator: string, unit: string, history = 3
  ): Promise<IMFEconomicData[]> {
    const targetCountries = countries.length > 0
      ? countries.map(country => Object.entries(this.COUNTRY_CODES).find(([name]) => name === country.trim().toLowerCase())?.[1]).filter((code): code is string => typeof code === 'string')
      : Object.values(this.COUNTRY_CODES);
    if (targetCountries.length === 0) return [];

    try {
      const response = await axios.get<IMFResponse>(`${this.BASE_URL}/${code}`, { timeout: 10000 });
      const values = response.data?.values?.[code];
      if (!values || typeof values !== 'object') return [];
      const retrievedAt = new Date().toISOString();
      const currentYear = new Date().getUTCFullYear();
      const results: IMFEconomicData[] = [];
      for (const countryCode of new Set(targetCountries)) {
        const countryData = values[countryCode];
        if (!countryData || typeof countryData !== 'object') continue;
        const validYears = Object.keys(countryData).filter(year => {
          const value = countryData[year];
          return /^\d{4}$/.test(year) &&
            (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
            Number.isFinite(Number(value));
        }).sort((a, b) => Number(b) - Number(a));
        const historical = validYears.filter(year => Number(year) < currentYear).slice(0, history);
        const selectedYears = validYears.filter(year => Number(year) >= currentYear || historical.includes(year));
        for (const year of selectedYears) {
          const numericYear = Number(year);
          results.push({
            country: this.getCountryName(countryCode), indicator, value: Number(countryData[year]),
            year: numericYear, unit, source: 'IMF World Economic Outlook', lastUpdated: '',
            observationPeriod: year, retrievedAt, sourceStatus: 'reported',
            dataStatus: numericYear > currentYear ? 'forecast' : numericYear === currentYear ? 'estimate-or-forecast' : 'unknown'
          });
        }
      }
      return results;
    } catch (error) {
      console.error(`Error fetching IMF ${indicator} data:`, error);
      return [];
    }
  }

  async getGDPGrowth(countries: string[] = []): Promise<IMFEconomicData[]> {
    return this.getIndicator(countries, 'NGDP_RPCH', 'GDP Growth Rate', 'Percent', 6);
  }

  async getCurrentAccountBalance(countries: string[] = []): Promise<IMFEconomicData[]> {
    return this.getIndicator(countries, 'BCA_NGDPD', 'Current Account Balance', 'Percent of GDP');
  }

  async getInflationRate(countries: string[] = []): Promise<IMFEconomicData[]> {
    return this.getIndicator(countries, 'PCPIPCH', 'Inflation Rate', 'Percent');
  }

  async getGDPPerCapita(countries: string[] = []): Promise<IMFEconomicData[]> {
    return this.getIndicator(countries, 'NGDPDPC', 'GDP per Capita', 'USD');
  }

  async getAllEconomicData(countries: string[] = []): Promise<Record<string, IMFAggregateData>> {
    const series = await Promise.all([
      this.getGDPGrowth(countries), this.getInflationRate(countries),
      this.getGDPPerCapita(countries), this.getCurrentAccountBalance(countries)
    ]);
    const fields = ['gdpGrowthHistory', 'inflation', 'gdpPerCapita', 'currentAccount'] as const;
    const countryMap: Record<string, IMFAggregateData> = {};
    const currentYear = new Date().getUTCFullYear();
    series.forEach((data, index) => {
      const field = fields[index];
      data.forEach(item => {
        const country = countryMap[item.country] ||= {
          country: item.country, source: item.source, sourceStatus: 'reported', lastUpdated: ''
        };
        if (field === 'gdpGrowthHistory') {
          (country[field] ||= []).push({
            year: item.year, value: item.value, observationPeriod: item.observationPeriod,
            retrievedAt: item.retrievedAt, sourceStatus: item.sourceStatus, dataStatus: item.dataStatus
          });
          return;
        }
        // Future projections and the current year's estimate must not silently
        // replace an available past observation in a historical scalar field.
        const previousYear = country[`${field}Year`];
        if (item.year >= currentYear || (previousYear !== undefined && previousYear >= item.year)) return;
        country[field] = item.value;
        country[`${field}Year`] = item.year;
        country[`${field}ObservationPeriod`] = item.observationPeriod;
        country[`${field}RetrievedAt`] = item.retrievedAt;
        country[`${field}SourceStatus`] = item.sourceStatus;
        country[`${field}DataStatus`] = item.dataStatus;
      });
    });
    return countryMap;
  }

  getIMFReports(): IMFReport[] {
    // These are discovery links, not fetched reports or verified findings.
    return [
      {
        title: 'IMF Asia and Pacific economic outlook publications',
        organization: 'International Monetary Fund', country: 'Asia and Pacific',
        summary: 'Official publication directory. Open the source to verify a report, its publication date and its findings.',
        publicationDate: '', url: 'https://www.imf.org/en/Publications/REO/APAC',
        type: 'Official reference directory', sourceStatus: 'reference-directory'
      },
      {
        title: 'IMF World Economic Outlook publications and data',
        organization: 'International Monetary Fund', country: 'Global',
        summary: 'Official publication and data directory. Open the source to verify the release and distinguish estimates from observations.',
        publicationDate: '', url: 'https://www.imf.org/en/Publications/WEO',
        type: 'Official reference directory', sourceStatus: 'reference-directory'
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
