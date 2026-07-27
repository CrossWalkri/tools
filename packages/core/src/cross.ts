/**
 * CROSS gate logic: round validation, gate requirements, and obligation mode
 * classification.
 *
 * Version 0.1.0 | CC0
 */

import type {
  CrossRound,
  CrossGateType,
  CrossObligationMode,
  CrossEvidenceScope,
  CrossEvidenceStrength,
} from './types.js'

// ---------------------------------------------------------------------------
// Gate requirements
// ---------------------------------------------------------------------------

interface GateRequirement {
  label: string
  description: string
}

/**
 * Returns the list of substantive requirements for a gate of a given type
 * operating in a given obligation mode. These are the minimum declared
 * requirements; programs may configure higher rigor.
 */
export function getGateRequirements(
  gateType: CrossGateType,
  obligationMode: CrossObligationMode,
): string[] {
  const shared: GateRequirement[] = [
    { label: 'Organizational identity', description: 'Five declared fields: legal or registered name, primary operating jurisdiction, primary contact, governance structure type, and organizational history. Field 6 (on-chain identity anchor) is recommended.' },
    { label: 'Disbursement authority', description: 'Named person or mechanism with legal authority to receive and deploy grant funds.' },
  ]

  const byMode: Record<CrossObligationMode, GateRequirement[]> = {
    build: [
      { label: 'Deliverable specification', description: 'Specific artifact or system to be produced, with independently verifiable completion criteria.' },
      { label: 'Scope declaration', description: 'The portion of the entity\'s work portfolio this grant covers.' },
      { label: 'Development stage declaration', description: 'Which of the five development stages (proof of concept through established infrastructure) the work occupies at submission.' },
    ],
    change: [
      { label: 'FROM state (baseline)', description: 'A measurable starting condition for the indicator, sourced from a named independent data source.' },
      { label: 'TO state (target)', description: 'A measurable target condition in the same units as the baseline, with a stated time horizon.' },
      { label: 'Population definition', description: 'The defined population in which the change will be measured, with boundary conditions.' },
      { label: 'Named data source', description: 'The specific source from which baseline and target data will be collected, accessible without applicant cooperation.' },
      { label: 'Intervention mechanism', description: 'The causal pathway connecting funded activities to the anticipated change in the indicator.' },
      { label: 'Causality stance', description: 'Whether the program claims attribution (causal responsibility) or contribution (material participation among multiple factors).' },
    ],
    retroactive: [
      { label: 'Prior contribution evidence', description: 'Documentation of the work already performed, from sources outside the applicant\'s control.' },
      { label: 'Attribution of prior work', description: 'Named entity under whose resources or governance the prior work was performed, if different from the applying entity.' },
      { label: 'Impact evidence', description: 'Verifiable evidence that the prior work produced the stated benefit, accessible to an independent reviewer.' },
    ],
  }

  const byGate: Partial<Record<CrossGateType, GateRequirement[]>> = {
    'entry-specification': [
      { label: 'Public benefit mechanism', description: 'The declared mechanism by which the funded work produces non-excludable or non-rivalrous benefit to parties outside the applicant.' },
      { label: 'Access condition', description: 'The terms under which the public benefit mechanism holds and can be independently verified.' },
      { label: 'Obligation fulfillment record', description: 'For returning applicants: documented history of prior grant commitments and whether those commitments were met.' },
    ],
    completion: [
      { label: 'Completion evidence', description: 'Evidence appropriate to the declared evidence scope and evidence strength for this gate.' },
      { label: 'Unintended effects disclosure', description: 'Disclosure of any effects that occurred during the grant period that were not specified in the entry gate, whether positive or negative.' },
      { label: 'Financial accountability', description: 'Expenditure by category for the grant period, with a verification path accessible without authentication walls.' },
    ],
    continuation: [
      { label: 'Sustainability stance', description: 'Declared position on whether outcomes produced by prior rounds are self-sustaining, conditional on external factors, or dependent on continued intervention.' },
      { label: 'Obligation fulfillment record', description: 'Documented history of all prior rounds with this funder and whether commitments were met.' },
      { label: 'Next-round specification', description: 'Entry specification for the proposed subsequent round, including obligation mode, gate configuration, and indicator fields.' },
    ],
  }

  const requirements: string[] = []

  for (const r of shared) {
    requirements.push(`${r.label}: ${r.description}`)
  }

  const modeRequirements = byMode[obligationMode]
  for (const r of modeRequirements) {
    requirements.push(`${r.label}: ${r.description}`)
  }

  const gateRequirements = byGate[gateType]
  if (gateRequirements === undefined) {
    // A valid gate type with no requirements of its own. Saying so beats
    // returning a shorter list that reads as complete.
    requirements.push(
      `No requirements specific to the ${gateType} gate are defined. The requirements above are the shared and obligation-mode requirements that apply at every gate. If this gate carries obligations of its own in your program, they are yours to declare.`,
    )
  } else {
    for (const r of gateRequirements) {
      requirements.push(`${r.label}: ${r.description}`)
    }
  }

  return requirements
}

