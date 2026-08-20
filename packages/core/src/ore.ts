/**
 * ORE (Origin, Reliability, Exposure) and STRUCK.
 *
 * Source grading at the ingestion boundary and obligation auditing at the
 * output boundary. ORE explicitly declines to specify how any dimension is
 * computed, so nothing here returns a grade. These functions return the
 * structure a conformant grading must fill, the gaps a given account leaves
 * open, and prompt templates for the judgment a model or a person makes.
 *
 * Specifications: ore-specification-0_1_2.md and finding-contract-0_1_0.md
 * at github.com/CrossWalkri/ORE.
 *
 * Version 0.1.0 | CC0
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OreDimensionName =
  | 'provenance-integrity'
  | 'epistemic-soundness'
  | 'confirmation-architecture'
  | 'track-record'
  | 'independence'

export type OreConfirmationMode =
  | 'trustless-single'
  | 'trustless-multi'
  | 'trust-based-single'
  | 'trust-based-multi'
  | 'unconfirmed'

export type OrePosture = 'screened' | 'graded' | 'open'

export interface OreDimensionScaffold {
  name: OreDimensionName
  question: string
  /** What a conformant grading must record on this dimension. */
  mustRecord: string[]
  /** Sub-assessments the supplied account cannot support, recorded as named flags. */
  namedGaps: string[]
  /** Rules that bind this dimension and are easy to violate. */
  constraints: string[]
}

export interface OreSourceInput {
  label: string
  description: string
  /** How origin is evidenced: signature, publisher, chain of custody, nothing. */
  originEvidence?: string
  /** What confirmed the source's output at the time it was produced. */
  confirmation?: string
  /** Whether the source discloses its internal architecture. */
  opaque?: boolean
  /** Whether the source has a stake in how the attested events are recorded. */
  stake?: string
  /** Interaction history, if any. */
  history?: string
}

export interface OreGradingScaffold {
  source: { label: string; description: string }
  dimensions: OreDimensionScaffold[]
  confirmationCandidates: OreConfirmationMode[]
  opacity: { opaque: boolean; obligations: string[] }
  monitoring: string[]
  standingRules: string[]
  promptTemplate: string
}

export interface OreEvidenceItem {
  label: string
  /** What the item states as its own basis: a citation, an attribution, nothing. */
  statedBasis?: string
  /** Any known relationship to another item or to an interested party. */
  relationships?: string
}

export interface OreIndependenceResult {
  claim: string
  items: Array<{
    label: string
    statedBasis: string | null
    rungLabelRequired: boolean
    notes: string[]
  }>
  distinctOriginsClaimed: number
  distinctOriginsEstablished: number | null
  flags: string[]
  constraints: string[]
  promptTemplate: string
}

export type OreObligationName =
  | 'graded-evidence'
  | 'refutation-conditions'
  | 'contested-regions'
  | 'derivation-to-origin'
  | 'judgment-with-consumer'

export type OreObligationStatus = 'indicated' | 'absent' | 'undetermined'

export interface OreObligationCheck {
  name: OreObligationName
  status: OreObligationStatus
  observed: string
  gap: string | null
  fix: string | null
}

export interface OreFindingAudit {
  obligations: OreObligationCheck[]
  systemicPatterns: string[]
  verdictNote: string
  promptTemplate: string
}

// ---------------------------------------------------------------------------
// Source grading scaffold
// ---------------------------------------------------------------------------

const DIMENSION_QUESTIONS: Record<OreDimensionName, string> = {
  'provenance-integrity':
    'Did this input come from where it claims, and did it arrive unchanged?',
  'epistemic-soundness':
    'Is the source output structured so that truth-evaluation by independent parties is possible?',
  'confirmation-architecture':
    'When this source produced its output, what confirmed it?',
  'track-record':
    'Has this source history of outputs surviving challenge accumulated evidence about its reliability?',
  independence:
    'Does the source have a stake in how the attested events are recorded?',
}

const DIMENSION_CONSTRAINTS: Record<OreDimensionName, string[]> = {
  'provenance-integrity': [
    'Near-binary: the evidence of origin and tamper-evidence either holds or it does not.',
    'Strength here guarantees origin only. It does not guarantee the originating party had accurate information, and must not stand in for any other dimension.',
  ],
  'epistemic-soundness': [
    'Assess three properties separately: are claims stated in terms reality can refute, are accuracy and relevance kept apart, does the source distinguish observation from inference.',
    'A perfectly sincere source can fail all three. Sincerity is not evidence on this dimension.',
  ],
  'confirmation-architecture': [
    'Never operationalize by party count. N signatures do not show that N independent perspectives confirmed anything.',
    'Where effective independence cannot be assessed, record a named flag on this dimension rather than an assumed value.',
    'A source may carry more than one confirmation mode at once. Record each mode present rather than forcing one cell.',
  ],
  'track-record': [
    'Uncomputable for new sources. Record as a named limitation, never as a middle grade.',
    'Adversarial resistance, meaning whether a challenge mechanism functions under pressure rather than merely existing, is a sub-case of this dimension.',
  ],
  independence: [
    'A structurally sound source can be informationally captured, with all of its information flowing from parties interested in the outcome.',
    'This dimension addresses conflict of interest. Epistemic soundness addresses claim structure. Both are required for the full picture.',
  ],
}

