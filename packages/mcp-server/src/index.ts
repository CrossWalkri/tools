#!/usr/bin/env node
/**
 * @proof-of-coord/evidence-integrity
 *
 * MCP server exposing the evidence integrity standards as AI tools over stdio.
 * Thirteen tools: WALKRI field auditing and generation, CROSS gate checking,
 * round configuration, framework classification, lens lookup, falsifiability
 * auditing and round auditing, plus ORE source grading, independence checking,
 * finding auditing, posture declaration and the Meridian Basin benchmark.
 *
 * Version 0.4.0 | CC0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import {
  auditField,
  getGateRequirements,
  validateRoundConfig,
  classifyObligationMode,
  searchPrimitives,
  getPrimitivesByLayer,
  auditFieldPrompt,
  configureRoundPrompt,
  classifyFrameworkPrompt,
  evaluateRoundPrompt,
  walkriFieldSchema,
  crossGateTypeSchema,
  crossObligationModeSchema,
  LENSES,
  getLens,
  getLensValue,
  getAllLensIds,
  FALSIFIABILITY_ELEMENTS,
  FALSIFIABILITY_TYPES,
  FALSIFIABILITY_FAILURE_MODES,
  getFalsifiabilityType,
  getFalsifiabilityFailureMode,
} from '@proof-of-coord/evidence-core'
import type { WalkriField, CrossGateType, CrossObligationMode } from '@proof-of-coord/evidence-core'
import { ORE_TOOLS, handleOreTool } from './ore-tools.js'
import { validateToolArgs, toolError } from './tool-validation.js'
import { withOutputSchemas, finish } from './tool-output.js'
import { SERVER_NAME, SERVER_VERSION } from './create-server.js'

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: 'walkri_audit_field',
    description:
      'Audit a grant application field against WALKRI\'s five pre-publication requirements. Returns a verdict (instrument or label) and specific gaps per criterion. Use before publishing any application form to verify that fields will produce usable data rather than incomparable free-text responses.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        label: {
          type: 'string',
          description: 'The visible label shown to applicants.',
        },
        description: {
          type: 'string',
          description:
            'Written statement of what the field measures, distinct from the label. This is the criterion intent.',
        },
        fieldType: {
          type: 'string',
          enum: ['text', 'textarea', 'url', 'number', 'boolean', 'select', 'multiselect', 'file'],
          description: 'The response type.',
        },
        options: {
          type: 'array',
          items: { type: 'string' },
          description:
            'For select/multiselect fields: the enumerated options with qualifying and non-qualifying examples.',
        },
        caption: {
          type: 'string',
          description: 'Caption or sub-label appearing below the field.',
        },
        placeholder: {
          type: 'string',
          description: 'Placeholder text shown inside the field input.',
        },
        required: {
          type: 'boolean',
          description: 'Whether this field is required.',
        },
      },
      required: ['label', 'fieldType', 'required'],
    },
  },
  {
    name: 'walkri_generate_field',
    description:
      'Generate a WALKRI-conformant field specification from a plain-language description of what you want to measure. Returns a prompt template and a draft field specification that satisfies all five WALKRI criterion specification elements.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        whatToMeasure: {
          type: 'string',
          description:
            'Plain-language description of the underlying construct this field should measure. Be specific about what a true response would tell an evaluator.',
        },
        programType: {
          type: 'string',
          description:
            'The type of grant program (e.g., Web3 public goods, international development, research, community foundation). Affects what evidence forms are appropriate.',
        },
        fieldTypeHint: {
          type: 'string',
          enum: ['text', 'textarea', 'url', 'number', 'boolean', 'select', 'multiselect', 'file'],
          description:
            'Optional hint for the preferred field type. The tool will justify or revise this based on the criterion intent.',
        },
      },
      required: ['whatToMeasure'],
    },
  },
  {
    name: 'cross_check_gate',
    description:
      'Check what a specific CROSS gate requires for a given obligation mode, and identify what is missing from provided content. Use to verify that a gate configuration or applicant submission meets CROSS minimum requirements before proceeding to the next gate.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        gateType: {
          type: 'string',
          enum: ['entry-specification', 'application', 'completion', 'continuation'],
          description: 'The gate type to check requirements for.',
        },
        obligationMode: {
          type: 'string',
          enum: ['build', 'change', 'retroactive'],
          description: 'The obligation mode this gate is operating under.',
        },
        content: {
          type: 'string',
          description:
            'Optional: the gate submission or configuration content to check for gaps. If omitted, returns the full requirements list without gap analysis.',
        },
      },
      required: ['gateType', 'obligationMode'],
    },
  },
  {
    name: 'cross_configure_round',
    description:
      'Recommend a CROSS round configuration including obligation mode, gate structure, and key fields for a described program. Returns a structured configuration recommendation and a prompt template for refining it with a language model.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        programDescription: {
          type: 'string',
          description:
            'Description of the grant program or round to configure. Include what the program funds, what success looks like, and who the applicants are.',
        },
        programType: {
          type: 'string',
          description:
            'The program type (e.g., Web3 public goods, international development, research, community foundation, challenge prize).',
        },
      },
      required: ['programDescription'],
    },
  },
  {
    name: 'cross_classify_framework',
    description:
      'Classify an external framework against CROSS+WALKRI primitives to understand which primitives it exemplifies and which compatibility statements apply. Use when evaluating whether an existing framework is compatible with CROSS+WALKRI or when drafting a compatibility statement.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        frameworkDescription: {
          type: 'string',
          description:
            'Description of the framework to classify. Include its purpose, key requirements, and how it structures evidence or accountability.',
        },
        frameworkName: {
          type: 'string',
          description: 'The name of the framework (optional, for reference in the output).',
        },
      },
      required: ['frameworkDescription'],
    },
  },
  {
    name: 'cross_lookup_lens',
    description:
      'Look up a dimension of the CROSS+WALKRI Lenses Framework. Five lenses sit above the primitives as cross-cutting metadata: calibration-tier (five tiers from impressionistic to falsifiable), authority-source (where binding force comes from), cultural-methodological-lineage (the tradition the framework descends from), funder-typology (the kind of funder), and framework-scope-type (what kind of object the framework is). Returns the lens, its enumerated values, and detection criteria. Use this when classifying a framework, assessing where an organization sits today, or naming a realistic next position.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        lens_id: {
          type: 'string',
          enum: [
            'calibration-tier',
            'authority-source',
            'cultural-methodological-lineage',
            'funder-typology',
            'framework-scope-type',
          ],
          description:
            'Optional: a specific lens to return. If omitted, returns all five lenses with their values.',
        },
        value_id: {
          type: 'string',
          description:
            'Optional: a specific value within the named lens to return. Requires lens_id.',
        },
      },
    },
  },
  {
    name: 'cross_falsifiability_audit',
    description:
      'Apply the four-element falsifiability test from the Falsifiability Architecture document. A falsifiable claim has: (1) a pre-committed claim, (2) a named verifying source outside the claimant\'s control, (3) a drift detection mechanism, and (4) a disclosure obligation. The tool returns the four elements with structural tests, plus the five gate-based falsifiability types and the eight failure modes. Use this when auditing whether a round configuration, compatibility statement, or grantee report meets the falsifiability standard, or when diagnosing why a claim that uses falsifiability vocabulary fails to function as falsifiable.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        scope: {
          type: 'string',
          enum: ['elements', 'types', 'failure-modes', 'all'],
          description:
            'What to return. "elements" returns the four structural elements. "types" returns the five gate-based falsifiability types. "failure-modes" returns the eight ways a falsifiability claim fails to function. "all" returns everything. Default: "all".',
        },
        type_id: {
          type: 'string',
          description:
            'Optional: a specific falsifiability type to return. Available: type-a-entry-gate, type-b-progress-gate, type-c-completion-gate, type-d-continuation-gate, type-e-portfolio-level.',
        },
        failure_mode_id: {
          type: 'string',
          description:
            'Optional: a specific failure mode to return. Available: transcendence-claim, declaration-exploit, precision-facade, partial-instantiation, direction-without-destination, vocabulary-without-architecture, correct-map-wrong-territory, frozen-map.',
        },
      },
    },
  },
  {
    name: 'cross_audit_round',
    description:
      'Evaluate whether a described grant round was run correctly under CROSS+WALKRI. Checks for entry specification gate, WALKRI-conformant fields, completion gate, and attestation corpus. Returns a structured assessment with a conformance verdict and prioritized gap list.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        roundDescription: {
          type: 'string',
          description:
            'Description of the grant round, including how it was structured, what it funded, and how applications were collected and evaluated.',
        },
        eligibilityCriteria: {
          type: 'string',
          description:
            'Optional: the eligibility criteria or entry requirements that were published for this round.',
        },
        formFields: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Optional: the names or labels of the fields in the application form. Used to assess whether WALKRI-conformant instrument fields were present.',
        },
        completionRequirements: {
          type: 'string',
          description:
            'Optional: the completion or reporting requirements that grantees had to meet to receive final payment.',
        },
      },
      required: ['roundDescription'],
    },
  },
  ...ORE_TOOLS,
]

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

function handleWalkriAuditField(args: Record<string, unknown>) {
  const field: WalkriField = {
    label: String(args['label'] ?? ''),
    description: args['description'] != null ? String(args['description']) : undefined,
    fieldType: args['fieldType'] as WalkriField['fieldType'],
    options: Array.isArray(args['options'])
      ? (args['options'] as string[])
      : undefined,
    caption: args['caption'] != null ? String(args['caption']) : undefined,
    placeholder: args['placeholder'] != null ? String(args['placeholder']) : undefined,
    required: Boolean(args['required']),
  }

  const result = auditField(field)
  const failingCriteria = result.criteria.filter((c) => !c.passes)

  let text = `WALKRI Audit Result\n\nField: "${field.label}"\nVerdict: ${result.verdict.toUpperCase()}\n\n`

  if (result.verdict === 'instrument') {
    text += 'All five WALKRI criteria pass. This field is a measurement instrument.\n'
  } else {
    text += `${failingCriteria.length} of 5 criteria fail.\n\n`
    text += 'Criteria Assessment:\n'
    for (const criterion of result.criteria) {
      const status = criterion.passes ? 'PASS' : 'FAIL'
      text += `\n[${status}] ${criterion.name}\n`
      if (!criterion.passes && criterion.gap) {
        text += `  Gap: ${criterion.gap}\n`
      }
      if (!criterion.passes && criterion.suggestion) {
        text += `  Fix: ${criterion.suggestion}\n`
      }
    }
  }

  if (result.systemicPatterns.length > 0) {
    text += '\nSystemic Patterns:\n'
    for (const pattern of result.systemicPatterns) {
      text += `- ${pattern}\n`
    }
  }

  text += '\n\nPrompt Template for Revision:\n\n'
  text += auditFieldPrompt(field)

  return { content: [{ type: 'text', text }] }
}

function handleWalkriGenerateField(args: Record<string, unknown>) {
  const whatToMeasure = String(args['whatToMeasure'] ?? '')
  const programType = args['programType'] != null ? String(args['programType']) : 'general'
  const fieldTypeHint = args['fieldTypeHint'] as WalkriField['fieldType'] | undefined

  // Build a draft field to pass to the prompt generator
  const draftField: WalkriField = {
    label: whatToMeasure.slice(0, 80),
    description: whatToMeasure,
    fieldType: fieldTypeHint ?? 'text',
    required: true,
  }

  let text = `WALKRI Field Generation\n\nYou want to measure: ${whatToMeasure}\nProgram type: ${programType}\n`

  if (fieldTypeHint) {
    text += `Requested field type: ${fieldTypeHint}\n`
  }

  text += '\nTo generate a WALKRI-conformant specification, send this prompt to a language model:\n\n'
  text += '---\n'
  text +=
    `You are a grant form designer applying the WALKRI standard. Generate a complete, WALKRI-conformant field specification for the following measurement goal.\n\n`
  text += `What this field should measure: ${whatToMeasure}\nProgram type: ${programType}\n`

  if (fieldTypeHint) {
    text += `Preferred field type (justify or revise): ${fieldTypeHint}\n`
  }

  text += `\nA WALKRI-conformant field must satisfy all five criterion specification elements:\n`
  text += `1. Criterion intent: written statement of what the field measures, distinct from the label\n`
  text += `2. Operational definition: qualifying and non-qualifying examples that constrain interpretation\n`
  text += `3. Response form: the response type with a written justification\n`
  text += `4. Evidence form: specific artifact type and access path, not "evidence of X"\n`
  text += `5. Conformance threshold: if referencing an external standard, which components apply and what passage looks like\n\n`
  text += `Return a complete field specification as JSON:\n`
  text += `{\n  "label": string,\n  "description": string,\n  "fieldType": string,\n  "options": string[] | null,\n  "caption": string,\n  "placeholder": string,\n  "required": boolean,\n  "walkriNotes": {\n    "criterionIntent": string,\n    "operationalDefinition": string,\n    "responseFormJustification": string,\n    "evidenceForm": string,\n    "complianceThreshold": string | null\n  }\n}`
  text += '\n---\n\n'

  // Also run the structural audit on the draft to show what needs to be addressed
  const auditResult = auditField(draftField)
  text += `Structural audit of the draft (based on the information provided):\n`
  text += `Verdict: ${auditResult.verdict.toUpperCase()}\n`
  text += `Criteria that need specification:\n`
  for (const criterion of auditResult.criteria.filter((c) => !c.passes)) {
    text += `- ${criterion.name}: ${criterion.gap}\n`
  }

  return { content: [{ type: 'text', text }] }
}

function handleCrossCheckGate(args: Record<string, unknown>) {
  const gateType = String(args['gateType'] ?? '') as CrossGateType
  const obligationMode = String(args['obligationMode'] ?? '') as CrossObligationMode
  const content = args['content'] != null ? String(args['content']) : null

  const requirements = getGateRequirements(gateType, obligationMode)

  let text = `CROSS Gate Requirements\n\nGate: ${gateType}\nObligation mode: ${obligationMode}\n\nRequired elements:\n\n`

  for (let i = 0; i < requirements.length; i++) {
    text += `${i + 1}. ${requirements[i]}\n\n`
  }

  if (content) {
    text += '\nGap Analysis Against Provided Content:\n\n'
    const contentLower = content.toLowerCase()
    const gaps: string[] = []
    const satisfied: string[] = []

    // Heuristic keyword matching against content
    const keywordMap: Record<string, string[]> = {
      'Organizational identity': ['legal name', 'organization', 'registered', 'entity'],
      'Disbursement authority': ['disbursement', 'authorized', 'signatory', 'wallet', 'receive funds'],
      'Deliverable specification': ['deliverable', 'artifact', 'completion criteria', 'what will be built'],
      'FROM state': ['baseline', 'from state', 'current value', 'starting condition'],
      'TO state': ['target', 'to state', 'goal value', 'desired condition'],
      'Population definition': ['population', 'beneficiaries', 'target group', 'who'],
      'Named data source': ['data source', 'measured by', 'collected from', 'via'],
      'Public benefit mechanism': ['open source', 'public good', 'benefit', 'access', 'license'],
      'Completion evidence': ['evidence', 'proof', 'report', 'documentation'],
      'Financial accountability': ['budget', 'expenditure', 'financial', 'spent'],
    }

    for (const req of requirements) {
      const label = req.split(':')[0] ?? req
      const keywords = keywordMap[label]
      const found = keywords
        ? keywords.some((kw) => contentLower.includes(kw))
        : contentLower.includes(label.toLowerCase())

      if (found) {
        satisfied.push(label)
      } else {
        gaps.push(label)
      }
    }

    if (satisfied.length > 0) {
      text += `Likely satisfied (${satisfied.length}):\n`
      for (const s of satisfied) {
        text += `  [OK] ${s}\n`
      }
      text += '\n'
    }

    if (gaps.length > 0) {
      text += `Likely missing or unclear (${gaps.length}):\n`
      for (const g of gaps) {
        text += `  [MISSING] ${g}\n`
      }
    } else {
      text += 'No obvious gaps detected in the provided content. Review against the full requirements list above to confirm.\n'
    }
  }

  return { content: [{ type: 'text', text }] }
}

function handleCrossConfigureRound(args: Record<string, unknown>) {
  const programDescription = String(args['programDescription'] ?? '')
  const programType = args['programType'] != null ? String(args['programType']) : 'general'

  // Heuristic classification
  const inferredMode = classifyObligationMode(programDescription)

  // Validate a sample round configuration for this mode
  const sampleRound = {
    obligationMode: inferredMode,
    gates: [
      {
        type: 'entry-specification' as const,
        obligationMode: inferredMode,
        evidenceScope: inferredMode === 'change' ? ('usage' as const) : ('output' as const),
        evidenceStrength: 'self-report' as const,
        required: true,
      },
      {
        type: 'completion' as const,
        obligationMode: inferredMode,
        evidenceScope:
          inferredMode === 'change'
            ? ('outcome' as const)
            : inferredMode === 'retroactive'
            ? ('impact' as const)
            : ('output' as const),
        evidenceStrength: 'third-party-verifiable' as const,
        required: true,
      },
    ],
    indicatorFields: ['primary-indicator'],
    publicBenefitMechanism:
      inferredMode === 'change'
        ? ('condition-change' as const)
        : inferredMode === 'retroactive'
        ? ('ecosystem-shift' as const)
        : ('output-production' as const),
  }

  const validation = validateRoundConfig(sampleRound)

  let text = `CROSS Round Configuration\n\nProgram: ${programDescription.slice(0, 120)}...\nProgram type: ${programType}\n\n`
  text += `Inferred obligation mode: ${inferredMode.toUpperCase()}\n\n`

  if (inferredMode === 'build') {
    text += `Build mode was selected because the description emphasizes producing an artifact, tool, or deliverable.\n`
    text += `Key entry specification requirements:\n`
    text += `- Deliverable specification (specific artifact with independently verifiable completion criteria)\n`
    text += `- Scope declaration (which portion of the entity's work this grant covers)\n`
    text += `- Development stage declaration (which of the five development stages the work occupies)\n`
  } else if (inferredMode === 'change') {
    text += `Change mode was selected because the description emphasizes measurable impact on conditions in the world.\n`
    text += `Key entry specification requirements:\n`
    text += `- FROM state: a measurable baseline sourced from a named independent data source\n`
    text += `- TO state: a measurable target in the same units as the baseline, with a time horizon\n`
    text += `- Population definition: who the change will be measured for, with boundary conditions\n`
    text += `- Named data source: where baseline and target data will be collected\n`
    text += `- Intervention mechanism: how the funded activities connect to the anticipated change\n`
    text += `- Causality stance: attribution (caused by this work) or contribution (material participation)\n`
  } else {
    text += `Retroactive mode was selected because the description references prior or completed work.\n`
    text += `Key entry specification requirements:\n`
    text += `- Prior contribution evidence from sources outside the applicant's control\n`
    text += `- Attribution of prior work if performed under a different entity\n`
    text += `- Impact evidence verifiable by an independent reviewer\n`
  }

  text += `\nRecommended gate structure:\n`
  for (const gate of sampleRound.gates) {
    text += `\n[${gate.type}]\n`
    text += `  Evidence scope: ${gate.evidenceScope}\n`
    text += `  Evidence strength: ${gate.evidenceStrength}\n`
    const reqs = getGateRequirements(gate.type, inferredMode)
    text += `  Requirements (${reqs.length}):\n`
    for (const req of reqs.slice(0, 5)) {
      text += `    - ${req.split(':')[0]}\n`
    }
    if (reqs.length > 5) {
      text += `    ... and ${reqs.length - 5} more\n`
    }
  }

  if (!validation.valid) {
    text += `\nConfiguration gaps to address:\n`
    for (const gap of validation.gaps) {
      text += `- ${gap}\n`
    }
  }

  text += '\n\nPrompt Template for Full Configuration:\n\n'
  text += '---\n'
  text += configureRoundPrompt(programDescription, programType)
  text += '\n---\n'

  return { content: [{ type: 'text', text }] }
}

function handleCrossClassifyFramework(args: Record<string, unknown>) {
  const frameworkDescription = String(args['frameworkDescription'] ?? '')
  const frameworkName =
    args['frameworkName'] != null ? String(args['frameworkName']) : 'the framework'

  // Keyword-based primitive matching for immediate structural output
  const matchedPrimitives = searchPrimitives(frameworkName)
  const layers = ['methodological', 'identity', 'obligation', 'evidence', 'specification', 'causal-architecture', 'portfolio'] as const

  let text = `CROSS+WALKRI Framework Classification\n\nFramework: ${frameworkName}\n\n`

  // Check which layers seem addressed by keywords in the description
  const descLower = frameworkDescription.toLowerCase()
  const layerKeywords: Record<string, string[]> = {
    methodological: ['definition', 'precision', 'term', 'vocabulary', 'language'],
    identity: ['organization', 'entity', 'applicant', 'identity', 'legal', 'wallet'],
    obligation: ['obligation', 'deliverable', 'commitment', 'mode', 'gate', 'requirement'],
    evidence: ['evidence', 'data', 'verification', 'proof', 'attestation', 'outcome'],
    specification: ['field', 'indicator', 'instrument', 'measurement', 'criterion', 'standard'],
    'causal-architecture': ['theory of change', 'causal', 'pathway', 'outcome', 'impact', 'logic model', 'logframe'],
    portfolio: ['portfolio', 'cohort', 'cross-program', 'multi-round', 'cycle', 'benchmark'],
  }

  const coveredLayers: string[] = []
  const uncoveredLayers: string[] = []

  for (const layer of layers) {
    const keywords = layerKeywords[layer] ?? []
    if (keywords.some((kw) => descLower.includes(kw))) {
      coveredLayers.push(layer)
    } else {
      uncoveredLayers.push(layer)
    }
  }

  text += `Layers addressed by the described framework:\n`
  for (const layer of coveredLayers) {
    text += `  [PRESENT] ${layer}\n`
  }
  text += `\nLayers not addressed:\n`
  for (const layer of uncoveredLayers) {
    text += `  [ABSENT] ${layer}\n`
  }

  text += `\nSample matching primitives (from keyword search on "${frameworkName}"):\n`
  if (matchedPrimitives.length > 0) {
    for (const p of matchedPrimitives.slice(0, 5)) {
      text += `  - ${p.name} (${p.layer})\n`
    }
  } else {
    text += `  No direct name matches. Primitives will be identified via layer coverage above.\n`
  }

  text += `\nTo produce a full compatibility statement, send this prompt to a language model:\n\n`
  text += '---\n'
  text += classifyFrameworkPrompt(frameworkDescription)
  text += '\n---\n'

  return { content: [{ type: 'text', text }] }
}

function handleCrossAuditRound(args: Record<string, unknown>) {
  const roundDescription = String(args['roundDescription'] ?? '')
  const eligibilityCriteria =
    args['eligibilityCriteria'] != null ? String(args['eligibilityCriteria']) : null
  const formFields = Array.isArray(args['formFields'])
    ? (args['formFields'] as string[])
    : null
  const completionRequirements =
    args['completionRequirements'] != null
      ? String(args['completionRequirements'])
      : null

  const descLower = roundDescription.toLowerCase()
  const criteriaLower = (eligibilityCriteria ?? '').toLowerCase()
  const completionLower = (completionRequirements ?? '').toLowerCase()

  // Structural checks
  const checks: Array<{ label: string; passed: boolean; note: string }> = []

  // Check 1: Entry specification gate
  const hasEntryGate =
    descLower.includes('entry') ||
    descLower.includes('specification') ||
    criteriaLower.includes('entry') ||
    criteriaLower.includes('eligibility') ||
    descLower.includes('before any application') ||
    descLower.includes('before applications')
  checks.push({
    label: 'Entry specification gate declared before round opened',
    passed: hasEntryGate,
    note: hasEntryGate
      ? 'Evidence of an entry specification or eligibility declaration found in the description.'
      : 'No evidence of a published entry specification gate. CROSS requires the obligation architecture to be declared before any application opens.',
  })

  // Check 2: Obligation mode declared
  const hasObligationMode =
    descLower.includes('build') ||
    descLower.includes('deliverable') ||
    descLower.includes('outcome') ||
    descLower.includes('baseline') ||
    descLower.includes('retroactive') ||
    descLower.includes('change mode') ||
    descLower.includes('build mode') ||
    descLower.includes('obligation')
  checks.push({
    label: 'Obligation mode explicitly declared',
    passed: hasObligationMode,
    note: hasObligationMode
      ? 'Obligation mode signals detected in the description.'
      : 'No explicit obligation mode (build, change, or retroactive) found. CROSS requires this to be declared before any application opens.',
  })

  // Check 3: Completion gate
  const hasCompletionGate =
    descLower.includes('completion') ||
    completionLower.includes('completion') ||
    descLower.includes('final payment') ||
    descLower.includes('milestone') ||
    completionLower.length > 20
  checks.push({
    label: 'Completion gate configured',
    passed: hasCompletionGate,
    note: hasCompletionGate
      ? 'Evidence of a completion gate or final payment requirement found.'
      : 'No completion gate found. CROSS requires a completion gate to verify that the grant obligation was met before final payment.',
  })

  // Check 4: WALKRI-conformant fields
  const hasInstrumentFields =
    formFields != null &&
    formFields.length > 0 &&
    formFields.some(
      (f) =>
        f.toLowerCase().includes('baseline') ||
        f.toLowerCase().includes('target') ||
        f.toLowerCase().includes('evidence') ||
        f.toLowerCase().includes('url') ||
        f.toLowerCase().includes('license') ||
        f.toLowerCase().includes('repository'),
    )
  checks.push({
    label: 'Application fields show measurement instrument characteristics',
    passed: hasInstrumentFields,
    note: hasInstrumentFields
      ? 'Form fields include measurement instrument indicators (baseline, target, evidence, URL, or license fields).'
      : formFields
      ? `${formFields.length} form fields provided but none show measurement instrument characteristics. Run walkri_audit_field on each field to check conformance.`
      : 'No form fields provided. Provide the application field labels to assess WALKRI conformance.',
  })

  // Check 5: Financial accountability
  const hasFinancialAccountability =
    descLower.includes('financial') ||
    descLower.includes('budget') ||
    descLower.includes('expenditure') ||
    completionLower.includes('financial') ||
    completionLower.includes('budget')
  checks.push({
    label: 'Financial accountability requirement at completion gate',
    passed: hasFinancialAccountability,
    note: hasFinancialAccountability
      ? 'Financial reporting or accountability requirement found.'
      : 'No financial accountability requirement at the completion gate. CROSS completion gates require expenditure by category with a verification path.',
  })

  const passCount = checks.filter((c) => c.passed).length
  const verdict =
    passCount === 5 ? 'conformant' : passCount >= 3 ? 'partial' : 'non-conformant'

  let text = `CROSS+WALKRI Round Audit\n\nVerdict: ${verdict.toUpperCase()} (${passCount}/${checks.length} checks passed)\n\n`

  text += 'Conformance Checks:\n\n'
  for (const check of checks) {
    text += `[${check.passed ? 'PASS' : 'FAIL'}] ${check.label}\n`
    text += `  ${check.note}\n\n`
  }

  const gaps = checks.filter((c) => !c.passed).map((c) => c.label)
  if (gaps.length > 0) {
    text += 'Gaps to address before the next round opens:\n'
    for (const gap of gaps) {
      text += `- ${gap}\n`
    }
    text += '\n'
  }

  text += '\nFor a comprehensive AI-assisted evaluation, send this prompt to a language model:\n\n'
  text += '---\n'
  const fullDescription = [
    roundDescription,
    eligibilityCriteria ? `Eligibility criteria: ${eligibilityCriteria}` : '',
    formFields ? `Form fields: ${formFields.join(', ')}` : '',
    completionRequirements ? `Completion requirements: ${completionRequirements}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
  text += evaluateRoundPrompt(fullDescription)
  text += '\n---\n'

  return { content: [{ type: 'text', text }] }
}

function handleCrossLookupLens(args: Record<string, unknown>) {
  const lensId = args['lens_id'] != null ? String(args['lens_id']) : null
  const valueId = args['value_id'] != null ? String(args['value_id']) : null

  if (lensId && valueId) {
    const value = getLensValue(lensId, valueId)
    if (!value) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: `Value "${valueId}" not found in lens "${lensId}".`,
                available_lenses: getAllLensIds(),
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      }
    }
    const lens = getLens(lensId)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            { lens: lens?.name, value, detection_criteria: lens?.detection_criteria },
            null,
            2,
          ),
        },
      ],
    }
  }

  if (lensId) {
    const lens = getLens(lensId)
    if (!lens) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: `Lens "${lensId}" not found.`,
                available_lenses: getAllLensIds(),
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      }
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(lens, null, 2) }],
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            total: LENSES.length,
            lenses: LENSES,
            note:
              'Five lenses organize cross-cutting metadata above the primitives. Each Part XII compatibility statement, gap map entry, and partial coverage map entry carries one value per lens.',
          },
          null,
          2,
        ),
      },
    ],
  }
}

function handleCrossFalsifiabilityAudit(args: Record<string, unknown>) {
  const scope = args['scope'] != null ? String(args['scope']) : 'all'
  const typeId = args['type_id'] != null ? String(args['type_id']) : null
  const failureModeId =
    args['failure_mode_id'] != null ? String(args['failure_mode_id']) : null

  if (typeId) {
    const type = getFalsifiabilityType(typeId)
    if (!type) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: `Falsifiability type "${typeId}" not found.`,
                available: FALSIFIABILITY_TYPES.map((t) => t.id),
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      }
    }
    return {
      content: [{ type: 'text', text: JSON.stringify({ type }, null, 2) }],
    }
  }

  if (failureModeId) {
    const mode = getFalsifiabilityFailureMode(failureModeId)
    if (!mode) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: `Failure mode "${failureModeId}" not found.`,
                available: FALSIFIABILITY_FAILURE_MODES.map((m) => m.id),
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      }
    }
    return {
      content: [{ type: 'text', text: JSON.stringify({ failure_mode: mode }, null, 2) }],
    }
  }

  const payload: Record<string, unknown> = {}
  if (scope === 'elements' || scope === 'all') {
    payload['four_elements'] = FALSIFIABILITY_ELEMENTS
  }
  if (scope === 'types' || scope === 'all') {
    payload['gate_types'] = FALSIFIABILITY_TYPES
  }
  if (scope === 'failure-modes' || scope === 'all') {
    payload['failure_modes'] = FALSIFIABILITY_FAILURE_MODES
  }
  payload['note'] =
    'A falsifiable claim requires all four elements (pre-committed claim, verifying source, drift detection mechanism, disclosure obligation). Gate type determines what is falsifiable at each stage. Failure modes name the eight ways a falsifiability claim fails to function in practice.'

  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  }
}

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: withOutputSchemas(TOOLS),
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const raw = (args ?? {}) as Record<string, unknown>

  let safeArgs: Record<string, unknown>
  try {
    safeArgs = validateToolArgs(name, raw)
  } catch (err) {
    return toolError(err, name)
  }

  try {
    const __r = await (async () => {
    switch (name) {
    case 'walkri_audit_field':
      return handleWalkriAuditField(safeArgs)
    case 'walkri_generate_field':
      return handleWalkriGenerateField(safeArgs)
    case 'cross_check_gate':
      return handleCrossCheckGate(safeArgs)
    case 'cross_configure_round':
      return handleCrossConfigureRound(safeArgs)
    case 'cross_classify_framework':
      return handleCrossClassifyFramework(safeArgs)
    case 'cross_lookup_lens':
      return handleCrossLookupLens(safeArgs)
    case 'cross_falsifiability_audit':
      return handleCrossFalsifiabilityAudit(safeArgs)
    case 'cross_audit_round':
      return handleCrossAuditRound(safeArgs)
    default: {
      const oreResult = handleOreTool(name, safeArgs)
      if (oreResult) return oreResult
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}. Available tools: ${TOOLS.map((t) => t.name).join(', ')}`,
          },
        ],
        isError: true,
      }
    }
  }
    })()
    return finish(__r, name)
  } catch (err) {
    return toolError(err, name)
  }
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport()
await server.connect(transport)
