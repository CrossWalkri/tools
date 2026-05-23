/**
 * The CROSS+WALKRI falsifiability architecture and typology.
 *
 * Operationalizes Commitment 1 of the Evolution Rules (Falsifiability). A
 * falsifiable claim has four structural elements; the typology of claims
 * varies by gate type. The eight failure modes from the Frame 2 Functioning
 * Check primitive apply at the falsifiability layer.
 *
 * Source: CROSS-WALKRI-falsifiability-architecture-and-typology-0_1_0.md.
 *
 * Version 0.1.0 | CC0
 */

export interface FalsifiabilityElement {
  /** Element identifier. */
  id: string
  /** Element name. */
  name: string
  /** What this element requires structurally. */
  requirement: string
  /** Primitive anchors that support this element. */
  primitive_anchors: string[]
  /** Structural test for whether this element is satisfied. */
  structural_test: string
}

export interface FalsifiabilityType {
  /** Gate-based identifier. */
  id: string
  /** Type name. */
  name: string
  /** What is falsifiable at this gate. */
  what_is_falsifiable: string
  /** The pre-commitment instrument at this gate. */
  pre_commitment_instrument: string
  /** The verifying source at this gate. */
  verifying_source: string
  /** Drift detection at this gate. */
  drift_detection: string
  /** Disclosure obligation at this gate. */
  disclosure_obligation: string
}

export interface FalsifiabilityFailureMode {
  /** Failure mode identifier. */
  id: string
  /** Mode name. */
  name: string
  /** Description in falsifiability context. */
  description: string
  /** Remediation pattern. */
  remediation: string
}

export const FALSIFIABILITY_ELEMENTS: readonly FalsifiabilityElement[] = [
  {
    id: 'pre-committed-claim',
    name: 'Pre-Committed Claim',
    requirement:
      'The specific statement of what the round, program, or applicant will accomplish, published before the period the claim covers begins. The claim is specific enough that it can be confronted with evidence.',
    primitive_anchors: [
      'Gate Type (Layer 3, entry specification gate)',
      'CROSS Part IV pre-round publication requirement',
      'WALKRI Section 3 pre-publication field requirements',
      'Pre-Award Indicator Confirmation Stage (Layer 3)',
    ],
    structural_test:
      'Could a reviewer who did not commission the work determine, from publicly accessible evidence without contacting the claimant, whether the claim is met? If yes, the claim is structured as pre-committed. If no, the claim is too vague to be falsifiable.',
  },
  {
    id: 'verifying-source',
    name: 'Verifying Source',
    requirement:
      'The named source outside the claimant\'s control where evidence for or against the claim will be checked. The source must be queryable independently of the claimant\'s participation.',
    primitive_anchors: [
      'Independent Verifiability from Sources Outside the Applicant\'s Control (Layer 1)',
      'Attestation Corpus (Layer 4)',
      'Evidence Form specifications (WALKRI Section 3 / Primitives Foundation Layer 5)',
    ],
    structural_test:
      'Is the source named in the round configuration or applicant-facing publication? Can a third party access the source without the claimant\'s cooperation? Does the source produce evidence in a form that can be checked against the pre-committed claim? If all three: the verifying source element is satisfied.',
  },
  {
    id: 'drift-detection-mechanism',
    name: 'Drift Detection Mechanism',
    requirement:
      'The named procedure by which mismatch between the pre-committed claim and the produced evidence is identified, located, and named. Drift is not assumed away; it is expected and surfaced.',
    primitive_anchors: [
      'Adverse Signal Engagement Principle Core Standard',
      'Obligation Fulfillment Record (Layer 3) for per-grant drift',
      'Portfolio-level Continuation Benchmark (Layer 7) for portfolio-level drift',
      'Inter-cycle Reflection Stage (Layer 4) for cross-cycle drift',
    ],
    structural_test:
      'When the produced evidence does not match the pre-committed claim, is there a named procedure that surfaces the mismatch? Is the procedure operative regardless of whether the claimant initiates it (a drift detection mechanism that depends on the claimant\'s cooperation is not yet a drift detection mechanism)?',
  },
  {
    id: 'disclosure-obligation',
    name: 'Disclosure Obligation',
    requirement:
      'The named requirement that the verification finding and any drift detected be published in a form independently queryable. Disclosure closes the loop: drift that is detected but not disclosed does not satisfy falsifiability.',
    primitive_anchors: [
      'Attestation Corpus (Layer 4) as the publication target',
      'CROSS Part XI funder obligations',
      'Inter-cycle Reflection Stage (Layer 4) as the standing publication vehicle',
    ],
    structural_test:
      'Where is the verification finding published? Is the publication independently queryable? Is the publication required (not optional)? Does the publication include both confirmed claims and drift findings (selective disclosure of only confirmed claims fails this element)?',
  },
] as const