const DIMENSION_RECORDS: Record<OreDimensionName, string[]> = {
  'provenance-integrity': [
    'The assessment.',
    'What the evidence of origin actually is.',
    'Any sub-assessment that could not be computed, as a named flag.',
  ],
  'epistemic-soundness': [
    'The assessment.',
    'The basis: which of the three structural properties were examined and how.',
    'Any property that could not be examined, as a named flag.',
  ],
  'confirmation-architecture': [
    'Every confirmation mode present, not one cell.',
    'The basis for each mode.',
    'Whether effective independence was assessable, as a named flag where it was not.',
  ],
  'track-record': [
    'Whether the dimension was graded at all. Where it was not, declare its absence.',
    'The basis where graded.',
    'Which limitations are expected to resolve with accumulated history and which are permanent for the source class.',
  ],
  independence: [
    'Whether the dimension was graded at all. Where it was not, declare its absence.',
    'The basis where graded: what stake was looked for and where.',
  ],
}

/**
 * Build the grading scaffold for a source: the four dimensions with what must
 * be recorded on each, the gaps the supplied account leaves open, the opacity
 * obligations, and the monitoring obligation that keeps the grade from being a
 * verdict.
 *
 * Returns structure and gaps. It does not return a grade, because ORE does not
 * specify how any dimension is computed.
 */
export function gradeSourceScaffold(input: OreSourceInput): OreGradingScaffold {
  const names: OreDimensionName[] = [
    'provenance-integrity',
    'epistemic-soundness',
    'confirmation-architecture',
    'track-record',
    'independence',
  ]

  const dimensions: OreDimensionScaffold[] = names.map((name) => {
    const namedGaps: string[] = []

    if (name === 'provenance-integrity' && !input.originEvidence) {
      namedGaps.push(
        'No evidence of origin supplied. Record provenance integrity as unestablished rather than assuming it holds.',
      )
    }
    if (name === 'confirmation-architecture') {
      if (!input.confirmation) {
        namedGaps.push(
          'No confirmation described. The candidate state is unconfirmed, which carries the highest confirmation uncertainty and is a recorded state rather than a blank.',
        )
      } else if (looksLikePartyCount(input.confirmation)) {
        namedGaps.push(
          'The confirmation account is expressed as a count of parties. Party count is visible; independence is not. Record effective independence as a named flag unless it was separately assessed.',
        )
      }
    }
    if (name === 'track-record' && !input.history) {
      namedGaps.push(
        'No interaction history supplied. If the source is new this is a genesis limitation and must be recorded as such, never defaulted to a middle grade.',
      )
    }
    if (name === 'independence' && !input.stake) {
      namedGaps.push(
        'No stake assessment supplied. Declare the absence of this dimension rather than omitting it silently.',
      )
    }

    return {
      name,
      question: DIMENSION_QUESTIONS[name],
      mustRecord: DIMENSION_RECORDS[name],
      namedGaps,
      constraints: DIMENSION_CONSTRAINTS[name],
    }
  })

  const opaque = input.opaque === true
  const opacityObligations = opaque
    ? [
        'Admit or decline according to the declared posture, never according to an unrecorded judgment about why the source is opaque.',
        'If admitted, enter at the grade the visible properties warrant, with a monitoring obligation attached.',
        'Do not treat a disclosure requirement as resolving opacity. An actor who knows the requirements can engineer conformance while obscuring what matters.',
      ]
    : [
        'Opacity not declared for this source. If the internal architecture is in fact undisclosed, re-run with opaque set and apply the opacity obligations.',
      ]

  return {
    source: { label: input.label, description: input.description },
    dimensions,
    confirmationCandidates: confirmationCandidates(input.confirmation),
    opacity: { opaque, obligations: opacityObligations },
    monitoring: [
      'Attach what should be watched over time. A grade that never updates and never triggers monitoring is a verdict under another name.',
      'Sources can degrade or be captured without any single measurement crossing a threshold. Absence of an adverse signal is the limit of what can be seen, not the absence of danger.',
    ],
    standingRules: [
      'The grade measures uncertainty, not quality. Never present it as a judgment of the source worth.',
      'Never use a low grade as grounds for rejection where the declared posture admits the source.',
      'Ungraded and low-grade are different states with different obligations.',
      'Do not combine the dimensions into a single score. A profile of separately based assessments is hard to tune silently and cheap to audit; one number is the reverse.',
    ],
    promptTemplate: gradeSourcePrompt(input),
  }
}

function looksLikePartyCount(confirmation: string): boolean {
  const c = confirmation.toLowerCase()
  const patterns = [
    /\b\d+\s*(signature|signer|attester|reviewer|validator|party|parties|source)/,
    /\bmulti(sig|-sig|ple parties)/,
    /\b(two|three|four|five|several|multiple)\s+(signature|signer|attester|reviewer|validator|part|source)/,
    /\bcorroborat/,
    /\bconfirmed by \d+/,
  ]
  return patterns.some((p) => p.test(c))
}

