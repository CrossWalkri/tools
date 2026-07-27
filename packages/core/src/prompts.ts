/**
 * Prompt templates for CROSS+WALKRI AI-assisted operations.
 *
 * Each function returns a fully-formed prompt string ready to pass to a
 * language model. The prompts are designed to elicit structured output that
 * conforms to the CROSS+WALKRI specifications.
 *
 * Version 0.1.0 | CC0
 */

import type { WalkriField } from './types.js'

// ---------------------------------------------------------------------------
// WALKRI prompts
// ---------------------------------------------------------------------------

/**
 * Generates a prompt asking a language model to produce a WALKRI-conformant
 * field specification from an existing field definition.
 *
 * The model should return a revised field definition that satisfies all five
 * WALKRI criterion specification elements.
 */
export function auditFieldPrompt(field: WalkriField): string {
  const optionsSection =
    field.options && field.options.length > 0
      ? `\nOptions provided: ${field.options.join(', ')}`
      : ''

  const captionSection = field.caption ? `\nCaption: ${field.caption}` : ''
  const placeholderSection = field.placeholder
    ? `\nPlaceholder: ${field.placeholder}`
    : ''

  return `You are auditing a grant application field against the five WALKRI pre-publication requirements. WALKRI requires that every intake field satisfy all five criterion specification elements before any applicant sees the form. A field that fails any criterion is a label, not a measurement instrument.

The five WALKRI criteria are:

1. Criterion intent: A written statement, distinct from the label, of what the field measures. Answers: what does a true response tell us about the applicant or subject?

2. Operational definition: A complete definition of each option or response category, with qualifying examples (what counts) and non-qualifying examples (what does not count). For numeric fields: the unit, counting rule, and boundary conditions.

3. Response form: The response type with a written justification for why that type is appropriate for the criterion intent. Response type is a measurement decision, not a formatting decision.

4. Evidence form: The specific artifact that satisfies the criterion: document type, data source, or access path, at a level sufficient for independent replication. Not "evidence of X" but "a URL to the LICENSE file in the root directory of a publicly accessible repository."

5. Conformance threshold: For fields referencing external standards, which components apply, what evidence satisfies each component, and what the minimum threshold for passage is.

Field to audit:
- Label: ${field.label}
- Field type: ${field.fieldType}
- Required: ${field.required}${captionSection}${placeholderSection}${optionsSection}
- Description: ${field.description ?? '(none provided)'}

For each of the five WALKRI criteria, state:
- Whether this field PASSES or FAILS the criterion
- If it fails: the specific gap (what is missing or inadequate)
- If it fails: a concrete suggestion for how to satisfy this criterion

Then provide:
- A verdict: INSTRUMENT (all five pass) or LABEL (one or more fail)
- Any systemic patterns across the failing criteria
- A revised field specification that would satisfy all five criteria

Respond in structured JSON matching this schema:
{
  "criteria": [
    {
      "name": "criterion-intent" | "operational-definition" | "response-form" | "evidence-form" | "conformance-threshold",
      "passes": boolean,
      "gap": string | null,
      "suggestion": string | null
    }
  ],
  "verdict": "instrument" | "label",
  "systemicPatterns": string[],
  "revisedField": {
    "label": string,
    "description": string,
    "fieldType": string,
    "options": string[] | null,
    "caption": string,
    "placeholder": string,
    "required": boolean
  }
}`
}

/**
 * Generates a prompt asking a language model to produce a complete
 * WALKRI-conformant field specification from a plain-language description
 * of what the field should measure.
 */
export function configureRoundPrompt(description: string, programType: string): string {
  return `You are configuring a CROSS grant round. CROSS (Common Reporting Outcome Standards Schema) requires that every grant round declare an obligation architecture before any application opens.

The three CROSS obligation modes are:

BUILD obligation: The funded work must produce a specified deliverable with independently verifiable completion criteria. The obligation object is the deliverable itself. Use this mode when the goal is to produce an artifact, tool, protocol, infrastructure, or research output.

CHANGE obligation: The funded work must produce a measurable shift in a specified condition in a defined population, from a declared FROM state to a declared TO state. Requires a baseline value, a target in the same units, a defined population, a named data source, and a stated mechanism connecting the intervention to the anticipated shift. Use this mode when the goal is impact on conditions in the world.

RETROACTIVE obligation: The funded work has already been performed and the funding rewards demonstrated past contribution. The obligation object is the prior contribution, assessed against the program's published criteria. Use this mode for retroactive public goods funding and recognition of past contributions.

The four CROSS gate types are:
- Entry specification gate: what an applicant must demonstrate before entering the round
- Progress verification gate: what a grantee must demonstrate to trigger mid-funding disbursement
- Completion verification gate: what a grantee must demonstrate to receive final payment
- Continuation specification gate: what a project must demonstrate to advance to a subsequent round

Evidence scope levels (ascending): output, usage, outcome, impact
Evidence strength levels (ascending): self-report, third-party-verifiable, independent-review, independent-evaluation

Program description: ${description}
Program type: ${programType}

Recommend a complete CROSS round configuration including:
1. Obligation mode with justification
2. Required gates (at minimum: entry-specification and completion)
3. Evidence scope and evidence strength for each gate
4. Public benefit mechanism (output-production | access-provision | condition-change | ecosystem-shift)
5. For change mode: the key indicator fields the entry specification gate must require (FROM state, TO state, population definition, data source, intervention mechanism, causality stance)
6. For build mode: the deliverable specification elements the entry gate must require

Respond in structured JSON:
{
  "obligationMode": "build" | "change" | "retroactive",
  "obligationModeJustification": string,
  "gates": [
    {
      "type": "entry-specification" | "progress-verification" | "completion" | "continuation",
      "evidenceScope": "output" | "usage" | "outcome" | "impact",
      "evidenceStrength": "self-report" | "third-party-verifiable" | "independent-review" | "independent-evaluation",
      "required": boolean,
      "keyRequirements": string[]
    }
  ],
  "publicBenefitMechanism": "output-production" | "access-provision" | "condition-change" | "ecosystem-shift",
  "indicatorFields": string[],
  "configurationGaps": string[]
}`
}

