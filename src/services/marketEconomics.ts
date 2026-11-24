/** Single-product planning scenario. Amounts are entered by the user in one currency. */
import { MARKETS, MARKET_CURRENCIES, type MarketCurrency } from '../data/marketCatalog.ts';
export { MARKET_CURRENCIES, type MarketCurrency } from '../data/marketCatalog.ts';

export interface MarketEconomicsInputs {
  currency: MarketCurrency;
  monthlyFixedCosts: string;
  unitPrice: string;
  unitVariableCost: string;
  expectedMonthlyUnits?: string;
}

export const MAX_ECONOMICS_INPUT_LENGTH = 32;
export const ECONOMICS_METHOD = 'Contribution per unit is unit price less variable cost per unit. For positive contribution, monthly break-even volume is monthly fixed costs divided by contribution per unit, rounded up to the next whole unit if needed. With zero or negative contribution, positive fixed costs cannot be recovered through sales. With zero fixed costs, zero sales covers the modeled costs.';
export const ECONOMICS_LIMITATION = 'User-entered scenario in one currency. Assumes constant price and variable cost per unit and fixed costs for one month. The calculation only includes costs entered by the user. Demand, currency conversion, cash timing and taxes are not modeled.';

export const SALES_METHOD = 'For one month, revenue equals expected units sold times price per unit. Total modeled costs equal monthly fixed costs plus expected units times variable cost per unit. Net result equals revenue less total modeled costs. Calculated amounts are decimal strings in the selected currency, with two fractional digits.';
export const SALES_LIMITATION = 'Sales volume, unit price and costs are user-entered assumptions. This scenario excludes taxes, cash-flow timing and costs omitted from the worksheet. Market demand has not been measured or forecast.';

export function emptyMarketEconomics(marketId: string): MarketEconomicsInputs {
  return { currency: MARKETS.find(market => market.id === marketId)?.worksheetCurrency ?? 'USD', monthlyFixedCosts: '', unitPrice: '', unitVariableCost: '' };
}

function volumeDraft(value?: string): string | undefined {
  return value?.trim() ? value : undefined;
}

export function sameMarketEconomics(left: MarketEconomicsInputs | undefined, right: MarketEconomicsInputs | undefined): boolean {
  if (!left || !right) return left === right;
  return left.currency === right.currency && left.monthlyFixedCosts === right.monthlyFixedCosts &&
    left.unitPrice === right.unitPrice && left.unitVariableCost === right.unitVariableCost &&
    volumeDraft(left.expectedMonthlyUnits) === volumeDraft(right.expectedMonthlyUnits);
}

/** Preserve incomplete drafts without accepting arbitrary properties or coercing corrupt inputs to zero. */
export function parseMarketEconomics(input: unknown): MarketEconomicsInputs | null {
  if (!input || typeof input !== 'object') return null;
  const { currency, monthlyFixedCosts, unitPrice, unitVariableCost, expectedMonthlyUnits } = input as Record<string, unknown>;
  const boundedText = (text: unknown): text is string => typeof text === 'string' && text.length <= MAX_ECONOMICS_INPUT_LENGTH;
  if (!MARKET_CURRENCIES.some(code => code === currency) || !boundedText(monthlyFixedCosts) || !boundedText(unitPrice) || !boundedText(unitVariableCost)) return null;
  if (expectedMonthlyUnits !== undefined && !boundedText(expectedMonthlyUnits)) return null;
  const inputs: MarketEconomicsInputs = { currency: currency as MarketCurrency, monthlyFixedCosts, unitPrice, unitVariableCost };
  const volume = volumeDraft(expectedMonthlyUnits);
  if (volume !== undefined) inputs.expectedMonthlyUnits = volume;
  return inputs;
}

// Calculate in integer hundredths so exact divisions such as 0.09 / (0.10 - 0.07) stay exact.
// The 12-digit limit keeps the break-even volume within the safe integer range.
function hundredths(raw: string): bigint | 'missing' | 'invalid' {
  if (typeof raw !== 'string') return 'invalid';
  const text = raw.trim();
  if (!text) return 'missing';
  if (!/^(?:\d{1,12}(?:\.\d{0,2})?|\.\d{1,2})$/.test(text)) return 'invalid';
  const [whole, fraction = ''] = text.split('.');
  return BigInt(whole || '0') * 100n + BigInt(fraction.padEnd(2, '0'));
}

interface MarketEconomicsResult {
  status: 'incomplete' | 'invalid' | 'no-positive-margin' | 'calculated';
  contributionPerUnit: number | null;
  breakEvenUnits: number | null;
}

export function calculateMarketEconomics(inputs: MarketEconomicsInputs): MarketEconomicsResult {
  const fixed = hundredths(inputs.monthlyFixedCosts);
  const price = hundredths(inputs.unitPrice);
  const variable = hundredths(inputs.unitVariableCost);
  const margin = typeof price === 'bigint' && typeof variable === 'bigint' ? price - variable : null;
  const contributionPerUnit = margin === null ? null : Number(margin) / 100;
  if ([fixed, price, variable].includes('invalid')) return { status: 'invalid', contributionPerUnit, breakEvenUnits: null };
  if (typeof fixed !== 'bigint' || margin === null) return { status: 'incomplete', contributionPerUnit, breakEvenUnits: null };
  if (margin <= 0n) return { status: 'no-positive-margin', contributionPerUnit, breakEvenUnits: fixed === 0n ? 0 : null };
  const units = (fixed + margin - 1n) / margin;
  return { status: 'calculated', contributionPerUnit, breakEvenUnits: Number(units) };
}

export type MonthlySalesResult =
  | { status: 'incomplete' | 'invalid-costs' | 'invalid-volume'; revenue: null; totalCosts: null; netResult: null }
  | { status: 'calculated'; revenue: string; totalCosts: string; netResult: string };

function formatHundredths(value: bigint): string {
  const magnitude = value < 0n ? -value : value;
  const fraction = (magnitude % 100n).toString().padStart(2, '0');
  return `${value < 0n ? '-' : ''}${magnitude / 100n}.${fraction}`;
}

/** Group an already calculated fixed-point amount without rounding it through Number. */
export function formatSalesAmount(amount: string): string {
  const [whole, cents] = amount.split('.');
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${cents}`;
}

export function calculateMonthlySales(inputs: MarketEconomicsInputs): MonthlySalesResult {
  const emptyAmounts = { revenue: null, totalCosts: null, netResult: null };
  const rawVolume = inputs.expectedMonthlyUnits;
  if (rawVolume !== undefined && typeof rawVolume !== 'string') return { status: 'invalid-volume', ...emptyAmounts };
  const volume = rawVolume?.trim();
  if (volume && !/^\d{1,12}$/.test(volume)) return { status: 'invalid-volume', ...emptyAmounts };

  const price = hundredths(inputs.unitPrice);
  const fixed = hundredths(inputs.monthlyFixedCosts);
  const variable = hundredths(inputs.unitVariableCost);
  if (price === 'invalid' || fixed === 'invalid' || variable === 'invalid') return { status: 'invalid-costs', ...emptyAmounts };
  if (!volume || price === 'missing' || fixed === 'missing' || variable === 'missing') return { status: 'incomplete', ...emptyAmounts };

  const units = BigInt(volume);
  const revenue = price * units;
  const totalCosts = fixed + variable * units;
  return {
    status: 'calculated',
    revenue: formatHundredths(revenue),
    totalCosts: formatHundredths(totalCosts),
    netResult: formatHundredths(revenue - totalCosts),
  };
}
