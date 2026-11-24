/**
 * Curated navigation, not retrieved market observations or legal requirements.
 * Portal content, publication dates and current applicability are unverified.
 * City names identify a starting point for exploration, not a market ranking.
 */
export type MarketRegion = 'Southeast Asia' | 'Oceania' | 'Middle East' | 'Europe' | 'Africa' | 'North America';

// Menu order is kept stable for existing worksheets. USD is also available across markets.
export const MARKET_CURRENCIES = ['USD', 'AUD', 'NZD', 'SGD', 'MYR', 'THB', 'IDR', 'PHP', 'VND', 'AED', 'KHR', 'GBP', 'KES', 'CAD'] as const;
export type MarketCurrency = typeof MARKET_CURRENCIES[number];

export interface MarketGuide {
  region: MarketRegion;
  id: string;
  name: string;
  flag: string;
  city: string;
  countryCode: string;
  worksheetCurrency: MarketCurrency;
  aliases?: readonly string[];
  setup: { name: string; url: string };
  regionalSetup?: { name: string; url: string };
  statistics: { name: string; url: string };
  cityPortal: { name: string; url: string };
  cityStatistics?: { name: string; url: string };
}

export const MARKETS: readonly MarketGuide[] = [
  {
    region: 'Southeast Asia',
    id: 'thailand', name: 'Thailand', flag: '🇹🇭', city: 'Bangkok', countryCode: 'THA', worksheetCurrency: 'THB',
    setup: { name: 'Thailand Board of Investment', url: 'https://www.boi.go.th/' },
    statistics: { name: 'National Statistical Office', url: 'https://www.nso.go.th/' },
    cityPortal: { name: 'Bangkok city portal', url: 'https://www.bangkok.go.th/' },
  },
  {
    region: 'Southeast Asia',
    id: 'singapore', name: 'Singapore', flag: '🇸🇬', city: 'Singapore', countryCode: 'SGP', worksheetCurrency: 'SGD',
    setup: { name: 'ACRA', url: 'https://www.acra.gov.sg/' },
    statistics: { name: 'Singapore Department of Statistics', url: 'https://www.singstat.gov.sg/' },
    cityPortal: { name: 'Urban Redevelopment Authority', url: 'https://www.ura.gov.sg/' },
  },
  {
    region: 'Southeast Asia',
    id: 'malaysia', name: 'Malaysia', flag: '🇲🇾', city: 'Kuala Lumpur', countryCode: 'MYS', worksheetCurrency: 'MYR',
    setup: { name: 'Malaysian Investment Development Authority', url: 'https://www.mida.gov.my/' },
    statistics: { name: 'Department of Statistics Malaysia', url: 'https://www.dosm.gov.my/' },
    cityPortal: { name: 'Kuala Lumpur city portal', url: 'https://www.dbkl.gov.my/' },
  },
  {
    region: 'Southeast Asia',
    id: 'indonesia', name: 'Indonesia', flag: '🇮🇩', city: 'Jakarta', countryCode: 'IDN', worksheetCurrency: 'IDR',
    setup: { name: 'OSS business portal', url: 'https://oss.go.id/' },
    statistics: { name: 'Statistics Indonesia', url: 'https://www.bps.go.id/' },
    cityPortal: { name: 'Jakarta government portal', url: 'https://www.jakarta.go.id/' },
  },
  {
    region: 'Southeast Asia',
    id: 'philippines', name: 'Philippines', flag: '🇵🇭', city: 'Manila', countryCode: 'PHL', worksheetCurrency: 'PHP',
    setup: { name: 'Department of Trade and Industry', url: 'https://www.dti.gov.ph/' },
    statistics: { name: 'Philippine Statistics Authority', url: 'https://psa.gov.ph/' },
    cityPortal: { name: 'City of Manila portal', url: 'https://manila.gov.ph/' },
  },
  {
    region: 'Southeast Asia',
    id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', city: 'Ho Chi Minh City', countryCode: 'VNM', worksheetCurrency: 'VND',
    setup: { name: 'National Business Registration Portal', url: 'https://dangkykinhdoanh.gov.vn/' },
    statistics: { name: 'Vietnam statistics portal', url: 'https://www.gso.gov.vn/' },
    cityPortal: { name: 'Ho Chi Minh City portal', url: 'https://hochiminhcity.gov.vn/' },
  },
  {
    region: 'Southeast Asia',
    id: 'cambodia', name: 'Cambodia', flag: '🇰🇭', city: 'Phnom Penh', countryCode: 'KHM', worksheetCurrency: 'KHR',
    setup: { name: 'Cambodia Online Business Registration', url: 'https://www.registrationservices.gov.kh/' },
    statistics: { name: 'National Institute of Statistics', url: 'https://www.nis.gov.kh/' },
    cityPortal: { name: 'Phnom Penh Capital Administration', url: 'https://phnompenh.gov.kh/' },
  },
  {
    region: 'Oceania',
    id: 'australia', name: 'Australia', flag: '🇦🇺', city: 'Sydney', countryCode: 'AUS', worksheetCurrency: 'AUD',
    setup: { name: 'Australian Government business portal', url: 'https://business.gov.au/' },
    statistics: { name: 'Australian Bureau of Statistics', url: 'https://www.abs.gov.au/' },
    cityPortal: { name: 'City of Sydney', url: 'https://www.cityofsydney.nsw.gov.au/' },
  },
  {
    region: 'Oceania',
    id: 'new-zealand', name: 'New Zealand', flag: '🇳🇿', city: 'Auckland', countryCode: 'NZL', worksheetCurrency: 'NZD',
    setup: { name: 'New Zealand Government business portal', url: 'https://www.business.govt.nz/' },
    statistics: { name: 'Stats NZ', url: 'https://www.stats.govt.nz/' },
    cityPortal: { name: 'Auckland Council', url: 'https://www.aucklandcouncil.govt.nz/' },
  },
  {
    region: 'Middle East',
    id: 'united-arab-emirates', name: 'United Arab Emirates', flag: '🇦🇪', city: 'Dubai', countryCode: 'ARE', worksheetCurrency: 'AED',
    aliases: ['UAE'],
    setup: { name: 'UAE government business portal', url: 'https://u.ae/en/information-and-services/business' },
    statistics: { name: 'Federal Competitiveness and Statistics Centre', url: 'https://fcsc.gov.ae/' },
    cityPortal: { name: 'Dubai Department of Economy and Tourism', url: 'https://www.dubaidet.gov.ae/en/' },
  },
  {
    region: 'Europe',
    id: 'uk', name: 'United Kingdom', flag: '🇬🇧', city: 'London', countryCode: 'GBR', worksheetCurrency: 'GBP',
    aliases: ['UK', 'U.K.', 'Britain', 'Great Britain'],
    setup: { name: 'GOV.UK · Set up a business', url: 'https://www.gov.uk/set-up-business' },
    statistics: { name: 'Office for National Statistics', url: 'https://www.ons.gov.uk/' },
    cityPortal: { name: 'GOV.UK · Find your local council', url: 'https://www.gov.uk/find-local-council' },
    cityStatistics: { name: 'London Datastore', url: 'https://data.london.gov.uk/' },
  },
  {
    region: 'Africa',
    id: 'kenya', name: 'Kenya', flag: '🇰🇪', city: 'Nairobi', countryCode: 'KEN', worksheetCurrency: 'KES',
    setup: { name: 'Business Registration Service', url: 'https://brs.go.ke/' },
    statistics: { name: 'Kenya National Bureau of Statistics', url: 'https://www.knbs.or.ke/' },
    cityPortal: { name: 'Nairobi City County', url: 'https://nairobi.go.ke/' },
  },
  {
    region: 'North America',
    id: 'canada', name: 'Canada', flag: '🇨🇦', city: 'Toronto', countryCode: 'CAN', worksheetCurrency: 'CAD',
    setup: { name: 'Government of Canada · Register your business', url: 'https://www.canada.ca/en/services/business/start/register-with-gov.html' },
    regionalSetup: { name: 'Ontario Business Registry', url: 'https://www.ontario.ca/page/ontario-business-registry' },
    statistics: { name: 'Statistics Canada', url: 'https://www.statcan.gc.ca/en/start' },
    cityPortal: { name: 'City of Toronto · Permits and licences', url: 'https://www.toronto.ca/services-payments/permits-licences-bylaws/' },
  },
];

