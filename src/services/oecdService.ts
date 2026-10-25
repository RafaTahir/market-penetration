import axios from 'axios';

export interface OECDIndicator {
  country: string;
  countryCode: string;
  indicator: string;
  indicatorCode: string;
  value: number;
  year: number;
  unit: string;
  source: string;
  lastUpdated: string;
  observationPeriod?: string;
  retrievedAt?: string;
  sourceStatus?: 'reported';
}

interface SDMXValue { id: string; name?: string; }
interface SDMXDimension { id: string; values?: SDMXValue[]; }
interface SDMXStructure {
  dimensions?: { series?: SDMXDimension[]; observation?: SDMXDimension[] };
  attributes?: { dataSet?: SDMXDimension[]; series?: SDMXDimension[]; observation?: SDMXDimension[] };
}
interface SDMXSeries {
  observations?: Record<string, unknown[]>;
  attributes?: unknown[];
}
interface SDMXDataSet { series?: Record<string, SDMXSeries>; attributes?: unknown[]; }
interface SDMXBody {
  structure?: SDMXStructure;
  structures?: SDMXStructure[];
  dataSets?: SDMXDataSet[];
}
interface SDMXResponse extends SDMXBody { data?: SDMXBody; }
type OECDAggregateIndicator = Pick<OECDIndicator,
  'value' | 'year' | 'unit' | 'observationPeriod' | 'retrievedAt' | 'sourceStatus'>;
type OECDField = 'gdp' | 'fdi_inflow' | 'trade_balance' | 'labour_productivity';
type OECDAggregateData = {
  country: string;
  countryCode: string;
  source: string;
  sourceStatus: 'reported';
  lastUpdated: string;
} & Partial<Record<OECDField, OECDAggregateIndicator>>;

export class OECDService {
  private static instance: OECDService;
  private readonly BASE_URL = 'https://sdmx.oecd.org/public/rest/data';
  private readonly COUNTRY_CODES = {
    indonesia: 'IDN', thailand: 'THA', singapore: 'SGP',
    malaysia: 'MYS', philippines: 'PHL', vietnam: 'VNM'
  };

  public static getInstance(): OECDService {
    if (!OECDService.instance) OECDService.instance = new OECDService();
    return OECDService.instance;
  }

