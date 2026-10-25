/** Provider parsing contracts. Every response below is a synthetic fixture; no live requests. */
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import https from 'node:https';
import { build } from 'esbuild';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const temporary = await mkdtemp(join(tmpdir(), 'provider-integrity-'));
after(() => rm(temporary, { recursive: true, force: true }));

const requests = [];
const databaseReads = [];
let transport = () => { throw new Error('Unexpected synthetic transport call'); };
let database = () => { throw new Error('Unexpected database read'); };
let forbiddenAttempts = 0;
const rejectExternal = () => {
  forbiddenAttempts++;
  throw new Error('Provider tests cannot make external requests or database writes');
};
const originalFetch = globalThis.fetch;
const originalHttpRequest = http.request;
const originalHttpsRequest = https.request;
globalThis.fetch = rejectExternal;
http.request = rejectExternal;
https.request = rejectExternal;
after(() => {
  globalThis.fetch = originalFetch;
  http.request = originalHttpRequest;
  https.request = originalHttpsRequest;
  delete globalThis.__providerIntegrityFixtures;
  assert.equal(forbiddenAttempts, 0, 'No external request or database mutation is permitted');
});

globalThis.__providerIntegrityFixtures = {
  async request(url, options) {
    requests.push({ url, options });
    return transport(url, options);
  },
  from(table) {
    const query = { table, filters: [] };
    databaseReads.push(query);
    const chain = {
      select() { return chain; },
      eq(...filter) { query.filters.push(filter); return chain; },
      ilike(...filter) { query.filters.push(filter); return chain; },
      order() { return chain; },
      limit() { return Promise.resolve(database(query)); },
      maybeSingle() { return Promise.resolve(database(query)); },
      insert: rejectExternal,
      upsert: rejectExternal,
      update: rejectExternal,
      delete: rejectExternal,
    };
    return chain;
  },
};

