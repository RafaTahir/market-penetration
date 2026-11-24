/** UK/Europe integration contracts using bundled historical data and plan fixtures. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { MARKETS, filterMarketGuides } from '../src/data/marketCatalog.ts';
import { CITY_RESEARCH_GUIDES } from '../src/data/cityResearchGuides.ts';
import { MARKET_FUNDAMENTALS, MARKET_SNAPSHOT_META } from '../src/data/marketSnapshot.ts';
import { historicalGdpAtYear } from '../src/services/marketComparison.ts';
import { MARKET_CURRENCIES, emptyMarketEconomics } from '../src/services/marketEconomics.ts';
import {
  buildMarketPlanExport, createMarketPlans, getCityQuestionSources, parseMarketPlans,
  setMarketFinding, setMarketQuestionSaved, setMarketScenario, updateMarketNextStep,
} from '../src/services/marketPlans.ts';
import { parseMarketPlanFile, previewMarketPlanRestore } from '../src/services/marketPlanRestore.ts';

const EDITED = '2026-11-24T01:10:00.000Z';
const uk = () => {
  const market = MARKETS.find(item => item.id === 'uk');
  assert.ok(market, 'UK needs a catalog identity before related data can be used');
  return market;
};

test('UK country, London city and ISO searches identify a European market without crossing filters', () => {
  const market = uk();
  assert.equal(market.name, 'United Kingdom');
  assert.equal(market.countryCode, 'GBR');
  assert.equal(market.city, 'London');
  assert.equal(market.region, 'Europe');
  for (const query of ['uk', '  UNITED KINGDOM  ', 'lOnDoN', 'GBR']) {
    assert.deepEqual(filterMarketGuides(MARKETS, query).map(item => item.id), ['uk']);
    assert.deepEqual(filterMarketGuides(MARKETS, query, 'Europe').map(item => item.id), ['uk']);
    assert.deepEqual(filterMarketGuides(MARKETS, query, 'Southeast Asia'), []);
  }
  assert.ok(filterMarketGuides(MARKETS, '', 'Europe').some(item => item.id === 'uk'));
  for (const region of new Set(MARKETS.map(item => item.region))) {
    assert.deepEqual(filterMarketGuides(MARKETS, '', region), MARKETS.filter(item => item.region === region));
  }
});

test('UK historical observations retain verified national USD values, years and retrieval provenance', () => {
  const snapshot = MARKET_FUNDAMENTALS[uk().countryCode];
  assert.ok(snapshot, 'UK snapshot must use GBR, not the city or UI identifier');
  // Exact literals checked against the same pinned population/GDP CSVs as the
  // existing snapshot; these are historical UK totals, never London estimates.
  assert.equal(MARKET_SNAPSHOT_META.observationYear, 2023);
  assert.equal(snapshot.population, 68526000);
  assert.equal(snapshot.gdpUsd, 3340032380668.0356);
  assert.equal(historicalGdpAtYear(snapshot, 2014), 3064708247921.4277);
  assert.equal(historicalGdpAtYear(snapshot, 2023), snapshot.gdpUsd);
  assert.deepEqual(snapshot.gdpSeries.map(point => point.year).sort((a, b) => a - b),
    Array.from({ length: 10 }, (_, index) => 2014 + index));
  assert.ok(snapshot.gdpSeries.every(point => Number.isFinite(point.value) && point.value >= 0));
  assert.equal(MARKET_SNAPSHOT_META.gdp.unit, 'current US dollars');
  assert.equal(MARKET_SNAPSHOT_META.population.unit, 'people');
  assert.ok(Number.isFinite(Date.parse(MARKET_SNAPSHOT_META.retrievedAt)));
  for (const source of [MARKET_SNAPSHOT_META.gdp, MARKET_SNAPSHOT_META.population]) {
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
    assert.match(source.commit, /^[a-f0-9]{40}$/);
    assert.ok(new URL(source.downloadUrl).pathname.includes(source.commit));
  }
});

test('London questions link to UK discovery sources and export unverified status without notebook scoring', () => {
  const market = uk();
  const guide = CITY_RESEARCH_GUIDES.uk;
  assert.ok(guide);
  assert.match(guide.scope, /London/);
  assert.match(guide.scope, /borough|Greater London|City of London/i);
  const expectedSources = {
    customers: ['https://www.ons.gov.uk/', 'https://data.london.gov.uk/'],
    location: ['https://www.gov.uk/find-local-council'],
    setup: ['https://www.gov.uk/set-up-business', 'https://www.gov.uk/find-local-council'],
  };
  let plans = createMarketPlans();
  for (const lens of ['customers', 'location', 'setup']) {
    assert.ok(guide.prompts[lens].question.trim());
    assert.ok(guide.prompts[lens].detail.trim());
    const sources = getCityQuestionSources(market, lens);
    assert.deepEqual(sources.map(source => source.url), expectedSources[lens]);
    for (const source of sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(url.hostname.endsWith('.gov.uk'), `Use a UK government source directory: ${source.url}`);
    }
    plans = setMarketQuestionSaved(plans, 'uk', lens, true);
  }
  const output = buildMarketPlanExport(plans, ['uk'], EDITED);
  assert.equal(output.markets.length, 1);
  const exported = output.markets[0];
  assert.equal(exported.region, 'Europe');
  assert.equal(exported.cityResearchStartingPoint, 'London');
  assert.equal(exported.sources.sourceContentsVerified, false);
  assert.equal(exported.sources.sourcePublicationDate, null);
  assert.ok(exported.savedResearchQuestions.every(question => question.kind === 'unverified-research-prompt'));
  assert.deepEqual(exported.savedResearchQuestions.map(question => question.question),
    ['customers', 'location', 'setup'].map(lens => guide.prompts[lens].question));
  for (const question of exported.savedResearchQuestions) {
    assert.deepEqual(question.sources.map(source => source.url), expectedSources[question.lens]);
  }
  assert.ok(!output.detailedNotebookCoverage.some(city => /London/i.test(city)));
  assert.equal('score' in exported, false);
  assert.equal('survivalProbability' in exported, false);
});

test('UK starts in GBP but all supported scenario currencies survive without conversion or relabeling', () => {
  assert.deepEqual(emptyMarketEconomics('uk'), {
    currency: 'GBP', monthlyFixedCosts: '', unitPrice: '', unitVariableCost: '',
  });
  assert.ok(MARKET_CURRENCIES.includes('GBP'));
  for (const currency of MARKET_CURRENCIES) {
    const inputs = { currency, monthlyFixedCosts: '123.45', unitPrice: '5.20', unitVariableCost: '2.70' };
    const original = setMarketScenario(createMarketPlans(), 'uk', inputs);
    const stored = parseMarketPlans(JSON.parse(JSON.stringify(original)));
    const exported = buildMarketPlanExport(stored, ['uk'], EDITED);
    const draft = parseMarketPlanFile(JSON.stringify(exported));
    assert.deepEqual(draft.plans.scenarios.uk, inputs);
    const scenario = exported.markets[0].breakEvenScenario;
    assert.deepEqual(scenario.inputs, inputs);
    assert.equal(scenario.result.breakEvenUnits, 50);
    assert.equal(scenario.result.contributionPerUnit, 2.5);
    assert.match(scenario.limitation, /currency conversion.*not modeled/);
  }
});

test('UK restore merges a fourth region, keeps local work and ignores file-supplied country/source claims', () => {
  let incoming = updateMarketNextStep(createMarketPlans(), 'uk', 'User note: inspect the proposed London premises.', EDITED);
  incoming = setMarketQuestionSaved(incoming, 'uk', 'location', true);
  incoming = setMarketFinding(incoming, 'uk', 'location', {
    text: 'Synthetic test finding: request a written quote.', source: 'Synthetic interview', observedOn: null,
  });
  const file = buildMarketPlanExport(incoming, ['uk'], EDITED);
  const row = file.markets[0];
  row.region = 'Southeast Asia';
  row.countryCode = 'SGP';
  row.cityResearchStartingPoint = 'Singapore';
  row.sources.businessSetup = { name: 'Untrusted', url: 'https://untrusted.invalid/' };
  row.savedResearchQuestions[0].question = 'Invented requirement';
  const draft = parseMarketPlanFile(JSON.stringify(file));
  assert.deepEqual(draft.warnings, []);
  const local = updateMarketNextStep(createMarketPlans(), 'singapore', 'Keep this existing note.', EDITED);
  const before = structuredClone(local);
  const selected = ['singapore', 'new-zealand', 'united-arab-emirates'];
  const restored = previewMarketPlanRestore(local, selected, draft);
  assert.deepEqual(restored.countries, [...selected, 'uk']);
  assert.deepEqual(local, before);
  assert.deepEqual(restored.plans.notes.singapore, local.notes.singapore);
  const canonical = buildMarketPlanExport(restored.plans, ['uk'], EDITED).markets[0];
  assert.equal(canonical.region, 'Europe');
  assert.equal(canonical.countryCode, 'GBR');
  assert.equal(canonical.cityResearchStartingPoint, 'London');
  assert.equal(canonical.savedResearchQuestions[0].question, CITY_RESEARCH_GUIDES.uk.prompts.location.question);
  assert.equal(canonical.sources.businessSetup.url, uk().setup.url);
  assert.equal(canonical.savedResearchQuestions[0].userFinding.kind, 'user-entered-research-finding');
  assert.equal(previewMarketPlanRestore(restored.plans, restored.countries, draft).changed, false);
});
