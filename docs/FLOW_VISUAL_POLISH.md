# Flow: a more visual, easier market explorer

Prepared in the existing cloud `RafaTahir/market-penetration` project on 2026-10-28, following the country-first restoration and Compare fix at `788c508`. The design keeps the original Bolt experience's navy, blue/teal identity, Flow emblem, six markets and research tools. It adds a clearer visual hierarchy and more direct phone workflows for founders and SMEs, with the existing business-profile options available for larger businesses.

## What changed and why

| Before | Now | Purpose |
| --- | --- | --- |
| Small text and visually similar compact country cards | Six original city-inspired SVG illustrations, larger country names and figures, clear plus/check selection | Make markets recognizable and easier to scan |
| A subdued hero and small search control | Larger editorial headline, stronger regional geography and a generous search field | Explain Flow and invite discovery immediately |
| Two horizontal navigation rows on phones | Four visible primary actions; six research modes in a compact grid; secondary tools in the existing More menu | Make available actions discoverable without sideways navigation |
| Card rail lacked a visible swipe hint when its heading was hidden | Visible swipe guidance and working Previous/Next controls when cards overflow | Let people explore all six markets through touch or buttons |
| Explore market jumped to the whole selected city collection | The chosen city receives keyboard focus and scrolls into view while the shortlist remains intact | Make the result match the action |
| Compare was easy to lose while browsing on phones | Persistent phone shortlist/Compare action; comparison opens with focus and sticky-tab clearance | Keep the next step within reach |
| Phone table exposed one country without explaining horizontal navigation | Overflow guidance, a keyboard-focusable scroll region and sticky research labels | Support actual side-by-side comparison on narrow screens |
| Repeated heading levels and dense research boxes | One clear research heading, illustrated city cards, numbered industry decision lenses and larger chart labels | Reduce reading burden while preserving useful detail |

The skyline studies are original decorative artwork, not geographic maps, statistical observations or copies of reference-site assets. The existing Natural Earth regional map remains geographic context. All application illustration assets are local; no image-provider key or external image request is required.

## Research and direct references

Accessible first-party sources informed the interaction patterns:

- [GitHub Primer UnderlineNav](https://github.com/primer/react/blob/main/packages/react/src/UnderlineNav/UnderlineNav.tsx): explicit overflow and current-page visibility. Flow uses its existing More menu for secondary phone navigation.
- [Primer SelectPanel](https://github.com/primer/react/blob/main/packages/react/src/SelectPanel/SelectPanel.tsx): visible, reversible selection, filtering that preserves hidden selections, and explicit empty states. Flow preserves its shortlist independently of search.
- [Primer ActionMenu](https://github.com/primer/react/blob/main/packages/react/src/ActionMenu/ActionMenu.tsx): predictable secondary actions with keyboard handling. Flow retains its native focus, dismissal and source-access safeguards.
- [Airbnb visx](https://github.com/airbnb/visx) and its [first-party visualization gallery](https://raw.githubusercontent.com/airbnb/visx/master/assets/visx-gallery.png): strong visual tile rhythm, concise labels and data-derived chart scales. Flow uses original artwork and its existing actual historical charts.
- [Airbnb-origin react-dates](https://github.com/airbnb/react-dates): documented accessible/mobile selection, clear controls and controlled focus. This is historical component evidence, not a claim about Airbnb's current homepage.

The worker could retrieve these first-party source files and inspect the visx gallery. Consumer homepages for Airbnb, Booking, Wise and TradingView, plus attempted investor pages, were blocked before access by the cloud proxy (`Tunnel connection failed: 403 Forbidden`). Their current rendered appearance and traffic figures were not verified. No traffic ranking or numerical usage claim supports this design, and no third-party branding, sample market values or new reference-library dependency was copied. Source branches can change; the cloud review retains retrieved files and hashes for the research date.

## Data and saved work

The historical 2023 population/GDP snapshot, actual 2014–2023 GDP lines, units, raw values, missingness, source/date disclosures and exports retain their existing meaning. See [snapshot provenance](FLOW_MARKET_SNAPSHOT.md). Decorative art is separate from charts. Unsupported reference analyses remain an explicit opt-in. Current law, live-provider credentials and AI consulting are not newly supplied by this visual pass.

The `flow-market-shortlist-v1` and `flow-entry-planner-v1` storage keys and schemas are preserved. Existing saved research, profile invalidation, unsaved-work guards, planner scoring rules and export formats are retained. No backend, database, access, dependency or credential change is part of this pass.

## Validation and release

Use `npm run typecheck`, `npm run lint -- --max-warnings=0`, `npm test`, and `npm run build`. Serve the final `dist/` with the existing production preview; run the browser suites with `FLOW_TEST_URL=http://127.0.0.1:4173`. The focused visual workflow suite is `tests/flow-polish-browser.py`; the existing exploration, Compare, planner, quality, integrity, visual and contrast suites cover preserved functionality.

The final production build passed application/Vite type checks, lint with zero errors and warnings, all 63 Node tests and all eight browser suites. Coverage includes 88 Compare destinations, eight new visual-workflow contexts across both themes at 360/390/768/1440px, actual PDF/PPTX/XLSX downloads, source/period/missingness/zero integrity, local saves/reloads/dirty guards and storage-denied guest behavior. All 56 expanded source-warning contrast checks exceeded the 4.5:1 small-text threshold. Country-code result counts and a direct search from six cards to no results have dedicated checks. External provider transport was blocked or explicitly mocked only within isolated test browsers; no production observations were fabricated. Existing nonfatal bundle-size, mixed XLSX import and Browserslist build warnings remain visible. This is targeted workflow/contrast validation rather than a complete accessibility certification.

The static client still builds with `npm ci --no-audit --no-fund` followed by `npm run build`, without required environment variables or an application server. Publish only to the existing Flow Site and audience. The worker has GitHub push capability but no ChatGPT Sites publication tool; its release handoff must distinguish verified GitHub source/build from the parent's eventual Site deployment and live verification. The original Bolt site remains outside this release.
