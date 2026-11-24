/** Editorial fieldwork suggestions. No measured demand, quoted prices or verified regulatory requirements. */
export type ResearchAngle = 'demand' | 'costs' | 'setup';

interface Fieldwork {
  questions: readonly [string, string];
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
        questions: ['Which customer has a problem they will pay to solve?', 'Which language, sales channel and support model do they expect?'],
        evidence: 'Walk through a buyer’s last purchase. Record the problem, budget owner, existing tool and renewal date.',
        decision: 'Choose a pilot segment with a named buyer and a problem the product can solve today.',
      },
      costs: {
        questions: ['What will local sales, support and cloud delivery cost?', 'Can the same product and payment flow serve both markets?'],
        evidence: 'Price the same pilot with local hosting, payment fees, onboarding time and support coverage itemised.',
        decision: 'Check whether the pilot fee covers delivery at the service level the buyer expects.',
      },
      setup: {
        questions: ['Which data, payment or sector rules apply to the actual service?', 'Does selling remotely differ from employing or operating locally?'],
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
        questions: ['Who buys, on which occasions and at what price?', 'What do nearby alternatives reveal about menu, format and demand?'],
        evidence: 'Visit the proposed catchment at the intended trading times. Record menus, queue lengths and prices alongside dates.',
        decision: 'Choose the meal occasion and price point to test with a pop-up or preorder.',
      },
      costs: {
        questions: ['What do rent, fit-out, ingredients and delivery actually cost?', 'How do cold storage, wastage and staffing change the margin?'],
        evidence: 'Get dated rent and supplier quotes. Price one menu item using usable yield, packaging and any delivery commission.',
        decision: 'Work out how many orders per trading day cover fixed costs at that margin. Check whether the kitchen can deliver them.',
      },
      setup: {
        questions: ['Which food, premises and activity approvals need checking?', 'Which import, labelling and employment requirements fit this model?'],
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
        questions: ['Is the first route a store, marketplace, distributor or direct sales?', 'Which local competitors set expectations on price and service?'],
        evidence: 'Compare listings or shop shelves for the same item. Ask shoppers what they last bought and how they found it.',
        decision: 'Choose one product and channel for a small sales trial and define what would justify restocking.',
      },
      costs: {
        questions: ['What are the landed cost, fulfilment cost and return rate?', 'How do leases, inventory and payment terms affect cash needs?'],
        evidence: 'Obtain supplier, freight and fulfilment quotes for one order size. Record payment dates, returns terms and currency.',
        decision: 'Estimate cash tied up between buying stock and collecting payment, including returns.',
      },
      setup: {
        questions: ['Which product, consumer and import requirements need review?', 'Do store operations and online sales have different obligations?'],
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
        questions: ['Who is the anchor customer, and where is the demand served?', 'What quality, certification and delivery standards do buyers need?'],
        evidence: 'Collect a buyer specification, sample acceptance criteria, order frequency and required delivery window.',
        decision: 'Choose a sample run that tests the toughest acceptance criterion before pricing a larger order.',
      },
      costs: {
        questions: ['What do site, power, labour and logistics quotes include?', 'Which imported inputs or supplier dependencies affect lead times?'],
        evidence: 'Request comparable site, power, materials and freight quotes for the same batch size and shift pattern.',
        decision: 'Estimate cost per accepted unit after scrap and downtime. Identify the input worth testing first.',
      },
      setup: {
        questions: ['Which site, environmental and industrial approvals need review?', 'What customs, workforce and activity conditions fit the project?'],
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
        questions: ['Which client segment buys the service, and who approves it?', 'Do clients expect a local team, partner or professional credential?'],
        evidence: 'Trace a recent client purchase from brief to approval. Record referral sources, procurement steps and selection criteria.',
        decision: 'Choose the client type and sponsor to approach with a paid discovery engagement.',
      },
      costs: {
        questions: ['What does the delivery team cost at the intended utilisation?', 'How do sales cycles, collections and travel affect working capital?'],
        evidence: 'Cost a sample engagement using billable days, travel, subcontractors and the client’s actual payment terms.',
        decision: 'Check whether the initial fee and billing milestones cover delivery until the client pays.',
      },
      setup: {
        questions: ['Is the service or professional title subject to local regulation?', 'Which contracting, employment and tax questions need an adviser?'],
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
        questions: ['Which route and customer segment have a clear service gap?', 'What delivery speed, reliability and returns service do buyers need?'],
        evidence: 'Ask shippers for anonymised lane volumes, collection windows, failed deliveries and return trips.',
        decision: 'Select one lane and service window for a trial that can test the shipper’s main complaint.',
      },
      costs: {
        questions: ['What do warehouse, vehicle, labour and last-mile quotes include?', 'How do utilisation, empty trips and border delays affect the model?'],
        evidence: 'Quote a round trip on the proposed lane, including loading time, fuel, tolls, empty kilometres and failed drops.',
        decision: 'Check cost per successful delivery at the booked load and a lighter load before setting the rate.',
      },
      setup: {
        questions: ['Which transport, storage and cross-border permissions need review?', 'Are any goods subject to additional handling or customs conditions?'],
        evidence: 'Map the proposed lane, handovers, goods, storage conditions and any border crossing.',
        decision: 'Confirm which carriers or authorities must review the route and cargo before accepting a booking.',
      },
    },
  },
];
