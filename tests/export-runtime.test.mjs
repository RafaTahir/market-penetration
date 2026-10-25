/** Real PDF/PPTX serialization with synthetic service fixtures; no provider requests. */
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire, syncBuiltinESMExports } from 'node:module';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import JSZip from 'jszip';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const localRequire = createRequire(import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), 'flow-export-test-'));
after(() => rm(temporary, { recursive: true, force: true }));

// Stub the service boundary before module evaluation: importing this harness cannot
// initialize real providers, read credentials, or contact a backend.
const result = await build({
  stdin: {
    contents: `
      export { ExportService } from './src/services/exportService.ts';
      export { jsPDF } from 'jspdf';
      export { default as PptxGenJS } from 'pptxgenjs';
    `,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
  plugins: [{
    name: 'synthetic-export-services',
    setup(builder) {
      builder.onResolve({ filter: /^xlsx$/ }, () => ({ path: localRequire.resolve('xlsx'), external: true }));
      builder.onResolve({ filter: /^\.\/(unifiedDataService|marketDataService)$/ }, args => ({
        path: args.path.slice(2), namespace: 'synthetic-export-services',
      }));
      builder.onLoad({ filter: /.*/, namespace: 'synthetic-export-services' }, args => ({
        contents: args.path === 'unifiedDataService'
          ? 'export class UnifiedDataService { static getInstance() { return globalThis.__flowExportFixtures.economic; } }'
          : 'export class MarketDataService { static getInstance() { return globalThis.__flowExportFixtures.market; } }',
      }));
    },
  }],
});
const bundlePath = join(temporary, 'export-harness.cjs');
await writeFile(bundlePath, result.outputFiles[0].contents);

let fixtureMode = 'synthetic';
const syntheticCountry = {
  country: 'Synthetic test market', gdp: 1.2e12, gdpGrowth: 0, inflation: 0,
  unemployment: 0, population: 2e6, gdpPerCapita: 600000, internetUsers: 1e6,
  exchangeRate: 1, interestRate: 0, source: 'Synthetic fixture only', lastUpdated: '',
  metricEvidence: { gdp: { source: 'Synthetic fixture only', observationPeriod: '2001', retrievedAt: '2020-02-03T00:00:00Z', status: 'reported' } },
};
function fixture(values) {
  if (fixtureMode === 'failed') throw new Error('Intentional synthetic provider failure');
  if (fixtureMode === 'empty') return [];
  if (fixtureMode === 'unattributed') return values.map(record => ({ ...record, source: undefined, metricEvidence: undefined }));
  if (fixtureMode === 'partial') return values.map(record => record.country
    ? { ...record, gdp: null, population: undefined, internetUsers: Number.NaN, gdpPerCapita: undefined, inflation: null, exchangeRate: undefined, interestRate: null, metricEvidence: {} }
    : record.symbol
      ? { ...record, price: undefined, change: null, changePercent: undefined, volume: null }
      : { ...record, rate: null, change: undefined, changePercent: null });
  if (fixtureMode === 'mixed' && values[0]?.country) return [...values, { ...values[0], country: 'Missing GDP fixture', gdp: null }];
  if (fixtureMode === 'unavailableEvidence' && values[0]?.country) return values.map(record => ({ ...record, metricEvidence: { ...record.metricEvidence, gdp: { source: 'Synthetic fixture only', observationPeriod: null, retrievedAt: null, status: 'unavailable' } } }));
  return values;
}
globalThis.__flowExportFixtures = {
  economic: { async getUnifiedEconomicData() { return fixture([syntheticCountry]); } },
  market: {
    async getStockData() {
      return fixture([{ symbol: 'TEST', name: 'Synthetic quote only', price: 123.45, change: 0, changePercent: 0, volume: 0, source: 'Synthetic quote fixture only', observedAt: '', storedAt: '2020-02-03T00:00:00Z', sourceStatus: 'cached-unverified' }]);
    },
    async getCurrencyRates() {
      return fixture([{ pair: 'USD/TEST', rate: 1.25, change: 0, changePercent: 0, source: 'Synthetic FX fixture only', observedAt: '2001-01-02', retrievedAt: '2020-02-03T00:00:00Z', sourceStatus: 'reported' }]);
    },
  },
};
after(() => { delete globalThis.__flowExportFixtures; });

const originalFetch = globalThis.fetch;
let networkAttempts = 0;
const transportTrap = () => {
  networkAttempts++;
  throw new Error('Export tests must not make external requests');
};
globalThis.fetch = async () => transportTrap();
const transports = [
  ...[http, https].flatMap(module => ['request', 'get'].map(key => ({ module, key, original: module[key] }))),
  ...['connect', 'createConnection'].map(key => ({ module: net, key, original: net[key] })),
];
for (const { module, key } of transports) module[key] = transportTrap;
syncBuiltinESMExports();
after(() => {
  globalThis.fetch = originalFetch;
  for (const { module, key, original } of transports) module[key] = original;
  syncBuiltinESMExports();
  assert.equal(networkAttempts, 0);
});
const { ExportService, jsPDF, PptxGenJS } = createRequire(import.meta.url)(bundlePath);
const pdfSnapshots = [];
const pptxSnapshots = [];
const xlsxSnapshots = [];
const XLSX = localRequire('xlsx');
const originalWorkbookSave = XLSX.writeFile;
XLSX.writeFile = (workbook, fileName) => {
  xlsxSnapshots.push({ fileName, bytes: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) });
};
after(() => { XLSX.writeFile = originalWorkbookSave; });
jsPDF.API.save = function (fileName) {
  pdfSnapshots.push({ fileName, bytes: Buffer.from(this.output('arraybuffer')) });
  return this;
};
PptxGenJS.prototype.writeFile = async function ({ fileName }) {
  pptxSnapshots.push({ fileName, bytes: await this.write({ outputType: 'nodebuffer' }) });
  return fileName;
};
const service = ExportService.getInstance();
const selection = { selectedCountries: ['synthetic test market'], selectedCities: [], activeTab: 'overview' };

