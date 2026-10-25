> Final application/configuration type checks, zero-warning lint, 63 tests and production browser validation are recorded in [FLOW_RELEASE.md](FLOW_RELEASE.md). Subset counts below describe the earlier integrity audit.

> Current integration and additional safeguards are documented in [FLOW_INTEGRITY_AUDIT.md](FLOW_INTEGRITY_AUDIT.md). This detailed component inventory describes its owned subset; final App reference gates, case-service opt-in and quote-provenance withholding were added during integration.

# Rendered research integrity audit

Scope: 11 analysis components reachable from the research library and `caseStudyService.ts`. No remote factual verification, live provider requests, credential use, database changes, or publication occurred. A named institution, plausible URL, stored row, or timestamp is not treated as independent verification. The numeric reference values were preserved; local constants are not automatically classified as random or fabricated.

| Surface and reachability | Actual data origin | Status and limits made visible |
| --- | --- | --- |
| `src/components/AnalyticsDashboard.tsx`; `#/research/analytics`, four metric tabs | Inline population, historical economic trends, digital adoption, and opportunity arrays | **Unverified static reference**. Observation dates unknown; year/projection labels do not establish accuracy. Opportunity scores illustrative, not calibrated probabilities. Excluded from entry planner. |
| `src/components/DataVisualization.tsx`; research **Data Visualization**, eight chart tabs | Inline market-size, growth, industry, digital, consumer, competition, investment, and trade arrays | **Unverified static charts**, including computed totals/averages. Institution/report names are labelled unverified attributions. Unknown observation dates. Country charts/tables filter; regional datasets and summaries explicitly retain full sample coverage. Scores not calibrated likelihoods. Excluded from planner. |
| `src/components/IndustryAnalysis.tsx`; research **Industry Deep Dive** | Inline `industries` array; country count does not recalculate values | **Unverified static industry reference**. Unknown observation dates, static regional coverage, illustrative opportunity/risk scores, excluded from planner. |
| `src/components/EnhancedIndustryAnalysis.tsx`; research **Industry Deep Dive** | Inline `industryData` array; unused trade/OECD reads formerly created a misleading impression of connection | **Unverified static industry reference**, company/narrative/publication labels unverified; no real-time/daily/today claim. Unused remote reads removed. Country count does not recalculate figures. Excluded from planner. |
| `src/components/MarketInsights.tsx`; research **Market Intelligence**, four insight tabs | Inline regional overview, consumer, competitive, and country regulatory arrays | **Unverified static market references**. Fixed totals no longer claim selected-country aggregation. Only regulatory cards filter by country. Sources labelled unverified attribution; scores not calibrated; observation dates unknown; excluded from planner. |
| `src/components/CaseStudies.tsx`; research **Case Studies** | `src/services/caseStudyService.ts` reads `case_studies_data`; empty/error/unconfigured paths fall back to inline defaults plus `src/data/additionalCaseStudies.ts`, `caseStudiesBatch2.ts`, `caseStudiesBatch3.ts`, `caseStudiesBatch4.ts` | **Unverified company narratives and numeric claims**. Returned records carry actual `stored-record` or `bundled-reference` provenance; view reports which was returned. All fallback construction-time `lastUpdated` values stripped to unknown at service boundary, including imported batch values. Listed publication dates labelled as unverified reference dates, distinct from unknown observation dates. Investment/ROI not independently verified. Excluded from planner. |
| `src/components/CompetitiveIntelligence.tsx`; `#/research/enterprise-intelligence` → **Competitive Intelligence** | `src/services/competitiveIntelligenceService.ts` reads `competitor_profiles`, `competitor_activities`, `market_share_tracking`, `pricing_intelligence`; no component-local fallback | **Unverified stored competitive records**. May contain seed/default data; live contents unknown. Query completion time explicitly not an observation date. Activity/pricing country-only filter support explained. Errors and late responses no longer retain prior selection records. Missing numeric values display unavailable rather than a synthetic zero. Pricing sources/dates and activity dates labelled unverified claims. Excluded from planner. |
| `src/components/RiskAssessment.tsx`; Enterprise → **Risk Assessment** | `src/services/riskAssessmentService.ts` → `getComprehensiveRiskProfile`, including `political_risk_index`, `economic_risk_factors`, `operational_risks`, credit and sanctions data | **Unverified connected reference**. No evidence that DB rows are sourced/current. May include seed/default values; zero not necessarily measured. Scores/severity not calibrated likelihoods or investment advice; observation dates unverified; excluded from planner. |
| `src/components/RegulatoryCompliance.tsx`; Enterprise → **Regulatory Compliance** | `src/services/regulatoryComplianceService.ts` reads `regulatory_requirements`, `tax_incentives`, `policy_changes` | **Unverified connected reference records**. May contain seeds/defaults; effective dates are unverified record claims; current applicability and observation dates unverified. Excluded from planner. |
| `src/components/LaborTalent.tsx`; Enterprise → **Labor & Talent** | `src/services/laborTalentService.ts` reads `salary_benchmarks`, `talent_pools`, `labor_market_data` | **Unverified connected reference records**. May contain seeds/defaults; year labels not independent evidence; scores not calibrated; zero may be default. Observation/source attribution unverified; excluded from planner. |
| `src/components/RealEstateLocation.tsx`; Enterprise → **Real Estate & Location** | `src/services/realEstateLocationService.ts` reads `commercial_real_estate`, `economic_zones`, `site_selection_matrix` | **Unverified connected reference records**. Rents and availability not confirmed current; zero may be default; site scores illustrative. Source/observation dates unverified; excluded from planner. |

