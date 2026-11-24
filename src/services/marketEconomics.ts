/** Single-product planning scenario. Amounts are entered by the user in one currency. */
export const MARKET_CURRENCIES = ['USD', 'AUD', 'NZD', 'SGD', 'MYR', 'THB', 'IDR', 'PHP', 'VND', 'AED', 'KHR', 'GBP'] as const;
export type MarketCurrency = typeof MARKET_CURRENCIES[number];

const localCurrency: ReadonlyMap<string, MarketCurrency> = new Map([
  ['australia', 'AUD'], ['new-zealand', 'NZD'], ['singapore', 'SGD'], ['malaysia', 'MYR'],
  ['thailand', 'THB'], ['indonesia', 'IDR'], ['philippines', 'PHP'], ['vietnam', 'VND'],
  ['united-arab-emirates', 'AED'], ['cambodia', 'KHR'], ['uk', 'GBP'],
]);

export interface MarketEconomicsInputs {
  currency: MarketCurrency;
  monthlyFixedCosts: string;
  unitPrice: string;
  unitVariableCost: string;
}

export const MAX_ECONOMICS_INPUT_LENGTH = 32;
export const ECONOMICS_METHOD = 'Contribution per unit is unit price less variable cost per unit. For positive contribution, monthly break-even volume is monthly fixed costs divided by contribution per unit, rounded up to the next whole unit if needed. With zero or negative contribution, positive fixed costs cannot be recovered through sales. With zero fixed costs, zero sales covers the modeled costs.';
export const ECONOMICS_LIMITATION = 'User-entered scenario in one currency. Assumes constant price and variable cost per unit and fixed costs for one month. The calculation only includes costs entered by the user. Demand, currency conversion, cash timing and taxes are not modeled.';

export function emptyMarketEconomics(marketId: string): MarketEconomicsInputs {
  return { currency: localCurrency.get(marketId) ?? 'USD', monthlyFixedCosts: '', unitPrice: '', unitVariableCost: '' };
}

/** Preserve incomplete drafts without accepting arbitrary properties or coercing corrupt inputs to zero. */
export function parseMarketEconomics(input: unknown): MarketEconomicsInputs | null {
  if (!input || typeof input !== 'object') return null;
  const { currency, monthlyFixedCosts, unitPrice, unitVariableCost } = input as Record<string, unknown>;
  const boundedText = (text: unknown): text is string => typeof text === 'string' && text.length <= MAX_ECONOMICS_INPUT_LENGTH;
  if (!MARKET_CURRENCIES.some(code => code === currency) || !boundedText(monthlyFixedCosts) || !boundedText(unitPrice) || !boundedText(unitVariableCost)) return null;
  return { currency: currency as MarketCurrency, monthlyFixedCosts, unitPrice, unitVariableCost };
}

// Calculate in integer hundredths so exact divisions such as 0.09 / (0.10 - 0.07) stay exact.
// The 12-digit whole-part bound also keeps every output safely representable as a JS number.
function hundredths(raw: string): bigint | 'missing' | 'invalid' {
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