export function getMarketDirectories(market: MarketGuide) {
  const directories = [{ label: 'Business setup', source: market.setup }];
  if (market.regionalSetup) {
    directories.push({ label: 'Province or state registration', source: market.regionalSetup });
  }
  directories.push(
    { label: 'National statistics', source: market.statistics },
    { label: 'City & premises', source: market.cityPortal },
  );
  if (market.cityStatistics) directories.push({ label: 'City statistics', source: market.cityStatistics });
  return directories;
}

function searchWords(text: string): string[] {
  // Preserve dotted initialisms such as U.A.E. while treating other punctuation as word separators.
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/\b(?:[a-z]\.)+[a-z]\b\.?/g, abbreviation => abbreviation.replace(/\./g, ''))
    .match(/[\p{L}\p{N}]+|\p{Regional_Indicator}{2}/gu) ?? [];
}

/** Each query word must occur in the same record. An empty query leaves the list unfiltered. */
export function makeSearchMatcher(query: string) {
  const terms = searchWords(query);
  return (fields: readonly string[]) => {
    if (!terms.length) return !query.trim();
    const text = searchWords(fields.join(' ')).join(' ');
    return terms.every(term => text.includes(term));
  };
}

export function filterMarketGuides(markets: readonly MarketGuide[], query: string, region?: MarketRegion): MarketGuide[] {
  const matches = makeSearchMatcher(query);
  return markets.filter(market => (!region || market.region === region) && matches([
    market.name, market.city, market.id, market.countryCode, market.worksheetCurrency, market.region, market.flag, ...(market.aliases ?? []),
  ]));
}
