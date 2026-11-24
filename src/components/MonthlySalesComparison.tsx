import { ArrowRight, ChevronDown, Columns3 } from 'lucide-react';
import type { MarketGuide } from '../data/marketCatalog';
import type { MarketPlansState } from '../services/marketPlans';
import { calculateMarketEconomics, calculateMonthlySales, formatSalesAmount, type MarketEconomicsInputs } from '../services/marketEconomics';
import './MonthlySalesComparison.css';

interface MonthlySalesComparisonProps {
  markets: readonly MarketGuide[];
  scenarios: MarketPlansState['scenarios'];
  onOpenWorksheet: (marketId: string) => void;
}

const wholeUnits = new Intl.NumberFormat('en-US');

function ScenarioFigures({ inputs }: { inputs: MarketEconomicsInputs }) {
  const sales = calculateMonthlySales(inputs);
  const costs = calculateMarketEconomics(inputs);
  const enteredUnits = inputs.expectedMonthlyUnits?.trim();

  let volume = 'Not entered';
  if (sales.status === 'invalid-volume') volume = 'Check units';
  else if (enteredUnits) volume = wholeUnits.format(Number(enteredUnits));

  let breakEven = 'Incomplete';
  if (costs.breakEvenUnits !== null) breakEven = wholeUnits.format(costs.breakEvenUnits);
  else if (costs.status === 'no-positive-margin') breakEven = 'No positive margin';
  else if (costs.status === 'invalid') breakEven = 'Check amounts';

  let result = enteredUnits ? 'Add missing amounts' : 'Add sales volume';
  let outcome = '';
  if (sales.status === 'calculated') {
    result = `${formatSalesAmount(sales.netResult)} ${inputs.currency}`;
    if (sales.netResult === '0.00') outcome = 'Break-even';
    else outcome = sales.netResult.startsWith('-') ? 'Shortfall' : 'Surplus';
  } else if (sales.status === 'invalid-costs') result = 'Check amounts';
  else if (sales.status === 'invalid-volume') result = 'Check sales volume';

  return <dl className="msc-figures">
    <div><dt>Expected units</dt><dd>{volume}</dd></div>
    <div><dt>Break-even units</dt><dd>{breakEven}</dd></div>
    <div><dt>Monthly result</dt><dd data-outcome={outcome || undefined}>{outcome && <small>{outcome} </small>}{result}</dd></div>
  </dl>;
}

export default function MonthlySalesComparison({ markets, scenarios, onOpenWorksheet }: MonthlySalesComparisonProps) {
  if (markets.length < 2 || !markets.some(market => scenarios[market.id]?.expectedMonthlyUnits?.trim())) return null;

  return <details className="monthly-sales-comparison">
    <summary><Columns3 size={17} aria-hidden="true" /><span>Compare monthly sales scenarios</span><ChevronDown size={16} aria-hidden="true" /></summary>
    <div className="msc-body">
      <p>One month at your assumed sales volumes, prices and costs. Each worksheet uses its own currency.</p>
      <ul aria-label="Shortlisted sales scenarios">
        {markets.map(market => {
          const inputs = scenarios[market.id];
          return <li key={market.id} data-market={market.id}>
            <div className="msc-market"><span aria-hidden="true">{market.flag}</span>
              <div><h3>{market.name}</h3>{inputs && <small>{inputs.currency} worksheet</small>}</div>
            </div>
            {inputs ? <ScenarioFigures inputs={inputs} /> : <span className="msc-empty">No worksheet saved</span>}
            <button type="button" className="msc-open" aria-label={`Open worksheet for ${market.name}`} onClick={() => onOpenWorksheet(market.id)}>
              Open worksheet <ArrowRight size={13} aria-hidden="true" />
            </button>
          </li>;
        })}
      </ul>
    </div>
  </details>;
}
