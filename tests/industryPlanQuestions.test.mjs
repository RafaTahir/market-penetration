import assert from 'node:assert/strict';
import test from 'node:test';
import { INDUSTRIES, INDUSTRY_QUESTION_IDS, getIndustryQuestion } from '../src/data/industryGuides.ts';
import { MARKETS } from '../src/data/marketCatalog.ts';
import {
  buildMarketPlanExport, createMarketPlans, getMarketQuestion, parseMarketPlans, serializeMarketPlans,
  setMarketFinding, setMarketQuestionSaved, setMarketScenario,
} from '../src/services/marketPlans.ts';

const demandId = 'industry-technology-buyer-problem';
const costId = 'industry-food-beverage-premises-and-ingredients';
const setupId = 'industry-technology-service-rules';
const finding = { text: 'Interviewee requested a priced pilot.', source: 'Interview notes', observedOn: '2026-02-14' };
const canada = MARKETS.find(market => market.id === 'canada');
const date = '2026-02-15T08:00:00.000Z';

test('every industry question resolves by its own unique semantic ID to the correct fieldwork', () => {
  const ids = new Set();
  for (const industry of INDUSTRIES) {
    for (const [angle, fieldwork] of Object.entries(industry.angles)) {
      for (const { id, text } of fieldwork.questions) {
        assert.match(id, new RegExp(`^industry-${industry.id}-[a-z-]+$`));
        assert.equal(ids.has(id), false, id);
        ids.add(id);
        assert.deepEqual(getIndustryQuestion(id), {
          id, industryId: industry.id, industryName: industry.name, angle, question: text,
          evidence: fieldwork.evidence, decision: fieldwork.decision,
        });
      }
    }
  }
  assert.equal(ids.size, 36);
  assert.deepEqual(new Set(INDUSTRY_QUESTION_IDS), ids);
  assert.equal(getIndustryQuestion(demandId).question, 'Which customer has a problem they will pay to solve?');
  assert.equal(getIndustryQuestion(costId).angle, 'costs');
  assert.equal(getIndustryQuestion(setupId).industryName, 'Technology & software');
  assert.throws(() => { getIndustryQuestion(demandId).question = 'Other text'; }, TypeError);
});

test('market questions show fieldwork and only appropriate research directories for that market', () => {
  const demand = getMarketQuestion(canada, demandId);
  assert.equal(demand.label, 'Technology & software · Customer & demand');
  assert.deepEqual(demand.sources, [canada.statistics]);
  const uk = MARKETS.find(market => market.id === 'uk');
  assert.deepEqual(getMarketQuestion(uk, demandId).sources, [uk.statistics, uk.cityStatistics]);
  assert.deepEqual(demand.fieldwork, { evidence: getIndustryQuestion(demandId).evidence, decision: getIndustryQuestion(demandId).decision });
  const setup = getMarketQuestion(canada, setupId);
  assert.deepEqual(setup.sources, [canada.setup, canada.regionalSetup, canada.cityPortal]);
  const costs = getMarketQuestion(canada, costId);
  assert.equal(costs.label, 'Food & beverage · Cost & delivery');
  assert.deepEqual(costs.sources, []);
  assert.equal(costs.question, 'What do rent, fit-out, ingredients and delivery actually cost?');
  const city = getMarketQuestion(canada, 'setup');
  assert.equal(city.label, 'Setup');
  assert.equal('fieldwork' in city, false);
  assert.notEqual(city.question, setup.question);
  // Returned display data must not change the next lookup or its curated source links.
  const originalUrl = canada.statistics.url;
  demand.sources[0].url = 'tampered';
  demand.fieldwork.evidence = 'tampered';
  assert.equal(getMarketQuestion(canada, demandId).sources[0].url, originalUrl);
  assert.notEqual(getMarketQuestion(canada, demandId).fieldwork.evidence, 'tampered');
});

