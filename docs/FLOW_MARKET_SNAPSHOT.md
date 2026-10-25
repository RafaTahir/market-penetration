# Historical market snapshot

`src/data/marketSnapshot.ts` is a separately curated historical artifact, not an API result, a live feed, or a fallback in any provider adapter. It contains total population and GDP for the common observation year **2023**, plus GDP observations for **2014–2023**, for Thailand (THA), Singapore (SGP), Malaysia (MYS), Indonesia (IDN), the Philippines (PHL) and Vietnam (VNM).

## Attribution and exact source files

Population is attributed by the mirror to **World Bank**, indicator `SP.POP.TOTL`; values are total people. GDP is attributed to **World Bank and OECD**, indicator `NY.GDP.MKTP.CD`; values are **current US dollars**, not constant-price dollars, purchasing-power-parity dollars, market demand or addressable market size. **DataHub / datasets** normalizes and republishes the source series as CSV.

| Input | Pinned DataHub commit | Whole downloaded CSV SHA-256 | Mirror license declaration |
| --- | --- | --- | --- |
| [Population CSV](https://raw.githubusercontent.com/datasets/population/d4b1a4a9a17e2123baf0ef119de05bceced1ab1b/data/population.csv) | `d4b1a4a9a17e2123baf0ef119de05bceced1ab1b` | `2c697c3e668c8cb06ee467cd0d475b37b52844fdc48cb7725b79b58f18bf0b02` | [ODC-PDDL-1.0](https://opendatacommons.org/licenses/pddl/) |
| [GDP CSV](https://raw.githubusercontent.com/datasets/gdp/36d761dc5617982d3e50b213e02b9a1b47c4e958/data/gdp.csv) | `36d761dc5617982d3e50b213e02b9a1b47c4e958` | `8d84ef6bcaccf740c01c5ed7566aae8f7b149d0e2c20001e441efd3cb5b2fa86` | [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) |

The declarations above are recorded from the mirrors' pinned [population datapackage](https://github.com/datasets/population/blob/d4b1a4a9a17e2123baf0ef119de05bceced1ab1b/datapackage.json) and [GDP datapackage](https://github.com/datasets/gdp/blob/36d761dc5617982d3e50b213e02b9a1b47c4e958/datapackage.json). They do not replace applicable upstream terms. Retain attribution to World Bank, OECD for GDP, and the DataHub mirrors when reusing this selection. Relevant upstream series: [population](https://data.worldbank.org/indicator/SP.POP.TOTL) and [GDP](https://data.worldbank.org/indicator/NY.GDP.MKTP.CD).

## Extraction and validation

- Both complete downloaded CSV hashes were independently recomputed and matched the pinned input hashes above. Headers are `Country Name,Country Code,Year,Value`.
- Selection uses ISO alpha-3 codes and exact observation years. Each selected country/year occurs once, all values are finite and nonnegative, and population counts are integral. No missing value is filled, interpolated or copied from another year/country.
- All six countries have both population and GDP observations for 2023 and every GDP year from 2014 through 2023. Population extends to 2025 in its mirror; GDP ends in 2023, so newer population rows are intentionally excluded from this common-year comparison.
- GDP units and indicator are explicit in its datapackage. The population datapackage identifies total-population series `SP.POP.TOTL`; its numeric counts are people, with no millions multiplier. Display abbreviation is the UI's responsibility.
- Raw CSV numeric literals are retained without deliberate decimal rounding. Runtime values use JavaScript numbers and their ordinary IEEE-754 precision limits. GDP series are not inflation-adjusted, and nominal changes also reflect exchange-rate and price movements.
- `retrievedAt = 2026-10-25T17:48:56Z` records the latest local capture time of the two downloaded CSV inputs. Population was captured at 17:48:08 UTC; GDP at 17:48:56 UTC. Retrieval is separate from observation year and does not establish source publication or freshness.

## Verification limits

The primary World Bank API request was blocked with HTTP 403 in this cloud environment. These values were **not independently cross-checked against the primary service**; a matching file hash establishes the downloaded mirror artifact, not factual accuracy or current applicability. Source revision and official publication dates remain **unknown**. The population datapackage says `last_updated: 2023-05-04` despite newer observation rows, so that packaging field cannot establish the CSV's publication date. GDP's packaging update label likewise does not make 2023 observations current.

The snapshot does not measure market demand, digital adoption, competition, business survivability, regulatory readiness or current legal requirements. It supplies no market ranking, entry recommendation, forecast, calibrated probability or planner score. Do not present it as live or current intelligence, merge it into provider error fallbacks, or treat national observations as city-level facts. Any later refresh must select an explicit compatible period, revalidate completeness and units, update the pinned hashes, and retain the observation/retrieval distinction.
