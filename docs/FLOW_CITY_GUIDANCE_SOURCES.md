# City research guidance and source limits

The city cards provide curated research prompts and source-directory routes. They do not supply retrieved local market findings, current legal requirements or a recommendation to enter a city. The prompts are original editorial guidance; they are not quotations or conclusions extracted from the linked sites.

## Source routes

Each city uses the existing `src/data/marketCatalog.ts` directories. The Customers lens points to the country statistics directory and asks the reader to establish the dataset's actual city/catchment scope and observation period. The Location lens points to the local or land-use directory. Setup distinguishes national registration, a regional registry where supplied, and city or premises enquiries. The relevant offices and procedures depend on the business and address.

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
| London | https://www.gov.uk/find-local-council | Compare candidate premises near Bank station and on the Southwark side of London Bridge. Match statistical areas and observation periods to the intended buyers, then identify the council for each postcode. |
| Nairobi | https://nairobi.go.ke/ | Compare one Westlands address with one in Industrial Area. Test paid orders for the same offer and compare delivery costs for the same destinations. Ask about the exact premises and intended use. |
| Toronto | https://www.toronto.ca/services-payments/permits-licences-bylaws/ | Compare a Toronto address in Etobicoke with a Mississauga alternative. Verify city, CMA or GTA boundaries in market estimates and address municipal enquiries separately for each site. |

These are research questions and directory labels, not newly verified administrative or regulatory findings. In particular, the Ho Chi Minh City cards ask readers to check current geography rather than assert an older boundary or a specific reform date.

## Retrieval limitation

On 2026-10-28 at 05:13:06 UTC, one bounded batch attempted to retrieve the six Southeast Asian city/address directories above in the cloud runtime. All six failed before page access with `Tunnel connection failed: 403 Forbidden`. No response content, official publication date, effective date or current legal applicability was verified. Other inherited national/statistics directory links were not newly fetched in this pass. The runtime audit metadata is retained in the task at `/workspace/scratch/flow-city-guidance/official-source-access.json`.

The visible city section therefore says **“Research guidance, not verified findings. Source publication dates unknown.”** The shared source disclosure retains the wider limitations. The retrieval-attempt time is not a source observation date or evidence of freshness. Historical country GDP/population remain separate and retain their existing provenance; no city observations, scores, legal facts or live API results are added by this change.


On 2026-11-24, the cloud proxy returned HTTP 403 on CONNECT for the Australian Government business portal, Australian Bureau of Statistics and City of Sydney, including a second attempt with approved network escalation. These are directory links. No portal content, publication date, legal requirement or current applicability was verified. Sydney’s customer and premises prompts distinguish the City of Sydney council area from the broader Greater Sydney geography.


The cloud proxy also blocked CONNECT requests to New Zealand’s government business portal, Stats NZ and Auckland Council with HTTP 403 before any pages loaded. An approved network retry produced the same result. These directories are starting points for Auckland research. Their publication dates, contents and current applicability remain unverified.

