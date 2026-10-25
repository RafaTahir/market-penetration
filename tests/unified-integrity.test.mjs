/** Regression contracts for missing metrics, source periods, and financial gaps. */
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test, { after, beforeEach } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const temporary = await mkdtemp(join(tmpdir(), 'flow-unified-integrity-'));
const result = await build({
  stdin: { contents: "export { UnifiedDataService } from './src/services/unifiedDataService.ts'; export { MarketDataService } from './src/services/marketDataService.ts'; export { CaseStudyService } from './src/services/caseStudyService.ts';", resolveDir: root, loader: 'ts' },
  bundle: true, platform: 'node', format: 'cjs', write: false,
  plugins: [{ name: 'guarded-integrity-fixtures', setup(builder) {
    builder.onResolve({ filter: /^\.\/(worldBankService|imfService|marketHoursService|browserCacheService|finnhubService|supabaseClient)$/ }, args => ({ path: args.path.slice(2), namespace: 'fixture' }));
    builder.onResolve({ filter: /^axios$/ }, () => ({ path: 'axios', namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => {
      const fixtures = {
        worldBankService: 'export class WorldBankService {static getInstance(){return {getAllEconomicIndicators:async()=>globalThis.__integrity.wb()}}}',
        imfService: 'export class IMFService {static getInstance(){return {getAllEconomicData:async()=>globalThis.__integrity.imf()}}}',
        marketHoursService: 'export class MarketHoursService {static getInstance(){return {}}}',
        finnhubService: 'export class FinnhubService {static getInstance(){return {getAllCachedStockData:async()=>globalThis.__integrity.stocks}}}',
        browserCacheService: 'export class BrowserCacheService {static getInstance(){return {get:k=>globalThis.__integrity.cache.get(k)||null,getStale:()=>null,set:(k,v)=>globalThis.__integrity.cache.set(k,v)}}}',
        supabaseClient: 'export const isSupabaseConfigured=false; export const supabase=new Proxy({}, {get(){throw new Error("Unexpected backend access")}});',
        axios: 'export default {get:async()=>globalThis.__integrity.fx()}',
      };
      return { contents: fixtures[args.path] };
    });
  } }],
});
const bundle = join(temporary, 'integrity.cjs');
await writeFile(bundle, result.outputFiles[0].contents);
const { UnifiedDataService, MarketDataService, CaseStudyService } = createRequire(import.meta.url)(bundle);
const originalFetch = globalThis.fetch;
beforeEach(() => {
  globalThis.fetch = () => { throw new Error('Unexpected external request'); };
  globalThis.__integrity = {
    wb: () => ({}), imf: () => ({}), fx: () => { throw new Error('Provider unavailable'); },
    stocks: [], cache: new Map(),
  };
  MarketDataService.instance = undefined;
});
after(async () => { globalThis.fetch = originalFetch; delete globalThis.__integrity; await rm(temporary, { recursive: true, force: true }); });

test('provider errors or absent records yield no invented economic, stock, FX, or synchronous macro rows', async () => {
  __integrity.wb = () => { throw new Error('Unavailable'); };
  __integrity.imf = () => { throw new Error('Unavailable'); };
  assert.deepEqual(await new UnifiedDataService().getUnifiedEconomicData(['Singapore']), []);
  const market = MarketDataService.getInstance();
  assert.deepEqual(await market.getStockData(['UNKNOWN']), []);
  assert.deepEqual(await market.getCurrencyRates(), []);
  assert.deepEqual(market.getEconomicIndicators(), []);
});

test('sparse provider rows preserve true zero and unknown metrics rather than injecting constants', async () => {
  __integrity.wb = () => ({ Singapore: { gdp: 0, gdpObservationPeriod: '2023', gdpRetrievedAt: '2026-10-25T04:00:00Z', inflation: 0, inflationObservationPeriod: '2024' } });
  const [row] = await new UnifiedDataService().getUnifiedEconomicData(['Singapore']);
  assert.equal(row.gdp, 0);
  assert.equal(row.inflation, 0);
  assert.equal(row.population, null);
  assert.equal(row.interestRate, null);
  assert.equal(row.exchangeRate, null);
  assert.equal(row.lastUpdated, '');
  assert.equal(row.metricEvidence.gdp.observationPeriod, '2023');
  assert.equal(row.metricEvidence.gdp.retrievedAt, '2026-10-25T04:00:00Z');
  assert.equal(row.metricEvidence.exchangeRate.status, 'unavailable');
  assert.match(row.source, /not independently verified/);
});

test('only matching observation periods support derived internet counts', async () => {
  __integrity.wb = () => ({ Singapore: { population: 2, populationObservationPeriod: '2023', internetUsers: 50, internetUsersObservationPeriod: '2024' } });
  assert.equal((await new UnifiedDataService().getUnifiedEconomicData(['Singapore']))[0].internetUsers, null);
  __integrity.cache.clear();
  __integrity.wb = () => ({ Singapore: { population: 2, populationObservationPeriod: '2023', internetUsers: 50, internetUsersObservationPeriod: '2023' } });
  const [row] = await new UnifiedDataService().getUnifiedEconomicData(['Singapore']);
  assert.equal(row.internetUsers, 1e6);
  assert.equal(row.metricEvidence.internetUsers.status, 'derived');
});

test('forecast and current-year IMF growth cannot silently become historical actual growth', async () => {
  const year = new Date().getUTCFullYear();
  __integrity.imf = () => ({ Singapore: { gdpGrowthHistory: [{ year: year + 1, value: 99, dataStatus: 'forecast' }, { year, value: 88, dataStatus: 'estimate-or-forecast' }, { year: year - 1, value: 0, dataStatus: 'unknown' }] } });
  const [row] = await new UnifiedDataService().getUnifiedEconomicData(['Singapore']);
  assert.equal(row.gdpGrowth, 0);
  assert.equal(row.metricEvidence.gdpGrowth.observationPeriod, String(year - 1));
  assert.match(row.metricEvidence.gdpGrowth.limitation, /classification has not been independently verified/);
});

test('unknown countries and old fallback cache namespaces cannot supply unrelated facts', async () => {
  let calls = 0;
  __integrity.wb = () => { calls++; return {}; };
  __integrity.cache.set('economic_v2_Singapore', [{ country: 'Singapore', gdp: 999 }]);
  assert.deepEqual(await new UnifiedDataService().getUnifiedEconomicData(['Singapore']), []);
  calls = 0;
  assert.deepEqual(await new UnifiedDataService().getUnifiedEconomicData(['Atlantis']), []);
  assert.equal(calls, 0);
});

test('missing stored quote fields remain null; valid zero changes and volume remain zero', async () => {
  __integrity.stocks = [
    { symbol: 'A', name: 'Synthetic fixture only', price: 10, data_source: 'Fixture provider', observed_at: '2023-01-02T00:00:00Z', timestamp: '2026-10-25T00:00:00Z' },
    { symbol: 'B', name: 'Synthetic fixture only', price: 20, data_source: 'Fixture provider', observed_at: '2023-01-02T00:00:00Z', change: 0, change_percent: 0, volume: 0, timestamp: '2026-10-25T00:00:00Z' },
  ];
  const rows = await MarketDataService.getInstance().getStockData(['A', 'B']);
  assert.equal(rows[0].change, null);
  assert.equal(rows[0].changePercent, null);
  assert.equal(rows[0].volume, null);
  assert.equal(rows[0].observedAt, '2023-01-02T00:00:00Z');
  assert.equal(rows[0].sourceStatus, 'cached-unverified');
  assert.equal(rows[1].volume, 0);
  assert.equal(rows[1].change, 0);
});

test('legacy quote rows without source/observation evidence are unavailable', async () => {
  __integrity.stocks = [{ symbol: 'A', name: 'Unattributed fixture', price: 123, change: 0, change_percent: 0, volume: 0, timestamp: new Date().toISOString() }];
  assert.deepEqual(await MarketDataService.getInstance().getStockData(['A']), []);
});

test('FX first comparison is unknown and stale cache retains the original provider date', async () => {
  __integrity.fx = () => ({ data: { date: '2023-01-02', rates: { SGD: 1.5 } } });
  const market = MarketDataService.getInstance();
  const [first] = await market.getCurrencyRates();
  assert.equal(first.observedAt, '2023-01-02');
  assert.notEqual(first.retrievedAt.slice(0, 10), first.observedAt);
  assert.equal(first.change, null);
  assert.equal(first.changePercent, null);
  market.lastCurrencyUpdate = 0;
  __integrity.fx = () => { throw new Error('Unavailable'); };
  const [stale] = await market.getCurrencyRates();
  assert.equal(stale.observedAt, '2023-01-02');
  assert.equal(stale.retrievedAt, first.retrievedAt);
  assert.equal(stale.sourceStatus, 'cached-unverified');
});

test('source directories contain discovery links, never fabricated publication dates', async () => {
  const rows = await new UnifiedDataService().getInstitutionalReports();
  assert.ok(rows.length > 0);
  assert.ok(rows.every(row => row.publicationDate === '' && row.type === 'Reference link (unverified)'));
});


test('case examples are explicit opt-in and cannot inherit construction-time freshness', async () => {
  const service = CaseStudyService.getInstance();
  assert.deepEqual(await service.getCaseStudies(), []);
  const examples = await service.getCaseStudies(undefined, { includeReferenceExamples: true });
  assert.ok(examples.length > 0);
  assert.ok(examples.every(item => item.provenance === 'bundled-reference' && item.lastUpdated === ''));
});