async function loadProviders(name, configuredKey) {
  const result = await build({
    stdin: {
      contents: `
        export { WorldBankService } from './src/services/worldBankService.ts';
        export { IMFService } from './src/services/imfService.ts';
        export { OECDService } from './src/services/oecdService.ts';
        export { TradeDataService } from './src/services/tradeDataService.ts';
        export { AlphaVantageService } from './src/services/alphaVantageService.ts';
      `,
      resolveDir: root,
      loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    define: { 'import.meta.env': JSON.stringify({ VITE_ALPHAVANTAGE_API_KEY: configuredKey }) },
    plugins: [{
      name: 'isolated-provider-fixtures',
      setup(builder) {
        builder.onResolve({ filter: /^axios$/ }, () => ({ path: 'axios', namespace: 'provider-fixtures' }));
        builder.onResolve({ filter: /^\.\/supabaseClient$/ }, () => ({ path: 'supabase', namespace: 'provider-fixtures' }));
        builder.onLoad({ filter: /.*/, namespace: 'provider-fixtures' }, args => ({
          contents: args.path === 'axios'
            ? 'export default { get(...args) { return globalThis.__providerIntegrityFixtures.request(...args); } };'
            : 'export const supabase = { from(...args) { return globalThis.__providerIntegrityFixtures.from(...args); } };',
        }));
      },
    }],
  });
  const output = join(temporary, `${name}.cjs`);
  await writeFile(output, result.outputFiles[0].contents);
  return createRequire(import.meta.url)(output);
}

// This literal is a fixture token in an isolated transport, never a real API key.
const providers = await loadProviders('configured', 'synthetic-fixture-only');
const unconfigured = await loadProviders('unconfigured', '');
const demoConfigured = await loadProviders('demo-configured', 'demo');
const wb = providers.WorldBankService.getInstance();
const imf = providers.IMFService.getInstance();
const oecd = providers.OECDService.getInstance();
const trade = providers.TradeDataService.getInstance();
const alpha = providers.AlphaVantageService.getInstance();

function reset() {
  requests.length = 0;
  databaseReads.length = 0;
  transport = () => { throw new Error('Unexpected synthetic transport call'); };
  database = () => { throw new Error('Unexpected database read'); };
}

async function withExpectedFailure(action) {
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  try { return await action(); }
  finally { console.error = originalError; console.warn = originalWarn; }
}

function assertAnnual(point, year) {
  assert.equal(point.year, year);
  assert.equal(point.observationPeriod, String(year));
  assert.equal(point.lastUpdated, '', 'An annual period must not invent an observation day');
  assert.match(point.retrievedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(point.sourceStatus, 'reported');
}

function wbPoint(value, date = '2023') {
  return { country: { value: 'Indonesia' }, countryiso3code: 'IDN', value, date };
}

test('World Bank real response parsing preserves zero, validates values and separates annual periods from retrieval', async () => {
  reset();
  transport = () => ({ data: [{}, [
    wbPoint(0), wbPoint(null), wbPoint(undefined), wbPoint('not-a-number'), wbPoint(Infinity),
    wbPoint(9, '2023-bad'), { ...wbPoint(9), countryiso3code: 'SGP' },
    { ...wbPoint(9), country: { value: '' } },
  ]] });
  for (const method of ['getGDPData', 'getInflationData', 'getUnemploymentData', 'getPopulationData', 'getInternetUsersData']) {
    const points = await wb[method](['indonesia']);
    assert.equal(points.length, 1, method);
    assert.equal(points[0].value, 0, method);
    assertAnnual(points[0], 2023);
    assert.equal(points[0].source, 'World Bank');
  }
  assert.equal(requests.length, 5);
  assert.equal(databaseReads.length, 0);
});

test('World Bank unknown selections and transport failures return no substitute country or numeric data', async () => {
  reset();
  for (const method of ['getGDPData', 'getInflationData', 'getUnemploymentData', 'getPopulationData', 'getInternetUsersData']) {
    for (const country of ['unknown-fixture-country', '__proto__', 'constructor', 'toString']) {
      assert.deepEqual(await wb[method]([country]), []);
    }
  }
  assert.equal(requests.length, 0);
  transport = () => { throw new Error('Intentional fixture outage'); };
  assert.deepEqual(await withExpectedFailure(() => wb.getAllEconomicIndicators(['indonesia'])), {});
  assert.equal(requests.length, 5);
});

test('World Bank aggregate keeps each latest field year and its zero rather than stamping today', async () => {
  reset();
  transport = url => {
    assert.match(url, /api\.worldbank\.org\/v2\/country\/IDN\/indicator\//);
    const gdp = url.endsWith('NY.GDP.MKTP.CD');
    return { data: [{}, [wbPoint(gdp ? 0 : 4, '2023'), wbPoint(gdp ? 1e9 : 3, '2022')]] };
  };
  const data = (await wb.getAllEconomicIndicators(['indonesia'])).Indonesia;
  assert.equal(data.gdp, 0);
  assert.equal(data.gdpYear, 2023);
  assert.equal(data.gdpObservationPeriod, '2023');
  assert.equal(data.gdpSourceStatus, 'reported');
  assert.equal(data.lastUpdated, '');
});

function imfResponse(indicator) {
  const year = new Date().getUTCFullYear();
  return { data: { values: { [indicator]: { IDN: { '2021': false, '2022': '3', '2023': '0', 'bad-year': '8', '2024': null, [year]: '10', [year + 1]: '20', [year + 2]: 'not-numeric' } } } } };
}

test('IMF parser keeps zero, rejects invalid points and marks forecasts separately from prior-year status', async () => {
  reset();
  transport = url => imfResponse(url.split('/').at(-1));
  const year = new Date().getUTCFullYear();
  for (const method of ['getGDPGrowth', 'getInflationRate', 'getGDPPerCapita', 'getCurrentAccountBalance']) {
    const points = await imf[method](['indonesia']);
    const zero = points.find(point => point.year === 2023);
    assert.ok(zero, method);
    assert.equal(zero.value, 0, method);
    assertAnnual(zero, 2023);
    assert.equal(zero.dataStatus, 'unknown');
    assert.equal(points.find(point => point.year === year).dataStatus, 'estimate-or-forecast');
    assert.equal(points.find(point => point.year === year + 1).dataStatus, 'forecast');
    assert.ok(points.every(point => Number.isFinite(point.value) && Number.isInteger(point.year)));
  }
});

test('IMF aggregate does not select future projections as historical scalar indicators', async () => {
  reset();
  transport = url => imfResponse(url.split('/').at(-1));
  const data = (await imf.getAllEconomicData(['indonesia'])).Indonesia;
  for (const field of ['inflation', 'gdpPerCapita', 'currentAccount']) {
    assert.equal(data[field], 0, field);
    assert.equal(data[`${field}Year`], 2023, field);
    assert.equal(data[`${field}ObservationPeriod`], '2023', field);
    assert.equal(data[`${field}DataStatus`], 'unknown', field);
  }
  assert.equal(data.lastUpdated, '');
  assert.ok(data.gdpGrowthHistory.some(point => point.dataStatus === 'forecast'));
});

test('IMF unsupported country and failed source remain unavailable', async () => {
  reset();
  for (const method of ['getGDPGrowth', 'getInflationRate', 'getGDPPerCapita', 'getCurrentAccountBalance']) {
    for (const country of ['unknown-fixture-country', '__proto__', 'constructor', 'toString']) {
      assert.deepEqual(await imf[method]([country]), []);
    }
  }
  assert.equal(requests.length, 0);
  transport = () => { throw new Error('Intentional fixture outage'); };
  assert.deepEqual(await withExpectedFailure(() => imf.getAllEconomicData(['indonesia'])), {});
});

test('IMF catalogue exposes official discovery directories without invented report dates or findings', () => {
  reset();
  const entries = imf.getIMFReports();
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.equal(new URL(entry.url).origin, 'https://www.imf.org');
    assert.equal(entry.type, 'Official reference directory');
    assert.equal(entry.sourceStatus, 'reference-directory');
    assert.equal(entry.publicationDate, '');
    assert.match(entry.summary, /directory/i);
    assert.match(entry.summary, /verify/i);
    assert.doesNotMatch(`${entry.title} ${entry.summary}`, /\d|latest|quarterly|comprehensive analysis/i);
  }
  assert.equal(requests.length, 0);
  assert.equal(databaseReads.length, 0);
});

function oecdResponse(nested = true, withUnit = true) {
  const dimensions = {
    series: [
      { id: 'REF_AREA', values: [{ id: 'IDN', name: 'Indonesia' }] },
      ...(withUnit ? [
        { id: 'UNIT_MEASURE', values: [{ id: 'USD', name: 'US dollars' }] },
        { id: 'UNIT_MULT', values: [{ id: '6' }] },
      ] : []),
    ],
    observation: [{ id: 'TIME_PERIOD', values: [{ id: '2023' }, { id: '2022' }] }],
  };
  const body = {
    dataSets: [{ series: { [withUnit ? '0:0:0' : '0']: { observations: { '0': [0], '1': [100] } } } }],
    structure: { dimensions },
  };
  return { data: nested ? { data: body } : body };
}

test('OECD SDMX GDP parser preserves zero and reads declared units and periods in supported envelopes', async () => {
  reset();
  for (const nested of [true, false]) {
    transport = url => {
      assert.match(url, /sdmx\.oecd\.org\/public\/rest\/data/);
      return oecdResponse(nested);
    };
    const points = await oecd.getGDPData(['indonesia']);
    const zero = points.find(point => point.year === 2023);
    assert.ok(zero);
    assert.equal(zero.value, 0);
    assertAnnual(zero, 2023);
    assert.equal(zero.unit, 'US dollars (10^6)');
  }
  assert.equal(databaseReads.length, 0, 'Legacy OECD cache does not establish provider provenance');
  transport = () => {
    const mismatched = oecdResponse();
    mismatched.data.data.structure.dimensions.series[0].values[0].id = 'SGP';
    return mismatched;
  };
  assert.deepEqual(await oecd.getGDPData(['indonesia']), [], 'An explicit different country must not be relabeled');
});

test('OECD missing unit, unknown country, unavailable API and unimplemented metrics never emit static authoritative values', async () => {
  reset();
  transport = () => oecdResponse(true, false);
  assert.deepEqual(await oecd.getGDPData(['indonesia']), []);
  const before = requests.length;
  for (const country of ['unknown-fixture-country', '__proto__', 'constructor', 'toString']) {
    assert.deepEqual(await oecd.getGDPData([country]), []);
  }
  for (const method of ['getFDIData', 'getTradeBalance', 'getProductivityData']) {
    assert.deepEqual(await oecd[method](['indonesia']), []);
  }
  assert.equal(requests.length, before);
  assert.equal(databaseReads.length, 0);
  transport = () => { throw new Error('Intentional fixture outage'); };
  assert.deepEqual(await withExpectedFailure(() => oecd.getAllIndicators(['indonesia'])), {});
});

function tradeRecord(overrides = {}) {
  return {
    country_code: '360', partner_country: 'Synthetic partner', trade_flow: 'Export',
    commodity_code: '01', commodity_name: 'Synthetic goods', trade_value_usd: 0,
    year: 2023, month: null, data_source: 'UN Comtrade', timestamp: '2025-07-01T00:00:00Z',
    ...overrides,
  };
}

test('trade cache parsing preserves reported zero and labels cached, incomplete coverage without inventing a source refresh', async () => {
  reset();
  database = query => {
    assert.equal(query.table, 'trade_statistics');
    return { data: [tradeRecord()], error: null };
  };
  const flows = await trade.getTradeFlows('indonesia', 2023, 'Export');
  assert.equal(flows.length, 1);
  assert.equal(flows[0].tradeValue, 0);
  assert.equal(flows[0].sourceStatus, 'cached-unverified');
  assert.equal(flows[0].observationPeriod, '2023');
  assert.equal(requests.length, 0);
});

test('trade rejects unknown countries, mismatched rows, malformed values and estimated fallback records', async () => {
  reset();
  for (const country of ['unknown-fixture-country', '__proto__', 'constructor', 'toString']) {
    assert.deepEqual(await withExpectedFailure(() => trade.getTradeFlows(country)), []);
  }
  assert.equal(databaseReads.length, 0);
  database = () => ({ data: [
    tradeRecord({ country_code: '702' }), tradeRecord({ year: 2022 }),
    tradeRecord({ trade_flow: 'Other' }), tradeRecord({ trade_flow: 'Import' }),
    tradeRecord({ trade_value_usd: null }), tradeRecord({ trade_value_usd: Infinity }),
    tradeRecord({ data_source: null }), tradeRecord({ month: 13 }),
    tradeRecord({ data_source: 'UN Comtrade (Estimated)' }), tradeRecord({ data_source: 'Demo' }),
  ], error: null });
  assert.deepEqual(await trade.getTradeFlows('indonesia', 2023, 'Export'), []);
  database = () => ({ data: null, error: new Error('Intentional fixture outage') });
  assert.deepEqual(await withExpectedFailure(() => trade.getTradeFlows('indonesia')), []);
  assert.equal(await withExpectedFailure(() => trade.getTradeBalance('indonesia')), null);
  assert.deepEqual(await withExpectedFailure(() => trade.getTopTradingPartners('indonesia')), []);
  assert.equal(requests.length, 0);
});

test('trade balance remains unavailable for missing directions and clearly scopes sums of available records', async () => {
  reset();
  database = query => {
    const direction = query.filters.find(([field]) => field === 'trade_flow')?.[1];
    return { data: direction === 'Import' ? [] : [tradeRecord()], error: null };
  };
  assert.equal(await trade.getTradeBalance('indonesia', 2023), null);
  database = query => {
    const direction = query.filters.find(([field]) => field === 'trade_flow')?.[1];
    return { data: [tradeRecord({ trade_flow: direction, trade_value_usd: direction === 'Export' ? 0 : 5 })], error: null };
  };
  const balance = await trade.getTradeBalance('indonesia', 2023);
  assert.equal(balance.exports, 0);
  assert.equal(balance.imports, 5);
  assert.equal(balance.balance, -5);
  assert.equal(balance.coverage, 'available-records');
  assert.equal(balance.sourceStatus, 'cached-unverified');
});

// Advance only the throttle's monotonic read. No timers or external API budget are used.
const originalNow = Date.now;
let simulatedNow = originalNow();
Date.now = () => (simulatedNow += 20000);
after(() => { Date.now = originalNow; });

test('Alpha Vantage missing and demo configuration produce no substitute quotes and make no requests', async () => {
  reset();
  for (const module of [unconfigured, demoConfigured]) {
    const service = module.AlphaVantageService.getInstance();
    assert.equal(await service.getStockQuote('UNKNOWN'), null);
    assert.equal(await service.getForexRate('USD', 'UNKNOWN'), null);
    assert.deepEqual(await service.getCommodityPrices(), []);
    assert.deepEqual(await service.getSEAMarketData(), []);
  }
  assert.equal(requests.length, 0);
  assert.equal(databaseReads.length, 0);
});

test('Alpha Vantage stock parser preserves zero and the provider trading day, leaving unsupported fundamentals unavailable', async () => {
  reset();
  transport = (url, options) => {
    assert.equal(options.params.function, 'GLOBAL_QUOTE');
    return { data: { 'Global Quote': {
      '01. symbol': 'SYNTHETIC', '05. price': '0', '06. volume': '0',
      '07. latest trading day': '2023-09-28', '09. change': '0', '10. change percent': '0%',
    } } };
  };
  const point = await alpha.getStockQuote('SYNTHETIC');
  assert.equal(point.price, 0);
  assert.equal(point.volume, 0);
  assert.equal(point.change, 0);
  assert.equal(point.changePercent, 0);
  assert.equal(point.lastUpdated, '2023-09-28');
  assert.equal(point.marketCap, null);
  assert.equal(point.peRatio, null);
  assert.equal(point.dividendYield, null);
  assert.match(point.retrievedAt, /^\d{4}-\d{2}-\d{2}T/);
  transport = () => ({ data: { 'Global Quote': { '05. price': '12.5' } } });
  const partial = await alpha.getStockQuote('SYNTHETIC');
  assert.equal(partial.price, 12.5);
  assert.equal(partial.lastUpdated, '');
  assert.equal(partial.volume, null);
  assert.equal(partial.change, null);
  assert.equal(partial.changePercent, null);
  assert.equal(databaseReads.length, 0);
});

test('Alpha Vantage empty, malformed, rate-limited and failed stock responses remain unavailable', async () => {
  reset();
  for (const data of [{}, { Note: 'Synthetic rate limit' }, { 'Global Quote': { '05. price': 'not-numeric' } }]) {
    transport = () => ({ data });
    assert.equal(await alpha.getStockQuote('SYNTHETIC'), null);
  }
  transport = () => ({ data: { 'Global Quote': { '01. symbol': 'DIFFERENT', '05. price': '12.5' } } });
  assert.equal(await alpha.getStockQuote('SYNTHETIC'), null, 'An explicit different symbol cannot be relabeled');
  transport = () => { throw new Error('Intentional fixture outage'); };
  assert.equal(await withExpectedFailure(() => alpha.getStockQuote('UNKNOWN')), null);
  assert.equal(databaseReads.length, 0);
});

test('Alpha Vantage forex keeps provider zero and source timestamp while absent fields remain unavailable', async () => {
  reset();
  transport = () => ({ data: { 'Realtime Currency Exchange Rate': {
    '1. From_Currency Code': 'USD', '3. To_Currency Code': 'SGD', '5. Exchange Rate': '0',
    '6. Last Refreshed': '2023-09-28 12:34:56', '7. Time Zone': 'UTC',
  } } });
  const point = await alpha.getForexRate('USD', 'SGD');
  assert.equal(point.rate, 0);
  assert.equal(point.lastUpdated, '2023-09-28 12:34:56');
  assert.equal(point.observationPeriod, '2023-09-28 12:34:56');
  assert.equal(point.sourceTimeZone, 'UTC');
  assert.equal(point.bid, null);
  assert.equal(point.ask, null);
  transport = () => ({ data: { 'Realtime Currency Exchange Rate': { '5. Exchange Rate': '1.25' } } });
  assert.equal((await alpha.getForexRate('USD', 'SGD')).lastUpdated, '');
  transport = () => ({ data: { 'Realtime Currency Exchange Rate': { '5. Exchange Rate': '-' } } });
  assert.equal(await alpha.getForexRate('USD', 'SGD'), null);
  transport = () => ({ data: { 'Realtime Currency Exchange Rate': {
    '1. From_Currency Code': 'EUR', '3. To_Currency Code': 'SGD', '5. Exchange Rate': '1.25',
  } } });
  assert.equal(await alpha.getForexRate('USD', 'SGD'), null, 'An explicit different currency cannot be relabeled');
  transport = () => { throw new Error('Intentional fixture outage'); };
  assert.equal(await withExpectedFailure(() => alpha.getForexRate('USD', 'SGD')), null);
  assert.equal(databaseReads.length, 0);
});

test('Alpha Vantage commodity parser keeps source periods, zero and unavailable comparisons without generating non-finite values', async () => {
  reset();
  transport = (url, options) => {
    assert.ok(['WTI', 'BRENT', 'NATURAL_GAS', 'COPPER', 'ALUMINUM'].includes(options.params.function));
    return { data: { unit: 'Synthetic source unit', data: [{ date: '2023-09-01', value: '0' }, { date: '2023-08-01', value: '0' }] } };
  };
  const points = await alpha.getCommodityPrices();
  assert.equal(points.length, 5);
  for (const point of points) {
    assert.equal(point.price, 0);
    assert.equal(point.lastUpdated, '2023-09-01');
    assert.equal(point.change, 0);
    assert.equal(point.changePercent, null);
    assert.equal(point.unit, 'Synthetic source unit');
  }
  transport = () => ({ data: { data: [{ value: '12.5' }] } });
  for (const point of await alpha.getCommodityPrices()) {
    assert.equal(point.price, 12.5);
    assert.equal(point.lastUpdated, '');
    assert.equal(point.change, null);
    assert.equal(point.changePercent, null);
    assert.equal(point.unit, '', 'Missing source units must not be invented from a commodity name');
  }
  transport = () => ({ data: { data: [{ value: '.' }] } });
  assert.deepEqual(await alpha.getCommodityPrices(), []);
  transport = () => { throw new Error('Intentional fixture outage'); };
  assert.deepEqual(await withExpectedFailure(() => alpha.getCommodityPrices()), []);
  assert.equal(databaseReads.length, 0);
});
