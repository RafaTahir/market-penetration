# City research guidance and source limits

The city cards provide curated research prompts and source-directory routes. They do not supply retrieved local market findings, current legal requirements or a recommendation to enter a city. The prompts are original editorial guidance; they are not quotations or conclusions extracted from the linked sites.

## Source routes

Each city uses the existing `src/data/marketCatalog.ts` directories. The Customers lens points to the country statistics directory and asks the reader to establish the dataset's actual city/catchment scope and observation period. The Location lens points to the local or land-use directory. Setup separates the national starting point from the city/address starting point; neither link is represented as a complete registration checklist.

| City | City/address directory | Distinction to research |
| --- | --- | --- |
| Bangkok | https://www.bangkok.go.th/ | Customer catchment, intended address and responsible district; distinguish investment enquiries through BOI from local operating questions |
| Singapore | https://www.ura.gov.sg/ | Area-level demand research, proposed premises use and entity-registration questions through ACRA |
| Kuala Lumpur | https://www.dbkl.gov.my/ | Kuala Lumpur versus a wider Klang Valley catchment; confirm the address jurisdiction and distinguish MIDA investment enquiries from entity registration |
| Jakarta | https://www.jakarta.go.id/ | Jakarta-province evidence versus a wider Greater Jakarta catchment; national OSS enquiries versus address-specific questions |
| Manila | https://manila.gov.ph/ | City of Manila versus other Metro Manila cities; confirm the entity-registration route rather than assuming DTI covers every structure |
| Ho Chi Minh City | https://hochiminhcity.gov.vn/ | Confirm current address jurisdiction and the boundary/observation period used by a dataset or older page |

These are research questions and directory labels, not newly verified administrative or regulatory findings. In particular, the Ho Chi Minh City cards ask readers to check current geography rather than assert an older boundary or a specific reform date.

## Retrieval limitation

On 2026-10-28 at 05:13:06 UTC, one bounded batch attempted to retrieve the six city/address directories above in the cloud runtime. All six failed before page access with `Tunnel connection failed: 403 Forbidden`. No response content, official publication date, effective date or current legal applicability was verified. Other inherited national/statistics directory links were not newly fetched in this pass. The runtime audit metadata is retained in the task at `/workspace/scratch/flow-city-guidance/official-source-access.json`.

The visible city section therefore says **“Research guidance, not verified findings. Source publication dates unknown.”** The shared source disclosure retains the wider limitations. The retrieval-attempt time is not a source observation date or evidence of freshness. Historical country GDP/population remain separate and retain their existing provenance; no city observations, scores, legal facts or live API results are added by this change.