/**
 * Suggest which cells of the confirmation-architecture table an account may
 * occupy. Written against the table directly: mechanism-required confirmation
 * (multisig, validator set, passed vote) is trustless multi-party; adversarial
 * or consensus confirmation built into the mechanism (bonded curation with
 * challengers, multi-reviewer processes) is trust-based multi-party.
 *
 * These are candidates for a grader to confirm or reject, never a determination.
 * A source can occupy more than one cell, so more than one may be returned.
 *
 * Patterns carry no trailing word boundary, so inflected forms match:
 * "signatures", "cryptographic", "curation", "challengers", "reviewers".
 */
function confirmationCandidates(confirmation?: string): OreConfirmationMode[] {
  if (!confirmation) return ['unconfirmed']
  const c = confirmation.toLowerCase()
  const out: OreConfirmationMode[] = []

  const mechanismMulti =
    /\b(multisig|multi-sig|validator|quorum|passed vote|on-chain vote|threshold signature)/.test(c)
  const cryptoSingle =
    /\b(cryptograph|signature|signed|proof|hash|attestation|attested|on-chain)/.test(c)
  const adversarialMulti =
    /\b(bonded curation|challenger|counter-stake|adversarial|multi-reviewer|multiple reviewer|dispute resolution|consensus|panel|committee|peer review)/.test(c)
  const socialSingle =
    /\b(evaluator|curat|badgeholder|review|editor|analyst|assessor|moderator)/.test(c)

  if (mechanismMulti) out.push('trustless-multi')
  else if (cryptoSingle) out.push('trustless-single')

  if (adversarialMulti) out.push('trust-based-multi')
  else if (socialSingle) out.push('trust-based-single')

  if (out.length === 0) out.push('unconfirmed')
  return out
}

// ---------------------------------------------------------------------------
// Independence across an evidence set
// ---------------------------------------------------------------------------

/**
 * Walk an evidence set for shared origin. Returns the chain structure each item
 * needs, the flags the supplied account already warrants, and the count of
 * origins claimed versus established.
 *
 * Agreement is evidence only when the agreeing sources are distinct in origin.
 * Sources that share an origin agree because they must.
 */
export function checkIndependence(
  claim: string,
  items: OreEvidenceItem[],
): OreIndependenceResult {
  const flags: string[] = []

  const analysed = items.map((item) => {
    const notes: string[] = []
    const basis = item.statedBasis?.trim() ? item.statedBasis.trim() : null

    if (!basis) {
      notes.push(
        'No basis stated. An uncited restatement is not an origin. Record the chain as terminating here and say why.',
      )
    } else if (referencesAnotherItem(basis, items, item.label)) {
      notes.push(
        'Basis names another item in this set. This item is a restatement rather than an independent origin.',
      )
    }

    if (item.relationships?.trim()) {
      notes.push(
        'A relationship is declared. Shared authorship, shared funding, board or advisory overlap, or one party sitting on the editorial side of another defeats nominal independence.',
      )
    }

    return {
      label: item.label,
      statedBasis: basis,
      rungLabelRequired: true,
      notes,
    }
  })

  const restatements = analysed.filter((a) =>
    a.notes.some((n) => n.startsWith('Basis names another item')),
  ).length
  const uncited = analysed.filter((a) => a.statedBasis === null).length
  const related = items.filter((i) => i.relationships?.trim()).length

  if (restatements > 0) {
    flags.push(
      `${restatements} of ${items.length} items name another item in this set as their basis. The apparent source count overstates the origin count by at least that much.`,
    )
  }
  if (uncited > 0) {
    flags.push(
      `${uncited} of ${items.length} items state no basis. These cannot be counted as independent origins without a walk that establishes one.`,
    )
  }
  if (related > 0) {
    flags.push(
      `${related} of ${items.length} items declare a relationship to another party. Nominal independence is not effective independence.`,
    )
  }
  if (items.length > 1 && restatements === 0 && uncited === 0 && related === 0) {
    flags.push(
      'No shared origin detected from the supplied accounts. This is the limit of what the supplied accounts show, not a finding of independence. Establishing independence requires walking each chain to its origin.',
    )
  }

  return {
    claim,
    items: analysed,
    distinctOriginsClaimed: items.length,
    distinctOriginsEstablished: null,
    flags,
    constraints: [
      'Count distinct origins, never sources.',
      'Label every rung for what it is: originating observation, primary record, aggregator, secondary reporting, review, restatement.',
      'Never present a review as the study or an aggregator as the registry.',
      'Where two apparently distinct chains reach the same origin, record the convergence. This is the derivation-side form of the joint-support flag.',
      'A truncated chain honestly labeled is conformant. A chain presented as reaching origin when it stops short is not.',
    ],
    promptTemplate: independencePrompt(claim, items),
  }
}

function referencesAnotherItem(
  basis: string,
  items: OreEvidenceItem[],
  selfLabel: string,
): boolean {
  const b = basis.toLowerCase()
  return items.some((other) => {
    if (other.label === selfLabel) return false
    const label = other.label.toLowerCase().trim()
    return label.length > 1 && b.includes(label)
  })
}

// ---------------------------------------------------------------------------
// Finding audit against STRUCK
// ---------------------------------------------------------------------------

