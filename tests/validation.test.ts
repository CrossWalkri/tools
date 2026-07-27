/**
 * Argument validation tests.
 *
 * This file exists because of a specific defect. The core package shipped Zod
 * schemas from the first release and no handler ever called them; arguments
 * were coerced by hand, including an unchecked cast on `fieldType`. A call with
 * `fieldType: "banana"`, or with no label at all, returned `isError: false` and
 * a confident conformance verdict on input the server had never examined.
 *
 * Every case below returned a verdict before validation was added.
 */

import { describe, it, expect } from 'vitest'
import { withServer, type ToolCallResult } from './helpers/mcp-client.js'

const SERVER = 'server.mjs'

function expectRejected(res: ToolCallResult, mustMention: string): void {
  expect(res.rpcError, 'a bad argument must not surface as a protocol error').toBeNull()
  expect(res.isError, 'a bad argument must set isError').toBe(true)
  expect(res.text).toContain('Invalid arguments')
  expect(res.text).toContain(mustMention)
}

describe('malformed input is refused rather than judged', () => {
  it('refuses an invalid fieldType instead of falling through to the text branch', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('walkri_audit_field', {
        label: 'Budget',
        fieldType: 'banana',
        required: true,
      })
      expectRejected(res, 'fieldType')
      expect(res.text).not.toContain('Verdict')
    })
  })

  it('refuses a missing required argument', async () => {
    await withServer(SERVER, async (client) => {
      expectRejected(
        await client.callTool('walkri_audit_field', { label: 'Budget', fieldType: 'text' }),
        'required',
      )
    })
  })

  it('refuses a field with no label', async () => {
    await withServer(SERVER, async (client) => {
      expectRejected(
        await client.callTool('walkri_audit_field', { fieldType: 'text', required: true }),
        'label',
      )
    })
  })

  it('refuses a wrongly typed options array', async () => {
    await withServer(SERVER, async (client) => {
      expectRejected(
        await client.callTool('walkri_audit_field', {
          label: 'Category',
          fieldType: 'select',
          required: true,
          options: 'not-an-array',
        }),
        'options',
      )
    })
  })

  it('refuses an out-of-range enum on a CROSS tool', async () => {
    await withServer(SERVER, async (client) => {
      expectRejected(
        await client.callTool('cross_check_gate', {
          gateType: 'not-a-gate',
          obligationMode: 'build',
        }),
        'gateType',
      )
    })
  })

  it('enforces a conditional argument: score mode needs an answer', async () => {
    await withServer(SERVER, async (client) => {
      expectRejected(await client.callTool('ore_run_benchmark', { mode: 'score' }), 'answer')
    })
  })

  it('refuses an empty evidence set', async () => {
    await withServer(SERVER, async (client) => {
      expectRejected(
        await client.callTool('ore_check_independence', { claim: 'x', items: [] }),
        'items',
      )
    })
  })
})

describe('well-formed input still works', () => {
  it('audits a properly specified field and returns a verdict', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('walkri_audit_field', {
        label: 'Budget breakdown',
        description:
          'The itemised expenditure the applicant proposes, by category, so reviewers can compare cost structures across applications.',
        fieldType: 'textarea',
        required: true,
        caption: 'Provide a link to a published budget document.',
      })
      expect(res.isError).toBe(false)
      expect(res.text).toContain('Verdict:')
    })
  })

  it('leaves a tool with no registered schema reachable', async () => {
    await withServer(SERVER, async (client) => {
      const res = await client.callTool('ore_declare_posture', {})
      expect(res.isError).toBe(false)
    })
  })

  it('stays responsive after every tool is called with empty arguments', async () => {
    await withServer(SERVER, async (client) => {
      const tools = await client.listTools()
      for (const tool of tools) {
        const res = await client.callTool(tool.name, {})
        expect(res.rpcError, `${tool.name} surfaced a protocol error`).toBeNull()
      }
      const still = await client.listTools()
      expect(still.length).toBe(tools.length)
    })
  })
})