function pdfText(snapshot) {
  assert.ok(snapshot.fileName.endsWith('.pdf'));
  const text = snapshot.bytes.toString('latin1');
  assert.ok(text.startsWith('%PDF-'));
  assert.match(text, /%%EOF/);
  assert.ok((text.match(/\/Type \/Page\b/g) || []).length >= 7);
  assert.match(text, /Unverified reference/);
  return text;
}

test('PDF export serializes real pages, correct trillion units, and unverified-reference labels', async () => {
  fixtureMode = 'synthetic';
  await service.generatePDFReport(selection);
  const text = pdfText(pdfSnapshots.at(-1));
  assert.match(text, /\$1\.2T/);
  assert.doesNotMatch(text, /\$1200\.0T|LIVE MARKET DATA|Real-Time Intelligence|Data sources: World Bank/);
  assert.match(text, /Synthetic test market/);
  assert.doesNotMatch(text, /NaN|Infinity/);
});

test('legacy PDF entry point has a real jsPDF runtime and retains a labeled report', async () => {
  await service.generatePDFReportOld(selection);
  const text = pdfText(pdfSnapshots.at(-1));
  assert.ok((text.match(/\/Type \/Page\b/g) || []).length >= 10);
  assert.match(text, /Executive Summary/);
});

test('PPTX export writes real charts, country labels, tables and one supported slide number', async () => {
  fixtureMode = 'synthetic';
  await service.generatePowerPointOutline(selection);
  const snapshot = pptxSnapshots.at(-1);
  assert.ok(snapshot.fileName.endsWith('.pptx'));
  const zip = await JSZip.loadAsync(snapshot.bytes);
  assert.equal(zip.file(/^ppt\/slides\/slide\d+\.xml$/).length, 11);
  const charts = await Promise.all(zip.file(/^ppt\/charts\/chart\d+\.xml$/).map(file => file.async('string')));
  assert.equal(charts.length, 2);
  assert.ok(charts.every(chart => chart.includes('1E293B')));
  const digitalChart = charts.find(chart => chart.includes('Internet penetration'));
  assert.ok(digitalChart);
  assert.match(digitalChart, /Synthetic test market/);
  assert.match(digitalChart, /<c:v>50<\/c:v>/);
  const masterFiles = zip.file(/^ppt\/slideMasters\/slideMaster\d+\.xml$/);
  const master = (await Promise.all(masterFiles.map(file => file.async('string')))).join('');
  assert.doesNotMatch(master, /\[\[SLIDE_NUMBER\]\]/);
  assert.match(master, /type="slidenum"/);
  const layouts = (await Promise.all(zip.file(/^ppt\/slideLayouts\/slideLayout\d+\.xml$/).map(file => file.async('string')))).join('');
  assert.match(layouts, /Unverified reference/);
  assert.doesNotMatch(layouts, /\[\[SLIDE_NUMBER\]\]/);
  const slides = (await Promise.all(zip.file(/^ppt\/slides\/slide\d+\.xml$/).map(file => file.async('string')))).join('');
  assert.match(slides, /USD\/TEST/);
  assert.match(slides, /Data Provenance and Limits/);
  assert.match(slides, /observedAt: 2001-01-02/);
  assert.match(slides, /generatedAt: \d{4}-/);
  assert.match(slides, /src\/services\/enhancedPPTXService.ts/);
  assert.match(slides, /<a:tbl>/);
  assert.doesNotMatch(slides, /LIVE MARKET DATA|World Bank, IMF, real-time APIs/);
});

