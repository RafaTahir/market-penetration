# Flow experience recovery — release validation

Prepared 2026-10-25 in the existing cloud `market-penetration` checkout, based on `1edf440156b2a89ab1d276f17a25108929e3b6a2`. **Prepared source release; deployment remains pending parent review/publication.** No Site or access changes. React 18/Vite 5/Tailwind 3 and existing assets/engine are retained; dependency versions and lockfile are unchanged.

Read [the before/after explanation](FLOW_EXPERIENCE_REVIEW.md) for the product correction and [the snapshot provenance](FLOW_MARKET_SNAPSHOT.md) for the new historical data. This proposal restores country discovery as Flow's starting point, with research, comparison and reporting reachable before optional notebook work. It does not launch an AI consultant or certify current market/regulatory facts.

## Compare navigation follow-up

The parent's hosted review found that Compare revealed its table below the viewport while hash navigation reset scrolling to the hero. Repeated Compare clicks also did not trigger another scroll. The focused follow-up waits for route navigation to commit, then moves keyboard focus and the viewport to `#market-comparison` on every explicit Compare action. The destination clears the sticky research tabs, has a visible keyboard focus indicator, and uses immediate scrolling to respect reduced motion and avoid interrupted browser scroll animations. Country selection does not steal focus. Header actions in retained modules share the same behavior; direct comparison links and the optional planner's Compare route are preserved. Other navigation retains its existing behavior.

The targeted regression is `tests/flow-comparison-browser.py`, run with `FLOW_TEST_URL=http://127.0.0.1:4173`. It exercises actual viewport placement and focus, keyboard continuation, initial/repeated/shortlist/research/shortcut actions, secondary views and planner/direct routes, in both themes at 390/1440px with both motion preferences. Data, provenance, exports, storage keys, dependencies and hosting/access settings are unchanged.

Follow-up validation passed: app/Vite type checks, zero-warning lint, all 63 Node tests, production build, all 88 targeted Compare destinations and the full exploration browser suite. Market Data's known public-provider requests were blocked in the test browser without synthetic responses; no external provider transport or uncaught browser errors occurred. The broader six-suite restoration checks below describe the preceding restoration release, not a claim that every suite was rerun for this narrow follow-up.

## Changes ready for review

- Restored navy/blue/emerald identity, original Flow emblem/gradient wordmark, clear product promise and visible research tools.
- Six original flag-led countries, functional country/city search, accessible shortlist selection, actual country/source comparison and JSON shortlist export.
- Sourced **2023 historical** population/nominal GDP, actual **2014–2023** GDP sparklines, and shared-scale GDP/population charts with visible source years and full provenance.
- Six research modes with city and industry switching, useful source paths and retained example analyses/report templates. Whole-page main exploration gate removed; unsupported legacy figures remain explicit opt-in.
- Compact native source disclosures retain full warning text and prior readable contrast. Numeric examples never become verified facts or planner evidence.
- Optional planner retains local version 1 research/export, scoring/missingness rules, profile invalidation and dirty guards. Leaving for bare home is protected too. Validated shortlist storage preserves selection across the planner round trip/reload without changing the notebook key.
- Tailwind dark variants follow the app theme rather than the OS, including retained reference analysis surfaces.
- Mobile research navigation sits above the swipeable cards; both themes, touch/keyboard controls and responsive chart/compare layouts are verified.

## Required checks

```bash
npm run typecheck
npm run lint -- --max-warnings=0
npm test
npm run build
```

Application and Vite type checks pass. ESLint has **zero errors and zero warnings**. All **63 Node tests pass** across planner rules, provider parsing, missingness/zero/period integrity, export serialization and mocked account/bookmark/realtime lifecycles. Tests do not establish deployed backend policies or credential validity.

Build includes full type checking. Existing nonfatal large-bundle, mixed XLSX import and outdated Browserslist warnings remain visible; no budgets, TLS checks, rules or assertions were disabled.

## Real production-preview browser checks

With the production build served on 4173:

```bash
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
FLOW_TEST_URL=http://127.0.0.1:4173 python tests/flow-browser.py
python tests/flow-quality-browser.py
python tests/flow-integrity-browser.py
FLOW_TEST_URL=http://127.0.0.1:4173 python tests/flow-visual-browser.py
FLOW_TEST_URL=http://127.0.0.1:4173 python tests/flow-contrast-browser.py
FLOW_TEST_URL=http://127.0.0.1:4173 python tests/flow-exploration-browser.py
```

The six suites exercise the actual application rather than only mocked component functions:

- Complete optional planner profile/evidence/save/reload/JSON export, profile invalidation, real-zero versus unknown, dirty navigation/close guards, native focus/scroll locks, guest auth and storage-denied recovery.
- Ten retained research routes, missing-source states, original provider periods and genuine zero, unknown publication dates and explicit reversible reference opt-in. Actual PDF/PPTX/XLSX buttons produce readable files retaining limits/provenance.
- New bare-URL discovery journey, six country cards, exact source totals, search/no-results, native country selection, comparison and exact raw historical-source shortlist JSON.
- City/industry/source journeys, real GDP/population switch and shared scale, historical source/licence/hash disclosure, accessible source-warning expansion and optional notebook round trip.
- A third shortlisted country and an intentionally empty shortlist both survive actual header navigation and reload, without changing notebook JSON.
- Normal/reference layouts at 360/390/768/1440px in both themes, touch/keyboard controls, no document overflow, first-viewport research modes and no uncaught browser errors.
- All **56 source-warning checks** retain the 4.5:1 small-text threshold after opening the full disclosures, with opposing OS/app themes. Opaque banners measure 8.75:1 light/13.45:1 dark; related notes remain at least 6.47:1. This is targeted contrast coverage, not a full accessibility certification.

External provider transport is blocked or explicitly mocked. Synthetic quote/evidence fixtures exist only in isolated test browsers; product preview screenshots use the actual historical snapshot. No real provider observations were invented or written.

## Reproduce and limitations

Tested cloud tooling: Node 24.19.0/npm 11.9.0, Python Playwright and `/usr/bin/chromium`. Install with `npm ci --no-audit --no-fund`; develop with `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`. `FLOW_TEST_ARTIFACTS` chooses screenshot/download output directories. Static output remains `dist/`, served at origin root with hash navigation and browser downloads; no application server or required environment variables.

Both hosted URLs were inaccessible in this worker (`net::ERR_TUNNEL_CONNECTION_FAILED`). Hosted visual comparison relies on the parent's independent observations plus historical source, and screenshots here are labelled local before/proposed after. Primary World Bank API cross-check was proxy-blocked 403; the dated DataHub mirror is separately pinned and attributed, not substituted into provider failures. Current legal applicability, source publication dates, live provider entitlements, deployed account/Supabase policies and scheduled delivery remain unverified.

Commit and push to the existing repository are authorized. Parent reviews the exact source/build and handles publication to the same existing Site. No independent deployment, replacement Site/task, credential creation, paid provider, sharing change or Bolt update is authorized by this release preparation. Historical private comparison notes remain locally ignored and are excluded from public source/artifacts.
