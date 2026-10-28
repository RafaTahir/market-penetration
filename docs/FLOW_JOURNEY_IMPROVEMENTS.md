# Flow: selected markets through to a plan

This bounded improvement pass builds on `db68f1b29b464935303b2526e05096750869ce24` in the existing cloud `RafaTahir/market-penetration` application. It addresses the live review's shortlist-to-plan mismatch, hidden selection side effect, clipped atlas label, hidden chart-scale limitation and repeated city guidance. The original Flow identity, public Site, historical data and city preparation methodology remain the base.

## What a user sees

| Review finding | Result |
| --- | --- |
| Selecting Malaysia then opening Your plan showed Jakarta/Manila | `#/plan` carries the actual shortlist into a market plan. Malaysia has Malaysia's official-directory paths and its own optional next-step note. Empty selection stays empty. |
| Detailed preparation supports only two cities | `#/plan/notebook` explicitly opens the existing Jakarta-province/City-of-Manila notebook. Its supported scope is stated beside the link; no Malaysia score or new city assessment is implied. |
| Explore silently added a country | An unselected country says “Add & explore”, with an accessible label naming the country and shortlist action. A selected country says “Explore market”. |
| Country GDP lines could imply comparable scales | “Own scale” is visible beside every actual sparkline. The existing observation years, units, values and full limitation are preserved. |
| Indonesia's atlas label clipped near 1165px | Intermediate layouts contain the atlas and labels within the hero and keep them clear of the copy. |
| City cards repeated generic prompts | All six cities have distinct Customers, Location and Setup questions with the appropriate statistics, national or local directory links. Guidance is explicitly separate from verified findings. |

The market plan offers locally saved next steps and a separate `flow-market-plan.json` export. These are personal, unverified notes, not market observations or scored evidence. Source publication dates remain unknown; note edit/export timestamps are explicitly separate. No source page was treated as a verified current legal requirement.

## Saved work and compatibility

The shortlist state now lives above route changes so it also survives navigation when browser storage is denied. Its `flow-market-shortlist-v1` schema is unchanged. New personal notes use the independent `flow-market-plans-v1` key; removing a country from the shortlist preserves its note. Successful storage saves survive reload; session-only notes survive route changes and expose an export-before-reload message.

The existing `flow-entry-planner-v1` state, engine, profile-context invalidation, qualified evidence, preparation scores and `flow-entry-research.json` format are unchanged. The new hub does not write that notebook key. The notebook's unsaved-evidence guard now also protects navigation to the market-plan hub. Existing notebook data remains available through the explicit city-notebook route, independently of the current shortlist.

The new market-plan export includes only currently selected markets, their user notes and curated source metadata. It supplies no preparation score, business-fit ranking or survival probability for these market plans. Previous notebook exports retain their original methodology, geography, raw workspace and assessments.

## Source limits

[City guidance source notes](FLOW_CITY_GUIDANCE_SOURCES.md) list the official-directory URLs and retrieval limits. All six attempted city/land-use portals were blocked before access by the worker proxy with HTTP 403. The cards therefore present distinct research questions and discovery routes, with source contents, publication dates and current applicability unverified. They do not present new regulatory facts, costs or demand findings. Jakarta-province/Greater-Jakarta and City-of-Manila/Metro-Manila scopes remain distinct; Ho Chi Minh City prompts ask the user to confirm current boundaries and address authority.

The pinned 2023 country snapshot and actual 2014–2023 GDP history are unchanged; see [their provenance](FLOW_MARKET_SNAPSHOT.md). No API fallback, credentials, database, dependency or audience change is part of this pass. The original Bolt site is outside this release.

## Verification and publication

The focused new browser suite is `tests/flow-market-plan-browser.py`. It checks a Malaysia-only shortlist, note/export/reload and empty-selection behavior, preservation of synthetic existing notebook records and 0/50 scores, both themes at 360/390/1165/1440px, atlas containment, visible scale disclosure and storage-denied route retention. Synthetic fixtures exist only in isolated test browsers. Existing notebook suites now target the explicit `#/plan/notebook` route and continue testing dirty guards, profile invalidation, genuine zeroes, missingness and original exports.

Use `npm run typecheck`, `npm run lint -- --max-warnings=0`, `npm test`, and `npm run build`; serve `dist/` and run all nine browser suites against the production preview. Build requirements remain `npm ci --no-audit --no-fund` followed by `npm run build`, with no application server or required environment variables. The release handoff records exact results and the source/build hashes.

The tested release passed application/Vite type checks, zero-warning lint, all 67 Node tests, production build and all nine browser suites. The new market-plan suite covers eight theme/width contexts plus storage denial, including preservation of existing synthetic 0/50 preparation scores, raw research and notebook JSON exports. Existing suites retain 88 Compare destinations, all original planner/quality/integrity/visual/exploration checks, real PDF/PPTX/XLSX downloads and 56 source-warning contrast checks above 4.5:1. Separate city-guidance QA exercised 72 city/lens cards across dark/light at 360/1165px, with six distinct prompts per lens and the expected directory links. External requests were blocked or explicitly mocked in isolated tests; no market observations were supplied to production. These checks do not certify current law, source contents, backend entitlements or complete accessibility. Existing nonfatal bundle-size/mixed-XLSX/Browserslist warnings remain.

Publish only to the same existing public Flow Site. This worker can push GitHub source but has no ChatGPT Sites publication tool; parent publication and live verification must be reported separately from local production-preview checks. No replacement Site, audience change or state reset is authorized by this pass.
