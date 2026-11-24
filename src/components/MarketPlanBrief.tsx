import { Fragment, useId } from 'react';
import type { buildMarketPlanExport } from '../services/marketPlans';
import BriefWorksheet from './BriefWorksheet';

type Plan = ReturnType<typeof buildMarketPlanExport>;
type Market = Plan['markets'][number];
type SavedQuestion = Market['savedResearchQuestions'][number];

const lensNames = { customers: 'Customers', location: 'Location', setup: 'Setup' } as const;

function BriefQuestion({ question, preparedDay }: { question: SavedQuestion; preparedDay: string }) {
  const finding = question.userFinding;
  return <li className="mpb-question">
    <div className="mpb-question-heading">
      <span className="mpb-field-label">{lensNames[question.lens]}</span>
      <span className="mpb-status">{finding ? 'Personal finding' : 'Open question'}</span>
    </div>
    <h4>{question.question}</h4>
    {!finding && <p className="mpb-question-sources">
      <span className="mpb-field-label">Research starting points</span>{' '}
      {question.sources.map((source, index) => <Fragment key={source.url}>
        {index > 0 && ' · '}
        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a>
      </Fragment>)}
    </p>}
    {finding && <div className="mpb-finding">
      <p className="mpb-user-text">{finding.text}</p>
      <dl className="mpb-citation">
        <div><dt>Personal source</dt><dd className="mpb-user-text">{finding.source || 'Not recorded'}</dd></div>
        <div><dt>Observation date</dt><dd>{finding.observedOn
          ? <><time dateTime={finding.observedOn}>{finding.observedOn}</time>{finding.observedOn > preparedDay && ' · future date, check source'}</>
          : 'Unknown'}</dd></div>
      </dl>
    </div>}
  </li>;
}

function BriefDirectories({ market }: { market: Market }) {
  const { businessSetup, regionalSetup, countryStatistics, cityAndLocation, cityStatistics } = market.sources;
  const entries = [
    ['Business setup', businessSetup], ['Province or state registration', regionalSetup], ['National statistics', countryStatistics],
    ['City and premises', cityAndLocation], ['City statistics', cityStatistics],
  ] as const;
  return <section className="mpb-section">
    <h3>Official directories</h3>
    <ul className="mpb-directory">{entries.map(([purpose, source]) => source && (
      <li key={purpose}>
        <span className="mpb-field-label">{purpose}</span>
        <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={source.name}>
          <span className="mpb-source-name">{source.name}</span>{' '}
          <span className="mpb-url">{source.url}</span>
        </a>
      </li>
    ))}</ul>
  </section>;
}

export default function MarketPlanBrief({ plan }: { plan: Plan }) {
  const briefId = useId();
  const prepared = new Date(plan.exportedAt);
  const year = prepared.getFullYear();
  const month = String(prepared.getMonth() + 1).padStart(2, '0');
  const day = String(prepared.getDate()).padStart(2, '0');
  const preparedDay = `${year}-${month}-${day}`;
  const preparedLabel = prepared.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });

  return <article className="mpb-paper" aria-labelledby={briefId}>
    <header className="mpb-heading">
      <p className="mpb-eyebrow">Flow</p>
      <h1 id={briefId}>Market plan brief</h1>
      <p className="mpb-meta">
        {plan.markets.length} {plan.markets.length === 1 ? 'market' : 'markets'} · Prepared <time dateTime={plan.exportedAt}>{preparedLabel}</time>
      </p>
      <p className="mpb-note">Notes and findings are user-entered and unverified. Directory contents, publication dates and current applicability are unverified.</p>
    </header>
    {plan.markets.length === 0 && <p className="mpb-empty">No markets selected.</p>}
    {plan.markets.map(market => (
      <section key={market.id} className="mpb-market" data-market={market.id} aria-labelledby={`${briefId}-${market.id}`}>
        <header className="mpb-market-heading">
          <p className="mpb-eyebrow">{market.region}</p>
          <h2 id={`${briefId}-${market.id}`}>{market.country}</h2>
          <p className="mpb-meta">{market.cityResearchStartingPoint} · city research starting point</p>
        </header>
        <section className="mpb-section mpb-next-step">
          <h3>Next step</h3>
          {market.userNextStep ? <>
            <p className="mpb-user-text">{market.userNextStep}</p>
            <p className="mpb-meta">Note edit date {market.noteEditedAt
              ? <time dateTime={market.noteEditedAt}>{market.noteEditedAt.slice(0, 10)} UTC</time>
              : 'unknown'}</p>
          </> : <p className="mpb-empty">No next step saved.</p>}
        </section>
        <section className="mpb-section">
          <h3>Saved research questions</h3>
          {market.savedResearchQuestions.length
            ? <ul className="mpb-questions">{market.savedResearchQuestions.map(question => (
              <BriefQuestion key={question.lens} question={question} preparedDay={preparedDay} />
            ))}</ul>
            : <p className="mpb-empty">No research questions saved.</p>}
        </section>
        <BriefWorksheet scenario={market.breakEvenScenario} />
        <BriefDirectories market={market} />
      </section>
    ))}
  </article>;
}
