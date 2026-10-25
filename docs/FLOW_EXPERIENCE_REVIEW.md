# Flow experience recovery: before and proposed after

This is a **prepared source release awaiting parent publication** on the existing `RafaTahir/market-penetration` application, based on `1edf440156b2a89ab1d276f17a25108929e3b6a2`. No replacement application, repository, Site, independent deployment or access change is part of this pass. Commit and push to the existing repository are authorized; parent handles publication.

The mistake was making research bookkeeping the front door. Flow's purpose is to help someone explore Southeast Asian markets, compare options and work towards an entry plan. Evidence management is useful after that invitation; it should not be a prerequisite for discovering the product.

| Experience | What the rejected version lost | Proposed restoration |
| --- | --- | --- |
| Product purpose | Bare URL opened “Market workspace”, ten unknown marks and source-entry actions | Bare URL opens market discovery with a clear launch/expansion promise; “Your plan” is optional |
| Recognizable identity | Cream/gray workspace, narrow rail, plain wordmark | Original Flow emblem, gradient wordmark, navy/blue/emerald identity, flag-led country cards and regional geography |
| Country breadth | Jakarta/Manila preparation appeared to be the whole product | All six original countries: Thailand, Singapore, Malaysia, Indonesia, Philippines and Vietnam; Thailand/Singapore initially shortlisted |
| Useful first view | Empty scales and documentation counts | Dated 2023 population/GDP cards, actual 2014–2023 GDP histories and a shared-scale GDP/population comparison |
| Discovery hierarchy | Country/city/industry modes hidden behind a whole-page unavailable-data gate | Visible six-mode research navigation, actual market/city search, city lenses, six industry guides and official-source starting points |
| Compare and plan | Compare duplicated the empty evidence overview | Country fundamentals/source-path comparison and exact shortlist export; notebook remains a separate preparation workflow |
| Research/report access | Original analyses and tools were buried | Visible Search/Compare/Market data/Analytics/Intelligence, source directory, retained example analyses and PDF/PPTX/XLSX report tools |
| Source honesty | Repetitive long warnings dominated the page | Visible status and years, accessible source/date disclosures, preserved full warning copy, explicit opt-in for unsupported legacy examples |
| Phone usability | Long stacked cards hid research modes; original legacy action buttons could overlap its hero | Research modes above a compact swipeable country rail, native keyboard/touch controls, responsive charts and readable themed surfaces |

## Existing architecture and functionality retained

`ResearchWorkspace` is promoted and reorganized rather than replaced with another app. Existing city, industry, intelligence, case, chart, source-directory, reporting and account routes remain. `ReferenceResearch` isolates the retained unsupported numeric analyses behind an explicit session-only reference choice. Country cards no longer reuse their old unsupported growth/digital/metric values.

The original logo is retained. Tailwind dark variants now follow the application theme class rather than the operating-system preference, fixing retained analysis cards that stayed white in dark mode. New component boundaries separate country fundamentals, research guides, comparison, reference material and source disclosure. React 18, Vite 5, Tailwind 3, dependencies and lockfile are unchanged.

The entry planner's `flow-entry-planner-v1` schema, stored research, engine, profile-context invalidation and exact JSON export are preserved. Leaving a dirty planner for research **or bare home** still requires the existing discard confirmation. The country shortlist now survives the plan round trip and reload under the separate validated `flow-market-shortlist-v1` key; an intentionally empty shortlist stays empty. Storage-denied guest work remains usable and export remains available. Comparison no longer captures ordinary Ctrl+C; its shortcut is Ctrl+Shift+C.

## What is sourced, and what is not

The normal fundamentals are a **historical artifact**, not a live API fallback. Population and nominal GDP use a common **2023** period for all six countries. The small GDP histories use actual **2014–2023** rows. Numbers, units and periods were extracted from pinned public DataHub mirrors of World Bank series; the whole CSV hashes and all selected rows were checked. See [snapshot provenance and limits](FLOW_MARKET_SNAPSHOT.md).

The primary World Bank API was blocked by this worker's proxy, so mirror values were not independently cross-checked against that service. Official source publication dates remain unknown; retrieval time is not observation time or freshness. National GDP/population are not city statistics, addressable demand, a business-fit score, a survival probability or current legal requirements. Missing values and genuine zeroes remain distinct.

Country/city/industry guides supply structured questions and curated official discovery links. Their linked contents and current legal applicability have not been retrieved or verified. Existing static/seeded research remains explicitly labelled and opt-in; it never supplies planner evidence or points. AI consulting is not enabled. No application credentials or paid providers were configured.

## Original-site verification limit

The historical source reference is `09774eb`. Its country-first layout, six research modes, original emblem/gradient identity and visible tools match the parent's independent live comparison. The exact deployed Bolt commit and integration remain unverified.

This worker attempted both `https://flow-qx0x.bolt.host/` and `https://rafa-flow-market-intelligence.snowypika17.chatgpt.site/` in real Chromium. Both failed before navigation with **`net::ERR_TUNNEL_CONNECTION_FAILED`**. This review therefore distinguishes historical-source comparison and the parent's live observations from this worker's local before/after browser captures. It does not manufacture a screenshot or claim direct hosted verification.

The concrete validation results and reproduction commands are in [the proposed release validation](FLOW_RELEASE.md). Review screenshots, exact source diff and static artifact are retained in the current cloud task handoff. Publication remains with the parent after source/build review.
