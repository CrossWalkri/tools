/**
 * TypeScript interfaces for CROSS+WALKRI grant standards.
 * Version 0.1.0 | CC0
 */

// ---------------------------------------------------------------------------
// WALKRI types
// ---------------------------------------------------------------------------

/** The five criterion specification elements that make a field a measurement instrument. */
export type WalkriCriterionName =
  | 'criterion-intent'
  | 'operational-definition'
  | 'response-form'
  | 'evidence-form'
  | 'conformance-threshold'

/** A single WALKRI criterion assessment result. */
export interface WalkriCriterion {
  /** Which of the five WALKRI criteria this result covers. */
  name: WalkriCriterionName
  /** Whether the field satisfies this criterion. */
  passes: boolean
  /** Description of what is missing or inadequate, if the criterion fails. */
  gap: string | null
  /** Concrete suggestion for how to satisfy this criterion. */
  suggestion: string | null
}

/** A field definition submitted for WALKRI audit. */
export interface WalkriField {
  /** The visible label shown to applicants. */
  label: string
  /** Written statement of what the field measures, distinct from the label. */
  description?: string | undefined
  /** The response type: text, textarea, url, number, boolean, select, multiselect, file. */
  fieldType: 'text' | 'textarea' | 'url' | 'number' | 'boolean' | 'select' | 'multiselect' | 'file'
  /** For select/multiselect fields: the enumerated options with qualifying and non-qualifying examples. */
  options?: string[] | undefined
  /** Caption or sub-label appearing below the field. */
  caption?: string | undefined
  /** Placeholder text shown inside the field input. */
  placeholder?: string | undefined
  /** Whether this field is required. */
  required: boolean
}

/** Verdict on whether a field is a measurement instrument or a label. */
export type WalkriVerdict = 'instrument' | 'label'

/** Full result of auditing a field against WALKRI's five pre-publication requirements. */
export interface WalkriAuditResult {
  /** The field that was audited. */
  field: WalkriField
  /** Assessment of each of the five WALKRI criteria. */
  criteria: WalkriCriterion[]
  /** Overall verdict: instrument if all five criteria pass, label if any fail. */
  verdict: WalkriVerdict
  /** Systemic patterns observed across the failing criteria, if any. */
  systemicPatterns: string[]
}

// ---------------------------------------------------------------------------
// CROSS types
// ---------------------------------------------------------------------------

/**
 * The three obligation modes that classify what type of commitment a grant creates.
 *
 * - build: the funded work must produce a specified deliverable.
 * - change: the funded work must produce a measurable shift in a condition.
 * - retroactive: the funded work has already been performed and the funding
 *   recognizes demonstrated past contribution.
 */
export type CrossObligationMode = 'build' | 'change' | 'retroactive'

/**
 * The four gate types in the CROSS gate sequence.
 *
 * - entry-specification: what an applicant must demonstrate before entering the round.
 * - application: the general application gate (used in rounds that do not separate entry
 *   specification from the application form).
 * - completion: what a grantee must demonstrate to receive final payment.
 * - continuation: what a project must demonstrate to advance to a subsequent round.
 */
export type CrossGateType =
  | 'entry-specification'
  | 'application'
  | 'completion'
  | 'continuation'

/**
 * Evidence scope levels in ascending order of rigor.
 *
 * - output: the deliverable exists.
 * - usage: the deliverable is being used by parties outside the applicant's control.
 * - outcome: a measurable change has occurred in the specified population.
 * - impact: a credible causal link is established between the funded work and the change.
 */
export type CrossEvidenceScope = 'output' | 'usage' | 'outcome' | 'impact'

/**
 * Evidence strength levels in ascending order of rigor.
 *
 * - self-report: grantee narrative with supporting links reviewed by funder staff.
 * - third-party-verifiable: evidence independently accessible from sources outside
 *   the applicant's control.
 * - independent-review: a named party outside the funder-grantee relationship confirms.
 * - independent-evaluation: a qualified evaluator conducts a structured assessment.
 */
export type CrossEvidenceStrength =
  | 'self-report'
  | 'third-party-verifiable'
  | 'independent-review'
  | 'independent-evaluation'

/** Configuration for a single CROSS gate. */
export interface CrossGate {
  /** The gate type. */
  type: CrossGateType
  /** The obligation mode this gate is configured for. */
  obligationMode: CrossObligationMode
  /** The minimum evidence scope required to pass this gate. */
  evidenceScope: CrossEvidenceScope
  /** The minimum evidence strength required to pass this gate. */
  evidenceStrength: CrossEvidenceStrength
  /** Whether this gate is required (as opposed to optional or configurable). */
  required: boolean
}

/** Configuration for a CROSS funding round. */
export interface CrossRound {
  /** The obligation mode declared for this round. */
  obligationMode: CrossObligationMode
  /** The gates configured for this round, in order. */
  gates: CrossGate[]
  /** Field identifiers or names that serve as primary measurement instruments in this round. */
  indicatorFields: string[]
  /** The declared mechanism by which funded work produces public benefit. */
  publicBenefitMechanism:
    | 'output-production'
    | 'access-provision'
    | 'condition-change'
    | 'ecosystem-shift'
}

// ---------------------------------------------------------------------------
// Primitive types
// ---------------------------------------------------------------------------

/**
 * The seven conceptual layers of the CROSS+WALKRI primitives foundation.
 */
export type PrimitiveLayer =
  | 'methodological'
  | 'identity'
  | 'obligation'
  | 'evidence'
  | 'specification'
  | 'causal-architecture'
  | 'portfolio'

/** A single CROSS+WALKRI primitive. */
export interface CrossPrimitive {
  /** Canonical name of the primitive. */
  name: string
  /** Conceptual layer this primitive belongs to. */
  layer: PrimitiveLayer
  /** Precise definition of the primitive. */
  description: string
  /**
   * How this primitive relates to others, as the foundation states it.
   *
   * Prose rather than a list, because the canonical source is prose and
   * splitting it into array items was a lossy invention of the hand-maintained
   * copy this array replaced.
   */
  relationships: string
  /** Provisions or contexts where this primitive is applied, as stated. */
  applications: string
}