// ---------------------------------------------------------------------------
// CROSS prompts
// ---------------------------------------------------------------------------

/**
 * Generates a prompt asking a language model to classify a described
 * framework against CROSS+WALKRI primitives.
 */
export function classifyFrameworkPrompt(frameworkDescription: string): string {
  return `You are classifying an external framework against the CROSS+WALKRI primitives to understand which primitives it exemplifies and what compatibility statements apply.

The CROSS+WALKRI primitives are organized in seven layers:
- Layer 1 (Methodological): Bidirectional Precision, Transclusion, Frame Language primitives
- Layer 2 (Identity): Entity Boundary, Scope, Sufficiency, Revenue Architecture, Disbursement Authority, Governance Resilience, On-chain Identity Anchor
- Layer 3 (Obligation): Obligation Mode, Development Stage, Gate Type, Gate Character, Obligation Fulfillment Record, Conflict of Interest, Public Benefit Mechanism, Access Condition
- Layer 4 (Evidence): Evidence Scope, Evidence Strength, Evidence Type, Causality Stance, Intended vs Unintended Effects, Beneficiary Accountability Gate, Attestation Corpus
- Layer 5 (Specification): Criterion Specification Elements, Data Quality Standards, External Standard Identifier Types, Access Models, Applicant Identity Instrument Types
- Layer 6 (Causal Architecture): Theory of Change Hierarchy, Theory Layer, Specification Directionality, Pathway, Sustainability Stance
- Layer 7 (Portfolio): Portfolio Position, Portfolio-level Continuation Benchmark, Inter-cycle Reflection Stage, Multi-cycle Retrospective Assessment, Portfolio Analysis Outputs, Cohort Position

Framework to classify:
${frameworkDescription}

For each CROSS+WALKRI primitive that this framework exemplifies (or partially exemplifies), state:
- The primitive name
- Whether the framework exemplifies it fully, partially, or only implicitly
- The specific mechanism in the framework that corresponds to the primitive
- Whether a formal compatibility statement would be warranted

Then provide:
- A summary of which layers this framework primarily addresses
- Which primitives are missing (gaps in the framework relative to CROSS+WALKRI)
- A draft compatibility statement opening sentence

Respond in structured JSON:
{
  "exemplifiedPrimitives": [
    {
      "primitiveName": string,
      "exemplification": "full" | "partial" | "implicit",
      "mechanism": string,
      "warrantsCompatibilityStatement": boolean
    }
  ],
  "primaryLayers": string[],
  "missingPrimitives": string[],
  "compatibilityStatementDraft": string
}`
}

/**
 * Generates a prompt asking a language model to evaluate whether a described
 * grant round was run correctly under CROSS+WALKRI.
 */
export function evaluateRoundPrompt(roundDescription: string): string {
  return `You are evaluating whether a described grant round was run correctly under CROSS+WALKRI. A conformant round must satisfy the following minimum requirements:

1. An entry specification gate was declared and published before any application opened, specifying the obligation mode, evidence scope, and key requirements.

2. The obligation mode was declared explicitly (build, change, or retroactive) and the round's application fields are coherent with that mode. A change-mode round without a FROM state requirement is non-conformant. A build-mode round without a deliverable specification is non-conformant.

3. Application fields that collect measurement data are WALKRI-conformant instruments, not bare labels. A conformant instrument has a written criterion intent, an operational definition with qualifying and non-qualifying examples, a justified response type, a specified evidence artifact and access path, and (if referencing an external standard) a compliance threshold.

4. A completion gate was configured and the evidence scope at the completion gate is appropriate to the obligation mode. Change-mode rounds require at least outcome evidence scope at completion.

5. For returning grantees: an obligation fulfillment record was reviewed before a continuation gate was passed.

Round description:
${roundDescription}

Assess the round against each requirement. For each, state:
- Whether the requirement was met, partially met, or not met
- Specific evidence from the description supporting your assessment
- What would need to be added or changed to achieve conformance

Then provide an overall conformance verdict and a prioritized list of gaps to address before the next round opens.

Respond in structured JSON:
{
  "requirements": [
    {
      "requirement": string,
      "status": "met" | "partial" | "not-met",
      "evidence": string,
      "remediation": string | null
    }
  ],
  "overallVerdict": "conformant" | "partial" | "non-conformant",
  "prioritizedGaps": string[]
}`
}
