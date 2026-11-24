/**
 * Curated research prompts, not retrieved city findings or legal requirements.
 * Follow the source directories in marketCatalog and verify their current scope.
 * Source publication dates and current applicability remain unknown.
 */
export type CityResearchLens = 'customers' | 'location' | 'setup';

interface CityResearchGuide {
  scope: string;
  prompts: Record<CityResearchLens, { question: string; detail: string }>;
}

export const CITY_RESEARCH_GUIDES: Readonly<Record<string, CityResearchGuide>> = {
  thailand: {
    scope: 'Bangkok address + customer catchment',
    prompts: {
      customers: {
        question: 'Which Bangkok catchment contains your first customers?',
        detail: 'Look for district-level tables, check their dates, then test demand around the intended address. A Thailand total is not a Bangkok customer estimate.',
      },
      location: {
        question: 'Which Bangkok address supports the operating model?',
        detail: 'Identify the responsible district through the city portal. Compare actual site quotes and customer journeys for that address.',
      },
      setup: {
        question: 'Investment support or operating at a Bangkok address?',
        detail: 'Use BOI for investment enquiries and the city portal for local-office discovery. Confirm which route fits the activity and ownership.',
      },
    },
  },
  singapore: {
    scope: 'Singapore · verify the address and activity',
    prompts: {
      customers: {
        question: 'Which part of Singapore contains the customer you need?',
        detail: 'Look for area-level datasets and their definitions before narrowing a national total to a customer segment. Validate the segment with actual buyers.',
      },
      location: {
        question: 'Does the intended Singapore premises fit the activity?',
        detail: 'Use URA as a starting point for the address and proposed use. Obtain current lease and service quotes separately from planning information.',
      },
      setup: {
        question: 'Which ACRA and premises questions fit this business?',
        detail: 'Separate entity-registration questions from address-use questions. Verify the current route for the actual business model rather than assuming one approval covers both.',
      },
    },
  },
  malaysia: {
    scope: 'Kuala Lumpur · separate wider Klang Valley research',
    prompts: {
      customers: {
        question: 'Kuala Lumpur customers or a wider Klang Valley catchment?',
        detail: 'Check whether a dataset covers Kuala Lumpur itself. Match interviews and delivery or travel radius to the customer area you intend to serve.',
      },
      location: {
        question: 'Which authority covers the proposed Kuala Lumpur address?',
        detail: 'Start with DBKL for an address confirmed within its jurisdiction. Keep premises research separate from a wider Klang Valley location comparison.',
      },
      setup: {
        question: 'Which national setup and Kuala Lumpur premises routes fit?',
        detail: 'Start investment enquiries with MIDA and address enquiries with DBKL. Confirm the relevant entity-registration body separately; MIDA is not a complete registration checklist.',
      },
    },
  },
  indonesia: {
    scope: 'Jakarta province · not all Greater Jakarta',
    prompts: {
      customers: {
        question: 'Jakarta province or a wider commuter catchment?',
        detail: 'Keep Jakarta-province tables separate from a Greater Jakarta sales area. Record which locations your customer interviews and purchase signals actually cover.',
      },
      location: {
        question: 'Is the operating address within your Jakarta research scope?',
        detail: 'Confirm the address and responsible office through the Jakarta portal. Price the actual site and delivery route rather than transferring a wider-region quote.',
      },
      setup: {
        question: 'How do national licensing and the Jakarta address fit together?',
        detail: 'Check activity and ownership questions through OSS. Then ask the relevant Jakarta office which address-specific steps apply to the proposed operation.',
      },
    },
  },
  philippines: {
    scope: 'City of Manila · not all Metro Manila',
    prompts: {
      customers: {
        question: 'City of Manila customers or another Metro Manila city?',
        detail: 'Match the dataset geography to the intended city and local catchment. A Metro Manila total does not establish demand for a City of Manila location.',
      },
      location: {
        question: 'Is this the City of Manila address you will operate from?',
        detail: 'Confirm the city and local address authority through the city portal. Do not carry premises research from another Metro Manila city across by default.',
      },
      setup: {
        question: 'Which registration route fits the structure and Manila address?',
        detail: 'Use DTI as a starting point, confirm the right entity-registration body, and verify city-specific steps for the exact address and business activity.',
      },
    },
  },
  vietnam: {
    scope: 'Ho Chi Minh City · confirm current address jurisdiction',
    prompts: {
      customers: {
        question: 'Which boundary does a Ho Chi Minh City figure use?',
        detail: 'Check the dataset boundary and observation period before locating the customer catchment. Do not combine older and newer geographic scopes without checking compatibility.',
      },
      location: {
        question: 'Which authority currently covers the Ho Chi Minh City address?',
        detail: 'Confirm the current administrative area and address authority through the city portal before comparing premises or reusing older location research.',
      },
      setup: {
        question: 'Which current registration and address authorities need checking?',
        detail: 'Use the national registration directory and the current city portal. Check effective dates and the jurisdiction used by each page before applying its guidance.',
      },
    },
  },
  cambodia: {
    scope: 'Phnom Penh · check the khan (district) and sangkat (commune) for each address',
    prompts: {
      customers: {
        question: 'Where do your first buyers in Phnom Penh buy today?',
        detail: 'Pick one customer type and two sangkats you can serve. Ask buyers in each where they last bought, what they paid and why they chose that supplier. Check the year and boundary of any statistics before applying them to either area.',
      },
      location: {
        question: 'What would it cost to serve those buyers from each Phnom Penh site?',
        detail: 'Test the trip from two candidate sites during delivery hours. For each written quote, record the currency, rent period, deposit, lease term and included services. If you convert amounts, keep the original quote and date the exchange rate.',
      },
      setup: {
        question: 'Who can confirm the setup steps for your activity at this address?',
        detail: 'Describe what you will sell, whether you will produce or store goods on site, and the address. Start with the national business portal for registration. Ask the capital administration which khan, sangkat or sector office can answer the premises question, and request a dated reply.',
      },
    },
  },
  australia: {
    scope: 'City of Sydney council area · check the boundary within Greater Sydney',
    prompts: {
      customers: {
        question: 'Is your first customer base in the City of Sydney or across Greater Sydney?',
        detail: 'Choose the suburbs you can serve. Check the ABS geography and observation year for each table, then test your price and delivery radius with buyers in those suburbs.',
      },
      location: {
        question: 'Which council covers the address on the Sydney lease quote?',
        detail: 'Check whether the proposed premises fall within the City of Sydney council area. For two candidate sites, record the relevant council, rent period and delivery access before comparing quotes.',
      },
      setup: {
        question: 'Which federal, NSW and council questions apply to this activity?',
        detail: 'Start with the Australian Government business portal. Describe the activity, ownership and exact operating address, then identify the state and council contacts that can confirm the applicable steps.',
      },
    },
  },
  'new-zealand': {
    scope: 'Auckland region · check the urban area and council boundary for each address',
    prompts: {
      customers: {
        question: 'Which part of Auckland can your first customers reach?',
        detail: 'Compare the suburbs inside your travel or delivery radius. Record whether a Stats NZ table describes the Auckland region, the urban area or a smaller statistical area, and when the observations were made.',
      },
      location: {
        question: 'Which Auckland premises work for your deliveries and staff?',
        detail: 'Start with two candidate addresses. Check the council boundary and ask Auckland Council about the proposed use where relevant. Compare access at operating hours, lease terms and actual supplier quotes.',
      },
      setup: {
        question: 'Which setup questions depend on the New Zealand business structure or the Auckland site?',
        detail: 'Take your proposed activity and ownership structure to the national business directory. Use the council directory to identify the contact for your exact address, and record the source and date for each answer.',
      },
    },
  },
  'united-arab-emirates': {
    scope: 'Dubai emirate · narrow the research to your district, buyers and operating address',
    prompts: {
      customers: {
        question: 'Which buyers could you reach from your proposed Dubai site?',
        detail: 'Choose a buyer segment and district. Check the geography and year of each table before using a UAE or emirate total. Ask local buyers which alternatives they use, what they pay and what would make them switch.',
      },
      location: {
        question: 'Which Dubai site works for your customers and deliveries?',
        detail: 'Compare two addresses at the hours you would trade. Record travel times, delivery access, quoted rent and included services. Ask who can confirm the proposed use at each address, including the relevant free-zone authority if applicable.',
      },
      setup: {
        question: 'Who can confirm the setup route for your proposed Dubai activity?',
        detail: 'Describe what you sell, who buys it and where the work takes place. Use the UAE portal and Dubai Department of Economy and Tourism to identify federal and emirate contacts. If considering a free zone, ask its authority about that activity and any sales outside the zone. Record the dated answers.',
      },
    },
  },
  uk: {
    scope: 'London · compare a City of London address with one in Southwark',
    prompts: {
      customers: {
        question: 'Who would buy near Bank station and on the Southwark side of London Bridge?',
        detail: 'Check whether local counts cover residents, workers or visitors. For retail, test the same offer at both sites at weekday lunch and on Saturday. Count passers-by and orders separately. For business sales, ask buyers who signs a purchase order and when they next review suppliers.',
      },
      location: {
        question: 'What would it cost to operate from each London address?',
        detail: 'Get written rent and service-charge quotes for each unit. Ask its council to check the rates estimate. Compare monthly totals and mark missing amounts. Time a delivery from kerb to stockroom during trading hours. For a second branch, include transfers from your existing site.',
      },
      setup: {
        question: 'Who can confirm your proposed use at each London postcode?',
        detail: 'Look up each postcode in the GOV.UK council finder. Send the council your activity, hours and delivery plan and ask what it needs to review before you sign a lease. For a subsidiary or branch, also confirm which entity would sign and who would handle any applications.',
      },
    },
  },
  kenya: {
    scope: 'Nairobi · compare one address in Westlands with one in Industrial Area',
    prompts: {
      customers: {
        question: 'Which buyers would reorder in Westlands or Industrial Area?',
        detail: 'Offer the same paid trial to one customer type in both areas. Record orders, repeat requests and the supplier each buyer uses today. For company accounts, ask who approves a new supplier and when it gets paid. Check the year and area of any KNBS figures you use.',
      },
      location: {
        question: 'What would the same delivery round cost from each Nairobi site?',
        detail: 'Test a round trip from each address to the same customers at the hour you would deliver. Record the vehicle quote, loading time, waiting charges and completed drops. Compare cost per completed drop alongside each site’s monthly rent and service charges.',
      },
      setup: {
        question: 'Which setup questions depend on the entity, and which on the Nairobi premises?',
        detail: 'Ask the Business Registration Service where to confirm the route for your proposed entity or branch. Give Nairobi City County the building, unit and intended use, such as packing goods or receiving customers. Request a dated answer on the office, steps and fees that apply to that site.',
      },
    },
  },
  canada: {
    scope: 'City of Toronto · compare an Etobicoke address with a Mississauga alternative',
    prompts: {
      customers: {
        question: 'Which buyers could you serve from Etobicoke or Mississauga?',
        detail: 'Map trial orders or appointments by customer postal area. For a corporate account, mark the sites that receive the service as well as the purchasing office. Check the year and boundary behind any City of Toronto, Toronto census metropolitan area (CMA) or Greater Toronto Area (GTA) total.',
      },
      location: {
        question: 'Which lease fits the space and delivery window you need?',
        detail: 'Request the unit area, base rent, additional rent and included charges for each site. Convert quoted annual rent per square foot to monthly CAD for the whole unit. Time a delivery to the same customer during the promised window, including loading and parking.',
      },
      setup: {
        question: 'Who can confirm your registration route and the proposed use of each site?',
        detail: 'Take your ownership or branch structure to the federal registration directory and Ontario Business Registry. Give the municipality your exact unit, activity and proposed alterations. Use Toronto’s permits directory for the Etobicoke site and ask Mississauga separately about its site.',
      },
    },
  },
};
