/**
 * ORE tool behaviour.
 *
 * These tools return structure, gaps and prompts rather than grades, because
 * ORE declines to specify how any dimension is computed. What is tested here is
 * that they hold that line: no combined score, no defaulted unknown, and the
 * party-count limit enforced. Two regex defects in the confirmation classifier
 * were found by exercising it this way while typecheck reported green.
 */

import { describe, it, expect } from 'vitest'
import { withServer } from './helpers/mcp-client.js'

const SERVER = 'server.mjs'

describe('ore_grade_source', () => {
  it('records a named gap rather than assuming provenance holds', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_grade_source', {
        label: 'Regional bulletin',
        description: 'A newsletter reporting a figure with no citation.',
      })
      const dims = (res.json as { dimensions: Array<{ name: string; namedGaps: string[] }> })
        .dimensions
      const provenance = dims.find((d) => d.name === 'provenance-integrity')!
      expect(provenance.namedGaps.length).toBeGreaterThan(0)
      expect(provenance.namedGaps[0]).toMatch(/unestablished/)
    })
  })

  it('flags an account that expresses confirmation as a count of parties', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_grade_source', {
        label: 'Attestation',
        description: 'An attested record.',
        confirmation: 'confirmed by 5 signatures from the working group',
      })
      const dims = (res.json as { dimensions: Array<{ name: string; namedGaps: string[] }> })
        .dimensions
      const conf = dims.find((d) => d.name === 'confirmation-architecture')!
      expect(conf.namedGaps.join(' ')).toMatch(/party count/i)
    })
  })

  it('classifies every cell of the confirmation table, including inflected forms', async () => {
    // Each of these fell through to "unconfirmed" before the classifier was
    // rewritten against the table: trailing word boundaries blocked plurals,
    // and the two multi-party cells were not detected at all.
    const cases: Array<[string, string]> = [
      ['5 signatures from the working group', 'trustless-single'],
      ['cryptographic proof from one attester', 'trustless-single'],
      ['multisig, validator set required', 'trustless-multi'],
      ['one curator reviewed it', 'trust-based-single'],
      ['bonded curation with challengers', 'trust-based-multi'],
    ]
    await withServer(SERVER, async (client) => {
      for (const [confirmation, expected] of cases) {
        const res = await client.callTool('ore_grade_source', {
          label: 'x',
          description: 'y',
          confirmation,
        })
        const got = (res.json as { confirmationCandidates: string[] }).confirmationCandidates
        expect(got, `"${confirmation}" should include ${expected}`).toContain(expected)
      }
    })
  })

  it('returns unconfirmed when nothing confirmed the source', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_grade_source', { label: 'x', description: 'y' })
      expect((res.json as { confirmationCandidates: string[] }).confirmationCandidates).toEqual([
        'unconfirmed',
      ])
    })
  })

  it('never returns a combined score, which the specification forbids', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_grade_source', {
        label: 'x',
        description: 'y',
        confirmation: 'signed',
      })
      const keys = Object.keys(res.json as object)
      expect(keys).not.toContain('score')
      expect(keys).not.toContain('grade')
      expect(keys).not.toContain('confidence')
    })
  })
})

describe('ore_check_independence', () => {
  it('counts origins rather than sources and flags restatement', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_check_independence', {
        claim: 'The initiative restored 4,200 hectares.',
        items: [
          { label: 'Self-report', relationships: 'published by the implementer' },
          { label: 'Bulletin' },
          { label: 'Authority report', statedBasis: 'attributes the figure to the Bulletin' },
        ],
      })
      const r = res.json as {
        distinctOriginsClaimed: number
        distinctOriginsEstablished: number | null
        flags: string[]
      }
      expect(r.distinctOriginsClaimed).toBe(3)
      // Establishing independence needs a walk the tool cannot perform, so it
      // reports null rather than a number it cannot justify.
      expect(r.distinctOriginsEstablished).toBeNull()
      expect(r.flags.join(' ')).toMatch(/name another item/)
      expect(r.flags.join(' ')).toMatch(/state no basis/)
    })
  })

  it('does not claim independence when it merely failed to find shared origin', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_check_independence', {
        claim: 'x',
        items: [
          { label: 'A', statedBasis: 'field survey conducted 2024' },
          { label: 'B', statedBasis: 'registry extract' },
        ],
      })
      const flags = (res.json as { flags: string[] }).flags.join(' ')
      expect(flags).toMatch(/limit of what the supplied accounts show/)
    })
  })
})

describe('ore_audit_finding', () => {
  it('marks every obligation absent on a finding that meets none', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_audit_finding', {
        finding:
          'We assess with high confidence that the programme succeeded. On average the surveys show a 50 percent rate. This is conclusive and the evidence is sufficient.',
      })
      const r = res.json as {
        obligations: Array<{ name: string; status: string }>
        systemicPatterns: string[]
      }
      expect(r.obligations.every((o) => o.status === 'absent')).toBe(true)
      expect(r.systemicPatterns.length).toBeGreaterThan(0)
    })
  })

  it('discriminates: a conformant finding is not reported as absent across the board', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_audit_finding', {
        finding: `Approximately 3,980 hectares were under restoration agreement. The weakest support on
provenance is the self-report, which is ungraded on confirmation and carries a joint-support flag
because three restatements derive from it. The registry is the primary record; the bulletin restates
the self-report, so those are secondary reporting rather than independent origins. Two surveys
disagree, 61 percent and 38 percent, and the disagreement turns on sampling method; both are
retained. This would be overturned if post-2023 imagery showed a different boundary. Whether this
suffices depends on what you are deciding; the reader will need to judge that.`,
      })
      const statuses = (res.json as { obligations: Array<{ status: string }> }).obligations.map(
        (o) => o.status,
      )
      expect(statuses.filter((s) => s === 'indicated').length).toBeGreaterThanOrEqual(3)
      expect(statuses.filter((s) => s === 'absent').length).toBe(0)
    })
  })
})

describe('ore_run_benchmark', () => {
  it('does not leak the key when serving the case', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_run_benchmark', { mode: 'case' })
      const raw = JSON.stringify(res.json)
      expect((res.json as { sources: unknown[] }).sources.length).toBe(12)
      expect(raw).not.toContain('seeded')
      expect(raw).not.toContain('correctHandling')
    })
  })

  it('serves five seeded items, exactly one of which is the control', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_run_benchmark', { mode: 'key' })
      const seeded = (res.json as { seeded: Array<{ isFailure: boolean }> }).seeded
      expect(seeded.length).toBe(5)
      expect(seeded.filter((s) => !s.isFailure).length).toBe(1)
    })
  })

  it('names the six clean sources so false positives can be scored', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_run_benchmark', { mode: 'key' })
      expect((res.json as { cleanSources: string[] }).cleanSources).toEqual([
        'S4',
        'S6',
        'S7',
        'S8',
        'S10',
        'S11',
      ])
    })
  })

  it('states the contamination limit in both case and key', async () => {
    await withServer(SERVER, async (client) => {
      for (const mode of ['case', 'key']) {
        const res = await client.callTool('ore_run_benchmark', { mode })
        expect(JSON.stringify(res.json)).toMatch(/contaminates it/)
      }
    })
  })
})
