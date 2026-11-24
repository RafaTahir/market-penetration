/** Editorial fieldwork suggestions. No measured demand, quoted prices or verified regulatory requirements. */
export type ResearchAngle = 'demand' | 'costs' | 'setup';

export const INDUSTRY_ANGLE_LABELS: Readonly<Record<ResearchAngle, string>> = {
  demand: 'Customer & demand',
  costs: 'Cost & delivery',
  setup: 'Setup & regulation',
};

export type IndustryQuestionId = `industry-${string}`;

interface IndustryPrompt {
  readonly id: IndustryQuestionId;
  readonly text: string;
}

interface Fieldwork {
  questions: readonly [IndustryPrompt, IndustryPrompt];
  evidence: string;
  decision: string;
}

interface IndustryGuide {
  id: 'technology' | 'food-beverage' | 'retail' | 'manufacturing' | 'professional-services' | 'logistics';
  name: string;
  shortName: string;
  question: string;
  subtitle: string;
  angles: Record<ResearchAngle, Fieldwork>;
}

export const INDUSTRIES: readonly IndustryGuide[] = [
  {
    id: 'technology', name: 'Technology & software', shortName: 'Technology',
    question: 'Who will buy first—and what needs to work locally?',
    subtitle: 'Look beyond adoption headlines to customers, distribution and delivery.',
    angles: {
      demand: {
        questions: [
          { id: 'industry-technology-buyer-problem', text: 'Which customer has a problem they will pay to solve?' },
          { id: 'industry-technology-sales-and-support', text: 'Which language, sales channel and support model do they expect?' },
        ],
        evidence: 'Walk through a buyer’s last purchase. Record the problem, budget owner, existing tool and renewal date.',
        decision: 'Choose a pilot segment with a named buyer and a problem the product can solve today.',
      },
      costs: {
        questions: [
          { id: 'industry-technology-pilot-delivery-costs', text: 'What will local sales, support and cloud delivery cost?' },
          { id: 'industry-technology-product-and-payments', text: 'Can the same product and payment flow serve both markets?' },
        ],
        evidence: 'Price the same pilot with local hosting, payment fees, onboarding time and support coverage itemised.',
        decision: 'Check whether the pilot fee covers delivery at the service level the buyer expects.',
      },
      setup: {
        questions: [
          { id: 'industry-technology-service-rules', text: 'Which data, payment or sector rules apply to the actual service?' },
          { id: 'industry-technology-remote-or-local-operations', text: 'Does selling remotely differ from employing or operating locally?' },
        ],
        evidence: 'Sketch where customer data goes, who handles payments and which entity would sign the contract.',
        decision: 'Identify which parts of the pilot need specialist review before using customer data.',
      },
    },
  },
  {
    id: 'food-beverage', name: 'Food & beverage', shortName: 'Food & beverage',
    question: 'Does the location work as well as the concept?',
    subtitle: 'Research the customer occasion, supply chain and specific premises together.',
    angles: {
      demand: {
        questions: [
          { id: 'industry-food-beverage-buying-occasion', text: 'Who buys, on which occasions and at what price?' },
          { id: 'industry-food-beverage-nearby-alternatives', text: 'What do nearby alternatives reveal about menu, format and demand?' },
        ],
        evidence: 'Visit the proposed catchment at the intended trading times. Record menus, queue lengths and prices alongside dates.',
        decision: 'Choose the meal occasion and price point to test with a pop-up or preorder.',
      },
      costs: {
        questions: [
          { id: 'industry-food-beverage-premises-and-ingredients', text: 'What do rent, fit-out, ingredients and delivery actually cost?' },
          { id: 'industry-food-beverage-kitchen-margin', text: 'How do cold storage, wastage and staffing change the margin?' },
        ],
        evidence: 'Get dated rent and supplier quotes. Price one menu item using usable yield, packaging and any delivery commission.',
        decision: 'Work out how many orders per trading day cover fixed costs at that margin. Check whether the kitchen can deliver them.',
      },
      setup: {
        questions: [
          { id: 'industry-food-beverage-premises-approvals', text: 'Which food, premises and activity approvals need checking?' },
          { id: 'industry-food-beverage-import-and-employment', text: 'Which import, labelling and employment requirements fit this model?' },
        ],
        evidence: 'List the proposed cooking, storage and delivery activities against the exact address and floor plan.',
        decision: 'Ask the relevant authorities which uses need review before committing to the lease or fit-out.',
      },
    },
  },
  {
    id: 'retail', name: 'Retail & commerce', shortName: 'Retail',
    question: 'Where will customers find you—and what brings them back?',
    subtitle: 'Compare a real route to the customer, not just the size of the market.',
    angles: {
      demand: {
        questions: [
          { id: 'industry-retail-first-sales-channel', text: 'Is the first route a store, marketplace, distributor or direct sales?' },
          { id: 'industry-retail-competitor-expectations', text: 'Which local competitors set expectations on price and service?' },
        ],
        evidence: 'Compare listings or shop shelves for the same item. Ask shoppers what they last bought and how they found it.',
        decision: 'Choose one product and channel for a small sales trial and define what would justify restocking.',
      },
      costs: {
        questions: [
          { id: 'industry-retail-landed-and-fulfilment-costs', text: 'What are the landed cost, fulfilment cost and return rate?' },
          { id: 'industry-retail-inventory-and-cash', text: 'How do leases, inventory and payment terms affect cash needs?' },
        ],
        evidence: 'Obtain supplier, freight and fulfilment quotes for one order size. Record payment dates, returns terms and currency.',
        decision: 'Estimate cash tied up between buying stock and collecting payment, including returns.',
      },
      setup: {
        questions: [
          { id: 'industry-retail-product-and-import-rules', text: 'Which product, consumer and import requirements need review?' },
          { id: 'industry-retail-store-or-online-obligations', text: 'Do store operations and online sales have different obligations?' },
        ],
        evidence: 'Document one item’s origin, materials, claims, labelling and proposed sales channel.',
        decision: 'Confirm who can verify the rules for that item and channel before placing a stock order.',
      },
    },
  },
  {
    id: 'manufacturing', name: 'Manufacturing', shortName: 'Manufacturing',
    question: 'Can the operating site support the whole production model?',
    subtitle: 'Bring demand, supplier access and site requirements into the same comparison.',
    angles: {
      demand: {
        questions: [
          { id: 'industry-manufacturing-anchor-customer', text: 'Who is the anchor customer, and where is the demand served?' },
          { id: 'industry-manufacturing-buyer-standards', text: 'What quality, certification and delivery standards do buyers need?' },
        ],
        evidence: 'Collect a buyer specification, sample acceptance criteria, order frequency and required delivery window.',
        decision: 'Choose a sample run that tests the toughest acceptance criterion before pricing a larger order.',
      },
      costs: {
        questions: [
          { id: 'industry-manufacturing-site-and-production-quotes', text: 'What do site, power, labour and logistics quotes include?' },
          { id: 'industry-manufacturing-supplier-lead-times', text: 'Which imported inputs or supplier dependencies affect lead times?' },
        ],
        evidence: 'Request comparable site, power, materials and freight quotes for the same batch size and shift pattern.',
        decision: 'Estimate cost per accepted unit after scrap and downtime. Identify the input worth testing first.',
      },
      setup: {
        questions: [
          { id: 'industry-manufacturing-site-approvals', text: 'Which site, environmental and industrial approvals need review?' },
          { id: 'industry-manufacturing-customs-and-workforce', text: 'What customs, workforce and activity conditions fit the project?' },
        ],
        evidence: 'Prepare the proposed site address, process diagram, materials, waste streams and equipment list.',
        decision: 'Confirm which agencies can review site suitability before committing capital to equipment or premises.',
      },
    },
  },
  {
    id: 'professional-services', name: 'Professional services', shortName: 'Services',
    question: 'How will trust turn into a repeatable client pipeline?',
    subtitle: 'Test the buying relationship, delivery team and scope of the service.',
    angles: {
      demand: {
        questions: [
          { id: 'industry-professional-services-client-approval', text: 'Which client segment buys the service, and who approves it?' },
          { id: 'industry-professional-services-local-team', text: 'Do clients expect a local team, partner or professional credential?' },
        ],
        evidence: 'Trace a recent client purchase from brief to approval. Record referral sources, procurement steps and selection criteria.',
        decision: 'Choose the client type and sponsor to approach with a paid discovery engagement.',
      },
      costs: {
        questions: [
          { id: 'industry-professional-services-team-utilisation', text: 'What does the delivery team cost at the intended utilisation?' },
          { id: 'industry-professional-services-working-capital', text: 'How do sales cycles, collections and travel affect working capital?' },
        ],
        evidence: 'Cost a sample engagement using billable days, travel, subcontractors and the client’s actual payment terms.',
        decision: 'Check whether the initial fee and billing milestones cover delivery until the client pays.',
      },
      setup: {
        questions: [
          { id: 'industry-professional-services-regulated-titles', text: 'Is the service or professional title subject to local regulation?' },
          { id: 'industry-professional-services-contracting-and-tax', text: 'Which contracting, employment and tax questions need an adviser?' },
        ],
        evidence: 'Write the proposed scope and professional titles, where staff will work and which entity will invoice.',
        decision: 'Use the scope to check licensing and contracting questions with an adviser before sending the proposal.',
      },
    },
  },
  {
    id: 'logistics', name: 'Logistics & delivery', shortName: 'Logistics',
    question: 'Where does the route make operational and commercial sense?',
    subtitle: 'Research the actual lane, customer density and delivery commitments.',
    angles: {
      demand: {
        questions: [
          { id: 'industry-logistics-route-service-gap', text: 'Which route and customer segment have a clear service gap?' },
          { id: 'industry-logistics-buyer-service-levels', text: 'What delivery speed, reliability and returns service do buyers need?' },
        ],
        evidence: 'Ask shippers for anonymised lane volumes, collection windows, failed deliveries and return trips.',
        decision: 'Select one lane and service window for a trial that can test the shipper’s main complaint.',
      },
      costs: {
        questions: [
          { id: 'industry-logistics-last-mile-quotes', text: 'What do warehouse, vehicle, labour and last-mile quotes include?' },
          { id: 'industry-logistics-utilisation-and-delays', text: 'How do utilisation, empty trips and border delays affect the model?' },
        ],
        evidence: 'Quote a round trip on the proposed lane, including loading time, fuel, tolls, empty kilometres and failed drops.',
        decision: 'Check cost per successful delivery at the booked load and a lighter load before setting the rate.',
      },
      setup: {
        questions: [
          { id: 'industry-logistics-transport-permissions', text: 'Which transport, storage and cross-border permissions need review?' },
          { id: 'industry-logistics-cargo-conditions', text: 'Are any goods subject to additional handling or customs conditions?' },
        ],
        evidence: 'Map the proposed lane, handovers, goods, storage conditions and any border crossing.',
        decision: 'Confirm which carriers or authorities must review the route and cargo before accepting a booking.',
      },
    },
  },
];

interface IndustryQuestion {
  id: IndustryQuestionId;
  industryId: IndustryGuide['id'];
  industryName: string;
  angle: ResearchAngle;
  question: string;
  evidence: string;
  decision: string;
}

// Persist semantic IDs only. Prompt wording and order may change independently of saved plans.
const questionsById = new Map<IndustryQuestionId, Readonly<IndustryQuestion>>();
for (const industry of INDUSTRIES) {
  for (const angle of ['demand', 'costs', 'setup'] as const) {
    const { questions, evidence, decision } = industry.angles[angle];
    for (const { id, text } of questions) {
      if (questionsById.has(id)) throw new Error(`Duplicate industry question ID: ${id}`);
      questionsById.set(id, Object.freeze({
        id, industryId: industry.id, industryName: industry.name, angle, question: text, evidence, decision,
      }));
    }
  }
}

export const INDUSTRY_QUESTION_IDS = Object.freeze([...questionsById.keys()]);

export function getIndustryQuestion(id: unknown): Readonly<IndustryQuestion> | undefined {
  return typeof id === 'string' ? questionsById.get(id as IndustryQuestionId) : undefined;
}
