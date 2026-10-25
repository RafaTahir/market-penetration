# Flow data-integrity audit and corrections

Current code validation is recorded in [FLOW_RELEASE.md](FLOW_RELEASE.md); full type checking and zero-warning lint now pass. The source-data verification limits below remain unchanged.

Date: 2026-10-25. Scope: rendered research screens, normal provider/aggregation paths, caches, case studies and every existing PDF/PPTX/XLSX report path. Work remains in the existing cloud `market-penetration` base. No real provider requests, live keys, credential changes, database writes, pushes, deployment or publication were used.

**No underlying market dataset was independently verified by this audit.** Tests establish lineage, missing-data behavior and presentation contracts, not the truth of a market, legal or company claim. The previous random spreadsheet fields were a specific defect; most other legacy figures are fixed literals or stored records, not random generation. Their accuracy remains unverified.

## Dataset inventory

| Status / dataset | Actual origin | Current treatment |
|---|---|---|
| Independently verified market/regulatory facts | None established in this pass | No dataset is promoted to verified, current legal guidance, or a validated forecast. |
| Provider-reported macro series | World Bank and IMF adapters (`worldBankService.ts`, `imfService.ts`) | Real transport responses are parsed when available. Per-field source, annual observation period, retrieval time and limitations remain separate. Unsupported/missing metrics are `null`; failed/empty providers produce no rows. Numeric zero is retained. IMF forecasts/current-year estimates cannot become past-year actual growth; past-year classification may still be unknown and says so. |
| Derived metrics | Unified internet-user count calculated from population and internet-use percentage | Only derived from matching known observation periods, explicitly marked derived; different/unknown years remain unavailable. No unrelated country defaults or missing-field macro constants. |
| Quote and FX records | Stored quote rows; public FX provider responses (`marketDataService.ts`) | Legacy quotes without declared source and observation metadata are withheld. Supplied source claims remain unverified. Missing change/volume stays unknown, including in market clocks; real zero survives. FX comparison is unknown without a prior observation. Cached failure retains the original provider date and retrieval time rather than stamping today. Storage time is not observation time. |
| OECD and trade | Supported OECD SDMX responses; source-declared cached trade rows | Unsupported OECD FDI/trade/productivity paths return unavailable, not invented OECD figures. Trade rejects estimated/demo/fallback rows, labels accepted records cached/unverified, and discloses available-record coverage. Partial cached totals do not become a national trade balance. No cached source attribution is independently authenticated. |
| Alpha Vantage adapter | Unused by the current App; source-reported provider records if a later authorized integration is added | No automatic demo key, fabricated quote/FX/commodity result, legacy cache masquerading as live, or invented current timestamp. No key was used. |
| Static reference screens | Inline App overview/country/comparison figures; analytics, eight charts, industry and market-insight arrays | Default research views say current data is unavailable. Users must explicitly choose **View unverified reference examples**. A persistent mode notice and **Hide examples** control remain; per-surface notices explain fixed figures, coverage and unknown observation dates. Values are excluded from planner assessments. Fixed values are not relabelled as verified merely because an institution is named. |
| Stored enterprise records | Competitive, regulatory, risk, labor and location services reading Supabase tables | Reference mode and local notices distinguish unverified stored records, possible seeds/defaults and unverified dates. No remote rows or deployed schema were inspected. Numeric default values, risk/site scores and effective dates do not establish measured facts, likelihoods, current law or availability. |
| Company case studies | Stored `case_studies_data` records or 80 bundled narrative/reference examples | Service defaults do not silently return examples. The reference UI explicitly opts in; returned records identify stored versus bundled provenance. Bundled construction-time timestamps are stripped, and listed source dates/ROI/company claims remain unverified. Filtering cannot show a hidden-country case. |
| Illustrative export sections | Code-defined sector, consumer, company-share, investment/ROI, strategy and proxy/scenario material | Retained only with self-contained illustrative labels and exact code-file origins. No automatic economic, stock or FX substitutions remain. Missing sources/fields and unavailable aggregates/plots say unavailable. Spreadsheet random adoption/growth/competitive fields remain removed; no replacement invented measurements were added. |
| Source directory | Intended IMF/World Bank/ASEAN portal links in application code | Generic discovery links replace unverifiable report titles, exact publication dates and authoritative-research claims. Publication dates are unknown, not today or a fabricated 2024 date. Link availability/contents were not remotely checked. |
| Planner inputs | User-entered profile, reasoning, source URL, observation date, rating and runway | Self-reported only. Coverage checks documentation, not factual truth. Profile changes require evidence review. Scores are preparation heuristics, not survival probabilities or AI/legal advice. |
| Unused AI interface stub | Previously canned responses and invented confidence percentages in `AIInsights.tsx`, not mounted by App | Hardened to explicitly labelled fixed research prompts, with no numerical confidence or fabricated growth/regulatory findings. No model is connected or launched. |

