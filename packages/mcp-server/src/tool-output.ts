/**
 * Provenance and the output contract.
 *
 * Two problems this closes.
 *
 * These tools emit conformance judgments that rest on encoded standards, and
 * ORE's exposure obligation applies to them as much as to anything else: an
 * output resting on ingested material declares what it rests on. Without it a
 * verdict becomes unattributable the moment a standard moves, and a caller
 * cannot tell which edition judged them. The sibling coordination server has
 * carried this since it was built; this one did not, so the claim was true of
 * one server and not the other.
 *
 * And the contract was mixed: six tools returned formatted prose and seven
 * returned JSON, so a client could not parse the server uniformly. Rather than
 * flatten the prose, which a model reads better than a JSON blob, every result
 * now carries `structuredContent` alongside whatever `content` it already
 * returned. Prose tools expose their text as `rendered`; JSON tools expose
 * their object. Both carry provenance, and every tool can therefore declare an
 * outputSchema that describes what actually arrives.
 *
 * Version 0.4.0 | CC0
 */

import { PRIMITIVES_FOUNDATION_VERSION } from '@proof-of-coord/evidence-core'
import { SERVER_NAME, SERVER_VERSION } from './create-server.js'

export interface Provenance {
  server: string
  serverVersion: string
  /** Standard and reference versions this response was produced against. */
  encodes: Record<string, string>
}

export const PROVENANCE: Provenance = {
  server: SERVER_NAME,
  serverVersion: SERVER_VERSION,
  encodes: {
    'cross-walkri-primitives-foundation': PRIMITIVES_FOUNDATION_VERSION,
    ore: '0.1.2',
    'finding-contract': '0.1.0',
  },
}

/** Response keys per tool, derived by calling each one and recording what came back. */
const JSON_TOOL_KEYS: Record<string, readonly string[]> = {
  cross_lookup_lens: [
    'id',
    'name',
    'what_it_organizes',
    'values',
    'detection_criteria',
    'output_shape_note',
  ],
  cross_falsifiability_audit: ['four_elements', 'gate_types', 'failure_modes', 'note'],
  ore_grade_source: [
    'source',
    'dimensions',
    'confirmationCandidates',
    'opacity',
    'monitoring',
    'standingRules',
    'promptTemplate',
  ],
  ore_check_independence: [
    'claim',
    'items',
    'distinctOriginsClaimed',
    'distinctOriginsEstablished',
    'flags',
    'constraints',
    'promptTemplate',
  ],
  ore_audit_finding: ['obligations', 'systemicPatterns', 'verdictNote', 'promptTemplate'],
  ore_declare_posture: ['postures', 'declarationRequirements', 'note'],
  ore_run_benchmark: [],
}

/** Tools whose readable output is prose; their structured form carries it as `rendered`. */
const PROSE_TOOLS = [
  'walkri_audit_field',
  'walkri_generate_field',
  'cross_check_gate',
  'cross_configure_round',
  'cross_classify_framework',
  'cross_audit_round',
]

const provenanceSchema = {
  type: 'object',
  description:
    'What this response was produced against: the server, its version, and the standard and reference versions encoded.',
  properties: {
    server: { type: 'string' },
    serverVersion: { type: 'string' },
    encodes: { type: 'object', additionalProperties: { type: 'string' } },
  },
  required: ['server', 'serverVersion', 'encodes'],
}

function schemaFor(name: string): Record<string, unknown> {
  if (PROSE_TOOLS.includes(name)) {
    return {
      type: 'object',
      properties: {
        rendered: {
          type: 'string',
          description: 'The readable report, identical to the text content.',
        },
        _provenance: provenanceSchema,
      },
      required: ['rendered', '_provenance'],
      additionalProperties: true,
    }
  }
  const keys = JSON_TOOL_KEYS[name] ?? []
  const properties: Record<string, unknown> = {}
  for (const k of keys) properties[k] = {}
  properties['_provenance'] = provenanceSchema
  return {
    type: 'object',
    properties,
    // `additionalProperties` stays open: these responses carry explanatory
    // fields that move with the standards, and a closed schema would turn an
    // added note into a validation failure for every client.
    required: [...keys, '_provenance'],
    additionalProperties: true,
  }
}

/** Attach the declared schema to each tool definition at list time. */
export function withOutputSchemas<T extends { name: string }>(
  tools: readonly T[],
): Array<T & { outputSchema: Record<string, unknown> }> {
  return tools.map((t) => ({ ...t, outputSchema: schemaFor(t.name) }))
}

/**
 * Attach provenance and a structured form to a tool result.
 *
 * Error results are left alone: they carry no encoded claim, so stamping one
 * would assert a standard version behind a message that made no judgment.
 */
export function finish<T>(result: T, toolName: string): T {
  const r = result as unknown as {
    content?: Array<{ type: string; text: string }>
    isError?: boolean
    structuredContent?: unknown
  }
  if (r?.isError === true) return result
  const first = r?.content?.[0]
  if (!first || first.type !== 'text' || typeof first.text !== 'string') return result

  let parsed: unknown = null
  try {
    parsed = JSON.parse(first.text)
  } catch {
    parsed = null
  }

  if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const stamped = { ...(parsed as Record<string, unknown>), _provenance: PROVENANCE }
    first.text = JSON.stringify(stamped, null, 2)
    r.structuredContent = stamped
    return result
  }

  // Prose result: leave the readable text exactly as it was, and expose the
  // same content structurally so a client has something to validate.
  r.structuredContent = { rendered: first.text, _provenance: PROVENANCE }
  void toolName
  return result
}