test('XLSX export writes readable sheets with visible limits, provenance, and unavailable unsupported metrics', async () => {
  fixtureMode = 'synthetic';
  await service.generateExcelReport(selection);
  const snapshot = xlsxSnapshots.at(-1);
  assert.ok(snapshot.fileName.endsWith('.xlsx'));
  const workbook = XLSX.read(snapshot.bytes, { type: 'buffer' });
  assert.equal(workbook.SheetNames.length, 10);
  assert.ok(workbook.SheetNames.includes('Market Reference'));
  assert.ok(workbook.SheetNames.includes('Data Provenance'));
  const rows = name => XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 });
  for (const name of workbook.SheetNames) {
    assert.match(workbook.Sheets[name].A1.v, /Unverified reference/);
    assert.doesNotMatch(JSON.stringify(rows(name)), /LIVE MARKET|Last Updated:|Data as of:|refreshes every 5 minutes/);
  }
  const dashboard = rows('Dashboard');
  assert.equal(dashboard.find(row => row[0] === 'Combined GDP')[1], '$1.20T');
  const digitalRow = rows('Digital Economy').find(row => row[0] === syntheticCountry.country);
  assert.equal(digitalRow[2], '50.0');
  assert.equal(digitalRow[6], 'Unavailable');
  assert.equal(digitalRow[7], 'Unavailable');
  const competitorRows = rows('Competitive Landscape');
  const scoresHeader = competitorRows.findIndex(row => row[1] === 'Product Quality');
  assert.deepEqual(competitorRows[scoresHeader + 1].slice(1), Array(7).fill('Unavailable'));
  const provenance = rows('Data Provenance');
  assert.match(provenance.find(row => row[0] === 'generatedAt')[1], /^\d{4}-\d{2}-\d{2}T/);
  assert.match(provenance.find(row => row[0] === 'observedAt')[1], /Unavailable/);
  const economicEvidence = provenance.find(row => row[0] === 'Economic field');
  assert.equal(economicEvidence[4], '2001');
  assert.equal(economicEvidence[5], '2020-02-03T00:00:00Z');
  const fxEvidence = provenance.find(row => row[0] === 'FX rate');
  assert.equal(fxEvidence[4], '2001-01-02');
  assert.equal(fxEvidence[5], '2020-02-03T00:00:00Z');
  assert.equal(provenance.find(row => row[0] === 'Economics')[3], 'Synthetic fixture only');
});

test('empty and failed providers serialize unavailable data without invented quotes, currencies or economic rows', async () => {
  const originalConsoleError = console.error;
  const expectedErrors = [];
  console.error = (...args) => expectedErrors.push(args);
  try {
    for (const mode of ['empty', 'failed']) {
      fixtureMode = mode;
      const focused = { ...selection, selectedCountries: ['singapore'] };
      await service.generatePDFReport(focused);
      const text = pdfText(pdfSnapshots.at(-1));
      assert.match(text, /Stock quotes unavailable/);
      assert.match(text, /FX rates unavailable/);
      assert.doesNotMatch(text, /NaN|Infinity|7245\.50|35\.4200|\$0\.4T|\$0\.0T/);
      await service.generatePowerPointOutline(focused);
      const zip = await JSZip.loadAsync(pptxSnapshots.at(-1).bytes);
      assert.equal(zip.file(/^ppt\/charts\/chart\d+\.xml$/).length, 0);
      const slides = (await Promise.all(zip.file(/^ppt\/slides\/slide\d+\.xml$/).map(file => file.async('string')))).join('');
      assert.match(slides, /Stock quotes unavailable/);
      assert.match(slides, /FX rates unavailable/);
      assert.doesNotMatch(slides, /7245\.50|35\.4200|NaN|Infinity/);
      await service.generateExcelReport(focused);
      const workbook = XLSX.read(xlsxSnapshots.at(-1).bytes, { type: 'buffer' });
      const rows = name => XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 });
      assert.equal(rows('Dashboard').find(row => row[0] === 'Combined GDP')[1], 'Unavailable');
      assert.equal(rows('Market Overview').find(row => row[0] === 'Total Population')[1], 'Unavailable');
      assert.equal(rows('Market Reference').find(row => row[0] === 'Average Index Performance')[1], 'Unavailable');
      assert.ok(rows('Market Overview').every(row => !['Singapore', 'Indonesia', 'Vietnam'].includes(row[0])));
      const provenance = rows('Data Provenance');
      assert.equal(provenance.find(row => row[0] === 'Economics')[2], 'Unavailable');
      assert.equal(provenance.find(row => row[0] === 'Stock quote')[2], 'Unavailable');
      assert.equal(provenance.find(row => row[0] === 'FX rate')[2], 'Unavailable');
      for (const name of workbook.SheetNames) assert.doesNotMatch(JSON.stringify(rows(name)), /NaN|Infinity|7245\.5|35\.42/);
    }
    assert.equal(expectedErrors.length, 9);
  } finally {
    console.error = originalConsoleError;
  }
});