export const FALSIFIABILITY_TYPES: readonly FalsifiabilityType[] = [
  {
    id: 'type-a-entry-gate',
    name: 'Type A: Entry-Gate Falsifiability',
    what_is_falsifiable:
      'The applicant\'s declared FROM state (change mode), declared deliverable specification (build mode), or declared prior contribution (retroactive mode); organizational identity declaration; sufficiency architecture declaration; public benefit mechanism declaration; prior work attribution where work is cited.',
    pre_commitment_instrument: 'The applicant\'s entry-gate submission, recorded as filed.',
    verifying_source:
      'For organizational identity: registry of legal entities and the Attestation Corpus. For sufficiency: published treasury or financial disclosures and any prior round records. For public benefit mechanism: named access condition (e.g., SPDX license file present in the repository).',
    drift_detection:
      'Discrepancy between the entry-gate declaration and the verifying source (legal entity name claimed does not match registration; affiliated entities not disclosed but publicly documentable; prior round history misstated).',
    disclosure_obligation:
      'Determination body\'s entry-gate finding published; any discrepancy noted as adverse signal entered in the standing log.',
  },
  {
    id: 'type-b-progress-gate',
    name: 'Type B: Progress-Gate Falsifiability',
    what_is_falsifiable:
      'The applicant\'s pre-committed milestone specification; the disbursement-trigger evidence requirements.',
    pre_commitment_instrument:
      'The Pre-Award Indicator Confirmation Stage document binding the indicator schedule before disbursement begins.',
    verifying_source:
      'The Attestation Corpus snapshot at the progress gate; named third-party data sources per the round configuration.',
    drift_detection:
      'Difference between the pre-committed milestone and the snapshot reading; the Adverse Signal Engagement plan operative for surfacing the difference.',
    disclosure_obligation:
      'Progress-gate finding published; iteration rights apply (Gate Character is developmental at progress gates), but the drift is documented even when iteration occurs.',
  },
  {
    id: 'type-c-completion-gate',
    name: 'Type C: Completion-Gate Falsifiability',
    what_is_falsifiable:
      'The applicant\'s pre-committed deliverable, change, or contribution against the produced evidence at the named evidence scope and strength.',
    pre_commitment_instrument:
      'The entry-gate criteria carried through (via the Pre-Award Indicator Confirmation Stage where configured); the runbook\'s completion-gate evidence requirements.',
    verifying_source:
      'The Attestation Corpus snapshot at completion; the named independent verification source per Commitment 6; the Determination Body Separation operating on the evidence.',
    drift_detection:
      'The Determination Body\'s finding on whether the pre-committed claim was met; per-criterion findings where multiple criteria are configured.',
    disclosure_obligation:
      'Determination published; the redress procedure operates if the finding is contested; the finding enters the Obligation Fulfillment Record for the applicant and is queryable by future funders.',
  },
  {
    id: 'type-d-continuation-gate',
    name: 'Type D: Continuation-Gate Falsifiability',
    what_is_falsifiable:
      'The sustainability stance declared; the continuation-stage evidence against the prior-cycle outcomes.',
    pre_commitment_instrument:
      'The continuation-specification gate criteria published at the program level (not the per-round level).',
    verifying_source:
      'Attestation Corpus snapshot at the continuation review; the named third-party data sources for sustained outcomes.',
    drift_detection:
      'Mismatch between the declared sustainability stance and the observed outcome trajectory.',
    disclosure_obligation:
      'Continuation finding published; portfolio-level patterns aggregated into the Portfolio-level Continuation Benchmark assessment.',
  },
  {
    id: 'type-e-portfolio-level',
    name: 'Type E: Portfolio-Level Falsifiability',
    what_is_falsifiable:
      'The Portfolio-level Continuation Benchmark threshold; the program\'s continued operation against the declared benchmark.',
    pre_commitment_instrument:
      'The benchmark threshold published at the program\'s entry specification gate.',
    verifying_source:
      'The aggregated Attestation Corpus across the funded cohort; the Inter-cycle Reflection Stage publications.',
    drift_detection: 'Program-level performance below the declared benchmark.',
    disclosure_obligation:
      'The funder publishes the portfolio finding; the program design is revised before the next cycle opens if the benchmark is not met.',
  },
] as const