// ---------------------------------------------------------------------------
// Round validation
// ---------------------------------------------------------------------------

interface RoundValidationResult {
  valid: boolean
  gaps: string[]
}

const evidenceScopeRank: Record<CrossEvidenceScope, number> = {
  output: 1,
  usage: 2,
  outcome: 3,
  impact: 4,
}

const evidenceStrengthRank: Record<CrossEvidenceStrength, number> = {
  'self-report': 1,
  'third-party-verifiable': 2,
  'independent-review': 3,
  'independent-evaluation': 4,
}

/**
 * Validates a CrossRound configuration for internal consistency.
 *
 * Checks that:
 * - An entry-specification gate is present.
 * - A completion gate is present.
 * - Change-mode rounds include the minimum evidence scope at the completion gate.
 * - Gate evidence scope does not regress between entry and completion.
 * - Indicator fields are declared.
 */
export function validateRoundConfig(round: CrossRound): RoundValidationResult {
  const gaps: string[] = []

  const gateTypes = round.gates.map((g) => g.type)

  if (!gateTypes.includes('entry-specification')) {
    gaps.push('Missing entry-specification gate. CROSS requires an entry specification gate to be declared before any application opens.')
  }

  if (!gateTypes.includes('completion')) {
    gaps.push('Missing completion gate. CROSS requires a completion gate to determine whether the grant obligation was met before final payment.')
  }

  if (round.indicatorFields.length === 0) {
    gaps.push('No indicator fields declared. At least one primary measurement instrument field must be named.')
  }

  // Change mode requires at least outcome evidence scope at the completion gate
  if (round.obligationMode === 'change') {
    const completionGate = round.gates.find((g) => g.type === 'completion')
    if (completionGate) {
      const scopeRank = evidenceScopeRank[completionGate.evidenceScope]
      if (scopeRank < evidenceScopeRank['outcome']) {
        gaps.push(
          `Change-mode rounds require outcome evidence scope at the completion gate. Current configuration specifies "${completionGate.evidenceScope}" evidence, which cannot verify that a condition change occurred.`,
        )
      }
    }
  }

  // Retroactive mode requires at least third-party-verifiable evidence strength
  if (round.obligationMode === 'retroactive') {
    const entryGate = round.gates.find((g) => g.type === 'entry-specification')
    if (entryGate) {
      const strengthRank = evidenceStrengthRank[entryGate.evidenceStrength]
      if (strengthRank < evidenceStrengthRank['third-party-verifiable']) {
        gaps.push(
          'Retroactive-mode rounds require at least third-party-verifiable evidence strength at the entry gate. Self-report cannot independently verify prior contribution.',
        )
      }
    }
  }

  // Check that gate evidence scope does not regress from entry to completion
  const entryGate = round.gates.find((g) => g.type === 'entry-specification')
  const completionGate = round.gates.find((g) => g.type === 'completion')
  if (entryGate && completionGate) {
    const entryRank = evidenceScopeRank[entryGate.evidenceScope]
    const completionRank = evidenceScopeRank[completionGate.evidenceScope]
    if (completionRank < entryRank) {
      gaps.push(
        `Completion gate evidence scope ("${completionGate.evidenceScope}") is weaker than entry gate evidence scope ("${entryGate.evidenceScope}"). Evidence scope should not regress between gates.`,
      )
    }
  }

  // Check public benefit mechanism is coherent with obligation mode
  if (
    round.obligationMode === 'change' &&
    round.publicBenefitMechanism === 'output-production'
  ) {
    gaps.push(
      'Public benefit mechanism is "output-production" but obligation mode is "change". Change-mode rounds should declare "condition-change" or "ecosystem-shift" as the public benefit mechanism, because the obligation is a measured shift in conditions, not merely delivery of an artifact.',
    )
  }

  if (
    round.obligationMode === 'build' &&
    round.publicBenefitMechanism === 'condition-change'
  ) {
    gaps.push(
      'Public benefit mechanism is "condition-change" but obligation mode is "build". Build-mode rounds should declare "output-production" or "access-provision" unless a downstream change is separately specified. Use change mode if the obligation is a measurable condition shift.',
    )
  }

  return { valid: gaps.length === 0, gaps }
}

