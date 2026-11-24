import { buildMarketPlanExport, type MarketPlansState } from './marketPlans';

export function downloadMarketPlan(plans: MarketPlansState, countries: readonly string[]) {
  const payload = buildMarketPlanExport(plans, countries);
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'flow-market-plan.json';
  anchor.click();
  URL.revokeObjectURL(url);
}
