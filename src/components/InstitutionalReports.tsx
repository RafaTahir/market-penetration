import { useState } from 'react';
import { ArrowUpRight, Globe2, Search } from 'lucide-react';
import { MARKETS } from '../data/marketCatalog';
import { INSTITUTIONAL_PORTALS } from '../data/institutionalPortals';

interface DirectoryLink {
  name: string;
  url: string;
  purpose: string;
  institution: string;
}

interface DirectoryGroup {
  name: string;
  area: string;
  detail: string;
  searchNames?: readonly string[];
  flag?: string;
  links: DirectoryLink[];
}

const marketGroups: DirectoryGroup[] = MARKETS.map(market => ({
  name: market.name,
  area: market.region,
  detail: market.city,
  searchNames: [market.countryCode, ...(market.aliases ?? [])],
  flag: market.flag,
  links: [
    { portal: market.setup, purpose: 'Business setup' },
    { portal: market.statistics, purpose: 'National statistics' },
    { portal: market.cityPortal, purpose: 'City & premises' },
  ].map(({ portal, purpose }) => ({ ...portal, purpose, institution: portal.name })),
}));

const institutionalGroups: DirectoryGroup[] = [...new Set(INSTITUTIONAL_PORTALS.map(portal => portal.country))].map(country => ({
  name: country,
  area: country === 'ASEAN' ? 'Southeast Asia' : country,
  detail: 'Cross-country data',
  links: INSTITUTIONAL_PORTALS.filter(portal => portal.country === country).map(portal => ({
    name: portal.title, url: portal.url, institution: portal.organization, purpose: 'Cross-country data',
  })),
}));

const groups = [...marketGroups, ...institutionalGroups];
const areas = [...new Set(groups.map(group => group.area))];
const purposes = [...new Set(groups.flatMap(group => group.links.map(link => link.purpose)))];
const fieldStyle = 'mt-2 min-h-11 w-full rounded-lg border border-[var(--ex-border)] bg-[var(--ex-panel)] px-3 py-2 text-[var(--ex-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ex-blue)]';

export default function InstitutionalReports() {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const [purpose, setPurpose] = useState('');
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = groups.filter(group => !area || group.area === area).map(group => ({
    ...group,
    links: group.links.filter(link => {
      if (purpose && link.purpose !== purpose) return false;
      const text = [group.name, group.area, group.detail, ...(group.searchNames ?? []), link.name, link.institution, link.purpose, new URL(link.url).hostname].join(' ').toLowerCase();
      return terms.every(term => text.includes(term));
    }),
  })).filter(group => group.links.length > 0);
  const count = filtered.reduce((sum, group) => sum + group.links.length, 0);

  return <main className="flow-explore-shell px-4 py-8 md:p-10">
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Institutional Reference Directory</h1>
        <p className="mt-2 text-[var(--ex-muted)]">Find official starting points for business setup, national statistics and local premises research.</p>
        <p className="mt-1 text-sm text-[var(--ex-muted)]">Publication dates are unknown. Check each portal for current guidance and local applicability.</p>
      </header>
      <div className="mt-7 grid gap-3 text-sm font-medium sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr]">
        <label className="sm:col-span-2 md:col-span-1">Search sources
          <span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ex-muted)]" aria-hidden="true" />
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Country, city, institution or topic" className={fieldStyle + ' pl-10'} />
          </span>
        </label>
        <label>Geographic coverage<select className={fieldStyle} value={area} onChange={event => setArea(event.target.value)}>
          <option value="">All areas</option>{areas.map(value => <option key={value}>{value}</option>)}
        </select></label>
        <label>Research purpose<select className={fieldStyle} value={purpose} onChange={event => setPurpose(event.target.value)}>
          <option value="">All purposes</option>{purposes.map(value => <option key={value}>{value}</option>)}
        </select></label>
      </div>
      <div className="my-4 flex min-h-11 items-center justify-between gap-3 text-sm">
        <p role="status" className="text-[var(--ex-muted)]">{count} {count === 1 ? 'source' : 'sources'}</p>
        {(query || area || purpose) && <button type="button" className="min-h-11 px-2 text-[var(--ex-blue)]" onClick={() => { setQuery(''); setArea(''); setPurpose(''); }}>Clear filters</button>}
      </div>
      {count === 0 ? <p>No sources match your filters. Try a broader location or purpose.</p> : <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(group => <section key={group.name} aria-label={group.name} className="min-w-0 overflow-hidden rounded-xl border border-[var(--ex-border)] bg-[var(--ex-panel)]">
          <header className="flex items-center gap-3 border-b border-[var(--ex-border)] bg-[var(--ex-panel-soft)] px-4 py-3">
            {group.flag ? <span className="text-2xl" aria-hidden="true">{group.flag}</span> : <Globe2 className="text-[var(--ex-teal)]" aria-hidden="true" />}
            <div><h2 className="font-semibold">{group.name}</h2><p className="text-xs text-[var(--ex-muted)]">{group.detail}</p></div>
          </header>
          <ul className="divide-y divide-[var(--ex-border)] px-4">
            {group.links.map(link => <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-3 py-3 text-sm text-[var(--ex-blue)] hover:underline">
                <span><small className="block text-xs text-[var(--ex-muted)]">{link.purpose}</small>{link.name}</span>
                <ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
              </a>
            </li>)}
          </ul>
        </section>)}
      </div>}
    </div>
  </main>;
}