test('v4 stores industry IDs and findings while v1–3 stay compatible for selections without them', () => {
  let plans = createMarketPlans();
  plans = setMarketQuestionSaved(plans, 'kenya', 'customers', true);
  plans = setMarketQuestionSaved(plans, 'uk', 'location', true);
  plans = setMarketFinding(plans, 'uk', 'location', finding);
  plans = setMarketScenario(plans, 'singapore', { currency: 'SGD', monthlyFixedCosts: '0', unitPrice: '2', unitVariableCost: '1', expectedMonthlyUnits: '0' });
  plans = setMarketQuestionSaved(plans, 'canada', 'location', true);
  plans = setMarketQuestionSaved(plans, 'canada', costId, true);
  plans = setMarketQuestionSaved(plans, 'canada', demandId, true);
  plans = setMarketFinding(plans, 'canada', demandId, finding);
  const disk = serializeMarketPlans(plans);
  assert.equal(disk.version, 4);
  const loaded = parseMarketPlans(JSON.parse(JSON.stringify(disk)));
  assert.deepEqual(loaded, plans);
  const expected = buildMarketPlanExport(plans, ['canada'], date);
  assert.deepEqual(buildMarketPlanExport(loaded, ['canada'], date), expected);
  assert.equal(expected.version, 4);
  const [market] = expected.markets;
  assert.deepEqual(market.savedResearchQuestions.map(q => q.lens), ['location']);
  assert.equal(market.savedResearchQuestions[0].kind, 'unverified-research-prompt');
  assert.deepEqual(market.savedIndustryQuestions.map(q => q.id), [costId, demandId]);
  assert.deepEqual(market.savedIndustryQuestions[0], { ...getIndustryQuestion(costId), kind: 'unverified-industry-research-prompt', sources: [], userFinding: null });
  assert.deepEqual(market.savedIndustryQuestions[1].userFinding, { kind: 'user-entered-research-finding', ...finding });
  for (const [country, version] of [['kenya', 1], ['uk', 2], ['singapore', 3]]) {
    const selected = buildMarketPlanExport(plans, [country], date);
    assert.equal(selected.version, version);
    assert.equal(selected.markets.length, 1);
    assert.equal('savedIndustryQuestions' in selected.markets[0], false);
    assert.equal(JSON.stringify(selected).includes(demandId), false);
  }
  assert.deepEqual(buildMarketPlanExport(plans, [], date).markets, []);
  assert.equal(buildMarketPlanExport(plans, [], date).version, 1);
  assert.equal(setMarketQuestionSaved(plans, 'canada', demandId, false), plans);
  const cleared = setMarketFinding(plans, 'canada', demandId, null);
  const remaining = setMarketQuestionSaved(setMarketQuestionSaved(cleared, 'canada', demandId, false), 'canada', costId, false);
  assert.equal(serializeMarketPlans(remaining).version, 3);
  assert.equal(buildMarketPlanExport(remaining, ['canada'], date).version, 1);
});

test('only known IDs on known markets retain findings, including during malformed storage reads', () => {
  const unknownIds = ['industry-unknown', 'industry-technology-demand-0', 'industry-__proto__', '__proto__', 'constructor', 'toString', null, { id: demandId }];
  const empty = createMarketPlans();
  for (const id of unknownIds) {
    assert.equal(getIndustryQuestion(id), undefined);
    assert.equal(getMarketQuestion(canada, id), undefined);
    assert.equal(setMarketQuestionSaved(empty, 'canada', id, true), empty);
    assert.equal(setMarketFinding(empty, 'canada', id, finding), empty);
  }
  assert.equal(setMarketFinding(empty, 'canada', demandId, finding), empty);
  assert.equal(setMarketQuestionSaved(empty, '__proto__', demandId, true), empty);
  assert.equal(getMarketQuestion({ ...canada, id: 'constructor' }, demandId), undefined);
  const raw = {
    version: 4,
    questions: { canada: [...unknownIds, demandId, demandId, 'location'], ['__proto__']: [demandId] },
    findings: { canada: { [costId]: finding, [demandId]: { ...finding, score: 100 }, ['__proto__']: finding }, kenya: { [demandId]: finding } },
  };
  const parsed = parseMarketPlans(raw);
  assert.deepEqual(parsed.questions, { canada: [demandId, 'location'] });
  assert.deepEqual(parsed.findings, { canada: { [demandId]: finding } });
  for (const version of [1, 2, 3]) {
    const legacy = parseMarketPlans({ ...raw, version });
    assert.deepEqual(legacy.questions, { canada: ['location'] });
    assert.deepEqual(legacy.findings, {});
  }
  assert.deepEqual(parseMarketPlans({ ...raw, version: 5 }), empty);
});
