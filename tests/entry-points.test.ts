/**
 * Entry-point and data-integrity tests.
 *
 * Every way a consumer can start this server must actually start, including the
 * compiled package entry that `main` and `bin` resolve to. In the sibling
 * repository a broken entry of exactly that kind survived typecheck, build and
 * a working bundle, and only failed when something ran it.
 */

import { describe, it, expect } from 'vitest'
import { withServer } from './helpers/mcp-client.js'
import {
  PRIMITIVES,
  PRIMITIVES_FOUNDATION_VERSION,
} from '../packages/core/src/primitives.js'
import { LENSES } from '../packages/core/src/lenses.js'
import {
  FALSIFIABILITY_ELEMENTS,
  FALSIFIABILITY_TYPES,
  FALSIFIABILITY_FAILURE_MODES,
} from '../packages/core/src/falsifiability.js'
import { auditField } from '../packages/core/src/walkri.js'
import { classifyObligationMode } from '../packages/core/src/cross.js'

const ENTRIES = [
  { label: 'bundle', path: 'server.mjs' },
  { label: 'package entry (main/bin)', path: 'packages/mcp-server/dist/index.js' },
]

describe('entry points', () => {
  for (const entry of ENTRIES) {
    it(`${entry.label} starts and lists all thirteen tools`, async () => {
      await withServer(entry.path, async (client) => {
        const tools = await client.listTools()
        expect(tools.length).toBe(13)
        for (const t of tools) {
          expect(t.name, 'every tool needs a name').toBeTruthy()
          expect(t.description, `${t.name} needs a description`).toBeTruthy()
        }
      })
    })
  }

  it('exposes both the grant tools and the evidence tools', async () => {
    await withServer('server.mjs', async (client) => {
      const names = (await client.listTools()).map((t) => t.name)
      expect(names.filter((n) => n.startsWith('walkri_')).length).toBe(2)
      expect(names.filter((n) => n.startsWith('cross_')).length).toBe(6)
      expect(names.filter((n) => n.startsWith('ore_')).length).toBe(5)
    })
  })
})

describe('data integrity', () => {
  it('holds the full foundation across seven layers with no duplicate names', () => {
    // 146 as of foundation 0.2.3. The array is generated from the vendored
    // source, and the generator refuses to write when its parse disagrees with
    // the count the document declares, so this asserts the generation ran
    // rather than restating a number a human typed.
    expect(PRIMITIVES.length).toBe(146)
    const layers = new Set(PRIMITIVES.map((p) => p.layer))
    expect(layers.size).toBe(7)
    const names = PRIMITIVES.map((p) => p.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('records the foundation version it was generated from', () => {
    expect(PRIMITIVES_FOUNDATION_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
    expect(PRIMITIVES_FOUNDATION_VERSION).toBe('0.2.3')
  })

  it('gives every primitive a description, so no entry is a bare name', () => {
    for (const p of PRIMITIVES) {
      expect(p.description.length, `${p.name} has no description`).toBeGreaterThan(0)
    }
  })

  it('holds the five lenses and the falsifiability sets the README claims', () => {
    expect(Object.keys(LENSES).length).toBe(5)
    expect(FALSIFIABILITY_ELEMENTS.length).toBe(4)
    expect(FALSIFIABILITY_TYPES.length).toBe(5)
    expect(FALSIFIABILITY_FAILURE_MODES.length).toBe(8)
  })
})

describe('WALKRI audit logic', () => {
  it('calls a bare label a label, not an instrument', () => {
    const result = auditField({ label: 'Budget', fieldType: 'text', required: true })
    expect(result.verdict).toBe('label')
    expect(result.criteria.filter((c) => !c.passes).length).toBeGreaterThan(0)
  })

  it('returns a gap and a fix for every failing criterion', () => {
    const result = auditField({ label: 'Budget', fieldType: 'text', required: true })
    for (const c of result.criteria.filter((x) => !x.passes)) {
      expect(c.gap, `${c.name} needs a gap`).toBeTruthy()
      expect(c.suggestion, `${c.name} needs a fix`).toBeTruthy()
    }
  })

  it('always returns exactly five criteria', () => {
    const result = auditField({ label: 'x', fieldType: 'boolean', required: false })
    expect(result.criteria.length).toBe(5)
  })
})

describe('obligation mode classification', () => {
  it('recognises retroactive language', () => {
    expect(classifyObligationMode('Rewarding work already done by contributors')).toBe(
      'retroactive',
    )
  })

  it('recognises change language over build language', () => {
    expect(
      classifyObligationMode(
        'Reduce the baseline rate in the target population, measured by a named outcome indicator against a theory of change',
      ),
    ).toBe('change')
  })

  it('recognises build language', () => {
    expect(classifyObligationMode('Ship a v1 tool and deploy the smart contract')).toBe('build')
  })

  it('documents the known limit: a tie resolves silently to build', () => {
    // A description with no signal either way returns 'build' rather than
    // reporting that it could not tell. Recorded so the behaviour is a decision
    // rather than a surprise. If ambiguity is surfaced later, this test flips.
    expect(classifyObligationMode('A programme of general interest.')).toBe('build')
  })
})
