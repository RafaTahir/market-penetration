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
};
