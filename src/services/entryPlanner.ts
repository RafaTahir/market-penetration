/**
 * Stage-one market entry preparation. This module does not fetch market data.
 * A complete record is still a user's assessment, not verified market evidence.
 */
export type Segment = 'founder' | 'sme' | 'enterprise';
export type Phase = 'exploring' | 'validating' | 'operating' | 'expanding';
export type Industry =
  | 'technology'
  | 'food-beverage'
  | 'retail'
  | 'manufacturing'
  | 'professional-services'
  | 'logistics';
export type CityId = 'jakarta' | 'manila';
export type FactorId = 'demand' | 'competition' | 'regulation' | 'costs' | 'talent';

export interface Evidence {
  rating: 1 | 2 | 3 | 4 | 5 | null;
  note: string;
  sourceUrl: string;
  observedOn: string;
  /** The business scope under which the user last reviewed this assessment. */
  profileContext?: string;
}

export interface Profile {
  segment: Segment;
  phase: Phase;
  industry: Industry;
  businessDescription: string;
  runwayMonths: number | null;
}

export interface PlannerState {
  version: 1;
  profile: Profile;
  evidence: Record<CityId, Record<FactorId, Evidence>>;
}

export interface FactorDefinition {
  id: FactorId;
  label: string;
  weight: number;
  question: string;
  action: string;
}

export interface CityDefinition {
  id: CityId;
  name: string;
  country: string;
  flag: string;
  sources: Array<{ title: string; url: string; scope: string }>;
}

export interface FactorEvaluation {
  id: FactorId;
  rating: number | null;
  qualified: boolean;
  reason: string;
}

export interface CityEvaluation {
  score: number | null;
  coverage: number;
  confidence: 'none' | 'low' | 'self-reported';
  ratedCount: number;
  qualifiedCount: number;
  factors: FactorEvaluation[];
  gaps: string[];
}

/** Weights are a transparent planning convention, not a validated prediction. */
export const FACTORS: readonly FactorDefinition[] = [
  {
    id: 'demand',
    label: 'Demand evidence',
    weight: 30,
    question: 'How strong is the evidence that customers in this city want your offer?',
    action: 'Document customer interviews, purchase signals, or a small paid demand test.',
  },
  {
    id: 'competition',
    label: 'Competitive position',
    weight: 20,
    question: 'How well supported is your reason for customers to choose you over local alternatives?',
    action: 'Compare local alternatives, prices, and your specific advantage for a target customer.',
  },
  {
    id: 'regulation',
    label: 'Regulatory preparation',
    weight: 20,
    question: 'How well have you checked the registrations and requirements relevant to your business?',
    action: 'Check applicable national and city requirements with official sources and local advice.',
  },
  {
    id: 'costs',
    label: 'Operating cost preparation',
    weight: 20,
    question: 'How well supported is your estimate of setup costs and ongoing operating costs?',
    action: 'Gather dated local quotes and build a budget covering setup, recurring costs, and contingencies.',
  },
  {
    id: 'talent',
    label: 'Talent and delivery access',
    weight: 10,
    question: 'How well have you checked access to the people or partners needed to deliver your offer?',
    action: 'Validate access to required skills, suppliers, and delivery partners using local conversations or quotes.',
  },
];

/** Discovery links only. The linked contents have not been fetched or verified. */
export const CITIES: readonly CityDefinition[] = [
  {
    id: 'jakarta',
    name: 'Jakarta',
    country: 'Indonesia',
    flag: '🇮🇩',
    sources: [
      {
        title: 'Online Single Submission (OSS)',
        url: 'https://oss.go.id/',
        scope: 'National · Indonesia · business licensing discovery',
      },
      {
        title: 'BPS Statistics Jakarta',
        url: 'https://jakarta.bps.go.id/',
        scope: 'Jakarta province · statistical data discovery',
      },
    ],
  },
  {
    id: 'manila',
    name: 'Manila',
    country: 'Philippines',
    flag: '🇵🇭',
    sources: [
      {
        title: 'Philippine Business Hub',
        url: 'https://business.gov.ph/',
        scope: 'National · Philippines · business registration discovery',
      },
      {
        title: 'Securities and Exchange Commission',
        url: 'https://www.sec.gov.ph/',
        scope: 'National · Philippines · company registration discovery',
      },
      {
        title: 'Philippine Statistics Authority',
        url: 'https://psa.gov.ph/',
        scope: 'National · Philippines · statistical data discovery',
      },
      {
        title: 'City Government of Manila',
        url: 'https://manila.gov.ph/',
        scope: 'City of Manila · municipal requirements discovery; not all Metro Manila',
      },
    ],
  },
];

