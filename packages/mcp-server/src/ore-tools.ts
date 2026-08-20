/**
 * ORE and finding-contract tools.
 *
 * Definitions and handlers kept in one module so the stdio entry (index.ts) and
 * the HTTP entry (create-server.ts) share them rather than each carrying a copy.
 *
 * None of these tools returns a grade or a verdict. ORE declines to specify how
 * any dimension is computed, so they return the structure a conformant grading
 * must fill, the gaps a supplied account leaves open, and a prompt template for
 * the judgment a model or a person makes.
 *
 * Version 0.1.0 | CC0
 */

import {
  gradeSourceScaffold,
  checkIndependence,
  auditFinding,
  getPostures,
  getPosture,
  POSTURE_DECLARATION_REQUIREMENTS,
  declarePosturePrompt,
  scoreBenchmarkPrompt,
  BENCHMARK_NOTICE,
  BENCHMARK_CLAIM,
  BENCHMARK_SOURCES,
  BENCHMARK_TASK,
  BENCHMARK_KEY,
  BENCHMARK_CLEAN_SOURCES,
  BENCHMARK_SCORING,
  BENCHMARK_LIMITS,
} from '@proof-of-coord/evidence-core'
import type { OreEvidenceItem, OrePosture } from '@proof-of-coord/evidence-core'

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const ORE_TOOLS = [
  {
    name: 'ore_grade_source',
    description:
      'Build the ORE grading scaffold for a data source at the ingestion boundary: five dimensions, three core and two declared extensions, with what a conformant grading must record on each, the named gaps the supplied account leaves open, the opacity obligations, and the monitoring obligation. Returns structure and gaps rather than a grade, because ORE does not specify how any dimension is computed. Use before admitting any source into a system that will make decisions from it.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        label: { type: 'string', description: 'Short name for the source.' },
        description: {
          type: 'string',
          description: 'What the source is and what it supplies.',
        },
        originEvidence: {
          type: 'string',
          description:
            'How origin is evidenced: signature, publisher, chain of custody. Omit if nothing evidences it, which is itself recorded.',
        },
        confirmation: {
          type: 'string',
          description:
            'What confirmed the source output at the time it was produced. Omit if nothing did, which is the unconfirmed state.',
        },
        opaque: {
          type: 'boolean',
          description:
            'Whether the source declines to disclose its internal architecture.',
        },
        stake: {
          type: 'string',
          description:
            'Whether the source has an interest in how the attested events are recorded.',
        },
        history: {
          type: 'string',
          description: 'Interaction history, if any, for the track-record dimension.',
        },
      },
      required: ['label', 'description'],
    },
  },
  {
    name: 'ore_check_independence',
    description:
      'Walk an evidence set for shared origin and report whether apparent agreement is independent confirmation or an artifact of restatement. Returns the chain structure each item needs, flags for uncited items, restatements and declared relationships, and the count of origins claimed against origins established. Use whenever several sources agree and that agreement is about to carry weight.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        claim: {
          type: 'string',
          description: 'The claim the sources supposedly support.',
        },
        items: {
          type: 'array',
          description: 'The sources in the evidence set.',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: 'Short name for this source.' },
              statedBasis: {
                type: 'string',
                description:
                  'What the source states as its own basis: a citation, an attribution. Omit where it states none.',
              },
              relationships: {
                type: 'string',
                description:
                  'Any known relationship to another source or to an interested party.',
              },
            },
            required: ['label'],
          },
        },
      },
      required: ['claim', 'items'],
    },
  },
  {
    name: 'ore_audit_finding',
    description:
      "Audit a finding against the five obligations of STRUCK: graded evidence, refutation conditions, contested regions rather than averages, derivation chains to origin with labeled rungs, and the sufficiency judgment left with the consumer. Returns per-obligation status, observed evidence, gaps and fixes, plus systemic patterns. Statuses are heuristic and deliberately distinguish 'this finding is wrong' from 'this finding cannot be checked'.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        finding: {
          type: 'string',
          description: 'The full text of the finding to audit.',
        },
      },
      required: ['finding'],
    },
  },
  {
    name: 'ore_declare_posture',
    description:
      'Return the three ORE intake postures (Screened, Graded, Open) with what each means, what it fits, the downstream condition it obliges, and its cautions, plus the declaration requirements any conformant system must satisfy. Optionally scoped to one posture, and optionally with a system description to produce a recommendation prompt. Use once per system before ingestion, and again when intake changes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        posture: {
          type: 'string',
          enum: ['screened', 'graded', 'open'],
          description: 'Optional. Return only this posture rather than all three.',
        },
        systemDescription: {
          type: 'string',
          description:
            'Optional. What the system ingests, from where, at what volume, and what decisions it feeds. Produces a recommendation prompt.',
        },
      },
      required: [],
    },
  },
  {
    name: 'ore_run_benchmark',
    description:
      'The Meridian Basin benchmark: a fabricated twelve-source dossier with known ground truth, seeded with four evidence-integrity failures and one genuine contested region that must be represented rather than resolved. Mode "case" returns the dossier to run. Mode "key" returns the ground truth and scoring. Mode "score" takes an answer and returns the key with a scoring prompt. Run the case before requesting the key.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        mode: {
          type: 'string',
          enum: ['case', 'key', 'score'],
          description:
            'case returns the dossier, key returns ground truth and scoring, score grades a supplied answer.',
        },
        answer: {
          type: 'string',
          description: 'Required for mode "score": the finding produced from the case.',
        },
      },
      required: ['mode'],
    },
  },
]

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function ok(payload: unknown) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  }
}