test('unknown numeric fields stay unavailable in report cells, plot omissions and scenarios while actual zero survives', async () => {
  fixtureMode = 'partial';
  await service.generatePDFReport(selection);
  const pdf = pdfText(pdfSnapshots.at(-1));
  assert.match(pdf, /Unavailable/);
  assert.doesNotMatch(pdf, /NaN|Infinity|\$0\.0T/);
  await service.generatePowerPointOutline(selection);
  const zip = await JSZip.loadAsync(pptxSnapshots.at(-1).bytes);
  assert.equal(zip.file(/^ppt\/charts\/chart\d+\.xml$/).length, 0);
  const slides = (await Promise.all(zip.file(/^ppt\/slides\/slide\d+\.xml$/).map(file => file.async('string')))).join('');
  assert.match(slides, /Unavailable/);
  assert.doesNotMatch(slides, /NaN|Infinity/);
  await service.generateExcelReport(selection);
  const workbook = XLSX.read(xlsxSnapshots.at(-1).bytes, { type: 'buffer' });
  const rows = name => XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 });
  assert.equal(rows('Dashboard').find(row => row[0] === 'Combined GDP')[1], 'Unavailable');
  assert.equal(rows('Dashboard').find(row => row[0] === 'Average GDP Growth')[1], '0.0%');
  const country = rows('Market Overview').find(row => row[0] === syntheticCountry.country);
  assert.deepEqual(country.slice(1, 5), ['Unavailable', 'Unavailable', 'Unavailable', '0.0']);
  assert.equal(country[6], '0.0');
  assert.equal(country[11], 'Unavailable');
  const digital = rows('Digital Economy').find(row => row[0] === syntheticCountry.country);
  assert.deepEqual(digital.slice(1), Array(7).fill('Unavailable'));
  const investment = rows('Investment Analysis').find(row => row[0] === syntheticCountry.country);
  assert.equal(investment[1], 'Unavailable');
  assert.equal(investment[4], 'Unavailable');
  const quote = rows('Market Reference').find(row => row[0] === 'TEST');
  assert.deepEqual(quote.slice(2, 6), Array(4).fill('Unavailable'));
  const fx = rows('Market Reference').find(row => row[0] === 'USD/TEST');
  assert.deepEqual(fx.slice(1, 4), Array(3).fill('Unavailable'));
  for (const name of workbook.SheetNames) assert.doesNotMatch(JSON.stringify(rows(name)), /NaN|Infinity/);
});

test('partial aggregate coverage, absent sources and unavailable evidence cannot manufacture factual totals', async () => {
  for (const mode of ['mixed', 'unattributed', 'unavailableEvidence']) {
    fixtureMode = mode;
    await service.generatePDFReport(selection);
    const text = pdfText(pdfSnapshots.at(-1));
    assert.doesNotMatch(text, /NaN|Infinity/);
    const summary = text.slice(text.indexOf('(Executive Summary)'), text.indexOf('(Market Overview)'));
    assert.match(summary, /Unavailable/);
    assert.doesNotMatch(summary, /\$1\.2T/);
    await service.generateExcelReport(selection);
    const workbook = XLSX.read(xlsxSnapshots.at(-1).bytes, { type: 'buffer' });
    const dashboard = XLSX.utils.sheet_to_json(workbook.Sheets.Dashboard, { header: 1 });
    assert.equal(dashboard.find(row => row[0] === 'Combined GDP')[1], 'Unavailable');
    if (mode === 'unattributed') {
      const quotes = XLSX.utils.sheet_to_json(workbook.Sheets['Market Reference'], { header: 1 });
      assert.equal(quotes.find(row => row[0] === 'TEST')[2], 'Unavailable');
      assert.equal(quotes.find(row => row[0] === 'USD/TEST')[1], 'Unavailable');
    }
  }
});

test('enhanced exporters contain no random or hardcoded automatic data fallbacks and label retained examples', async () => {
  for (const file of ['enhancedPDFService.ts', 'enhancedPPTXService.ts', 'enhancedExcelService.ts']) {
    const source = await readFile(join(root, 'src/services', file), 'utf8');
    assert.doesNotMatch(source, /Math\.random|getFallback(?:Economic|Stock|Currency)Data|using fallback/);
    assert.match(source, /Illustrative|ILLUSTRATIVE/);
    assert.match(source, new RegExp('src/services/' + file.replace('.', '\\.')));
    assert.match(source, /generatedAt/);
    assert.match(source, /observedAt/);
  }
});
