/**
 * Provenance and output contract.
 *
 * The sibling coordination server carried both from the start; this one carried
 * neither, so the claim that these tools declare what standard version produced
 * a result was true of one server and false of the other.
 *
 * The contract was also mixed: six tools returned prose and seven returned
 * JSON, so a client could not parse the server uniformly. Rather than flatten
 * the prose, every tool now returns structuredContent alongside whatever
 * content it already returned, and declares a schema describing it.
 */

import { describe, it, expect } from 'vitest'
import { withServer, type McpTestClient } from './helpers/mcp-client.js'

const SERVER = 'server.mjs'

/** Minimal valid arguments per tool, so each can be exercised for real. */
const VALID_ARGS: Record<string, Record<string, unknown>> = {
  walkri_audit_field: {
    label: 'Budget breakdown',
    description:
      'The itemised expenditure proposed, by category, so reviewers can compare cost structures across applications.',
    fieldType: 'textarea',
    required: true,
  },
  walkri_generate_field: { whatToMeasure: 'whether the applicant has prior delivery history' },
  cross_check_gate: { gateType: 'completion', obligationMode: 'build' },
  cross_configure_round: { programDescription: 'Fund open source infrastructure maintenance' },
  cross_classify_framework: { frameworkDescription: 'A results framework built on logframes' },
  cross_lookup_lens: { lens_id: 'calibration-tier' },
  cross_falsifiability_audit: { scope: 'all' },
  cross_audit_round: { roundDescription: 'A build round with entry and completion gates' },
  ore_grade_source: { label: 'A registry extract', description: 'Public records for the period.' },
  ore_check_independence: { claim: 'The figure holds.', items: [{ label: 'A' }, { label: 'B' }] },
  ore_audit_finding: { finding: 'We found that the programme worked.' },
  ore_declare_posture: {},
  ore_run_benchmark: { mode: 'case' },
}

interface Provenance {
  server: string
  serverVersion: string
  encodes: Record<string, string>
}

async function eachTool(
  client: McpTestClient,
  fn: (name: string, raw: Awaited<ReturnType<McpTestClient['callToolRaw']>>) => void,
): Promise<number> {
  const tools = await client.listTools()
  let n = 0
  for (const t of tools) {
    const args = VALID_ARGS[t.name]
    expect(args, `no valid arguments recorded for ${t.name}`).toBeDefined()
    const raw = await client.callToolRaw(t.name, args!)
    expect(raw.isError, `${t.name} failed on valid arguments`).not.toBe(true)
    fn(t.name, raw)
    n += 1
  }
  return n
}

describe('every tool declares an output schema', () => {
  it('covers all thirteen, with provenance required', async () => {
    await withServer(SERVER, async (client) => {
      const tools = await client.listTools()
      expect(tools.length).toBe(13)
      for (const t of tools) {
        const schema = t.outputSchema as
          | { type: string; required?: string[]; additionalProperties?: boolean }
          | undefined
        expect(schema, `${t.name} declares no outputSchema`).toBeDefined()
        expect(schema!.type).toBe('object')
        expect(schema!.required, `${t.name} must require _provenance`).toContain('_provenance')
        expect(
          schema!.additionalProperties,
          `${t.name} should stay open to added explanatory fields`,
        ).toBe(true)
      }
    })
  })
})

describe('every tool returns provenance', () => {
  it('names the server, its version, and the standards encoded', async () => {
    const checked = await withServer(SERVER, (client) =>
      eachTool(client, (name, raw) => {
        const sc = raw.structuredContent as { _provenance?: Provenance } | undefined
        expect(sc, `${name} returned no structuredContent`).toBeDefined()
        const p = sc!._provenance
        expect(p, `${name} carries no provenance`).toBeDefined()
        expect(p!.server).toBe('evidence-integrity-suite')
        expect(p!.serverVersion).toMatch(/^\d+\.\d+\.\d+$/)
        expect(p!.encodes['cross-walkri-primitives-foundation']).toMatch(/^\d+\.\d+\.\d+$/)
      }),
    )
    expect(checked).toBe(13)
  })

  it('reports the foundation version the primitives were generated from', async () => {
    await withServer(SERVER, async (client) => {
      const raw = await client.callToolRaw('ore_declare_posture', {})
      const p = (raw.structuredContent as { _provenance: Provenance })._provenance
      // Generated from the vendored source, so this is the version the array
      // was built against rather than a number someone typed twice.
      expect(p.encodes['cross-walkri-primitives-foundation']).toBe('0.2.3')
    })
  })

  it('does not stamp an error result, which carries no encoded claim', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('walkri_audit_field', { label: 'x', fieldType: 'nope' })
      expect(res.isError).toBe(true)
      expect(res.text).not.toContain('_provenance')
    })
  })
})

describe('the mixed prose and JSON contract is bridged, not flattened', () => {
  it('keeps prose readable while exposing it structurally', async () => {
    await withServer(SERVER, async (client) => {
      const raw = await client.callToolRaw(
        'walkri_audit_field',
        VALID_ARGS['walkri_audit_field']!,
      )
      // The readable report is untouched: a model reads this better than JSON.
      expect(raw.content[0]!.text).toContain('WALKRI Audit Result')
      const sc = raw.structuredContent as { rendered: string }
      expect(sc.rendered).toBe(raw.content[0]!.text)
    })
  })

  it('returns the object itself for tools that already spoke JSON', async () => {
    await withServer(SERVER, async (client) => {
      const raw = await client.callToolRaw('cross_lookup_lens', { lens_id: 'calibration-tier' })
      const sc = raw.structuredContent as Record<string, unknown>
      expect(sc['id']).toBe('calibration-tier')
      expect(sc).not.toHaveProperty('rendered')
      expect(JSON.parse(raw.content[0]!.text)).toEqual(sc)
    })
  })
})
