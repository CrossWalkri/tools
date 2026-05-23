/**
 * Factory that creates a configured MCP Server instance.
 * Shared by both the stdio and HTTP entry points.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Re-export everything from index except the transport startup
// by extracting the shared logic here. index.ts and http.ts both import this.

import {
  auditField,
  getGateRequirements,
  validateRoundConfig,
  classifyObligationMode,
  searchPrimitives,
  auditFieldPrompt,
  configureRoundPrompt,
  classifyFrameworkPrompt,
  evaluateRoundPrompt,
  LENSES,
  getLens,
  getLensValue,
  getAllLensIds,
  FALSIFIABILITY_ELEMENTS,
  FALSIFIABILITY_TYPES,
  FALSIFIABILITY_FAILURE_MODES,
  getFalsifiabilityType,
  getFalsifiabilityFailureMode,
} from '@cross-walkri/core'
import type { WalkriField, CrossGateType, CrossObligationMode } from '@cross-walkri/core'

// ---------------------------------------------------------------------------
// Tool definitions (identical to index.ts)
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: 'walkri_audit_field',
    description:
      'Audit a grant application field against WALKRI\'s five pre-publication requirements. Returns a verdict (instrument or label) and specific gaps per criterion. Use before publishing any application form to verify that fields will produce usable data rather than incomparable free-text responses.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        label: { type: 'string', description: 'The visible label shown to applicants.' },
        description: { type: 'string', description: 'Written statement of what the field measures, distinct from the label. This is the criterion intent.' },
        fieldType: { type: 'string', enum: ['text', 'textarea', 'url', 'number', 'boolean', 'select', 'multiselect', 'file'], description: 'The response type.' },
        options: { type: 'array', items: { type: 'string' }, description: 'For select/multiselect fields: the enumerated options with qualifying and non-qualifying examples.' },
        caption: { type: 'string', description: 'Caption or sub-label appearing below the field.' },
        placeholder: { type: 'string', description: 'Placeholder text shown inside the field input.' },
        required: { type: 'boolean', description: 'Whether this field is required.' },
      },
      required: ['label', 'fieldType', 'required'],
    },
  },
  {
    name: 'walkri_generate_field',
    description: 'Generate a WALKRI-conformant field specification from a plain-language description of what you want to measure. Returns a prompt template and a draft field specification that satisfies all five WALKRI criterion specification elements.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        whatToMeasure: { type: 'string', description: 'Plain-language description of the underlying construct this field should measure. Be specific about what a true response would tell an evaluator.' },
        programType: { type: 'string', description: 'The type of grant program (e.g., Web3 public goods, international development, research, community foundation). Affects what evidence forms are appropriate.' },
        fieldTypeHint: { type: 'string', enum: ['text', 'textarea', 'url', 'number', 'boolean', 'select', 'multiselect', 'file'], description: 'Optional hint for the preferred field type. The tool will justify or revise this based on the criterion intent.' },
      },
      required: ['whatToMeasure'],
    },
  },
  {
    name: 'cross_check_gate',
    description: 'Check what a specific CROSS gate requires for a given obligation mode, and identify what is missing from provided content.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        gateType: { type: 'string', enum: ['entry-specification', 'application', 'completion', 'continuation'], description: 'The gate type to check requirements for.' },
        obligationMode: { type: 'string', enum: ['build', 'change', 'retroactive'], description: 'The obligation mode this gate is operating under.' },
        content: { type: 'string', description: 'Optional: the gate submission or configuration content to check for gaps.' },
      },
      required: ['gateType', 'obligationMode'],
    },
  },
  {
    name: 'cross_configure_round',
    description: 'Recommend a CROSS round configuration including obligation mode, gate structure, and key fields for a described program.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        programDescription: { type: 'string', description: 'Description of the grant program or round to configure.' },
        programType: { type: 'string', description: 'The program type (e.g., Web3 public goods, international development, research, community foundation, challenge prize).' },
      },
      required: ['programDescription'],
    },
  },
  {
    name: 'cross_classify_framework',
    description: 'Classify an external framework against CROSS+WALKRI primitives to understand which primitives it exemplifies and which compatibility statements apply.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        frameworkDescription: { type: 'string', description: 'Description of the framework to classify.' },
        frameworkName: { type: 'string', description: 'The name of the framework (optional, for reference in the output).' },
      },
      required: ['frameworkDescription'],
    },
  },
  {
    name: 'cross_lookup_lens',
    description:
      'Look up a dimension of the CROSS+WALKRI Lenses Framework. Five lenses sit above the primitives: calibration-tier, authority-source, cultural-methodological-lineage, funder-typology, framework-scope-type.',
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
          description: 'Optional: a specific lens to return.',
        },
        value_id: {
          type: 'string',
          description: 'Optional: a specific value within the named lens. Requires lens_id.',
        },
      },
    },
  },
  {
    name: 'cross_falsifiability_audit',
    description:
      'Apply the four-element falsifiability test from the Falsifiability Architecture document. Returns the four structural elements, the five gate-based falsifiability types, and the eight failure modes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        scope: {
          type: 'string',
          enum: ['elements', 'types', 'failure-modes', 'all'],
          description: 'What to return. Default: all.',
        },
        type_id: { type: 'string', description: 'Optional specific falsifiability type.' },
        failure_mode_id: { type: 'string', description: 'Optional specific failure mode.' },
      },
    },
  },
  {
    name: 'cross_audit_round',
    description: 'Evaluate whether a described grant round was run correctly under CROSS+WALKRI. Returns a structured assessment with a conformance verdict and prioritized gap list.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        roundDescription: { type: 'string', description: 'Description of the grant round, including how it was structured, what it funded, and how applications were collected and evaluated.' },
        eligibilityCriteria: { type: 'string', description: 'Optional: the eligibility criteria or entry requirements that were published for this round.' },
        formFields: { type: 'array', items: { type: 'string' }, description: 'Optional: the names or labels of the fields in the application form.' },
        completionRequirements: { type: 'string', description: 'Optional: the completion or reporting requirements that grantees had to meet to receive final payment.' },
      },
      required: ['roundDescription'],
    },
  },
]

// ---------------------------------------------------------------------------
// Handlers (copied verbatim from index.ts)
// ---------------------------------------------------------------------------

function handleWalkriAuditField(args: Record<string, unknown>) {
  const field: WalkriField = {
    label: String(args['label'] ?? ''),
    description: args['description'] != null ? String(args['description']) : undefined,
    fieldType: args['fieldType'] as WalkriField['fieldType'],
    options: Array.isArray(args['options']) ? (args['options'] as string[]) : undefined,
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
    text += `${failingCriteria.length} of 5 criteria fail.\n\nCriteria Assessment:\n`
    for (const criterion of result.criteria) {
      const status = criterion.passes ? 'PASS' : 'FAIL'
      text += `\n[${status}] ${criterion.name}\n`
      if (!criterion.passes && criterion.gap) text += `  Gap: ${criterion.gap}\n`
      if (!criterion.passes && criterion.suggestion) text += `  Fix: ${criterion.suggestion}\n`
    }
  }
  if (result.systemicPatterns.length > 0) {
    text += '\nSystemic Patterns:\n'
    for (const pattern of result.systemicPatterns) text += `- ${pattern}\n`
  }
  text += '\n\nPrompt Template for Revision:\n\n' + auditFieldPrompt(field)
  return { content: [{ type: 'text', text }] }
}

function handleWalkriGenerateField(args: Record<string, unknown>) {
  const whatToMeasure = String(args['whatToMeasure'] ?? '')
  const programType = args['programType'] != null ? String(args['programType']) : 'general'
  const fieldTypeHint = args['fieldTypeHint'] as WalkriField['fieldType'] | undefined
  const draftField: WalkriField = {
    label: whatToMeasure.slice(0, 80),
    description: whatToMeasure,
    fieldType: fieldTypeHint ?? 'text',
    required: true,
  }
  let text = `WALKRI Field Generation\n\nYou want to measure: ${whatToMeasure}\nProgram type: ${programType}\n`
  if (fieldTypeHint) text += `Requested field type: ${fieldTypeHint}\n`
  text += '\nTo generate a WALKRI-conformant specification, send this prompt to a language model:\n\n---\n'
  text += `You are a grant form designer applying the WALKRI standard. Generate a complete, WALKRI-conformant field specification for the following measurement goal.\n\nWhat this field should measure: ${whatToMeasure}\nProgram type: ${programType}\n`
  if (fieldTypeHint) text += `Preferred field type (justify or revise): ${fieldTypeHint}\n`
  text += `\nA WALKRI-conformant field must satisfy all five criterion specification elements:\n1. Criterion intent\n2. Operational definition\n3. Response form\n4. Evidence form\n5. Compliance threshold\n\nReturn a complete field specification as JSON.\n---\n\n`
  const auditResult = auditField(draftField)
  text += `Structural audit of the draft:\nVerdict: ${auditResult.verdict.toUpperCase()}\nCriteria that need specification:\n`
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
  for (let i = 0; i < requirements.length; i++) text += `${i + 1}. ${requirements[i]}\n\n`
  if (content) {
    text += '\nGap Analysis Against Provided Content:\n\n'
    const contentLower = content.toLowerCase()
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
    const gaps: string[] = []
    const satisfied: string[] = []
    for (const req of requirements) {
      const label = req.split(':')[0] ?? req
      const keywords = keywordMap[label]
      const found = keywords ? keywords.some((kw) => contentLower.includes(kw)) : contentLower.includes(label.toLowerCase())
      if (found) satisfied.push(label)
      else gaps.push(label)
    }
    if (satisfied.length > 0) {
      text += `Likely satisfied (${satisfied.length}):\n`
      for (const s of satisfied) text += `  [OK] ${s}\n`
      text += '\n'
    }
    if (gaps.length > 0) {
      text += `Likely missing or unclear (${gaps.length}):\n`
      for (const g of gaps) text += `  [MISSING] ${g}\n`
    }
  }
  return { content: [{ type: 'text', text }] }
}

function handleCrossConfigureRound(args: Record<string, unknown>) {
  const programDescription = String(args['programDescription'] ?? '')
  const programType = args['programType'] != null ? String(args['programType']) : 'general'
  const inferredMode = classifyObligationMode(programDescription)
  const sampleRound = {
    obligationMode: inferredMode,
    gates: [
      { type: 'entry-specification' as const, obligationMode: inferredMode, evidenceScope: inferredMode === 'change' ? ('usage' as const) : ('output' as const), evidenceStrength: 'self-report' as const, required: true },
      { type: 'completion' as const, obligationMode: inferredMode, evidenceScope: inferredMode === 'change' ? ('outcome' as const) : inferredMode === 'retroactive' ? ('impact' as const) : ('output' as const), evidenceStrength: 'third-party-verifiable' as const, required: true },
    ],
    indicatorFields: ['primary-indicator'],
    publicBenefitMechanism: inferredMode === 'change' ? ('condition-change' as const) : inferredMode === 'retroactive' ? ('ecosystem-shift' as const) : ('output-production' as const),
  }
  const validation = validateRoundConfig(sampleRound)
  let text = `CROSS Round Configuration\n\nProgram: ${programDescription.slice(0, 120)}...\nProgram type: ${programType}\n\nInferred obligation mode: ${inferredMode.toUpperCase()}\n\n`
  text += `Recommended gate structure:\n`
  for (const gate of sampleRound.gates) {
    text += `\n[${gate.type}]\n  Evidence scope: ${gate.evidenceScope}\n  Evidence strength: ${gate.evidenceStrength}\n`
    const reqs = getGateRequirements(gate.type, inferredMode)
    text += `  Requirements (${reqs.length}):\n`
    for (const req of reqs.slice(0, 5)) text += `    - ${req.split(':')[0]}\n`
    if (reqs.length > 5) text += `    ... and ${reqs.length - 5} more\n`
  }
  if (!validation.valid) {
    text += `\nConfiguration gaps:\n`
    for (const gap of validation.gaps) text += `- ${gap}\n`
  }
  text += '\n\nPrompt Template for Full Configuration:\n\n---\n' + configureRoundPrompt(programDescription, programType) + '\n---\n'
  return { content: [{ type: 'text', text }] }
}

function handleCrossClassifyFramework(args: Record<string, unknown>) {
  const frameworkDescription = String(args['frameworkDescription'] ?? '')
  const frameworkName = args['frameworkName'] != null ? String(args['frameworkName']) : 'the framework'
  const matchedPrimitives = searchPrimitives(frameworkName)
  const layers = ['methodological', 'identity', 'obligation', 'evidence', 'specification', 'causal-architecture', 'portfolio'] as const
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
    if (keywords.some((kw) => descLower.includes(kw))) coveredLayers.push(layer)
    else uncoveredLayers.push(layer)
  }
  let text = `CROSS+WALKRI Framework Classification\n\nFramework: ${frameworkName}\n\nLayers addressed:\n`
  for (const layer of coveredLayers) text += `  [PRESENT] ${layer}\n`
  text += `\nLayers not addressed:\n`
  for (const layer of uncoveredLayers) text += `  [ABSENT] ${layer}\n`
  text += `\nSample matching primitives:\n`
  if (matchedPrimitives.length > 0) {
    for (const p of matchedPrimitives.slice(0, 5)) text += `  - ${p.name} (${p.layer})\n`
  } else {
    text += `  No direct name matches.\n`
  }
  text += `\nTo produce a full compatibility statement:\n\n---\n` + classifyFrameworkPrompt(frameworkDescription) + '\n---\n'
  return { content: [{ type: 'text', text }] }
}

function handleCrossAuditRound(args: Record<string, unknown>) {
  const roundDescription = String(args['roundDescription'] ?? '')
  const eligibilityCriteria = args['eligibilityCriteria'] != null ? String(args['eligibilityCriteria']) : null
  const formFields = Array.isArray(args['formFields']) ? (args['formFields'] as string[]) : null
  const completionRequirements = args['completionRequirements'] != null ? String(args['completionRequirements']) : null
  const descLower = roundDescription.toLowerCase()
  const criteriaLower = (eligibilityCriteria ?? '').toLowerCase()
  const completionLower = (completionRequirements ?? '').toLowerCase()
  const checks = [
    { label: 'Entry specification gate declared before round opened', passed: descLower.includes('entry') || descLower.includes('specification') || criteriaLower.includes('eligibility'), note: '' },
    { label: 'Obligation mode explicitly declared', passed: descLower.includes('build') || descLower.includes('deliverable') || descLower.includes('outcome') || descLower.includes('baseline') || descLower.includes('retroactive'), note: '' },
    { label: 'Completion gate configured', passed: descLower.includes('completion') || completionLower.includes('completion') || descLower.includes('milestone') || completionLower.length > 20, note: '' },
    { label: 'Application fields show measurement instrument characteristics', passed: formFields != null && formFields.length > 0 && formFields.some((f) => f.toLowerCase().includes('baseline') || f.toLowerCase().includes('target') || f.toLowerCase().includes('evidence') || f.toLowerCase().includes('url') || f.toLowerCase().includes('license')), note: '' },
    { label: 'Financial accountability requirement at completion gate', passed: descLower.includes('financial') || descLower.includes('budget') || completionLower.includes('financial'), note: '' },
  ]
  const passCount = checks.filter((c) => c.passed).length
  const verdict = passCount === 5 ? 'conformant' : passCount >= 3 ? 'partial' : 'non-conformant'
  let text = `CROSS+WALKRI Round Audit\n\nVerdict: ${verdict.toUpperCase()} (${passCount}/${checks.length} checks passed)\n\nConformance Checks:\n\n`
  for (const check of checks) text += `[${check.passed ? 'PASS' : 'FAIL'}] ${check.label}\n\n`
  const gaps = checks.filter((c) => !c.passed).map((c) => c.label)
  if (gaps.length > 0) {
    text += 'Gaps to address:\n'
    for (const gap of gaps) text += `- ${gap}\n`
    text += '\n'
  }
  const fullDescription = [roundDescription, eligibilityCriteria ? `Eligibility: ${eligibilityCriteria}` : '', formFields ? `Fields: ${formFields.join(', ')}` : '', completionRequirements ? `Completion: ${completionRequirements}` : ''].filter(Boolean).join('\n\n')
  text += '\nFor comprehensive evaluation:\n\n---\n' + evaluateRoundPrompt(fullDescription) + '\n---\n'
  return { content: [{ type: 'text', text }] }
}

function handleCrossLookupLens(args: Record<string, unknown>) {
  const lensId = args['lens_id'] != null ? String(args['lens_id']) : null
  const valueId = args['value_id'] != null ? String(args['value_id']) : null
  if (lensId && valueId) {
    const value = getLensValue(lensId, valueId)
    if (!value) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: `Value "${valueId}" not found in lens "${lensId}".`, available_lenses: getAllLensIds() }, null, 2) }], isError: true }
    }
    const lens = getLens(lensId)
    return { content: [{ type: 'text', text: JSON.stringify({ lens: lens?.name, value, detection_criteria: lens?.detection_criteria }, null, 2) }] }
  }
  if (lensId) {
    const lens = getLens(lensId)
    if (!lens) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: `Lens "${lensId}" not found.`, available_lenses: getAllLensIds() }, null, 2) }], isError: true }
    }
    return { content: [{ type: 'text', text: JSON.stringify(lens, null, 2) }] }
  }
  return { content: [{ type: 'text', text: JSON.stringify({ total: LENSES.length, lenses: LENSES }, null, 2) }] }
}

function handleCrossFalsifiabilityAudit(args: Record<string, unknown>) {
  const scope = args['scope'] != null ? String(args['scope']) : 'all'
  const typeId = args['type_id'] != null ? String(args['type_id']) : null
  const failureModeId = args['failure_mode_id'] != null ? String(args['failure_mode_id']) : null
  if (typeId) {
    const type = getFalsifiabilityType(typeId)
    if (!type) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: `Falsifiability type "${typeId}" not found.`, available: FALSIFIABILITY_TYPES.map((t) => t.id) }, null, 2) }], isError: true }
    }
    return { content: [{ type: 'text', text: JSON.stringify({ type }, null, 2) }] }
  }
  if (failureModeId) {
    const mode = getFalsifiabilityFailureMode(failureModeId)
    if (!mode) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: `Failure mode "${failureModeId}" not found.`, available: FALSIFIABILITY_FAILURE_MODES.map((m) => m.id) }, null, 2) }], isError: true }
    }
    return { content: [{ type: 'text', text: JSON.stringify({ failure_mode: mode }, null, 2) }] }
  }
  const payload: Record<string, unknown> = {}
  if (scope === 'elements' || scope === 'all') payload['four_elements'] = FALSIFIABILITY_ELEMENTS
  if (scope === 'types' || scope === 'all') payload['gate_types'] = FALSIFIABILITY_TYPES
  if (scope === 'failure-modes' || scope === 'all') payload['failure_modes'] = FALSIFIABILITY_FAILURE_MODES
  return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createMcpServer(): Server {
  const server = new Server(
    { name: 'cross-walkri', version: '0.3.0' },
    { capabilities: { tools: {} } },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    const safeArgs = (args ?? {}) as Record<string, unknown>
    switch (name) {
      case 'walkri_audit_field': return handleWalkriAuditField(safeArgs)
      case 'walkri_generate_field': return handleWalkriGenerateField(safeArgs)
      case 'cross_check_gate': return handleCrossCheckGate(safeArgs)
      case 'cross_configure_round': return handleCrossConfigureRound(safeArgs)
      case 'cross_classify_framework': return handleCrossClassifyFramework(safeArgs)
      case 'cross_lookup_lens': return handleCrossLookupLens(safeArgs)
      case 'cross_falsifiability_audit': return handleCrossFalsifiabilityAudit(safeArgs)
      case 'cross_audit_round': return handleCrossAuditRound(safeArgs)
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}. Available: ${TOOLS.map((t) => t.name).join(', ')}` }], isError: true }
    }
  })

  return server
}
