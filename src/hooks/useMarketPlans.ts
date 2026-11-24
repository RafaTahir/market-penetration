import { useEffect, useRef, useState } from 'react';
import { parseMarketEconomics, sameMarketEconomics, type MarketEconomicsInputs } from '../services/marketEconomics';
import { previewMarketPlanRestore, type RestoreDraft } from '../services/marketPlanRestore';
import type { CityResearchLens } from '../data/cityResearchGuides';
import {
  createMarketPlans, MARKET_PLANS_KEY, parseMarketPlans, parseResearchFinding,
  sameResearchFinding, serializeMarketPlans, setMarketFinding, setMarketQuestionSaved, setMarketScenario,
  updateMarketNextStep, type MarketPlansState, type ResearchFinding,
} from '../services/marketPlans';

function loadPlans() {
  try {
    const raw = localStorage.getItem(MARKET_PLANS_KEY);
    if (raw === null) return { plans: createMarketPlans(), savedLocally: true };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('version' in value) || (value.version !== 1 && value.version !== 2 && value.version !== 3) ||
        (value.version >= 2 && (!('findings' in value) || !value.findings || typeof value.findings !== 'object' || Array.isArray(value.findings))) ||
        (value.version === 3 && (!('scenarios' in value) || !value.scenarios || typeof value.scenarios !== 'object' || Array.isArray(value.scenarios))) ||
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
    const base = stored.savedLocally ? stored.plans : current.current.plans;
    const plans = change(base);
    // Once this tab has unsaved edits, retain them in memory. A later write could
    // otherwise replace another tab's work with this session's older snapshot.
    let savedLocally = stored.savedLocally;
    if (savedLocally && plans !== base) {
      try { localStorage.setItem(MARKET_PLANS_KEY, JSON.stringify(serializeMarketPlans(plans))); }
      catch { savedLocally = false; }
    }
    current.current = { plans, savedLocally };
    setSnapshot(current.current);
    return current.current;
  }

  function saveFinding(marketId: string, lens: CityResearchLens, expected: ResearchFinding | undefined, next: ResearchFinding | null) {
    const value = next && parseResearchFinding(next);
    if (next && !value) return false;
    let accepted = false;
    edit(state => {
      if (!state.questions[marketId]?.includes(lens) ||
          !sameResearchFinding(state.findings[marketId]?.[lens], expected)) return state;
      const updated = setMarketFinding(state, marketId, lens, value);
      accepted = sameResearchFinding(updated.findings[marketId]?.[lens], value ?? undefined);
      return updated;
    });
    return accepted;
  }

  function saveScenario(marketId: string, expected: MarketEconomicsInputs | undefined, next: MarketEconomicsInputs | null): boolean {
    const inputs = next === null ? null : parseMarketEconomics(next);
    if (next !== null && inputs === null) return false;
    let accepted = false;
    edit(state => {
      if (!sameMarketEconomics(state.scenarios[marketId], expected)) return state;
      const updated = setMarketScenario(state, marketId, inputs);
      accepted = sameMarketEconomics(updated.scenarios[marketId], inputs ?? undefined);
      return updated;
    });
    return accepted;
  }

  return {
    ...snapshot,
    saveFinding,
    restoreDraft: (draft: RestoreDraft, countries: readonly string[]) =>
      edit(state => previewMarketPlanRestore(state, countries, draft).plans),
    setQuestionSaved: (marketId: string, lens: CityResearchLens, saved: boolean) =>
      edit(state => setMarketQuestionSaved(state, marketId, lens, saved)),
    saveScenario,
    saveNote: (marketId: string, text: string) => edit(state => updateMarketNextStep(state, marketId, text)),
  };
}

export type MarketPlanSession = ReturnType<typeof useMarketPlans>;
