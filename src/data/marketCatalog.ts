/**
 * Curated navigation, not retrieved market observations or legal requirements.
 * Portal content, publication dates and current applicability are unverified.
 * City names identify a starting point for exploration, not a market ranking.
 */
export type MarketRegion = 'Southeast Asia' | 'Oceania' | 'Middle East';

export interface MarketGuide {
  region: MarketRegion;
  id: string;
  name: string;
  flag: string;
  city: string;
  countryCode: string;
  aliases?: readonly string[];
  setup: { name: string; url: string };
  statistics: { name: string; url: string };
  cityPortal: { name: string; url: string };
}

export const MARKETS: readonly MarketGuide[] = [
  {
    region: 'Southeast Asia',
    id: 'thailand', name: 'Thailand', flag: '🇹🇭', city: 'Bangkok', countryCode: 'THA',
    setup: { name: 'Thailand Board of Investment', url: 'https://www.boi.go.th/' },
    statistics: { name: 'National Statistical Office', url: 'https://www.nso.go.th/' },
    cityPortal: { name: 'Bangkok city portal', url: 'https://www.bangkok.go.th/' },
  },
  {
    region: 'Southeast Asia',
    id: 'singapore', name: 'Singapore', flag: '🇸🇬', city: 'Singapore', countryCode: 'SGP',
    setup: { name: 'ACRA', url: 'https://www.acra.gov.sg/' },
    statistics: { name: 'Singapore Department of Statistics', url: 'https://www.singstat.gov.sg/' },
    cityPortal: { name: 'Urban Redevelopment Authority', url: 'https://www.ura.gov.sg/' },
  },
  {
    region: 'Southeast Asia',
    id: 'malaysia', name: 'Malaysia', flag: '🇲🇾', city: 'Kuala Lumpur', countryCode: 'MYS',
    setup: { name: 'Malaysian Investment Development Authority', url: 'https://www.mida.gov.my/' },
    statistics: { name: 'Department of Statistics Malaysia', url: 'https://www.dosm.gov.my/' },
    cityPortal: { name: 'Kuala Lumpur city portal', url: 'https://www.dbkl.gov.my/' },
  },
  {
    region: 'Southeast Asia',
    id: 'indonesia', name: 'Indonesia', flag: '🇮🇩', city: 'Jakarta', countryCode: 'IDN',
    setup: { name: 'OSS business portal', url: 'https://oss.go.id/' },
    statistics: { name: 'Statistics Indonesia', url: 'https://www.bps.go.id/' },
    cityPortal: { name: 'Jakarta government portal', url: 'https://www.jakarta.go.id/' },
  },
  {
    region: 'Southeast Asia',
    id: 'philippines', name: 'Philippines', flag: '🇵🇭', city: 'Manila', countryCode: 'PHL',
    setup: { name: 'Department of Trade and Industry', url: 'https://www.dti.gov.ph/' },
    statistics: { name: 'Philippine Statistics Authority', url: 'https://psa.gov.ph/' },
    cityPortal: { name: 'City of Manila portal', url: 'https://manila.gov.ph/' },
  },
  {
    region: 'Southeast Asia',
    id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', city: 'Ho Chi Minh City', countryCode: 'VNM',
    setup: { name: 'National Business Registration Portal', url: 'https://dangkykinhdoanh.gov.vn/' },
    statistics: { name: 'Vietnam statistics portal', url: 'https://www.gso.gov.vn/' },
    cityPortal: { name: 'Ho Chi Minh City portal', url: 'https://hochiminhcity.gov.vn/' },
  },
  {
    region: 'Southeast Asia',
    id: 'cambodia', name: 'Cambodia', flag: '🇰🇭', city: 'Phnom Penh', countryCode: 'KHM',
    setup: { name: 'Cambodia Online Business Registration', url: 'https://www.registrationservices.gov.kh/' },
    statistics: { name: 'National Institute of Statistics', url: 'https://www.nis.gov.kh/' },
    cityPortal: { name: 'Phnom Penh Capital Administration', url: 'https://phnompenh.gov.kh/' },
  },
  {
    region: 'Oceania',
    id: 'australia', name: 'Australia', flag: '🇦🇺', city: 'Sydney', countryCode: 'AUS',
    setup: { name: 'Australian Government business portal', url: 'https://business.gov.au/' },
    statistics: { name: 'Australian Bureau of Statistics', url: 'https://www.abs.gov.au/' },
    cityPortal: { name: 'City of Sydney', url: 'https://www.cityofsydney.nsw.gov.au/' },
  },
  {
    region: 'Oceania',
    id: 'new-zealand', name: 'New Zealand', flag: '🇳🇿', city: 'Auckland', countryCode: 'NZL',
    setup: { name: 'New Zealand Government business portal', url: 'https://www.business.govt.nz/' },
    statistics: { name: 'Stats NZ', url: 'https://www.stats.govt.nz/' },
    cityPortal: { name: 'Auckland Council', url: 'https://www.aucklandcouncil.govt.nz/' },
  },
  {
    region: 'Middle East',
    id: 'united-arab-emirates', name: 'United Arab Emirates', flag: '🇦🇪', city: 'Dubai', countryCode: 'ARE',
    aliases: ['UAE'],
    setup: { name: 'UAE government business portal', url: 'https://u.ae/en/information-and-services/business' },
    statistics: { name: 'Federal Competitiveness and Statistics Centre', url: 'https://fcsc.gov.ae/' },
    cityPortal: { name: 'Dubai Department of Economy and Tourism', url: 'https://www.dubaidet.gov.ae/en/' },
  },
];

export function filterMarketGuides(markets: readonly MarketGuide[], query: string, region?: MarketRegion): MarketGuide[] {
  const term = query.trim().toLowerCase();
  return markets.filter(market => {
    if (region && market.region !== region) return false;
    const searchable = [market.name, market.city, market.id, market.countryCode, market.region, ...(market.aliases ?? [])];
    return searchable.some(label => label.toLowerCase().includes(term));
  });
}
