import { useState, type MouseEvent } from 'react';
import { ArrowRight, ChevronDown, Columns3 } from 'lucide-react';
import { getIndustryQuestion, INDUSTRY_ANGLE_LABELS } from '../data/industryGuides';
import type { MarketGuide } from '../data/marketCatalog';
import type { MarketPlansState } from '../services/marketPlans';
import './IndustryQuestionComparison.css';

interface IndustryQuestionComparisonProps {
  markets: readonly MarketGuide[];
  plans: MarketPlansState;
}

interface SharedQuestion {
  question: NonNullable<ReturnType<typeof getIndustryQuestion>>;
  markets: MarketGuide[];
}

function sharedQuestions(markets: readonly MarketGuide[], plans: MarketPlansState) {
  const groups = new Map<string, SharedQuestion>();
  for (const market of markets) {
    for (const id of plans.questions[market.id] ?? []) {
      const question = getIndustryQuestion(id);
      if (!question) continue;
      const group = groups.get(question.id);
      if (group) group.markets.push(market);
      else groups.set(question.id, { question, markets: [market] });
    }
  }
  return [...groups.values()].filter(group => group.markets.length >= 2);
}

function focusCurrentQuestion(event: MouseEvent<HTMLAnchorElement>, rowId: string) {
  if (event.currentTarget.hash !== window.location.hash || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const row = document.getElementById(rowId);
  if (row) {
    event.preventDefault();
    row.focus({ preventScroll: true });
    row.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}

export default function IndustryQuestionComparison({ markets, plans }: IndustryQuestionComparisonProps) {
  const [selectedId, setSelectedId] = useState('');
  const groups = sharedQuestions(markets, plans);
  const current = groups.find(({ question }) => question.id === selectedId) ?? groups[0];
  if (!current) return null;
  const { question } = current;

  return <details className="industry-question-comparison">
    <summary><Columns3 size={17} aria-hidden="true" /><span>Compare industry findings</span><ChevronDown size={16} aria-hidden="true" /></summary>
    <div className="iqc-body">
      {groups.length > 1 && <label className="iqc-picker">Question to compare
        <select value={question.id} onChange={event => setSelectedId(event.target.value)}>
          {groups.map(group => <option value={group.question.id} key={group.question.id}>
            {group.question.industryName} · {group.question.question}
          </option>)}
        </select>
      </label>}
      <p className="iqc-industry">{question.industryName} · {INDUSTRY_ANGLE_LABELS[question.angle]}</p>
      <h3>{question.question}</h3>
      <p className="iqc-provenance">Your saved findings, sources and dates are unverified.</p>
      <ul className="iqc-markets" aria-label="Markets with this saved question">
        {current.markets.map(market => {
          const finding = plans.findings[market.id]?.[question.id];
          return <li key={market.id} data-market={market.id}>
            <h4><span aria-hidden="true">{market.flag}</span>{market.name}</h4>
            {finding ? <>
              <p className="iqc-status">Your finding</p>
              <p className="iqc-finding">{finding.text}</p>
              <dl className="iqc-citation">
                <div><dt>Source</dt><dd>{finding.source || 'Not recorded'}</dd></div>
                <div><dt>Observation date</dt><dd>{finding.observedOn
                  ? <><time dateTime={finding.observedOn}>{finding.observedOn}</time>
                    {Date.parse(`${finding.observedOn}T00:00:00`) > Date.now() && ' · Future date'}</>
                  : 'Unknown'}</dd></div>
              </dl>
            </> : <p className="iqc-status">No finding yet</p>}
            <a href={`#/plan/question/${market.id}/${question.id}`}
              aria-label={`Open question for ${market.name}`}
              onClick={event => focusCurrentQuestion(event, `question-${market.id}-${question.id}`)}>
              Open question <ArrowRight size={14} aria-hidden="true" />
            </a>
          </li>;
        })}
      </ul>
    </div>
  </details>;
}
