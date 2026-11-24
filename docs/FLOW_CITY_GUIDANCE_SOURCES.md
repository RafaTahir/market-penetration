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
| Phnom Penh | https://phnompenh.gov.kh/ | Identify the khan and sangkat for each candidate address. Compare buyers’ alternatives inside the actual catchment and record the currency, term and inclusions of each site quote. |
| Sydney | https://www.cityofsydney.nsw.gov.au/ | Check an ABS table’s statistical geography and period, the actual premises council, and the federal, NSW or council contact for the activity |
| Auckland | https://www.aucklandcouncil.govt.nz/ | Compare Stats NZ regional, urban and smaller-area boundaries to the customer catchment. Check the council for the premises and the national route for the proposed business structure. |
| Dubai | https://www.dubaidet.gov.ae/en/ | Use the Dubai Department of Economy and Tourism as an emirate-level economic directory. Confirm which authority covers the exact activity and address, including a candidate free zone where relevant. |

These are research questions and directory labels, not newly verified administrative or regulatory findings. In particular, the Ho Chi Minh City cards ask readers to check current geography rather than assert an older boundary or a specific reform date.

## Retrieval limitation

On 2026-10-28 at 05:13:06 UTC, one bounded batch attempted to retrieve the six Southeast Asian city/address directories above in the cloud runtime. All six failed before page access with `Tunnel connection failed: 403 Forbidden`. No response content, official publication date, effective date or current legal applicability was verified. Other inherited national/statistics directory links were not newly fetched in this pass. The runtime audit metadata is retained in the task at `/workspace/scratch/flow-city-guidance/official-source-access.json`.

The visible city section therefore says **“Research guidance, not verified findings. Source publication dates unknown.”** The shared source disclosure retains the wider limitations. The retrieval-attempt time is not a source observation date or evidence of freshness. Historical country GDP/population remain separate and retain their existing provenance; no city observations, scores, legal facts or live API results are added by this change.


On 2026-11-24, the cloud proxy returned HTTP 403 on CONNECT for the Australian Government business portal, Australian Bureau of Statistics and City of Sydney, including a second attempt with approved network escalation. These are directory links. No portal content, publication date, legal requirement or current applicability was verified. Sydney’s customer and premises prompts distinguish the City of Sydney council area from the broader Greater Sydney geography.


The cloud proxy also blocked CONNECT requests to New Zealand’s government business portal, Stats NZ and Auckland Council with HTTP 403 before any pages loaded. An approved network retry produced the same result. These directories are starting points for Auckland research. Their publication dates, contents and current applicability remain unverified.

The Dubai customer guide sends readers to the Federal Competitiveness and Statistics Centre to check each table’s period and geographic coverage. The setup guide points to the UAE government business directory and Dubai Department of Economy and Tourism. It asks readers to identify the relevant authority and obtain a dated answer for their proposed activity. On 2026-11-24 the cloud proxy returned HTTP 403 on CONNECT for all three destinations before any page loaded. Portal contents, publication dates, fees and operating requirements remain unverified. [National statistics](https://fcsc.gov.ae/) · [UAE business directory](https://u.ae/en/information-and-services/business) · [Dubai Department of Economy and Tourism](https://www.dubaidet.gov.ae/en/)

Phnom Penh uses the national statistics directory for dated tables and the capital administration as a starting point for address enquiries. The setup guide also links to the national online business registration directory. A cloud check of all three URLs, including an approved retry, stopped at the proxy with HTTP 403 on CONNECT. Page contents, publication dates, applicable authorities and operating requirements remain unverified. The prompts ask readers to obtain comparable written quotes and the exchange rate they used for any conversion. [National Institute of Statistics](https://www.nis.gov.kh/) · [Cambodia Online Business Registration](https://www.registrationservices.gov.kh/) · [Phnom Penh Capital Administration](https://phnompenh.gov.kh/)