const COMBINED_SCORE = /\b(\d{1,3}\s*%|\d(\.\d+)?\s*\/\s*(5|10|100)|confidence(?: score| level)?[:=]\s*\S+|high|medium|low)\s*confidence\b|confidence[:=]\s*\d/i
const EXPOSURE_HINTS = /\b(provenance|source grade|grade profile|weakest|flag(ged|s)?|ungraded|joint[- ]support|per[- ]dimension)\b/i
const REFUTATION_HINTS = /\b(refut\w+|would be (wrong|overturned|withdrawn)|overturn\w*|falsif\w+|disconfirm\w+|this fails if|would require (revision|withdrawal))\b/i
const PROCESS_REFUTATION = /\b(further review|additional analysis|more research|if we learn more|subsequent review)\b/i
const AVERAGING = /\b(on average|the mean|median of|midpoint|averaging|averaged|consensus (figure|value|estimate)|split the difference)\b/i
const CONTEST_HINTS = /\b(disagree\w*|contested|conflict\w* (evidence|accounts|reports)|two (surveys|sources|estimates)|ranges? from|dissent\w*)\b/i
const RUNG_HINTS = /\b(primary (record|source)|originating|aggregator|secondary reporting|restat\w+|review of|cites?|according to|derived from)\b/i
const ADEQUACY = /\b(sufficient (evidence|support)|conclusive\w*|adequate to|establishes? (that|conclusively)|proves?|we can be confident|this confirms)\b/i
const CONSUMER_HINTS = /\b(whether this suffices|the reader|the consumer|depends on what|for your decision|you will need to judge|raise confidence)\b/i

/**
 * Audit a finding against the five obligations of STRUCK.
 *
 * Detection is heuristic and returns 'indicated', 'absent' or 'undetermined'
 * rather than pass or fail, because whether an obligation is genuinely met is a
 * judgment the accompanying prompt template hands to a reader. A finding that
 * fails an obligation is not thereby false; it is a finding its reader cannot
 * check, and the two claims are different.
 */
export function auditFinding(finding: string): OreFindingAudit {
  const text = finding ?? ''
  const obligations: OreObligationCheck[] = []

  // 1. Graded evidence
  const hasExposure = EXPOSURE_HINTS.test(text)
  const hasCombined = COMBINED_SCORE.test(text)
  obligations.push({
    name: 'graded-evidence',
    status: hasExposure ? 'indicated' : hasCombined ? 'absent' : 'undetermined',
    observed: hasCombined
      ? 'A single combined confidence expression is present.'
      : hasExposure
        ? 'Language indicating per-dimension exposure of support is present.'
        : 'No language indicating exposure of the support profile was found.',
    gap: hasCombined
      ? 'A single confidence figure stands where a per-dimension profile is required. One number is easy to tune and hard to audit.'
      : hasExposure
        ? null
        : 'The finding does not appear to expose what it rests on.',
    fix: hasExposure
      ? null
      : 'For each dimension, state the weakest assessment anywhere in the material support, plus every flag any source in it carries. Where support is ungraded, say so on the face of the finding. Where separately obtained sources cannot be shown distinct in origin, carry the joint-support flag.',
  })

  // 2. Refutation conditions
  const hasRefutation = REFUTATION_HINTS.test(text)
  const processOnly = PROCESS_REFUTATION.test(text) && !/\bif (the|a|any) \w+ (shows|reports|records|contains|differs)/i.test(text)
  obligations.push({
    name: 'refutation-conditions',
    status: hasRefutation && !processOnly ? 'indicated' : hasRefutation ? 'undetermined' : 'absent',
    observed: hasRefutation
      ? processOnly
        ? 'Refutation language is present but appears to be phrased as further process rather than as an observation.'
        : 'Refutation language is present.'
      : 'No refutation condition was found.',
    gap: hasRefutation
      ? processOnly
        ? 'A condition phrased as process cannot be recognized in the world. "If further review disagrees" is not a refutation condition.'
        : null
      : 'The finding does not say what would overturn it, so a reader cannot know what the author would accept as being wrong.',
    fix:
      hasRefutation && !processOnly
        ? null
        : 'State what could be found in the world that would require withdrawal or revision, concretely enough that a reader would recognize it on encountering it. If nothing could refute the claim, say so and name why.',
  })

  // 3. Contested regions
  const hasAveraging = AVERAGING.test(text)
  const hasContest = CONTEST_HINTS.test(text)
  obligations.push({
    name: 'contested-regions',
    status: hasAveraging && !hasContest ? 'absent' : hasContest ? 'indicated' : 'undetermined',
    observed: hasAveraging
      ? hasContest
        ? 'Both averaging language and contest language are present.'
        : 'Averaging language is present with no representation of disagreement.'
      : hasContest
        ? 'Disagreement in the support is represented.'
        : 'No disagreement is represented, and none is declared absent.',
    gap: hasAveraging && !hasContest
      ? 'A central value may stand where a contest should be represented. Check whether any cited source actually asserts the reported figure.'
      : hasContest
        ? null
        : 'Where no disagreement exists because only one line of support was consulted, that is an unexamined state rather than agreement, and the difference must be recorded.',
    fix: hasContest
      ? null
      : 'Name what is disputed, which support sits on each side, and what the disagreement turns on. Where a contest is resolved, state the basis and retain the losing position.',
  })

  // 4. Derivation to origin
  const hasRungs = RUNG_HINTS.test(text)
  obligations.push({
    name: 'derivation-to-origin',
    status: hasRungs ? 'undetermined' : 'absent',
    observed: hasRungs
      ? 'Attribution language is present. Whether every rung is labeled for what it actually is cannot be determined mechanically.'
      : 'No attribution or derivation language was found.',
    gap: hasRungs
      ? 'Attribution alone does not establish that a review is not being cited as a study, or an aggregator as a registry.'
      : 'The finding does not trace its support, so a reader cannot tell an origin from a restatement.',
    fix: 'Label every rung by its role: originating observation, primary record, aggregator, secondary reporting, review, restatement. Where a chain cannot be walked to origin, record where the walk stopped and why.',
  })

  // 5. Judgment with the consumer
  const assertsAdequacy = ADEQUACY.test(text)
  const leavesJudgment = CONSUMER_HINTS.test(text)
  obligations.push({
    name: 'judgment-with-consumer',
    status: assertsAdequacy && !leavesJudgment ? 'absent' : leavesJudgment ? 'indicated' : 'undetermined',
    observed: assertsAdequacy
      ? 'Language asserting the sufficiency or conclusiveness of the support is present.'
      : leavesJudgment
        ? 'The sufficiency judgment appears to be left with the reader.'
        : 'No explicit adequacy claim and no explicit hand-off of the judgment.',
    gap: assertsAdequacy && !leavesJudgment
      ? 'The finding declares its own support adequate. Whether support suffices depends on what is being decided and what being wrong would cost, neither of which the producer generally knows.'
      : null,
    fix: assertsAdequacy && !leavesJudgment
      ? 'Report what the support is and leave sufficiency to the consumer. Stating what would raise confidence, and what that would cost, is an aid rather than a substitute.'
      : null,
  })

  const absent = obligations.filter((o) => o.status === 'absent').map((o) => o.name)
  const systemicPatterns: string[] = []

  if (absent.includes('graded-evidence') && absent.includes('derivation-to-origin')) {
    systemicPatterns.push(
      'Unsourced conclusion: the finding neither exposes the quality of its support nor traces it. A reader has no route from the claim back to anything.',
    )
  }
  if (absent.includes('contested-regions') && absent.includes('refutation-conditions')) {
    systemicPatterns.push(
      'Closed finding: disagreement is not represented and nothing would overturn the claim. This is the structural shape of an impressionistic claim, whatever its accuracy.',
    )
  }
  if (absent.length >= 4) {
    systemicPatterns.push(
      'The finding carries almost none of the contract obligations. It may be entirely accurate and it is not checkable, which is the more durable problem.',
    )
  }

  return {
    obligations,
    systemicPatterns,
    verdictNote:
      'Statuses are heuristic. "Indicated" means the language of an obligation is present, not that the obligation is met. Whether a finding fails is a judgment; use the prompt template to make it, and distinguish "this finding is wrong" from "this finding cannot be checked" when reporting.',
    promptTemplate: auditFindingPrompt(finding),
  }
}