export const METHODOLOGY =
  'Preparation index, not a survival probability or market forecast. Ratings are user assessments from 1 (weak preparation) to 5 (strong preparation). ' +
  'All five factors must have a rating, an evidence note of at least 20 characters, an HTTPS source link without embedded credentials, and a valid observation date within the past 365 days. ' +
  'Complete records are self-reported; a link and note do not verify their contents or truth. ' +
  'The index is the weighted mean of (rating − 1) / 4 × 100, rounded to a whole number: demand 30%, competition 20%, regulation 20%, costs 20%, talent 10%. ' +
  'Missing, stale, or future-dated evidence blocks the index, including missing regulatory evidence. ' +
  'An assessment must be reviewed again when its business profile changes. Complete evidence rated 1–2 still creates a preparation action gap. ' +
  'Compare cities only for the same business profile and industry. Runway is a separate user preparation input and does not change the index. ' +
  'Official source links are discovery starting points; their contents have not been verified.';

const SEGMENTS: readonly Segment[] = ['founder', 'sme', 'enterprise'];
const PHASES: readonly Phase[] = ['exploring', 'validating', 'operating', 'expanding'];
const INDUSTRIES: readonly Industry[] = [
  'technology', 'food-beverage', 'retail', 'manufacturing', 'professional-services', 'logistics',
];
const DAY_MS = 24 * 60 * 60 * 1000;

function emptyEvidence(): Evidence {
  return { rating: null, note: '', sourceUrl: '', observedOn: '' };
}

function emptyCityEvidence(): Record<FactorId, Evidence> {
  return {
    demand: emptyEvidence(),
    competition: emptyEvidence(),
    regulation: emptyEvidence(),
    costs: emptyEvidence(),
    talent: emptyEvidence(),
  };
}

export function createPlannerState(): PlannerState {
  return {
    version: 1,
    profile: {
      segment: 'founder',
      phase: 'exploring',
      industry: 'technology',
      businessDescription: '',
      runwayMonths: null,
    },
    evidence: { jakarta: emptyCityEvidence(), manila: emptyCityEvidence() },
  };
}

/** Read only explicit own fields; untrusted persisted data is never spread. */
function field(value: unknown, name: string): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  try {
    return Object.prototype.hasOwnProperty.call(value, name)
      ? (value as Record<string, unknown>)[name]
      : undefined;
  } catch {
    return undefined;
  }
}

function text(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function choice<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  return typeof value === 'string' && choices.includes(value as T) ? value as T : fallback;
}

function rating(value: unknown): Evidence['rating'] {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
    ? value as Evidence['rating']
    : null;
}

function sourceUrl(value: unknown): string {
  const candidate = text(value, 2048);
  // Reject oversized URLs instead of truncating them into a different location.
  if (typeof value !== 'string' || value.trim().length > 2048) return '';
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return '';
    return candidate;
  } catch {
    return '';
  }
}

/** A strict calendar date, not Date.parse's permissive rollover dates. */
function dateTimestamp(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) return null;
  return time;
}

/** Runway changes do not invalidate market evidence; business scope changes do. */
export function getProfileContext(profile: Profile): string {
  return JSON.stringify([
    choice(field(profile, 'segment'), SEGMENTS, 'founder'),
    choice(field(profile, 'phase'), PHASES, 'exploring'),
    choice(field(profile, 'industry'), INDUSTRIES, 'technology'),
    text(field(profile, 'businessDescription'), 1200),
  ]);
}

