/**
 * Curated navigation, not retrieved market observations or legal requirements.
 * Portal content, publication dates and current applicability are unverified.
 * City names identify a starting point for exploration, not a market ranking.
 */
export interface MarketGuide {
  id: string;
  name: string;
  flag: string;
  city: string;
  countryCode: string;
  setup: { name: string; url: string };
  statistics: { name: string; url: string };
  cityPortal: { name: string; url: string };
}

export const MARKETS: readonly MarketGuide[] = [
  {
    id: 'thailand', name: 'Thailand', flag: '🇹🇭', city: 'Bangkok', countryCode: 'THA',
    setup: { name: 'Thailand Board of Investment', url: 'https://www.boi.go.th/' },
    statistics: { name: 'National Statistical Office', url: 'https://www.nso.go.th/' },
    cityPortal: { name: 'Bangkok city portal', url: 'https://www.bangkok.go.th/' },
  },
  {
    id: 'singapore', name: 'Singapore', flag: '🇸🇬', city: 'Singapore', countryCode: 'SGP',
    setup: { name: 'ACRA', url: 'https://www.acra.gov.sg/' },
    statistics: { name: 'Singapore Department of Statistics', url: 'https://www.singstat.gov.sg/' },
    cityPortal: { name: 'Urban Redevelopment Authority', url: 'https://www.ura.gov.sg/' },
  },
  {
    id: 'malaysia', name: 'Malaysia', flag: '🇲🇾', city: 'Kuala Lumpur', countryCode: 'MYS',
    setup: { name: 'Malaysian Investment Development Authority', url: 'https://www.mida.gov.my/' },
    statistics: { name: 'Department of Statistics Malaysia', url: 'https://www.dosm.gov.my/' },
    cityPortal: { name: 'Kuala Lumpur city portal', url: 'https://www.dbkl.gov.my/' },
  },
  {
    id: 'indonesia', name: 'Indonesia', flag: '🇮🇩', city: 'Jakarta', countryCode: 'IDN',
    setup: { name: 'OSS business portal', url: 'https://oss.go.id/' },
    statistics: { name: 'Statistics Indonesia', url: 'https://www.bps.go.id/' },
    cityPortal: { name: 'Jakarta government portal', url: 'https://www.jakarta.go.id/' },
  },
  {
    id: 'philippines', name: 'Philippines', flag: '🇵🇭', city: 'Manila', countryCode: 'PHL',
    setup: { name: 'Department of Trade and Industry', url: 'https://www.dti.gov.ph/' },
    statistics: { name: 'Philippine Statistics Authority', url: 'https://psa.gov.ph/' },
    cityPortal: { name: 'City of Manila portal', url: 'https://manila.gov.ph/' },
  },
  {
    id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', city: 'Ho Chi Minh City', countryCode: 'VNM',
    setup: { name: 'National Business Registration Portal', url: 'https://dangkykinhdoanh.gov.vn/' },
    statistics: { name: 'Vietnam statistics portal', url: 'https://www.gso.gov.vn/' },
    cityPortal: { name: 'Ho Chi Minh City portal', url: 'https://hochiminhcity.gov.vn/' },
  },
];
