# Historical market snapshot

`src/data/marketSnapshot.ts` contains annual national population and GDP observations for **2014–2023**, with **2023** as the common headline year. The 13 markets are Thailand (THA), Singapore (SGP), Malaysia (MYS), Indonesia (IDN), the Philippines (PHL), Vietnam (VNM), Cambodia (KHM), Australia (AUS), New Zealand (NZL), the United Arab Emirates (ARE), the United Kingdom (GBR), Kenya (KEN) and Canada (CAN).

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
- Filtering each pinned CSV to the 13 catalog ISO codes and years 2014 through 2023 yielded exactly 130 unique country-year observations per indicator. Every 2023 endpoint matched its existing headline. All selected population counts and GDP values were positive. The population mirror extends to 2025 for all 13 markets. GDP ends in 2023, which defines the common comparison period.
- `populationSeries` preserves decreases in the source. Singapore goes from 5,703,569 people in 2019 to 5,685,807 in 2020 and 5,453,566 in 2021. The other year-on-year decreases are Thailand in 2023, New Zealand in 2022 and the UAE in 2020. These observations alone do not establish causes.
- GDP units and indicator are explicit in its datapackage. The population datapackage identifies total-population series `SP.POP.TOTL`; its numeric counts are people, with no millions multiplier. Display abbreviation is the UI's responsibility.
- Raw CSV numeric literals are retained without deliberate decimal rounding. Runtime values use JavaScript numbers and their ordinary IEEE-754 precision limits. GDP series are not inflation-adjusted, and nominal changes also reflect exchange-rate and price movements.
- The pinned CSVs retain their archived local capture timestamps. `population.retrievedAt` is `2026-10-25T17:48:08Z` and `gdp.retrievedAt` is `2026-10-25T17:48:56Z`. The top-level `retrievedAt` records the later of the two captures for the combined snapshot. Retrieval is separate from observation year and does not establish source publication or freshness.

Australia was added on 2026-11-24 from the original cached CSVs. Both complete files matched the SHA-256 values above. Filtering to country code `AUS` yielded one 2023 population count (26,659,922) and one nominal GDP observation for each year from 2014 through 2023. The 2023 GDP value is 1,723,827,215,334.7063 current US dollars. The extraction date records when the Australian rows were selected. The input retrieval time stays 2026-10-25T17:48:56Z.

New Zealand uses the same cached CSVs and the same retrieval timestamp. Both whole-file hashes were checked again before selecting the unique rows for country code `NZL`. The population CSV gives exactly 5,200,000 people for 2023. The GDP CSV includes every year from 2014 through 2023 and gives 253,465,703,232.14594 current US dollars for 2023.

The UAE selection uses country code `ARE`. After verifying both cached CSVs against their original hashes, extraction yielded a 2023 population of 10,483,751 and GDP of 504,173,451,327.43365 current US dollars. Each GDP year from 2014 through 2023 has one observation. These totals cover the UAE nationally. Dubai city and emirate figures require separate sources with explicit geographic coverage. The original CSV capture times apply to this selection.

Cambodia’s national rows use country code `KHM`. Both whole-file hashes matched before extraction. The 2023 population count is 17,423,880 and GDP is 31,772,759,998.85713 current US dollars. Each GDP observation year from 2014 through 2023 occurs once. The figures describe national totals. Research about Phnom Penh or an individual district needs figures with the corresponding geographic scope.

The United Kingdom series uses country code `GBR`. The original pinned CSVs contain one 2023 UK population observation of 68,526,000 people and one GDP observation for every year from 2014 through 2023. The 2023 GDP value is 3,340,032,380,668.0356 current US dollars. Both file hashes matched before extraction. These figures describe the entire UK. Comparing a London borough or the wider London region requires observations for that geography.

The Kenya series uses country code `KEN`. Both original CSV hashes matched before extraction. The 2023 national observations are 55,339,003 residents and GDP of 107,440,575,838.04752 current US dollars. Each GDP year from 2014 through 2023 has exactly one row. These national series do not measure Nairobi County’s population or economic output.

The Canada series uses country code `CAN`. Both complete CSV hashes matched before extraction, with one population observation of 40,049,088 people for 2023 and one GDP observation per year from 2014 through 2023. Nominal 2023 GDP is 2,140,085,567,791.4514 current US dollars. The original CSV capture times apply. Toronto city and metropolitan area figures require separate observations for the relevant boundary.

## GDP per person

GDP per person is a Flow calculation in current US dollars per resident. For each selected year, divide national GDP by the national population with the same ISO code and observation year. For example, Singapore's 2014 inputs are US$314,863,580,758.45465 and 5,469,724 people. The 2023 comparison uses Singapore's 2023 inputs for both series. A missing input or a zero population leaves the ratio unavailable. A genuine zero GDP with a positive population yields zero.

Whole-dollar display values use the unrounded inputs. The shortlist export retains both source series and provenance. The ratio describes average output per resident. Household income, purchasing power and sales potential require separate evidence. Changes over time can also reflect prices and exchange rates.

## Verification limits

The original World Bank API request returned HTTP 403 in this cloud environment. Verification therefore covers the pinned mirror files. The upstream revision and official publication dates remain **unknown**. The population datapackage labels its last update `2023-05-04` despite containing newer observation years. Neither mirror's packaging date establishes when the upstream provider published these observations.

The snapshot does not measure market demand, digital adoption, competition, business survivability, regulatory readiness or current legal requirements. It supplies no market ranking, entry recommendation, forecast, calibrated probability or planner score. Do not present it as live or current intelligence, merge it into provider error fallbacks, or treat national observations as city-level facts. Any later refresh must select an explicit compatible period, revalidate completeness and units, update the pinned hashes, and retain the observation/retrieval distinction.