The Dubai customer guide sends readers to the Federal Competitiveness and Statistics Centre to check each table’s period and geographic coverage. The setup guide points to the UAE government business directory and Dubai Department of Economy and Tourism. It asks readers to identify the relevant authority and obtain a dated answer for their proposed activity. On 2026-11-24 the cloud proxy returned HTTP 403 on CONNECT for all three destinations before any page loaded. Portal contents, publication dates, fees and operating requirements remain unverified. [National statistics](https://fcsc.gov.ae/) · [UAE business directory](https://u.ae/en/information-and-services/business) · [Dubai Department of Economy and Tourism](https://www.dubaidet.gov.ae/en/)

Phnom Penh uses the national statistics directory for dated tables and the capital administration as a starting point for address enquiries. The setup guide also links to the national online business registration directory. A cloud check of all three URLs, including an approved retry, stopped at the proxy with HTTP 403 on CONNECT. Page contents, publication dates, applicable authorities and operating requirements remain unverified. The prompts ask readers to obtain comparable written quotes and the exchange rate they used for any conversion. [National Institute of Statistics](https://www.nis.gov.kh/) · [Cambodia Online Business Registration](https://www.registrationservices.gov.kh/) · [Phnom Penh Capital Administration](https://phnompenh.gov.kh/)

## London research scope

The guide pairs a candidate City of London address near Bank station with one on the Southwark side of London Bridge. A shop can compare orders from the same offer across trading hours. A business supplier can compare buying authority and contract review dates. The locations and tests are editorial examples. Demand, costs and operating permissions for either site remain unknown.

The Office for National Statistics and London Datastore are starting points for checking the geography, period and population behind a table. A business should establish whether a count represents residents, workers or visitors before using it to size a customer catchment. The GOV.UK council finder is the starting point for postcode-specific enquiries. Ask the relevant council about the intended activity and obtain dated replies and site quotes. The national business setup directory is a separate starting point for the business structure. [Office for National Statistics](https://www.ons.gov.uk/) · [London Datastore](https://data.london.gov.uk/) · [Find a local council](https://www.gov.uk/find-local-council) · [Set up a business](https://www.gov.uk/set-up-business)

On 2026-11-24, the cloud proxy returned HTTP 403 on CONNECT before the GOV.UK council finder, business setup and business rates pages, ONS Census Maps, the City of London and Southwark homepages, or the London high streets data service could be read. The approved retry reached the same boundary. These addresses are directory pointers. Page contents, publication dates, rates, licensing requirements and applicability to either example address remain unverified.

## Nairobi research scope

Westlands and Industrial Area are two places a team can investigate. The guide asks founders to distinguish first orders from repeat requests and business suppliers to check purchasing approval and payment terms. For a premises comparison, teams can record dated transport quotes, loading and waiting time, and completed deliveries to the same customers from each address. These are proposed tests. Flow has no observations of orders, rents, transport prices or delivery times for either site.

The Kenya National Bureau of Statistics is a starting point for finding the year and geography of a published figure. The Business Registration Service is a directory for entity and branch enquiries. Nairobi City County is the starting point for questions about the actual unit and activity. On 2026-11-24 at 14:34 UTC, the cloud proxy returned HTTP 403 on CONNECT for all three directories. An approved retry received the same response before any page loaded. Page titles, contents, publication dates, site-specific permissions and fees remain unverified. [Kenya National Bureau of Statistics](https://www.knbs.or.ke/) · [Business Registration Service](https://brs.go.ke/) · [Nairobi City County](https://nairobi.go.ke/)

## Toronto research scope

An Etobicoke premises and a Mississauga alternative give a team two addresses to compare. A founder can map trial orders or appointments to postal areas. A supplier considering a corporate contract can compare the purchasing office with the sites where it would deliver. Statistics Canada is a starting point for checking the reference year and geography of a table. Verify whether it describes the City of Toronto, the Toronto census metropolitan area (CMA), or an area the publisher calls the Greater Toronto Area (GTA). National or regional totals alone cannot establish buyers in either catchment. [Statistics Canada](https://www.statcan.gc.ca/en/start)

For each site, the guide asks for comparable rent quotes and a timed delivery. For entity or branch questions it points to the federal registration directory and Ontario Business Registry. For activity, alterations and premises enquiries, Toronto’s directory is a starting point for the Etobicoke example. The Mississauga alternative needs a separate municipal enquiry. Flow supplies no determination of the registrations, licences or permissions a business needs. [Government of Canada business registration](https://www.canada.ca/en/services/business/start/register-with-gov.html) · [Ontario Business Registry](https://www.ontario.ca/page/ontario-business-registry) · [City of Toronto permits and licences](https://www.toronto.ca/services-payments/permits-licences-bylaws/)

On 2026-11-24 at 14:53 UTC, the cloud proxy returned HTTP 403 on CONNECT for all four directories before a page loaded. Their catalog names identify the intended destinations. Page titles, contents, publication dates and current applicability remain unverified.