// ---------------------------------------------------------------------------
// Intake postures
// ---------------------------------------------------------------------------

export interface OrePostureSpec {
  posture: OrePosture
  whatItMeans: string
  fits: string
  downstreamCondition: string
  cautions: string[]
}

const POSTURES: Record<OrePosture, OrePostureSpec> = {
  screened: {
    posture: 'screened',
    whatItMeans:
      'Nothing enters without being graded first. The ingestion boundary is the review boundary.',
    fits: 'Every record may carry decision weight, and volume is low enough for eyes at entry.',
    downstreamCondition:
      'All held material is graded, and outputs expose grades on their support.',
    cautions: [
      'What a screened intake declines is declared in advance as scope and posture, covering source classes and opacity treatment. It is never a grade verdict on a particular source.',
    ],
  },
  graded: {
    posture: 'graded',
    whatItMeans:
      'Everything admitted enters immediately at the grade its visible properties warrant, and review effort is prioritized by uncertainty: the thinnest accounts get eyes first.',
    fits: 'Volume exceeds entry-review capacity, but decisions draw continuously on the store.',
    downstreamCondition:
      'Outputs may rest on any graded material and expose the profile. Flagged dimensions travel with the record.',
    cautions: [
      'Prioritizing by uncertainty is the mechanism that makes this posture honest. Without it, thin accounts accumulate unreviewed and the posture is Open with extra steps.',
    ],
  },
  open: {
    posture: 'open',
    whatItMeans:
      'Bulk material enters ungraded into a quarantined state. It may serve discovery, search and lead generation. It may not support findings, attestations or decisions until graded.',
    fits: 'Corpus migration and exploratory ingestion, where the value of having the material inside the system precedes the capacity to grade it.',
    downstreamCondition:
      'The citation boundary is absolute. An output cannot cite quarantined material as support.',
    cautions: [
      'Enforce the quarantine boundary structurally rather than procedurally. A policy that people are asked to follow is not a boundary.',
      'One channel stays open and must be declared rather than denied: a quarantined item read by a person who then produces a finding that never cites it. That is the residual channel.',
      'This is the posture most systems are in without having declared it, which is how ungraded material comes to support decisions.',
    ],
  },
}

export function getPostures(): OrePostureSpec[] {
  return [POSTURES.screened, POSTURES.graded, POSTURES.open]
}

