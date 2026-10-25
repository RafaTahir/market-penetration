import { useId } from 'react';
import {
  CITIES, FACTORS, evaluateCity,
  type CityId, type FactorId, type PlannerState,
} from '../../services/entryPlanner';
import './visualisations.css';

interface EvidenceComparisonProps {
  state: PlannerState;
  onSelectFactor: (city: CityId, factor: FactorId) => void;
  today: string;
  variant?: 'compact' | 'full';
}

const FACTOR_LABELS: Record<FactorId, string> = {
  demand: 'Demand',
  competition: 'Competition',
  regulation: 'Regulation',
  costs: 'Operating costs',
  talent: 'Talent & delivery',
};

export function EvidenceComparison({ state, onSelectFactor, today, variant = 'full' }: EvidenceComparisonProps) {
  const id = useId().replace(/:/g, '');
  const cities = CITIES.map(city => ({ city, result: evaluateCity(state, city.id, today) }));

  return (
    <figure className={`evidence-comparison evidence-comparison-${variant}`} aria-labelledby={`${id}-title`}>
      <figcaption className="visual-heading evidence-comparison-heading">
        <div>
          <span className="visual-kicker">One shared scale</span>
          <h2 id={`${id}-title`}>Preparation, side by side.</h2>
        </div>
      </figcaption>

      <div className="comparison-legend" aria-label="City symbols">
        {CITIES.map(city => <span key={city.id} data-city={city.id}><i className="comparison-symbol" aria-hidden="true" />{city.name}</span>)}
        <span className="comparison-self-reported">Self-reported · unverified</span>
      </div>

      <div className="comparison-plot" role="group" aria-label="Five preparation factors. Ratings are plotted only when documentation qualifies. Select any city factor to add or review evidence.">
        <div className="comparison-axis" aria-hidden="true">
          <span />
          <div className="comparison-ticks">{[1, 2, 3, 4, 5].map(tick => <span key={tick}>{tick}</span>)}</div>
          <span className="comparison-unknown-title">Unknown</span>
        </div>

        {FACTORS.map((factor, factorIndex) => (
          <div className="comparison-factor" key={factor.id}>
            <div className="comparison-factor-label">{FACTOR_LABELS[factor.id]}</div>
            <div className="comparison-factor-lanes">
              {cities.map(({ city, result }) => {
                const assessment = result.factors[factorIndex];
                const evidence = state.evidence[city.id][factor.id];
                const hasInput = evidence.rating !== null || !!evidence.note || !!evidence.sourceUrl || !!evidence.observedOn;
                const plotted = assessment.qualified && assessment.rating !== null;
                const status = plotted ? `Documented, self-reported preparation rating ${assessment.rating} of 5. Source observation date ${evidence.observedOn}.` : hasInput ? `Review needed. ${assessment.reason}` : 'Unknown. No documented assessment yet.';
                return (
                  <button
                    type="button"
                    key={city.id}
                    className={`comparison-lane${plotted ? ' is-documented' : hasInput ? ' needs-review' : ' is-unknown'}`}
                    data-city={city.id}
                    aria-label={`${city.name}, ${factor.label}. ${status} Select to ${hasInput ? 'review' : 'add'} evidence.`}
                    onClick={() => onSelectFactor(city.id, factor.id)}
                  >
                    <span className="comparison-rating-track" aria-hidden="true">
                      <span className="comparison-track-line" />
                      {[0, 25, 50, 75, 100].map(position => <span className="comparison-track-tick" key={position} style={{ left: `${position}%` }} />)}
                      {plotted && <span className="comparison-rating-dot comparison-symbol" style={{ left: `${(assessment.rating! - 1) * 25}%` }}>{assessment.rating}</span>}
                    </span>
                    <span className="comparison-unknown-cell" aria-hidden="true">
                      {!plotted && <span className="comparison-unknown-dot comparison-symbol">{hasInput ? '!' : '+'}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="comparison-axis-labels" aria-hidden="true"><span /><span><span>1 · weak preparation</span><span>5 · strong</span></span><span /></div>
      </div>

      <div className="comparison-footer">
        <span className="comparison-status-key"><span className="comparison-key-unknown" aria-hidden="true">+</span> Add evidence <span className="comparison-key-review" aria-hidden="true">!</span> Review</span>
        <span>Select a mark to edit</span>
      </div>

      <details className="visual-source-details comparison-source-details">
        <summary>Coverage, dates &amp; method</summary>
        <div>
          <p>Ratings reflect your preparation from 1 (weak) to 5 (strong). A mark appears on the scale only with a rating, a substantive note, an HTTPS source, a valid observation within 365 days, and a review for your current business profile. Unknown and review marks have no numeric value.</p>
          {cities.map(({ city, result }) => {
            const dates = result.factors.filter(factor => factor.qualified).map(factor => state.evidence[city.id][factor.id].observedOn).sort();
            return <p key={city.id}><strong>{city.name}: {result.qualifiedCount}/{FACTORS.length} documented.</strong> {dates.length ? `Qualifying observation dates: ${dates[0]}${dates[0] === dates[dates.length - 1] ? '' : ` to ${dates[dates.length - 1]}`}.` : 'No source dates currently qualify.'}</p>;
          })}
          <p>Self-reported assessments; source contents and current applicability are unverified. Select a factor for its saved source, date, reasoning, and any review requirements.</p>
        </div>
      </details>
    </figure>
  );
}
