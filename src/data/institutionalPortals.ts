import type { IMFReport } from '../services/imfService';

/** Curated institutional portals. Publication dates and page contents are unverified. */
export const INSTITUTIONAL_PORTALS: readonly IMFReport[] = [
  { title: 'IMF DataMapper', organization: 'IMF', country: 'Global', summary: 'Official data discovery portal. Contents, editions, observation periods and applicability have not been verified.', publicationDate: '', url: 'https://www.imf.org/external/datamapper/', type: 'Reference link (unverified)' },
  { title: 'World Bank Open Data', organization: 'World Bank', country: 'Global', summary: 'Official data discovery portal. No publication date or current business applicability is established by this directory.', publicationDate: '', url: 'https://data.worldbank.org/', type: 'Reference link (unverified)' },
  { title: 'ASEANstats Data Portal', organization: 'ASEAN Secretariat', country: 'ASEAN', summary: 'Regional data discovery portal. Linked content has not been fetched, checked or incorporated as verified research.', publicationDate: '', url: 'https://data.aseanstats.org/', type: 'Reference link (unverified)' }
];