export function getPosture(posture: OrePosture): OrePostureSpec {
  return POSTURES[posture]
}

export const POSTURE_DECLARATION_REQUIREMENTS: string[] = [
  'Declare the posture, or different postures per source class, before ingestion begins.',
  'State the treatment of opaque sources in advance: which classes are admitted at the grades their visible properties warrant, and which if any are declined.',
  'Record with every admitted record which posture was in force when it entered, so no record grading history is ambiguous later.',
  'Enforce the declared posture downstream condition. A declared posture with an unenforced condition is a description rather than a commitment.',
  'Specify the standing-loss process: how eligibility can be reduced or withdrawn, with the evidence, the basis and the decision recorded and retained with the source.',
  'Never silently discard an adverse finding about a source, however the assessment resolves.',
  'Treat standing loss as changing eligibility going forward, not as a retroactive verdict on outputs already produced.',
]

// ---------------------------------------------------------------------------
// Benchmark: the Meridian Basin dossier
// ---------------------------------------------------------------------------

export interface OreBenchmarkSource {
  id: string
  text: string
}

export const BENCHMARK_NOTICE =
  'Every organisation, project, person, document and figure in this case is fabricated. Nothing here refers to any real entity, and no part of it should be cited as evidence about anything in the world. Its only use is as a test.'

export const BENCHMARK_CLAIM =
  'The Meridian Basin Water Restoration Initiative restored 4,200 hectares of degraded riparian land between March 2023 and December 2025, improving downstream water quality in the Calder catchment and achieving a 61 percent survival rate among plantings.'

export const BENCHMARK_SOURCES: OreBenchmarkSource[] = [
  { id: 'S1', text: 'Initiative self-report, "Restoration Outcomes 2023 to 2025." Published by Meridian Basin Trust, January 2026. States the 4,200 hectare figure, the 61 percent survival rate, and the water quality improvement. Names no methodology for the hectare count. Signed by the Trust programme director.' },
  { id: 'S2', text: 'Calder Regional Environmental Bulletin, issue 44, March 2026. A quarterly newsletter from a regional environmental association. Reports that "the Meridian Basin initiative restored over 4,200 hectares." Carries no citation. The bulletin editor is listed in S11 as a member of the Trust advisory panel.' },
  { id: 'S3', text: 'Grant completion report to the Halvard Fund, February 2026. Submitted by Meridian Basin Trust. States 4,200 hectares. Includes a methodology appendix describing hectare counting by polygon digitisation from satellite imagery, naming the digitisation operator and giving the imagery capture dates as August and September 2022.' },
  { id: 'S4', text: 'Independent field survey, Ostrand Ecological Consulting, November 2025. Commissioned by the Halvard Fund. Sampled 40 plots across the intervention area using fixed-radius plot counts. Reports a planting survival rate of 61 percent, with a stated confidence interval and the sampling frame described.' },
  { id: 'S5', text: '"Regional Restoration in Review," Calder Basin Water Authority annual report, April 2026. A public-sector annual report. In a section on partner activity, states that the Meridian initiative "restored 4,200 hectares." A footnote attributes the figure to the Calder Regional Environmental Bulletin.' },
  { id: 'S6', text: 'Independent field survey, Petrin Land Assessment, October 2025. Commissioned by the Calder Basin Water Authority, with no contractual or ownership relationship to Ostrand or to the Trust. Sampled 55 transects across the same intervention area using line-intercept sampling. Reports a planting survival rate of 38 percent, with a stated confidence interval and the sampling frame described. Notes that line-intercept and fixed-radius methods are known to diverge on sparse plantings and does not assert that its figure supersedes any other.' },
  { id: 'S7', text: 'Calder catchment water quality monitoring dataset, 2019 to 2026. Published by the Calder Basin Water Authority as an open dataset with per-station readings. Shows a measurable improvement in turbidity and nitrate levels at downstream stations beginning in the second quarter of 2024.' },
  { id: 'S8', text: 'Regional regulatory notice, Calder Basin Water Authority, January 2024. Announces mandatory effluent treatment upgrades for licensed agricultural operations in the upper catchment, with a compliance deadline of March 2024. Applies to 31 operations upstream of the monitoring stations in S7.' },
  { id: 'S9', text: 'Conference presentation, "Restoration at Scale in the Calder," June 2026. Delivered by the Trust programme director at a regional practitioners conference. States 4,200 hectares and cites S5 for the figure.' },
  { id: 'S10', text: 'Land title and tenure records, Meridian district registry. Public records covering the intervention area. Confirm that 3,980 hectares within the claimed intervention boundary were under restoration agreements during the period. A further 340 hectares within the boundary are recorded as under a separate conservation covenant predating 2019, with no restoration agreement.' },
  { id: 'S11', text: 'Meridian Basin Trust governance disclosure, 2026. Lists trustees, advisory panel members, and related parties. The advisory panel includes the editor of the Calder Regional Environmental Bulletin (S2). The Trust is recorded as legally independent of Meridian Basin Foundation, a grant-making body of similar name operating in an adjacent region, with no shared officers.' },
  { id: 'S12', text: 'Aggregated funder track record entry, Philanthropic Outcomes Index. A third-party database entry for "Meridian Basin" showing fourteen completed projects since 2011 with a 93 percent completion rate. The entry source field lists both Meridian Basin Trust and Meridian Basin Foundation as contributing organisations under one identifier.' },
]