## Concrete corrections

- Preserved numeric historical/reference layouts and made unsupported attribution, company narrative, score, and date limits visible on each surface.
- Removed unused external industry calls and fabricated current/daily status for static industry arrays.
- Relabelled competitive client request completion time so it cannot be mistaken for source freshness.
- Fixed case detail to use filtered results immediately, with a fallback and empty state; prior hidden-country cases no longer remain visible.
- Cleared connected prior-filter results and ignored late responses; errors display unavailable records.
- Guarded empty chart totals/ratios/averages against zero/NaN, corrected the unweighted average label, and preserved missing digital values as unavailable.
- Corrected touched-module type/lint issues only; no repository-wide cleanup.

## Review gaps

- **No claim in this inventory is remotely verified.** Institution names and case-study URLs have not been opened or validated; company financial/expansion narratives are preserved as unverified references.
- Database migrations define numeric zeros, confidence defaults (including 50), and default-current metadata timestamps. Seed helpers exist and some target different table names from readers. Deployed row provenance cannot be inferred from these files; no database was queried.
- Imported case-study data files still contain construction-time timestamp expressions. They are read-only in this change and their timestamps are discarded by `CaseStudyService` before use. No original observation date has been invented.
- Historical/projected series and scoring methods remain unsupported unless independently sourced by later research. Regional reference charts have not been made current by relabelling.
- Public provider/source adapters, inline App overview, country selector, comparison, export services, and entry planner are separately owned by the parent/other agents; they are outside this component edit scope.

## Validation

- Scoped ESLint passes for all 11 components plus `caseStudyService.ts`.
- Scoped `git diff --check` passes.
- TypeScript reports no diagnostics in the 12 audited modules; unrelated repository diagnostics remain outside this scope.
- **App browser PASS**: four analytics tabs; both industry components; four insight tabs; eight chart tabs; case-study detail fallback and empty filters; all five disconnected Enterprise modules after country selection. Zero external requests and zero uncaught browser errors. Local Chromium via Python Playwright with external requests blocked. Script: `scratch/flow-onboarding/check-rendered-integrity.py`; screenshots/log: `scratch/flow-onboarding/rendered-integrity/`.
- Additional actual-browser checks passed for a Vietnam-only regulatory empty state and the real `CaseStudyService` offline return: all **80** bundled references carry `bundled-reference` provenance and empty/unknown `lastUpdated`; zero external requests.
- An isolated local browser harness also passed all six industry/risk/regulatory/labor/location components, every disconnected tab, and resetting country selection; zero external requests and page errors.