export const FALSIFIABILITY_FAILURE_MODES: readonly FalsifiabilityFailureMode[] = [
  {
    id: 'transcendence-claim',
    name: 'Transcendence Claim',
    description:
      'The claim asserts it has escaped the falsifiability constraints it operates within ("Our outcomes are too systemic to be measured against pre-committed indicators").',
    remediation:
      'Name the systemic outcome at the ecosystem-shift mechanism type; commit to evidence at the impact evidence scope; accept contribution stance with named causal pathway and co-factors.',
  },
  {
    id: 'declaration-exploit',
    name: 'Declaration Exploit',
    description:
      'The act of declaring a falsifiable commitment is treated as evidence the commitment is falsifiable ("Our round configuration declares the indicators; that declaration is itself the falsifiability").',
    remediation:
      'Declarations are pre-commitment instruments but do not by themselves satisfy Elements 2, 3, and 4. The verifying source must be named and the disclosure obligation operative.',
  },
  {
    id: 'precision-facade',
    name: 'Precision Facade',
    description:
      'The claim appears specific but the specificity does not carry falsifiability content ("a 23.7% improvement in the named metric" where the named metric is not actually defined or measured by an independent source).',
    remediation:
      'Precision is necessary but not sufficient; the precision must be backed by named verifying source and named drift detection mechanism.',
  },
  {
    id: 'partial-instantiation',
    name: 'Partial Instantiation',
    description:
      'A falsifiability structure is partially implemented while an unfalsifiable assumption does the remaining work (pre-commitment published; verifying source named; but drift detection left to the grantee\'s self-report).',
    remediation:
      'Name the missing element explicitly. A partial form is admissible if the partial state is documented.',
  },
  {
    id: 'direction-without-destination',
    name: 'Direction Without Destination',
    description:
      'The claim names motion toward an outcome without specifying the outcome ("The program will strengthen the ecosystem").',
    remediation:
      'Name the destination per the Obligation Mode entry-gate requirement. A directional claim with no destination cannot be falsified because nothing has been committed to.',
  },
  {
    id: 'vocabulary-without-architecture',
    name: 'Vocabulary Without Architecture',
    description:
      'Falsifiability vocabulary is used without the structural requirements falsifiability implies (a Part XII compatibility statement claims the source framework operates at Tier 5 (Falsifiable) but the framework lacks any of the four elements).',
    remediation:
      'Vocabulary use must be backed by structural elements. If a framework is described as falsifiable, audit the framework against the four-element test before publishing the description.',
  },
  {
    id: 'correct-map-wrong-territory',
    name: 'Correct Map / Wrong Territory',
    description:
      'Falsifiability language accurately describes a different context but not the one it is applied to (a round configuration imports falsifiability vocabulary from a regulatory context where independent verification is statutorily required, but the round itself operates under voluntary publication without the regulatory infrastructure).',
    remediation:
      'Name the territory the falsifiability claim operates in; do not import vocabulary from a different territory without naming the structural difference.',
  },
  {
    id: 'frozen-map',
    name: 'Frozen Map',
    description:
      'Falsifiability language that was accurate at specification has not been updated as conditions changed (a round configuration specifies falsifiability against an Attestation Corpus source that has subsequently changed its API or its publication mechanism, making the verifying source no longer queryable as specified).',
    remediation:
      'Per Element 2, the verifying source must remain queryable; changes to source availability require updates to the configuration.',
  },
] as const

/** Return all four falsifiability elements. */
export function getFalsifiabilityElements(): readonly FalsifiabilityElement[] {
  return FALSIFIABILITY_ELEMENTS
}

/** Return a falsifiability type by id (e.g., type-a-entry-gate). */
export function getFalsifiabilityType(id: string): FalsifiabilityType | undefined {
  return FALSIFIABILITY_TYPES.find((t) => t.id === id)
}

/** Return a falsifiability failure mode by id. */
export function getFalsifiabilityFailureMode(
  id: string,
): FalsifiabilityFailureMode | undefined {
  return FALSIFIABILITY_FAILURE_MODES.find((m) => m.id === id)
}
