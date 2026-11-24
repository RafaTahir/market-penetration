import { useEffect, useRef, useState } from 'react';
import { BarChart3, Calculator, ChevronDown } from 'lucide-react';
import type { MarketGuide } from '../data/marketCatalog';
import {
  calculateMarketEconomics, calculateMonthlySales, emptyMarketEconomics, formatSalesAmount, MARKET_CURRENCIES,
  MAX_ECONOMICS_INPUT_LENGTH, type MarketCurrency, type MarketEconomicsInputs, type MonthlySalesResult,
} from '../services/marketEconomics';
import './MarketEconomicsWorksheet.css';

interface WorksheetProps {
  market: MarketGuide;
  scenario: MarketEconomicsInputs | undefined;
  onChange: (expected: MarketEconomicsInputs | undefined, next: MarketEconomicsInputs | null) => boolean;
}

const fields = [
  { key: 'monthlyFixedCosts', label: 'Monthly fixed costs' },
  { key: 'unitPrice', label: 'Price per unit' },
  { key: 'unitVariableCost', label: 'Variable cost per unit' },
] as const;

const unitsFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
const moneyFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });
const percentFormat = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 });

function MonthlyTotals({ result, currency }: {
  result: Extract<MonthlySalesResult, { status: 'calculated' }>;
  currency: MarketCurrency;
}) {
  const amounts = [
    { label: 'Revenue', amount: result.revenue, className: 'me-revenue' },
    { label: 'Modeled costs', amount: result.totalCosts, className: 'me-costs' },
  ].map(row => ({ ...row, cents: BigInt(row.amount.replace('.', '')) }));
  const maximum = amounts[0].cents > amounts[1].cents ? amounts[0].cents : amounts[1].cents;
  const balance = result.netResult.startsWith('-') ? 'Shortfall' : result.netResult === '0.00' ? 'Break-even' : 'Surplus';

  return <dl className="me-monthly-totals">
    {amounts.map(({ label, amount, cents, className }) => {
      const width = maximum === 0n ? 0 : Number(cents * 10000n / maximum) / 100;
      return <div className={`me-monthly-row ${className}`} key={label}>
        <dt>{label}</dt>
        <dd>{formatSalesAmount(amount)} {currency}
          <span className="me-track" aria-hidden="true"><span style={{ width: `${width}%` }} /></span>
        </dd>
      </div>;
    })}
    <div className="me-monthly-balance" data-balance={balance.toLowerCase()}>
      <dt>{balance}</dt><dd>{formatSalesAmount(result.netResult)} {currency}</dd>
    </div>
  </dl>;
}

