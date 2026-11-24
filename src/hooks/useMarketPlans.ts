import { useEffect, useRef, useState } from 'react';
import type { CityResearchLens } from '../data/cityResearchGuides';
import {
  createMarketPlans, MARKET_PLANS_KEY, parseMarketPlans,
  setMarketQuestionSaved, updateMarketNextStep, type MarketPlansState,
} from '../services/marketPlans';

function loadPlans() {
  try {
    const raw = localStorage.getItem(MARKET_PLANS_KEY);
    return { plans: raw ? parseMarketPlans(JSON.parse(raw)) : createMarketPlans(), savedLocally: true };
  } catch {
    return { plans: createMarketPlans(), savedLocally: false };
  }
}

export function useMarketPlans() {
  const [snapshot, setSnapshot] = useState(loadPlans);
  const current = useRef(snapshot);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== MARKET_PLANS_KEY && event.key !== null) return;
      if (!current.current.savedLocally) return;
      const next = loadPlans();
      current.current = next;
      setSnapshot(next);
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function edit(change: (state: MarketPlansState) => MarketPlansState) {
    // Prefer the latest persisted notes, but keep session edits if storage failed.
    const stored = current.current.savedLocally ? loadPlans() : current.current;
    const plans = change(stored.savedLocally ? stored.plans : current.current.plans);
    let savedLocally = true;
    try { localStorage.setItem(MARKET_PLANS_KEY, JSON.stringify(plans)); }
    catch { savedLocally = false; }
    current.current = { plans, savedLocally };
    setSnapshot(current.current);
  }

  return {
    ...snapshot,
    setQuestionSaved: (marketId: string, lens: CityResearchLens, saved: boolean) =>
      edit(state => setMarketQuestionSaved(state, marketId, lens, saved)),
    saveNote: (marketId: string, text: string) => edit(state => updateMarketNextStep(state, marketId, text)),
  };
}

export type MarketPlanSession = ReturnType<typeof useMarketPlans>;