Detailed inventories: [rendered surfaces](FLOW_INTEGRITY_SCREENS.md) and [all export paths](FLOW_INTEGRITY_EXPORTS.md).

## Main corrections

- Removed automatic fixed macroeconomic, quote and currency tables from source/aggregation/export failure paths. Unknown countries cannot receive another country's data.
- Introduced nullable metrics and per-field evidence. No data does not mean zero; dates and units are carried rather than guessed. Normalization and derived arithmetic reject nonfinite results.
- Separated annual observation periods, retrieval time, cache/storage time and artifact generation time. No current day is invented for an unknown annual observation or publication.
- Rejected old fallback cache namespaces. New cached reads do not restore earlier substituted aggregates or establish a fresh observation.
- Made unverified reference content an explicit, reversible session choice, including the legacy enterprise/report-builder views. Reference examples do not feed the planner or ordinary provider results.
- Added visible provenance to every analysis surface and report artifact. Removed unused industry fetches that falsely suggested the static figures were connected; removed false source/freshness/confidence claims.
- Preserved architecture, original assets, source-supported zero values and explicit examples. No new numerical facts, legal conclusions, research citations or credentials were invented to make the interface look complete.

## Executed regression checks

- **50/50 Node tests pass:** 11 planner, 17 provider parser/transport, 10 aggregation/financial/case-study integrity and 12 real export serialization contracts. Transports are mocked/trapped; no live API data was used.
- Failure, empty, unknown-country, missing-source, missing-field, nonfinite, partial coverage, real-zero, forecast, mismatched-year, cache and time-separation cases are exercised. Tests check actual PDF pages and PPTX/XLSX archive contents, including visible source limits and retained example provenance.
- Production integrity browser passes: examples absent by default; explicit enable/hide; fresh navigation resets the default; failed providers show no invented economics/quotes/FX; publication dates unknown; a mocked zero remains zero and shows its 2023 source period; no unrelated country row appears.
- Production planner browser passes: profile/evidence/save/reload/export, scope invalidation, unsaved edits, account state, history, four widths, themes and storage denial; zero external requests/page errors.
- Production quality browser passes: ten deep links with reference opt-in where required, 360px layout, guest/refresh guards, manifest assets and actual PDF/PPTX/XLSX downloads with external requests blocked; no uncaught errors.
- Actual-App surface checks also exercised four analytics tabs, both industry views, four insight tabs, eight chart tabs, case filtering/empty states and all five disconnected enterprise modules. These validate presentation behavior, not the dataset claims.
- Production build and whitespace checks pass. Application/configuration TypeScript checks and zero-warning lint pass after the release cleanup. The earlier 14 unused-code TypeScript errors and 86 lint issues have been resolved in the release validation. Whole-project application/configuration type checks and zero-warning lint pass; rules were not disabled.

Reproduce from `/workspace/market-penetration` with the tested Node 24 runtime:

```bash
node --experimental-strip-types --test tests/*.test.mjs
npm run build
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
```

With preview running, use separate sessions:

```bash
FLOW_TEST_URL=http://127.0.0.1:4173 python tests/flow-browser.py
python tests/flow-quality-browser.py
python tests/flow-integrity-browser.py
```

Browser scripts accept `FLOW_TEST_ARTIFACTS`. The integrity test's zero-valued response is explicitly a synthetic fixture in an isolated browser context, not newly researched evidence.

## Remaining review gaps

1. No row-by-row fact check of legacy figures, company narratives/URLs, valuations, ROI, salaries, rents, regulatory requirements, tax claims or scores was performed. Reference mode is containment and disclosure, not a correction or certification of those claims.
2. Live provider schemas, geographic/sector coverage, revisions, actual/estimate classification, commercial entitlements and connectivity remain unverified. Mocked parser success is not proof the live service is available or accurate.
3. Deployed database contents, provenance, migrations, seed/default mixtures and access policies were not inspected. Older quote rows without provenance are intentionally unavailable rather than assumed sourced.
4. Seed/population helpers were not executed or certified. Imported case-study source files retain their old timestamp expressions; the tested service boundary discards those dates before returning examples. Future consumers must keep that boundary.
5. A URL, institutional name, recent date or complete user record does not establish current regulation or independent verification. There is no calibrated survival model or connected AI consultant.
6. This was a bounded integrity pass. It does not certify every hidden/dead component, every possible export permutation or the whole platform's accuracy. Existing search, sharing, scheduling and other product gaps remain documented separately.

Package declarations, lockfile, original images and README credential content were preserved. The apparent Finnhub variable was not copied, used or rotated. Setup/startup configuration is saved as a draft; no public preview, publication or fresh-task restoration is claimed.
