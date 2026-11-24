import { useEffect, useRef, useState } from 'react';
import { MARKETS } from '../data/marketCatalog';

const key = 'flow-market-shortlist-v1';
const defaults = ['singapore', 'thailand'];
const supported = new Set(MARKETS.map(market => market.id));

function readShortlist() {
  try {
    const raw = localStorage.getItem(key);
    const stored = raw ? JSON.parse(raw) : null;
    const valid = stored?.version === 1 && Array.isArray(stored.countries);
    const countries = valid
      ? [...new Set<string>(stored.countries.filter((id: unknown) => typeof id === 'string' && supported.has(id)))]
      : defaults;
    return { countries, saved: valid || raw === null, initialized: valid };
  } catch {
    return { countries: defaults, saved: false, initialized: false };
  }
}

export function useMarketShortlist() {
  const [snapshot, setSnapshot] = useState(readShortlist);
  const current = useRef(snapshot);

  function update(change: (countries: string[]) => string[]) {
    const stored = current.current.saved ? readShortlist() : current.current;
    const countries = change(stored.saved ? stored.countries : current.current.countries);
    let saved = stored.saved;
    if (saved) {
      try { localStorage.setItem(key, JSON.stringify({ version: 1, countries })); }
      catch { saved = false; }
    }
    const next = { countries, saved, initialized: true };
    current.current = next;
    setSnapshot(next);
    return next;
  }

  useEffect(() => {
    if (!current.current.initialized && current.current.saved) update(countries => countries);
    function sync(event: StorageEvent) {
      if ((event.key === key || event.key === null) && current.current.saved) {
        const next = readShortlist();
        if (!next.saved) next.countries = current.current.countries;
        current.current = next;
        setSnapshot(next);
      }
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return { countries: snapshot.countries, saved: snapshot.saved, update };
}