export function parsePlannerState(value: unknown): PlannerState {
  const result = createPlannerState();
  if (field(value, 'version') !== 1) return result;

  const rawProfile = field(value, 'profile');
  result.profile.segment = choice(field(rawProfile, 'segment'), SEGMENTS, result.profile.segment);
  result.profile.phase = choice(field(rawProfile, 'phase'), PHASES, result.profile.phase);
  result.profile.industry = choice(field(rawProfile, 'industry'), INDUSTRIES, result.profile.industry);
  result.profile.businessDescription = text(field(rawProfile, 'businessDescription'), 1200);
  const runway = field(rawProfile, 'runwayMonths');
  result.profile.runwayMonths = typeof runway === 'number' && Number.isFinite(runway) && runway >= 0 && runway <= 120
    ? runway
    : null;

  const rawEvidence = field(value, 'evidence');
  for (const city of CITIES) {
    const rawCity = field(rawEvidence, city.id);
    for (const factor of FACTORS) {
      const rawFactor = field(rawCity, factor.id);
      const observedOn = field(rawFactor, 'observedOn');
      const profileContext = field(rawFactor, 'profileContext');
      result.evidence[city.id][factor.id] = {
        rating: rating(field(rawFactor, 'rating')),
        note: text(field(rawFactor, 'note'), 2000),
        sourceUrl: sourceUrl(field(rawFactor, 'sourceUrl')),
        observedOn: typeof observedOn === 'string' && dateTimestamp(observedOn) !== null ? observedOn : '',
      };
      // A context may contain escaped JSON text from the bounded description.
      // Never attach today's scope to an older assessment automatically.
      if (typeof profileContext === 'string' && profileContext.length > 0 && profileContext.length <= 8192) {
        result.evidence[city.id][factor.id].profileContext = profileContext;
      }
    }
  }
  return result;
}

function evaluateFactor(evidence: Evidence, factor: FactorDefinition, today: number, profileContext: string): FactorEvaluation {
  const reasons: string[] = [];
  if (evidence.rating === null) reasons.push('Add a 1–5 preparation rating.');
  if (evidence.note.length < 20) reasons.push('Add an evidence note of at least 20 characters.');
  if (!evidence.sourceUrl) reasons.push('Add a valid HTTPS source link without embedded credentials.');
  const observation = dateTimestamp(evidence.observedOn);
  if (observation === null) reasons.push('Add a valid observation date.');
  else if (observation > today) reasons.push('The observation date is in the future.');
  else if (today - observation > 365 * DAY_MS) reasons.push('Evidence is older than 365 days; refresh it.');
  if ((evidence.rating !== null || evidence.note.length > 0) && evidence.profileContext !== profileContext) {
    reasons.push('Business profile changed — review and save this assessment again.');
  }

  return {
    id: factor.id,
    rating: evidence.rating,
    qualified: reasons.length === 0,
    reason: reasons.length ? reasons.join(' ') : 'Complete, recent self-reported documentation; source contents and present applicability have not been verified.',
  };
}

export function evaluateCity(state: PlannerState, city: CityId, today?: string): CityEvaluation {
  const clean = parsePlannerState(state);
  const todayText = today ?? new Date().toISOString().slice(0, 10);
  const todayTime = dateTimestamp(todayText);
  if (todayTime === null) throw new RangeError('today must be a real YYYY-MM-DD calendar date.');
  const profileContext = getProfileContext(clean.profile);
  const factors = FACTORS.map((factor) => evaluateFactor(clean.evidence[city][factor.id], factor, todayTime, profileContext));
  const qualifiedCount = factors.filter((factor) => factor.qualified).length;
  const ratedCount = factors.filter((factor) => factor.rating !== null).length;
  const complete = qualifiedCount === FACTORS.length;
  const weightedPoints = FACTORS.reduce((total, factor, index) => {
    const value = factors[index].rating;
    return total + (value === null ? 0 : ((value - 1) / 4) * factor.weight);
  }, 0);
  const totalWeight = FACTORS.reduce((total, factor) => total + factor.weight, 0);

  return {
    score: complete ? Math.round((weightedPoints / totalWeight) * 100) : null,
    coverage: qualifiedCount / FACTORS.length,
    confidence: complete ? 'self-reported' : qualifiedCount > 0 ? 'low' : 'none',
    ratedCount,
    qualifiedCount,
    factors,
    gaps: factors.flatMap((factor, index) => {
      const definition = FACTORS[index];
      if (!factor.qualified) return [`${definition.label}: ${factor.reason} ${definition.action}`];
      if (factor.rating !== null && factor.rating <= 2) {
        return [`${definition.label}: Preparation rated ${factor.rating}/5. ${definition.action}`];
      }
      return [];
    }),
  };
}