export const BENCHMARK_TASK: string[] = [
  'What can be concluded about the hectare figure, and on what support.',
  'What can be concluded about the survival rate.',
  'What can be concluded about the water quality improvement and its cause.',
  'What can be concluded about the implementing organisation track record.',
  'For each conclusion, what would overturn it.',
  'Any integrity concerns about the dossier itself.',
]

export interface OreBenchmarkSeededItem {
  name: string
  isFailure: boolean
  where: string
  correctHandling: string
}

export const BENCHMARK_KEY: OreBenchmarkSeededItem[] = [
  {
    name: 'Circular corroboration on the hectare figure',
    isFailure: true,
    where: 'S1, S2, S3, S5, S9',
    correctHandling:
      'The figure has one originating party. S1 and S3 are both Trust documents. S2 carries no citation and its editor sits on the Trust advisory panel per S11. S5 footnotes S2. S9 cites S5. Record a single origin with no independent confirmation and carry the joint-support flag. The only independent record, S10, supports 3,980 hectares under restoration agreement, with 340 further hectares inside the boundary under a covenant predating the project, so the claimed figure appears to measure the boundary rather than the restored area.',
  },
  {
    name: 'Impossible provenance in the only stated methodology',
    isFailure: true,
    where: 'S3',
    correctHandling:
      'The methodology appendix dates its satellite imagery to August and September 2022, before the March 2023 intervention start. Imagery predating the intervention cannot show restored land. Record provenance integrity as failing on S3, and note that this leaves the headline figure with no stated method rather than a weak one. Most often missed, because the appendix is well formed and reads as rigour.',
  },
  {
    name: 'Phantom merge in the track record',
    isFailure: true,
    where: 'S12 against S11',
    correctHandling:
      'S12 merges Meridian Basin Trust and Meridian Basin Foundation under one identifier; S11 records them as legally independent with no shared officers. The aggregate cannot be attributed to the Trust. Record the track record as unestablished rather than strong, and treat the merge as a defect in S12 rather than a fact about either organisation.',
  },
  {
    name: 'Proxy attribution on the water quality improvement',
    isFailure: true,
    where: 'S1 attributing S7, against S8',
    correctHandling:
      'The improvement in S7 is real and well sourced; its attribution to the restoration is not. S8 records mandatory effluent upgrades for 31 upstream operations with a compliance deadline immediately preceding the observed change. Record the improvement as established and the causal attribution as unsupported, naming the confound. Discarding the measurement is also an error, since only the attribution fails.',
  },
  {
    name: 'Genuine contested region on the survival rate. This is the control.',
    isFailure: false,
    where: 'S4 against S6',
    correctHandling:
      'Two independent surveys, 61 percent from fixed-radius plots and 38 percent from line-intercept transects, both with described sampling frames, using methods known to diverge on sparse plantings. Represent the contest: what is disputed, which support sits on each side, and that it turns on survey method. Do not average to roughly 50 percent, a figure neither survey asserts. Do not resolve without stating a basis. Flagging this as an integrity failure is a false positive and the more damaging error; silently dropping S6 because it disagrees with the headline claim is the most common of the three ways to fail this item.',
  },
]

export const BENCHMARK_CLEAN_SOURCES = ['S4', 'S6', 'S7', 'S8', 'S10', 'S11']

export const BENCHMARK_SCORING: string[] = [
  'One point for each of the four seeded failures identified by substance rather than by name: four points.',
  'One point for representing the survival-rate contest without averaging or resolving it.',
  'One point for not flagging any of the six clean sources (S4, S6, S7, S8, S10, S11) as compromised.',
  'One point for stating refutation conditions on at least three of the four conclusions.',
  'One point for not carrying the hectare figure forward as corroborated.',
  'One point for leaving the sufficiency judgment to the reader rather than declaring the dossier adequate or inadequate to a decision it does not name.',
]

export const BENCHMARK_LIMITS: string[] = [
  'Publishing a benchmark alongside the specifications it tests contaminates it for any system trained on public text after publication. A system that reproduces the key may have read it. Declare whether the system under test could have.',
  'The case is small, single-domain, and constructed by the author of the specifications it exercises, so the failures it seeds are the failures that author knows to look for. It is a floor, not a survey.',
  'The dossier is fabricated, so every source says exactly what it was written to say. Real dossiers are harder in ways this one cannot represent.',
]

// ---------------------------------------------------------------------------
// Prompt templates
// ---------------------------------------------------------------------------

