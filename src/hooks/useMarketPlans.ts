import { useEffect, useRef, useState } from 'react';
import type { MarketEconomicsInputs } from '../services/marketEconomics';
import { previewMarketPlanRestore, type RestoreDraft } from '../services/marketPlanRestore';
import type { CityResearchLens } from '../data/cityResearchGuides';
import {
  createMarketPlans, MARKET_PLANS_KEY, parseMarketPlans,
  setMarketQuestionSaved, setMarketScenario, updateMarketNextStep, type MarketPlansState,
} from '../services/marketPlans';

function loadPlans() {
  try {
    const raw = localStorage.getItem(MARKET_PLANS_KEY);
    if (raw === null) return { plans: createMarketPlans(), savedLocally: true };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 ||
        !('notes' in value) || !value.notes || typeof value.notes !== 'object' || Array.isArray(value.notes)) {
      return { plans: createMarketPlans(), savedLocally: false };
    }
    return { plans: parseMarketPlans(value), savedLocally: true };
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
      if (!next.savedLocally) next.plans = current.current.plans;
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
    // Once this tab has unsaved edits, retain them in memory. A later write could
    // otherwise replace another tab's work with this session's older snapshot.
    let savedLocally = stored.savedLocally;
    if (savedLocally) {
      try { localStorage.setItem(MARKET_PLANS_KEY, JSON.stringify(plans)); }
      catch { savedLocally = false; }
    }
    current.current = { plans, savedLocally };
    setSnapshot(current.current);
    return current.current;
  }

  return {
    ...snapshot,
    restoreDraft: (draft: RestoreDraft, countries: readonly string[]) =>
      edit(state => previewMarketPlanRestore(state, countries, draft).plans),
    setQuestionSaved: (marketId: string, lens: CityResearchLens, saved: boolean) =>
      edit(state => setMarketQuestionSaved(state, marketId, lens, saved)),
    saveScenario: (marketId: string, inputs: MarketEconomicsInputs | null) => edit(state => setMarketScenario(state, marketId, inputs)),
    saveNote: (marketId: string, text: string) => edit(state => updateMarketNextStep(state, marketId, text)),
  };
}

export type MarketPlanSession = ReturnType<typeof useMarketPlans>;
