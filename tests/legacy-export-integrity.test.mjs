/** Real legacy/report PDF and XLSX serialization, with provider imports replaced before evaluation. */
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const localRequire = createRequire(import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), 'flow-legacy-export-test-'));
after(() => rm(temporary, { recursive: true, force: true }));
const result = await build({
  stdin: {
    contents: `
      export { ExportService } from './src/services/exportService.ts';
      export { ProfessionalDeckService } from './src/services/professionalDeckService.ts';
      export { default as ReportGenerator } from './src/components/ReportGenerator.tsx';
      export { jsPDF } from 'jspdf';
    `,
    resolveDir: root,
    loader: 'tsx',
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  jsx: 'transform',
  write: false,
  plugins: [{
    name: 'legacy-export-boundaries',
    setup(builder) {
      builder.onResolve({ filter: /^xlsx$/ }, () => ({ path: localRequire.resolve('xlsx'), external: true }));
      builder.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'legacy-export-boundaries' }));
      builder.onResolve({ filter: /^lucide-react$/ }, () => ({ path: 'icons', namespace: 'legacy-export-boundaries' }));
      builder.onResolve({ filter: /^\.\/enhanced(PDF|Excel|PPTX)Service$/ }, args => ({
        path: args.path.slice(2), namespace: 'legacy-export-boundaries',
      }));
      builder.onLoad({ filter: /.*/, namespace: 'legacy-export-boundaries' }, args => {
        if (args.path === 'react') return { contents: `
          export const useState = value => [value, () => {}];
          export default { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) };
        ` };
        if (args.path === 'icons') return { contents: 'export const FileText = "FileText", Download = "Download", Presentation = "Presentation", Sparkles = "Sparkles";' };
        const className = args.path[0].toUpperCase() + args.path.slice(1);
        return { contents: `export class ${className} { static getInstance() { return {}; } }` };
      });
    },
  }],
});
const bundlePath = join(temporary, 'legacy-export-harness.cjs');
await writeFile(bundlePath, result.outputFiles[0].contents);

// None of these generators needs transport. Fail if that boundary changes.
const originals = [];
let transportAttempts = 0;
function trap(target, key) {
  originals.push([target, key, target[key]]);
  target[key] = () => { transportAttempts++; throw new Error('Legacy export tests prohibit transport'); };
}
trap(globalThis, 'fetch');
for (const name of ['node:http', 'node:https']) {
  const module = localRequire(name);
  trap(module, 'request');
  trap(module, 'get');
}
const net = localRequire('node:net');
trap(net, 'connect');
trap(net, 'createConnection');
after(() => {
  for (const [target, key, original] of originals) target[key] = original;
  assert.equal(transportAttempts, 0);
});

const { ExportService, ProfessionalDeckService, ReportGenerator, jsPDF } = localRequire(bundlePath);
const pdfSnapshots = [];
jsPDF.API.save = function (fileName) {
  pdfSnapshots.push({ fileName, bytes: Buffer.from(this.output('arraybuffer')), pages: this.getNumberOfPages() });
  return this;
};
const XLSX = localRequire('xlsx');
const originalWorkbookSave = XLSX.writeFile;
const workbooks = [];
XLSX.writeFile = workbook => workbooks.push(XLSX.read(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer' }));
after(() => { XLSX.writeFile = originalWorkbookSave; });
const selection = { selectedCountries: ['Singapore'], selectedCities: [], activeTab: 'overview' };

function pdfText(snapshot) {
  const text = snapshot.bytes.toString('latin1');
  assert.ok(text.startsWith('%PDF-'));
  assert.match(text, /%%EOF/);
  assert.doesNotMatch(text, /NaN|Infinity|World Bank|IMF|updated every 5 minutes|5 Minutes|Proven Data/);
  return text;
}

function buttons(node) {
  if (!node || typeof node !== 'object') return [];
  const children = node.props?.children || [];
  return [...(node.type === 'button' ? [node] : []), ...children.flat(Infinity).flatMap(buttons)];
}

test('professional deck labels every slide as a static template with creation and missing observation dates', async () => {
  await ProfessionalDeckService.getInstance().generateProfessionalDeck(selection);
  const snapshot = pdfSnapshots.at(-1);
  const text = pdfText(snapshot);
  assert.equal(snapshot.pages, 8);
  assert.equal((text.match(/Source: src\/services\/professionalDeckService\.ts/g) || []).length, snapshot.pages);
  assert.equal((text.match(/observedAt: unavailable/g) || []).length, snapshot.pages);
  assert.equal((text.match(/generatedAt: \d{4}-\d{2}-\d{2}T/g) || []).length, snapshot.pages);
  assert.match(text, /Illustrative template/);
  assert.doesNotMatch(text, /Live Market Data|Real-Time Insights|real-time APIs|1000\+/);
});

test('written-report route identifies fixed business scenarios on every exported page', () => {
  const writtenButton = buttons(ReportGenerator()).find(button => button.props.onClick.name === 'generateWrittenReport');
  assert.ok(writtenButton);
  writtenButton.props.onClick();
  const snapshot = pdfSnapshots.at(-1);
  const text = pdfText(snapshot);
  assert.ok(snapshot.pages >= 5);
  assert.equal((text.match(/Source: src\/components\/ReportGenerator\.tsx/g) || []).length, snapshot.pages);
  assert.equal((text.match(/observedAt: unavailable/g) || []).length, snapshot.pages);
  assert.equal((text.match(/Illustrative planning example/g) || []).length, snapshot.pages);
  assert.match(text, /ILLUSTRATIVE ROI ASSUMPTION/);
});

test('legacy PDF keeps static examples and code provenance visible on every page', async () => {
  await ExportService.getInstance().generatePDFReportOld(selection);
  const snapshot = pdfSnapshots.at(-1);
  const text = pdfText(snapshot);
  assert.equal((text.match(/Source: src\/services\/exportService\.ts/g) || []).length, snapshot.pages);
  assert.equal((text.match(/illustrative static example/g) || []).length, snapshot.pages);
  assert.match(text, /Illustrative: Population/);
  assert.match(text, /generatedAt: \d{4}-\d{2}-\d{2}T/);
});

test('legacy spreadsheet identifies all fixed tables as examples with a code source and unavailable observation dates', async () => {
  await ExportService.getInstance().generateExcelReportOld(selection);
  const workbook = workbooks.at(-1);
  assert.equal(workbook.SheetNames.length, 5);
  for (const name of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 });
    assert.match(rows[0][0], /Illustrative static example/);
    assert.deepEqual(rows[1], ['Source', 'src/services/exportService.ts']);
    assert.match(rows[2][1], /Unavailable/);
    assert.match(rows[3][1], /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(rows[3][2], 'Export creation only');
  }
});