function fail(message: string) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message }, null, 2) }],
    isError: true,
  }
}

function str(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key]
  return v == null ? undefined : String(v)
}

function handleGradeSource(args: Record<string, unknown>) {
  const label = str(args, 'label')
  const description = str(args, 'description')
  if (!label || !description) {
    return fail('Both label and description are required.')
  }
  const originEvidence = str(args, 'originEvidence')
  const confirmation = str(args, 'confirmation')
  const stake = str(args, 'stake')
  const history = str(args, 'history')

  return ok(
    gradeSourceScaffold({
      label,
      description,
      opaque: args['opaque'] === true,
      ...(originEvidence ? { originEvidence } : {}),
      ...(confirmation ? { confirmation } : {}),
      ...(stake ? { stake } : {}),
      ...(history ? { history } : {}),
    }),
  )
}

function handleCheckIndependence(args: Record<string, unknown>) {
  const claim = str(args, 'claim')
  const rawItems = args['items']
  if (!claim) return fail('A claim is required.')
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return fail('items must be a non-empty array of sources.')
  }

  const items: OreEvidenceItem[] = []
  for (const raw of rawItems) {
    if (typeof raw !== 'object' || raw === null) {
      return fail('Each item must be an object with at least a label.')
    }
    const rec = raw as Record<string, unknown>
    const label = rec['label'] != null ? String(rec['label']) : ''
    if (!label) return fail('Each item requires a label.')
    const statedBasis = rec['statedBasis'] != null ? String(rec['statedBasis']) : ''
    const relationships =
      rec['relationships'] != null ? String(rec['relationships']) : ''
    items.push({
      label,
      ...(statedBasis ? { statedBasis } : {}),
      ...(relationships ? { relationships } : {}),
    })
  }

  return ok(checkIndependence(claim, items))
}

function handleAuditFinding(args: Record<string, unknown>) {
  const finding = str(args, 'finding')
  if (!finding) return fail('The finding text is required.')
  return ok(auditFinding(finding))
}

function handleDeclarePosture(args: Record<string, unknown>) {
  const posture = str(args, 'posture')
  const systemDescription = str(args, 'systemDescription')

  const postures =
    posture && ['screened', 'graded', 'open'].includes(posture)
      ? [getPosture(posture as OrePosture)]
      : getPostures()

  return ok({
    postures,
    declarationRequirements: POSTURE_DECLARATION_REQUIREMENTS,
    note: 'Most systems are in the Open posture without having declared it, which is how ungraded material comes to support decisions. Movement between postures is legitimate; what conformance requires is that the posture in force when a record was admitted is recorded with it.',
    ...(systemDescription
      ? { promptTemplate: declarePosturePrompt(systemDescription) }
      : {}),
  })
}

function handleRunBenchmark(args: Record<string, unknown>) {
  const mode = str(args, 'mode')

  if (mode === 'case') {
    return ok({
      notice: BENCHMARK_NOTICE,
      headlineClaim: BENCHMARK_CLAIM,
      sources: BENCHMARK_SOURCES,
      whatToProduce: BENCHMARK_TASK,
      instruction:
        'Produce a finding on the headline claim before requesting the key. The key is published separately so the case can be run first.',
      limits: BENCHMARK_LIMITS,
    })
  }

  if (mode === 'key') {
    return ok({
      notice: BENCHMARK_NOTICE,
      seeded: BENCHMARK_KEY,
      cleanSources: BENCHMARK_CLEAN_SOURCES,
      cleanSourcesNote:
        'These six carry no seeded defects. S4 and S6 disagree, which is not a defect in either. Flagging any of the six as compromised is a false positive and should be scored as such.',
      scoring: BENCHMARK_SCORING,
      limits: BENCHMARK_LIMITS,
    })
  }

  if (mode === 'score') {
    const answer = str(args, 'answer')
    if (!answer) return fail('mode "score" requires an answer.')
    return ok({
      notice: BENCHMARK_NOTICE,
      seeded: BENCHMARK_KEY,
      cleanSources: BENCHMARK_CLEAN_SOURCES,
      scoring: BENCHMARK_SCORING,
      promptTemplate: scoreBenchmarkPrompt(answer),
      limits: BENCHMARK_LIMITS,
    })
  }

  return fail('mode must be one of: case, key, score.')
}

/**
 * Dispatch an ORE tool call. Returns null when the name is not an ORE tool, so
 * callers can fall through to their own default handling.
 */
export function handleOreTool(
  name: string,
  args: Record<string, unknown>,
): { content: Array<{ type: string; text: string }>; isError?: boolean } | null {
  switch (name) {
    case 'ore_grade_source':
      return handleGradeSource(args)
    case 'ore_check_independence':
      return handleCheckIndependence(args)
    case 'ore_audit_finding':
      return handleAuditFinding(args)
    case 'ore_declare_posture':
      return handleDeclarePosture(args)
    case 'ore_run_benchmark':
      return handleRunBenchmark(args)
    default:
      return null
  }
}
