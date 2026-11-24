import { formatSalesAmount } from '../services/marketEconomics';
import type { buildMarketPlanExport } from '../services/marketPlans';

type BriefScenario = ReturnType<typeof buildMarketPlanExport>['markets'][number]['breakEvenScenario'];

const amountFormat = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const unitFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });

function entered(value: string): string {
  return value.trim() ? value : 'Not entered';
}

export default function BriefWorksheet({ scenario }: { scenario: BriefScenario }) {
  if (!scenario) return <section className="brief-worksheet">
    <h3>Monthly worksheet</h3>
    <p>No worksheet saved.</p>
  </section>;

  const { inputs, result } = scenario;
  const { breakEvenUnits, contributionPerUnit, status } = result;
  const sales = scenario.monthlySales?.result;

  let breakEvenStatus = '';
  if (status === 'incomplete') breakEvenStatus = 'The worksheet is missing one or more cost or price assumptions.';
  if (status === 'invalid') breakEvenStatus = 'One or more amounts are invalid. Use nonnegative amounts with up to 12 whole digits and two decimal places.';
  if (status === 'no-positive-margin') {
    breakEvenStatus = breakEvenUnits === 0
      ? 'Zero sales covers the entered fixed costs. Each unit sold contributes zero or less.'
      : 'Each unit sold contributes zero or less toward the entered fixed costs.';
  }

  let volume = 'Unavailable';
  if (breakEvenUnits !== null) volume = `${unitFormat.format(breakEvenUnits)} ${breakEvenUnits === 1 ? 'unit' : 'units'}/month`;
  else if (status === 'no-positive-margin') volume = 'Unreachable at the entered price';

  return <section className="brief-worksheet">
    <h3>Monthly worksheet</h3>
    <dl className="brief-worksheet-inputs">
      <div><dt>Currency</dt><dd>{inputs.currency}</dd></div>
      <div><dt>Monthly fixed costs</dt><dd>{entered(inputs.monthlyFixedCosts)}</dd></div>
      <div><dt>Price per unit</dt><dd>{entered(inputs.unitPrice)}</dd></div>
      <div><dt>Variable cost per unit</dt><dd>{entered(inputs.unitVariableCost)}</dd></div>
      {inputs.expectedMonthlyUnits !== undefined &&
        <div><dt>Expected monthly sales (units)</dt><dd>{entered(inputs.expectedMonthlyUnits)}</dd></div>}
    </dl>

    <h4>Break-even</h4>
    <dl className="brief-worksheet-results">
      <div><dt>Contribution per unit</dt><dd>{contributionPerUnit === null ? 'Unavailable' : `${amountFormat.format(contributionPerUnit)} ${inputs.currency}`}</dd></div>
      <div><dt>Break-even sales</dt><dd>{volume}</dd></div>
    </dl>
    {breakEvenStatus && <p className="brief-worksheet-status">{breakEvenStatus}</p>}

    {sales && <>
      <h4>Monthly sales scenario</h4>
      {sales.status === 'calculated' ? <dl className="brief-worksheet-results">
        <div><dt>Revenue</dt><dd>{formatSalesAmount(sales.revenue)} {inputs.currency}</dd></div>
        <div><dt>Modeled costs</dt><dd>{formatSalesAmount(sales.totalCosts)} {inputs.currency}</dd></div>
        <div><dt>{sales.netResult.startsWith('-') ? 'Shortfall' : sales.netResult === '0.00' ? 'Break-even balance' : 'Surplus'}</dt>
          <dd>{formatSalesAmount(sales.netResult)} {inputs.currency}</dd></div>
      </dl> : <p className="brief-worksheet-status">{
        sales.status === 'invalid-volume' ? 'Sales result unavailable. Expected units must be a whole number from 0 to 999,999,999,999.' :
          sales.status === 'invalid-costs' ? 'Sales result unavailable. Correct the cost or price amounts.' :
            'Sales result unavailable until all three amounts and expected units are entered.'
      }</p>}
    </>}
    <p className="brief-worksheet-limit">One month at your entered price and costs. This scenario excludes taxes, currency conversion, cash timing and demand forecasts.</p>
  </section>;
}
