/** Catalog integration contracts using bundled historical data and plan fixtures. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { MARKETS, filterMarketGuides, getMarketDirectories } from '../src/data/marketCatalog.ts';
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

test('discovery combines currency, place and region terms on the same market with tolerant spelling normalization', () => {
  for (const [query, id] of [
    ['Nairobi Kenya', 'kenya'], ['  kEs  aFrIcA  ', 'kenya'], ['KEN Nairobi', 'kenya'],
    ['London GBP', 'uk'], ['U.K. GBP', 'uk'], ['new-zealand NZD', 'new-zealand'],
    ['Hồ Chí Minh Vietnam', 'vietnam'], ['Ho\u0302\u0300 Chi\u0301 Minh Vietnam', 'vietnam'],
    ['Nairobi, Kenya / KES', 'kenya'], ['Dubai AED', 'united-arab-emirates'],
    [' Toronto / CAD ', 'canada'], ['🇨🇦 CAN', 'canada'], ['Canada North America', 'canada'],
  ]) {
    assert.deepEqual(filterMarketGuides(MARKETS, query).map(market => market.id), [id], query);
  }
  assert.ok(filterMarketGuides(MARKETS, 'ke').some(market => market.id === 'kenya'));
  assert.ok(filterMarketGuides(MARKETS, 'ae').some(market => market.id === 'united-arab-emirates'));
  for (const query of ['AE KE', 'Nairobi GBP', 'London KES', 'Kenya Europe', 'Naiorbi']) {
    assert.deepEqual(filterMarketGuides(MARKETS, query), [], query);
  }
  assert.deepEqual(filterMarketGuides(MARKETS, 'KES Africa', 'Africa').map(market => market.id), ['kenya']);
  assert.deepEqual(filterMarketGuides(MARKETS, 'Nairobi Kenya', 'Europe'), []);
  assert.deepEqual(filterMarketGuides(MARKETS, 'London GBP', 'Africa'), []);
  assert.deepEqual(filterMarketGuides(MARKETS, 'CAD', 'North America').map(market => market.id), ['canada']);
  assert.deepEqual(filterMarketGuides(MARKETS, 'Toronto', 'Europe'), []);
});

test('blank search keeps the region intersection while punctuation-only search cannot match everything', () => {
  for (const query of ['', ' \t\n ']) {
    assert.deepEqual(filterMarketGuides(MARKETS, query), MARKETS);
    assert.deepEqual(filterMarketGuides(MARKETS, query, 'Africa'), MARKETS.filter(market => market.region === 'Africa'));
  }
  for (const query of ['---', ' . , / ', '()!']) {
    assert.deepEqual(filterMarketGuides(MARKETS, query), [], query);
    assert.deepEqual(filterMarketGuides(MARKETS, query, 'Africa'), [], query);
  }
});

test('Kenya joins Africa with KES planning, pinned national USD history and correctly scoped official directories', () => {
  const market = MARKETS.find(item => item.id === 'kenya');
  assert.ok(market);
  assert.deepEqual([market.name, market.city, market.region, market.countryCode, market.worksheetCurrency],
    ['Kenya', 'Nairobi', 'Africa', 'KEN', 'KES']);
  const snapshot = MARKET_FUNDAMENTALS[market.countryCode];
  assert.equal(MARKET_SNAPSHOT_META.observationYear, 2023);
  assert.equal(snapshot.population, 55339003);
  assert.equal(snapshot.gdpUsd, 107440575838.04752);
  assert.equal(historicalGdpAtYear(snapshot, 2014), 68285796514.28962);
  assert.equal(historicalGdpAtYear(snapshot, 2023), snapshot.gdpUsd);
  assert.equal(MARKET_SNAPSHOT_META.gdp.unit, 'current US dollars');
  const sources = {
    customers: ['https://www.knbs.or.ke/'],
    location: ['https://nairobi.go.ke/'],
    setup: ['https://brs.go.ke/', 'https://nairobi.go.ke/'],
  };
  let plans = createMarketPlans();
  assert.match(CITY_RESEARCH_GUIDES.kenya.scope, /Nairobi/);
  for (const lens of Object.keys(sources)) {
    assert.deepEqual(getCityQuestionSources(market, lens).map(source => source.url), sources[lens]);
    plans = setMarketQuestionSaved(plans, 'kenya', lens, true);
  }
  const exported = buildMarketPlanExport(plans, ['kenya'], EDITED).markets[0];
  assert.equal(exported.region, 'Africa');
  assert.equal(exported.cityResearchStartingPoint, 'Nairobi');
  assert.equal(exported.sources.sourceContentsVerified, false);
  assert.equal(exported.sources.sourcePublicationDate, null);
  for (const question of exported.savedResearchQuestions) {
    assert.equal(question.kind, 'unverified-research-prompt');
    assert.deepEqual(question.sources.map(source => source.url), sources[question.lens]);
  }
});

test('Canada maps Toronto to North America and retains the unrounded national USD series from the pinned CSVs', () => {
  const market = MARKETS.find(item => item.id === 'canada');
  assert.ok(market);
  assert.deepEqual([market.name, market.city, market.region, market.countryCode, market.worksheetCurrency],
    ['Canada', 'Toronto', 'North America', 'CAN', 'CAD']);
  const snapshot = MARKET_FUNDAMENTALS[market.countryCode];
  assert.equal(MARKET_SNAPSHOT_META.observationYear, 2023);
  assert.equal(MARKET_SNAPSHOT_META.gdp.unit, 'current US dollars');
  assert.equal(snapshot.population, 40049088);
  const expected = [
    1805749878439.9412, 1556508816217.1401, 1527994741907.425, 1649265644244.095, 1725329192783.024,
    1743725183672.5212, 1655684730000.1936, 2007472181464.1519, 2161483369422.0146, 2140085567791.4514,
  ];
  assert.deepEqual(snapshot.gdpSeries, expected.map((value, index) => ({ year: 2014 + index, value })));
  assert.equal(snapshot.gdpUsd, expected.at(-1));
});

test('saved Toronto prompts preserve national statistics and all three setup jurisdictions as discovery links', () => {
  const market = MARKETS.find(item => item.id === 'canada');
  const setup = 'https://www.canada.ca/en/services/business/start/register-with-gov.html';
  const ontario = 'https://www.ontario.ca/page/ontario-business-registry';
  const toronto = 'https://www.toronto.ca/services-payments/permits-licences-bylaws/';
  const sources = { customers: ['https://www.statcan.gc.ca/en/start'], location: [toronto], setup: [setup, ontario, toronto] };
  const guide = CITY_RESEARCH_GUIDES.canada;
  assert.match(guide.scope, /Toronto/);
  assert.match(guide.scope, /Etobicoke/);
  assert.match(guide.scope, /Mississauga/);
  assert.match(guide.prompts.customers.detail, /census metropolitan area|CMA/i);
  assert.match(guide.prompts.setup.detail, /Mississauga/);
  assert.deepEqual(getMarketDirectories(market).map(entry => entry.source.url), [setup, ontario, ...sources.customers, toronto]);
  let plans = createMarketPlans();
  for (const lens of Object.keys(sources)) {
    const prompt = guide.prompts[lens];
    assert.ok(prompt.question.trim() && prompt.detail.trim(), lens);
    assert.deepEqual(getCityQuestionSources(market, lens).map(source => source.url), sources[lens]);
    plans = setMarketQuestionSaved(plans, 'canada', lens, true);
  }
  const [row] = buildMarketPlanExport(plans, ['canada'], EDITED).markets;
  assert.deepEqual(row.savedResearchQuestions.map(q => q.lens), Object.keys(sources));
  for (const q of row.savedResearchQuestions) {
    assert.equal(q.question, guide.prompts[q.lens].question);
    assert.equal(q.kind, 'unverified-research-prompt');
    assert.equal(q.userFinding, null);
    assert.deepEqual(q.sources.map(source => source.url), sources[q.lens]);
  }
  assert.equal(row.sources.regionalSetup.url, ontario);
  assert.equal(row.sources.sourceContentsVerified, false);
  assert.equal(row.sources.sourcePublicationDate, null);
});