// ---------------------------------------------------------------------------
// Obligation mode classification (heuristic)
// ---------------------------------------------------------------------------

export interface ObligationModeClassification {
  mode: CrossObligationMode
  /** Signal counts the call rested on, so a caller can see the margin. */
  basis: { changeSignals: number; buildSignals: number; retroactiveMatched: boolean }
  /**
   * True when the evidence did not distinguish the modes. Previously a tie
   * returned 'build' with no indication, which is a judgment the description
   * never supported. An unknown belongs in a named state, not in a default.
   */
  ambiguous: boolean
  /** What a caller should do about it, in one line. */
  note: string
}

/**
 * Infer an obligation mode from a natural-language description, with the basis.
 *
 * Heuristic, suitable for suggesting a starting configuration and always to be
 * reviewed by a human operator before a round opens. Where the signals do not
 * separate, that is reported rather than resolved.
 */
export function classifyObligationModeWithBasis(
  description: string,
): ObligationModeClassification {
  const lower = description.toLowerCase()

  // Retroactive signals: past tense, recognition of prior work
  const retroactiveSignals = [
    'already built',
    'already completed',
    'prior work',
    'past contribution',
    'retrospective',
    'retroactive',
    'retro pgf',
    'retropgf',
    'recognition of',
    'reward past',
    'work already done',
    'existing contribution',
    'historical impact',
    'previously deployed',
  ]
  const retroactiveMatched = retroactiveSignals.some((s) => lower.includes(s))
  if (retroactiveMatched) {
    return {
      mode: 'retroactive',
      basis: { changeSignals: 0, buildSignals: 0, retroactiveMatched: true },
      ambiguous: false,
      note: 'Retroactive language is decisive here: the description names work already done.',
    }
  }

  // Change signals: measurable outcomes, baselines, populations, condition shifts
  const changeSignals = [
    'measurable change',
    'measurable impact',
    'baseline',
    'outcome',
    'condition change',
    'shift in',
    'reduce',
    'increase',
    'improve',
    'from x to y',
    'target population',
    'beneficiaries',
    'adoption rate',
    'usage growth',
    'measured by',
    'kpi',
    'key performance indicator',
    'theory of change',
  ]
  const changeScore = changeSignals.filter((s) => lower.includes(s)).length

  // Build signals: deliverables, artifacts, tools, code, infrastructure
  const buildSignals = [
    'build',
    'create',
    'develop',
    'ship',
    'deliver',
    'release',
    'launch',
    'deploy',
    'tool',
    'protocol',
    'smart contract',
    'feature',
    'v1',
    'mvp',
    'specification',
    'audit report',
    'research report',
    'infrastructure',
    'integration',
  ]
  const buildScore = buildSignals.filter((s) => lower.includes(s)).length

  const basis = {
    changeSignals: changeScore,
    buildSignals: buildScore,
    retroactiveMatched: false,
  }

  if (changeScore > buildScore) {
    return {
      mode: 'change',
      basis,
      ambiguous: false,
      note: 'Change signals outweigh build signals.',
    }
  }

  if (changeScore === buildScore) {
    return {
      mode: 'build',
      basis,
      ambiguous: true,
      note:
        changeScore === 0
          ? 'Neither change nor build language was found. Build is returned as a starting point only; the description does not support a mode, and an operator must choose one.'
          : 'Change and build signals are evenly matched, so this description does not distinguish the modes. Build is returned as a starting point only; an operator must choose.',
    }
  }

  return {
    mode: 'build',
    basis,
    ambiguous: false,
    note: 'Build signals outweigh change signals.',
  }
}

/**
 * The mode alone, for callers that only need the classification.
 *
 * Prefer classifyObligationModeWithBasis where the answer is shown to a person:
 * this form cannot tell them the call was a coin toss.
 */
export function classifyObligationMode(description: string): CrossObligationMode {
  return classifyObligationModeWithBasis(description).mode
}
