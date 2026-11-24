import { useEffect, useRef, useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import type { MarketGuide } from '../data/marketCatalog';
import {
  calculateMarketEconomics, emptyMarketEconomics, MARKET_CURRENCIES,
  MAX_ECONOMICS_INPUT_LENGTH, type MarketCurrency, type MarketEconomicsInputs,
} from '../services/marketEconomics';
import './MarketEconomicsWorksheet.css';

interface WorksheetProps {
  market: MarketGuide;
  scenario: MarketEconomicsInputs | undefined;
  onChange: (next: MarketEconomicsInputs | null) => void;
}

const fields = [
  { key: 'monthlyFixedCosts', label: 'Monthly fixed costs' },
  { key: 'unitPrice', label: 'Price per unit' },
  { key: 'unitVariableCost', label: 'Variable cost per unit' },
] as const;

const unitsFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
const moneyFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });
const percentFormat = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 });

export default function MarketEconomicsWorksheet({ market, scenario, onChange }: WorksheetProps) {
  const inputs = scenario ?? emptyMarketEconomics(market.id);
  const { status, contributionPerUnit, breakEvenUnits } = calculateMarketEconomics(inputs);
  const [pendingReset, setPendingReset] = useState<MarketCurrency | 'clear' | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const currencySelect = useRef<HTMLSelectElement>(null);
  const clearButton = useRef<HTMLButtonElement>(null);
  const hasAmounts = fields.some(({ key }) => inputs[key] !== '');
  const prefix = `economics-${market.id}`;

  useEffect(() => {
    if (pendingReset) cancelButton.current?.focus();
  }, [pendingReset]);

  function changeCurrency(currency: MarketCurrency) {
    if (hasAmounts) setPendingReset(currency);
    else onChange({ ...inputs, currency });
  }

  function finishReset(confirmed: boolean) {
    if (confirmed) {
      if (pendingReset === 'clear') onChange(null);
      else if (pendingReset) onChange({ ...emptyMarketEconomics(market.id), currency: pendingReset });
    }
    if (!confirmed && pendingReset === 'clear') clearButton.current?.focus();
    else currencySelect.current?.focus();
    setPendingReset(null);
  }

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
        <p>{pendingReset === 'clear'
          ? `Clear the break-even worksheet for ${market.name}?`
          : `Changing from ${inputs.currency} to ${pendingReset} clears the three amounts so you can enter new figures.`}</p>
        <button type="button" ref={cancelButton} onClick={() => finishReset(false)}>Cancel</button>
        <button type="button" onClick={() => finishReset(true)}>{pendingReset === 'clear'
          ? 'Clear amounts' : `Switch to ${pendingReset} and clear amounts`}</button>
      </div>}
      <div className="me-inputs">
        {fields.map(({ key, label }) => <div key={key} className="me-field">
          <label htmlFor={`${prefix}-${key}`}>{label}</label>
          <input id={`${prefix}-${key}`} type="text" inputMode="decimal" autoComplete="off"
            aria-describedby={`${prefix}-currency-unit${status === 'invalid' ? ' ' + prefix + '-message' : ''}`}
            maxLength={MAX_ECONOMICS_INPUT_LENGTH} value={inputs[key]}
            onChange={event => {
              setPendingReset(null);
              onChange({ ...inputs, [key]: event.target.value });
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
      <details className="me-method">
        <summary>How it’s calculated</summary>
        <p>Subtract the variable cost from the price per unit. Divide monthly fixed costs by that contribution, then round up to whole units. The estimate assumes a constant price and unit cost and excludes taxes, demand and cash timing.</p>
      </details>
      {scenario && <button className="me-clear" ref={clearButton} type="button" onClick={() => setPendingReset('clear')}>Clear worksheet</button>}
    </div>
  </details>;
}