export default function MarketEconomicsWorksheet({ market, scenario, onChange }: WorksheetProps) {
  const inputs = scenario ?? emptyMarketEconomics(market.id);
  const { status, contributionPerUnit, breakEvenUnits } = calculateMarketEconomics(inputs);
  const monthly = calculateMonthlySales(inputs);
  const [pendingReset, setPendingReset] = useState<{
    action: MarketCurrency | 'clear';
    expected: MarketEconomicsInputs | undefined;
  } | null>(null);
  const [conflict, setConflict] = useState(false);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const currencySelect = useRef<HTMLSelectElement>(null);
  const clearButton = useRef<HTMLButtonElement>(null);
  const hasAmounts = fields.some(({ key }) => inputs[key] !== '');
  const prefix = `economics-${market.id}`;

  useEffect(() => {
    if (pendingReset) cancelButton.current?.focus();
  }, [pendingReset]);

  function save(expected: MarketEconomicsInputs | undefined, next: MarketEconomicsInputs | null) {
    setConflict(!onChange(expected, next));
  }

  function changeCurrency(currency: MarketCurrency) {
    if (hasAmounts) setPendingReset({ action: currency, expected: scenario });
    else save(scenario, { ...inputs, currency });
  }

  function finishReset(confirmed: boolean) {
    if (!pendingReset) return;
    const { action, expected } = pendingReset;
    if (confirmed) {
      if (action === 'clear') save(expected, null);
      else {
        const next = { ...emptyMarketEconomics(market.id), currency: action };
        if (expected?.expectedMonthlyUnits) next.expectedMonthlyUnits = expected.expectedMonthlyUnits;
        save(expected, next);
      }
    }
    if (!confirmed && action === 'clear') clearButton.current?.focus();
    else currencySelect.current?.focus();
    setPendingReset(null);
  }

  function changeVolume(value: string) {
    const next = { ...inputs };
    if (value.trim()) next.expectedMonthlyUnits = value;
    else delete next.expectedMonthlyUnits;
    setPendingReset(null);
    save(scenario, next);
  }

  let monthlyMessage = 'Enter your expected unit sales to compare revenue with monthly costs.';
  if (monthly.status === 'invalid-volume') monthlyMessage = 'Use a whole number from 0 to 999,999,999,999, without commas.';
  else if (monthly.status === 'invalid-costs') monthlyMessage = 'Correct the amounts above to see the monthly result.';
  else if (inputs.expectedMonthlyUnits) monthlyMessage = 'Enter all three amounts above to see the monthly result.';

  let message = '';
  if (status === 'invalid') message = 'Use nonnegative amounts with up to 12 whole digits and two decimal places. Omit currency symbols and commas.';
  else if (status === 'incomplete') message = 'Enter all three amounts to estimate monthly break-even sales.';
  else if (status === 'no-positive-margin') {
    message = breakEvenUnits === 0
      ? 'With zero fixed costs, zero sales break even. Each sale contributes zero or less.'
      : 'The price must exceed the variable cost for sales to cover monthly fixed costs.';
  }

  const share = contributionPerUnit !== null && contributionPerUnit > 0
    ? contributionPerUnit / Number(inputs.unitPrice) : null;
  const unitCount = breakEvenUnits === null ? '—' : unitsFormat.format(breakEvenUnits);

  return <details className="market-economics" id={`break-even-${market.id}`}>
    <summary onClick={() => setPendingReset(null)}>
      <Calculator size={17} aria-hidden="true" />
      <span>Break-even worksheet</span>
      <ChevronDown size={16} aria-hidden="true" />
    </summary>
    <div className="me-body">
      <p className="me-help">Estimate how many sales would cover one month of costs. Use your own figures for one product or service.</p>
      <div className="me-currency">
        <label htmlFor={`${prefix}-currency`}>Currency</label>
        <select ref={currencySelect} id={`${prefix}-currency`} value={inputs.currency}
          onChange={event => changeCurrency(event.target.value as MarketCurrency)}>
          {MARKET_CURRENCIES.map(currency => <option key={currency} value={currency}>{currency}</option>)}
        </select>
      </div>
      {pendingReset && <div className="me-confirm" role="group" aria-label="Confirm worksheet change">
        <p>{pendingReset.action === 'clear'
          ? `Clear the break-even worksheet for ${market.name}, including any expected sales volume?`
          : `Changing from ${pendingReset.expected?.currency ?? inputs.currency} to ${pendingReset.action} clears the three amounts in the worksheet. Your sales volume stays the same.`}</p>
        <button type="button" ref={cancelButton} onClick={() => finishReset(false)}>Cancel</button>
        <button type="button" onClick={() => finishReset(true)}>{pendingReset.action === 'clear'
          ? (pendingReset.expected?.expectedMonthlyUnits ? 'Clear worksheet and volume' : 'Clear amounts')
          : `Switch to ${pendingReset.action} and clear amounts`}</button>
      </div>}
      <div className="me-inputs">
        {fields.map(({ key, label }) => <div key={key} className="me-field">
          <label htmlFor={`${prefix}-${key}`}>{label}</label>
          <input id={`${prefix}-${key}`} type="text" inputMode="decimal" autoComplete="off"
            aria-describedby={`${prefix}-currency-unit${status === 'invalid' ? ' ' + prefix + '-message' : ''}`}
            maxLength={MAX_ECONOMICS_INPUT_LENGTH} value={inputs[key]}
            onChange={event => {
              setPendingReset(null);
              save(scenario, { ...inputs, [key]: event.target.value });
            }} />
        </div>)}
      </div>
      <span id={`${prefix}-currency-unit`} className="sr-only">Amounts in {inputs.currency}</span>
      <div className="me-result" aria-live="polite" aria-atomic="true">
        <dl>
          <div><dt>Contribution per unit</dt><dd>{contributionPerUnit === null ? '—' : `${moneyFormat.format(contributionPerUnit)} ${inputs.currency}`}</dd></div>
          <div><dt>Break-even sales</dt><dd><strong>{unitCount}</strong> {breakEvenUnits !== null && <small>{breakEvenUnits === 1 ? 'unit' : 'units'}/month</small>}</dd></div>
        </dl>
        {share !== null && <div className="me-share">
          <div aria-hidden="true"><span style={{ width: `${share * 100}%` }} /></div>
          <p>{percentFormat.format(share)} of the price contributes to fixed costs</p>
        </div>}
        {message && <p className="me-message" id={`${prefix}-message`}>{message}</p>}
      </div>
      <section className="me-monthly" aria-label="Monthly sales scenario">
        <h3><BarChart3 size={17} aria-hidden="true" />Monthly sales scenario</h3>
        <label htmlFor={`${prefix}-volume`}>Expected monthly sales</label>
        <div className="me-volume-field">
          <input id={`${prefix}-volume`} name="expectedMonthlyUnits" type="text" inputMode="numeric" autoComplete="off"
            value={inputs.expectedMonthlyUnits ?? ''} maxLength={MAX_ECONOMICS_INPUT_LENGTH}
            aria-invalid={monthly.status === 'invalid-volume' || undefined}
            aria-describedby={`${prefix}-volume-unit${monthly.status === 'invalid-volume' ? ' ' + prefix + '-volume-message' : ''}`}
            onChange={event => changeVolume(event.target.value)} />
          <span id={`${prefix}-volume-unit`}>units/month · optional</span>
        </div>
        <div className="me-monthly-result" aria-live="polite" aria-atomic="true">
          {monthly.status === 'calculated' ? <>
            <MonthlyTotals result={monthly} currency={inputs.currency} />
            <p>One month at your price, volume and modeled costs.</p>
          </> : <p id={`${prefix}-volume-message`}>{monthlyMessage}</p>}
        </div>
      </section>
      <details className="me-method">
        <summary>How it’s calculated</summary>
        <p>Subtract the variable cost from the price per unit. Divide monthly fixed costs by that contribution, then round up to whole units. For a monthly sales scenario, multiply your unit price by your expected sales. Modeled costs are monthly fixed costs plus variable cost per unit times sales. Subtract those costs from revenue for the monthly balance. The estimate assumes a constant price and unit cost and excludes taxes, demand and cash timing.</p>
      </details>
      {conflict && <p className="me-conflict" role="status">This worksheet changed in another tab. Review the latest values and re-enter your change.</p>}
      {scenario && <button className="me-clear" ref={clearButton} type="button" onClick={() => setPendingReset({ action: 'clear', expected: scenario })}>Clear worksheet</button>}
    </div>
  </details>;
}
