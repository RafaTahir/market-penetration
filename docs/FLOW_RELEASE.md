# Flow release validation

Validated 2026-10-25 on the existing `market-penetration` base, retaining React 18, Vite 5, Tailwind 3 and the original Flow assets. This release introduces a visual business-profile/evidence workspace and repairs the existing library's reliability and data-integrity boundaries. It does not certify underlying market figures or launch an AI consultant.

## Resulting behavior

- The workspace opens with a geographic city view, qualified-only preparation tracks, documentation coverage and focused next actions. Overview, Compare cities and Evidence views replace the long reading sequence. Profile, evidence and methodology are available in accessible native drawers. Fresh workspaces use a light palette; existing theme preferences remain.
- Founders, SMEs and enterprises can record business phase, industry, offering and runway; compare documented preparation for Jakarta province and the City of Manila; preserve research locally; and export its exact saved evidence and methodology.
- Missing sources and metrics remain unavailable. Genuine zero values survive. Observation periods, retrieval/storage time and report generation time stay separate. Provider failures cannot create substitute economic, quote or FX observations.
- Legacy static/unverified views require explicit reference-mode opt-in and carry persistent source/date limitations. Examples never supply planner evidence or calibrated survival probabilities.
- PDF, PPTX and XLSX downloads retain provenance and clearly labelled illustrative sections. Unsupported random spreadsheet metrics and misleading confidence/publication claims were removed.
- Guest startup, hash navigation/history, account-route guards, mobile layout, source-directory metadata and service-worker freshness are repaired.
- Account/bookmark/realtime effects ignore stale user/target results and release subscriptions. Failed saves retain drafts; missing/error states do not become false zero summaries.
- Context values/hooks are separate from provider components, satisfying Fast Refresh rules. Database JSON and service boundaries have declared types. No lint/type-check rules were disabled.

## Checks actually passed

```bash
npm run typecheck
npm run lint -- --max-warnings=0
npm test
npm run build
```

Type checking covers application and Vite configuration. Lint has **zero errors and zero warnings**. All **63 tests pass**: 11 planner-domain, 17 provider, 10 aggregation/financial/case-study integrity, 12 export serialization, four account-component lifecycle and nine bookmark/realtime-hook lifecycle tests. Connected-service tests use isolated mocked boundaries; they do not validate deployed credentials or live backend policies.

The build now runs type checking before Vite. Existing nonfatal large-bundle and mixed XLSX import warnings remain; they are not hidden by relaxed budgets.

All four production-preview browser suites pass:

```bash
FLOW_TEST_URL=http://127.0.0.1:4173 python tests/flow-browser.py
python tests/flow-quality-browser.py
python tests/flow-integrity-browser.py
FLOW_TEST_URL=http://127.0.0.1:4173 python tests/flow-visual-browser.py
```

They check the real planner journey, local persistence/export, scope changes, unsaved edits, guest access, navigation/history, themes/storage denial, mobile layouts, ten retained library routes, explicit reference mode, absent-source behavior and actual PDF/PPTX/XLSX button downloads. External provider requests are blocked or explicitly mocked. Visual checks also cover geographic label bounds, qualified rating 1 versus Unknown, genuine aggregate zero, incomplete/stale/profile-invalid records, source traceability, keyboard drawers and four responsive widths in both themes. No uncaught browser errors occurred. The zero-valued/2023 provider response is a test fixture, not newly researched evidence.

## Reproduce

Tested cloud runtime: Node 24.19.0 and npm 11.9.0; Python Playwright and Chromium are supplied by the cloud image. No dependency versions or lockfile entries changed.

```bash
npm ci --no-audit --no-fund
npm run typecheck
npm run lint -- --max-warnings=0
npm test
npm run build
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
```

Run browser checks in separate sessions while preview is running. `FLOW_TEST_ARTIFACTS` selects a writable screenshot/download directory. Normal development uses `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`. Browser tests require the cloud image's Python Playwright and `/usr/bin/chromium`; Node tests require the documented Node 24 runtime.

## Deployment and limitations

Build output is `dist/`, a static client application with no required environment variables or application server. The authorized destination is the existing owner-private ChatGPT Site. Its owner coordinates publication of the exact pushed revision; this code task does not create another Site, change sharing, or update the old Bolt site. A Git push is not proof of publishing. Verify the release in the authenticated private Site after publication. Guest research works without optional account or provider configuration; source availability and backend behavior remain subject to the limits below.

No market/regulatory dataset was independently fact-checked. See [the dataset inventory](FLOW_INTEGRITY_AUDIT.md), [screen inventory](FLOW_INTEGRITY_SCREENS.md) and [export inventory](FLOW_INTEGRITY_EXPORTS.md). Live provider availability/entitlements, deployed Supabase schema/RLS, scheduled delivery, sharing and current legal applicability remain unverified. Legacy search/save remains explicitly unavailable; full product expansion is a separate stage.

Private comparison notes are retained in the task workspace for review and are not part of the public source release. No credentials were created, rotated, copied from the README or supplied to live providers during validation.