export function gradeSourcePrompt(input: OreSourceInput): string {
  return `Grade the source below using ORE. A grade measures uncertainty, not quality: you are
answering how much of this source reliability can currently be seen, and what is being
trusted that cannot be seen. You are not answering whether the source is good.

For each dimension state the assessment, the basis you made it on, and any part you could
not assess, recorded as a named gap. Never fill an unknown with a middle value.

1. Provenance integrity. Did this come from where it claims, and arrive unchanged?
2. Epistemic soundness. Is the output structured so an independent party could evaluate its
   truth? Are claims refutable, are accuracy and relevance kept separate, does the source
   distinguish observation from inference?
3. Confirmation architecture. What confirmed this output when it was produced? Classify on
   two axes, trustless or trust-based and single-party or multi-party, and record every mode
   present. If nothing confirmed it, say unconfirmed. Do not treat party count as evidence of
   independence.
4. Track record and independence, if assessable. Uncomputable dimensions are named
   limitations, not middle grades.

Then handle opacity: it raises uncertainty and never constitutes a verdict. Finally state what
would change this grading and what should be monitored over time.

Do not combine the dimensions into a single score.

SOURCE: ${input.label}
${input.description}
${input.originEvidence ? `ORIGIN EVIDENCE: ${input.originEvidence}\n` : ''}${input.confirmation ? `CONFIRMATION: ${input.confirmation}\n` : ''}${input.stake ? `STAKE: ${input.stake}\n` : ''}${input.history ? `HISTORY: ${input.history}\n` : ''}`
}

export function independencePrompt(claim: string, items: OreEvidenceItem[]): string {
  const list = items
    .map((i) => `- ${i.label}${i.statedBasis ? ` (states basis: ${i.statedBasis})` : ' (no basis stated)'}${i.relationships ? ` (relationship: ${i.relationships})` : ''}`)
    .join('\n')
  return `Determine whether the sources below are independent, or whether their agreement is an
artifact of shared origin. Agreement is evidence only when the agreeing sources are distinct in
origin; sources that share an origin agree because they must.

For each source, identify what it rests on, following every citation, attribution, footnote and
acknowledgement. Build its derivation chain and label every rung for what it actually is:
originating observation, primary record, aggregator, secondary reporting, review, restatement.
Say where each chain terminates, and where a chain cannot be walked to origin, record where the
walk stopped and why.

Then identify convergence: where two apparently distinct chains reach the same origin, say so.
Check for related parties, since shared authorship, shared funding, board or advisory overlap,
or one party sitting on the editorial side of another defeats nominal independence.

Report how many genuinely independent origins support the claim, and how many sources restate
them. Count origins, never sources. Close by saying what would establish real independent
confirmation and where to look for it.

CLAIM: ${claim}

SOURCES:
${list}`
}

export function auditFindingPrompt(finding: string): string {
  return `Audit the finding below against STRUCK. Report pass, fail, or not applicable
with a stated reason for each of the five obligations, name the specific passage for every
failure, and say what would fix it.

1. Does it expose what it rests on, per dimension, including the weakest support and any gaps,
   rather than asserting a conclusion with a single confidence figure?
2. Does it state what would overturn it, in terms of what could be found in the world rather
   than in terms of further process?
3. Where its material disagreed, did it represent the disagreement, or did it average, silently
   resolve, or drop the dissenting side? Check specifically for a central value that no cited
   source actually asserts.
4. Are its derivation chains walked to origin with rungs labeled honestly? Look for a review
   cited as a study, an aggregator cited as a registry, or a chain presented as complete that
   stops at a restatement.
5. Does it leave the sufficiency judgment to its reader, or does it declare its own support
   adequate?

Close with a verdict that distinguishes two different claims. A finding failing an obligation is
not thereby false; it is a finding its reader cannot check. Say which you are asserting, and do
not claim the finding is wrong when what you have established is that it is unverifiable.

FINDING:
${finding}`
}

export function declarePosturePrompt(systemDescription: string): string {
  return `Recommend an intake posture for the system described below, or different postures for
different classes of source, and say why each fits.

The three postures:

Screened: nothing enters without being graded first; the ingestion boundary is the review
boundary. What a screened intake declines is declared in advance as scope, never decided per
source as a verdict.

Graded: everything admitted enters at the grade its visible properties warrant, and review
effort goes first to the thinnest accounts.

Open: bulk material enters ungraded into quarantine, may serve discovery, search and lead
generation, and may not support any finding, attestation or decision until graded. The citation
boundary is absolute.

For your recommendation, state concretely what the system must enforce downstream; how opaque
sources are treated, declared in advance rather than decided per source; and if any part is
Open, how the quarantine boundary is enforced structurally rather than by policy, naming the
residual channel where a person reads quarantined material and then acts on it in a finding
that never cites it.

Then state what must be recorded with each admitted record so its grading history is never
ambiguous later, including which posture was in force when it entered. Finally give the
standing-loss process: how eligibility can be reduced or withdrawn, with evidence and basis
recorded, never silently discarding an adverse finding, and not applied retroactively to
outputs already produced.

THE SYSTEM:
${systemDescription}`
}

export function scoreBenchmarkPrompt(answer: string): string {
  const key = BENCHMARK_KEY.map(
    (k) => `- ${k.name} (${k.isFailure ? 'seeded failure' : 'control, must NOT be flagged as a defect'}), at ${k.where}.\n  Correct handling: ${k.correctHandling}`,
  ).join('\n')
  return `Score the answer below against the Meridian Basin benchmark key. Nine points, equally
weighted.

${BENCHMARK_SCORING.map((s) => `- ${s}`).join('\n')}

THE KEY:
${key}

Clean sources that must not be flagged as compromised: ${BENCHMARK_CLEAN_SOURCES.join(', ')}.

Report the score with a per-item breakdown, and state explicitly whether the system under test
could have read the published key, since that changes what the score means.

THE ANSWER:
${answer}`
}