  async getGDPData(countries: string[] = []): Promise<OECDIndicator[]> {
    const targetCountries = this.getTargetCountries(countries);
    const indicators: OECDIndicator[] = [];
    for (const countryCode of new Set(targetCountries)) {
      try {
        const response = await axios.get<SDMXResponse>(
          `${this.BASE_URL}/OECD.SDD.NAD,DSD_NAMAIN1@DF_TABLE1,/A.${countryCode}.B1GQ.V.....`,
          { headers: { Accept: 'application/json' }, timeout: 15000 }
        );
        const body = response.data?.data || response.data;
        const structure = body?.structure || body?.structures?.[0] || response.data?.structure;
        if (!structure || !Array.isArray(body?.dataSets)) continue;
        const retrievedAt = new Date().toISOString();
        for (const dataSet of body.dataSets) {
          for (const [seriesKey, series] of Object.entries(dataSet.series || {})) {
            for (const [timeKey, values] of Object.entries(series.observations || {})) {
              const metadata = (ids: string[]) => this.getMetadata(structure, dataSet, seriesKey, series, timeKey, values, ids);
              const time = metadata(['TIME_PERIOD']);
              const reportedCountry = metadata(['REF_AREA', 'LOCATION', 'COUNTRY']);
              const measure = metadata(['UNIT_MEASURE', 'UNIT']);
              const multiplier = metadata(['UNIT_MULT']);
              const period = time?.id;
              // A raw SDMX value cannot be called USD unless its supplied unit
              // actually says so. Missing units or periods remain unavailable.
              if (!/^\d{4}$/.test(period || '') || !measure ||
                (reportedCountry && reportedCountry.id !== countryCode) ||
                typeof values?.[0] !== 'number' || !Number.isFinite(values[0])) continue;
              const unitName = measure.name || measure.id;
              if (!unitName) continue;
              const unit = multiplier && multiplier.id !== '0'
                ? `${unitName} (10^${multiplier.id})` : unitName;
              indicators.push({
                country: this.getCountryName(countryCode), countryCode,
                indicator: 'GDP', indicatorCode: 'B1GQ', value: values[0], year: Number(period), unit,
                source: 'OECD', lastUpdated: '', observationPeriod: period,
                retrievedAt, sourceStatus: 'reported'
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching OECD GDP for ${countryCode}:`, error);
      }
    }
    return indicators;
  }

  // These endpoints have no implemented source parser. Previously returned
  // constants were never retrieved from OECD and cannot serve as provider data.
  async getFDIData(countries: string[] = []): Promise<OECDIndicator[]> { void countries; return []; }
  async getTradeBalance(countries: string[] = []): Promise<OECDIndicator[]> { void countries; return []; }
  async getProductivityData(countries: string[] = []): Promise<OECDIndicator[]> { void countries; return []; }

  async getAllIndicators(countries: string[] = []): Promise<Record<string, OECDAggregateData>> {
    const series = await Promise.all([
      this.getGDPData(countries), this.getFDIData(countries),
      this.getTradeBalance(countries), this.getProductivityData(countries)
    ]);
    const countryMap: Record<string, OECDAggregateData> = {};
    for (const item of series.flat()) {
      const country = countryMap[item.country] ||= {
        country: item.country, countryCode: item.countryCode, source: 'OECD',
        sourceStatus: 'reported', lastUpdated: ''
      };
      const fieldNames: Record<string, OECDField> = {
        'GDP': 'gdp', 'FDI Inflow': 'fdi_inflow',
        'Trade Balance': 'trade_balance', 'Labour Productivity': 'labour_productivity'
      };
      const key = fieldNames[item.indicator];
      if (!key) continue;
      if (country[key] && country[key].year >= item.year) continue;
      country[key] = {
        value: item.value, year: item.year, unit: item.unit,
        observationPeriod: item.observationPeriod, retrievedAt: item.retrievedAt,
        sourceStatus: item.sourceStatus
      };
    }
    return countryMap;
  }

  private getMetadata(
    structure: SDMXStructure, dataSet: SDMXDataSet, seriesKey: string, series: SDMXSeries,
    timeKey: string, observation: unknown[], ids: string[]
  ): SDMXValue | undefined {
    const dimensionGroups: Array<[SDMXDimension[] | undefined, string[]]> = [
      [structure.dimensions?.series, seriesKey.split(':')],
      [structure.dimensions?.observation, timeKey.split(':')]
    ];
    for (const [dimensions, keys] of dimensionGroups) {
      if (!Array.isArray(dimensions)) continue;
      const index = dimensions.findIndex(dimension => ids.includes(dimension.id));
      if (index >= 0) return dimensions[index].values?.[Number(keys[index])];
    }
    const attributeGroups: Array<[SDMXDimension[] | undefined, unknown[] | undefined]> = [
      [structure.attributes?.dataSet, dataSet.attributes],
      [structure.attributes?.series, series.attributes],
      [structure.attributes?.observation, observation?.slice(1)]
    ];
    for (const [attributes, values] of attributeGroups) {
      if (!Array.isArray(attributes) || !Array.isArray(values)) continue;
      const index = attributes.findIndex(attribute => ids.includes(attribute.id));
      const valueIndex = values[index];
      if (index >= 0 && typeof valueIndex === 'number' && Number.isInteger(valueIndex) && valueIndex >= 0) {
        return attributes[index].values?.[valueIndex];
      }
    }
    return undefined;
  }

  private getTargetCountries(countries: string[]): string[] {
    return countries.length > 0
      ? countries.map(country => Object.entries(this.COUNTRY_CODES).find(([name]) => name === country.trim().toLowerCase())?.[1]).filter((code): code is string => typeof code === 'string')
      : Object.values(this.COUNTRY_CODES);
  }

  private getCountryName(code: string): string {
    return Object.keys(this.COUNTRY_CODES).find(country =>
      this.COUNTRY_CODES[country as keyof typeof this.COUNTRY_CODES] === code
    )?.replace(/^./, letter => letter.toUpperCase()) || code;
  }
}
