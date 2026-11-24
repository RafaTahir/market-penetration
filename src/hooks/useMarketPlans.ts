import { useEffect, useRef, useState } from 'react';
import { parseMarketEconomics, sameMarketEconomics, type MarketEconomicsInputs } from '../services/marketEconomics';
import { previewMarketPlanRestore, type RestoreDraft } from '../services/marketPlanRestore';
import {
  createMarketPlans, MARKET_PLANS_KEY, parseMarketPlans, parseResearchFinding,
  sameResearchFinding, serializeMarketPlans, setMarketFinding, setMarketQuestionSaved, setMarketScenario,
  updateMarketNextStep, type MarketPlansState, type MarketQuestionId, type ResearchFinding,
} from '../services/marketPlans';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadPlans() {
  try {
    const raw = localStorage.getItem(MARKET_PLANS_KEY);
    if (raw === null) return { plans: createMarketPlans(), savedLocally: true };
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || (value.version !== 1 && value.version !== 2 && value.version !== 3 && value.version !== 4) ||
        !isRecord(value.notes) || (value.version >= 2 && !isRecord(value.findings)) ||
        (value.version >= 3 && !isRecord(value.scenarios)) || (value.version === 4 && !isRecord(value.questions))) {
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

  function saveFinding(marketId: string, questionId: MarketQuestionId, expected: ResearchFinding | undefined, next: ResearchFinding | null) {
    const value = next && parseResearchFinding(next);
    if (next && !value) return false;
    let accepted = false;
    edit(state => {
      if (!state.questions[marketId]?.includes(questionId) ||
          !sameResearchFinding(state.findings[marketId]?.[questionId], expected)) return state;
      const updated = setMarketFinding(state, marketId, questionId, value);
      accepted = sameResearchFinding(updated.findings[marketId]?.[questionId], value ?? undefined);
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
    setQuestionSaved: (marketId: string, questionId: MarketQuestionId, saved: boolean) =>
      edit(state => setMarketQuestionSaved(state, marketId, questionId, saved)),
    saveScenario,
    saveNote: (marketId: string, text: string) => edit(state => updateMarketNextStep(state, marketId, text)),
  };
}

export type MarketPlanSession = ReturnType<typeof useMarketPlans>;
