/**
 * Argument validation and the tool error boundary.
 *
 * The core package has shipped Zod schemas since the first release and nothing
 * ever called them. Handlers coerced arguments by hand, including an unchecked
 * cast on `fieldType`, so a call with `fieldType: "banana"`, or with no label at
 * all, produced a confident conformance verdict on input the server never
 * examined. That is a silent discard of an adverse signal, which is the failure
 * the Adverse-Signal Engagement Principle exists to forbid, committed by tools
 * that assess other people's conformance.
 *
 * Validation failures are returned as tool results rather than thrown, because a
 * malformed argument is a fault in the call and not in the protocol. A caller
 * that receives a transport error abandons the call; one that receives
 * `isError: true` naming the argument can correct it and retry.
 *
 * Version 0.4.0 | CC0
 */

import { z, ZodError } from 'zod'

const fieldType = z.enum([
  'text',
  'textarea',
  'url',
  'number',
  'boolean',
  'select',
  'multiselect',
  'file',
])

const gateType = z.enum([
  'entry-specification',
  'application',
  'completion',
  'continuation',
])

const obligationMode = z.enum(['build', 'change', 'retroactive'])

/** One schema per tool, keyed by the name the tool is called under. */
export const TOOL_INPUT_SCHEMAS: Record<string, z.ZodTypeAny> = {
  walkri_audit_field: z.object({
    label: z.string().min(1, 'a field label is required'),
    description: z.string().optional(),
    fieldType,
    options: z.array(z.string()).optional(),
    caption: z.string().optional(),
    placeholder: z.string().optional(),
    required: z.boolean(),
  }),

  walkri_generate_field: z.object({
    whatToMeasure: z.string().min(1, 'describe what the field should measure'),
    programType: z.string().optional(),
    fieldTypeHint: fieldType.optional(),
  }),

  cross_check_gate: z.object({
    gateType,
    obligationMode,
    content: z.string().optional(),
  }),

  cross_configure_round: z.object({
    programDescription: z.string().min(1, 'describe the program to configure'),
    programType: z.string().optional(),
  }),

  cross_classify_framework: z.object({
    frameworkDescription: z.string().min(1, 'describe the framework to classify'),
    frameworkName: z.string().optional(),
  }),

  cross_lookup_lens: z.object({
    lens_id: z
      .enum([
        'calibration-tier',
        'authority-source',
        'cultural-methodological-lineage',
        'funder-typology',
        'framework-scope-type',
      ])
      .optional(),
    value_id: z.string().optional(),
  }),

  cross_falsifiability_audit: z.object({
    scope: z.enum(['elements', 'types', 'failure-modes', 'all']).optional(),
    type_id: z.string().optional(),
    failure_mode_id: z.string().optional(),
  }),

  cross_audit_round: z.object({
    roundDescription: z.string().min(1, 'describe the round to audit').optional(),
    description: z.string().optional(),
    obligationMode: obligationMode.optional(),
  }),

  ore_grade_source: z.object({
    label: z.string().min(1, 'a short name for the source is required'),
    description: z.string().min(1, 'describe what the source is and supplies'),
    originEvidence: z.string().optional(),
    confirmation: z.string().optional(),
    opaque: z.boolean().optional(),
    stake: z.string().optional(),
    history: z.string().optional(),
  }),

  ore_check_independence: z.object({
    claim: z.string().min(1, 'state the claim the sources supposedly support'),
    items: z
      .array(
        z.object({
          label: z.string().min(1, 'each source needs a label'),
          statedBasis: z.string().optional(),
          relationships: z.string().optional(),
        }),
      )
      .min(1, 'supply at least one source'),
  }),

  ore_audit_finding: z.object({
    finding: z.string().min(1, 'the finding text is required'),
  }),

  ore_declare_posture: z.object({
    posture: z.enum(['screened', 'graded', 'open']).optional(),
    systemDescription: z.string().optional(),
  }),

  ore_run_benchmark: z
    .object({
      mode: z.enum(['case', 'key', 'score']),
      answer: z.string().optional(),
    })
    .refine((v) => v.mode !== 'score' || (v.answer && v.answer.length > 0), {
      message: 'mode "score" requires an answer to grade',
      path: ['answer'],
    }),
}

/**
 * Validate the arguments for a tool call.
 *
 * Returns the parsed arguments. Throws ZodError, which the boundary below turns
 * into a readable tool result. A tool with no registered schema passes through
 * unchanged rather than being blocked, so adding a tool never silently breaks it.
 */
export function validateToolArgs(
  name: string,
  args: Record<string, unknown>,
): Record<string, unknown> {
  const schema = TOOL_INPUT_SCHEMAS[name]
  if (!schema) return args
  return schema.parse(args) as Record<string, unknown>
}

function describeIssue(issue: ZodError['issues'][number]): string {
  const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
  return `${path}: ${issue.message}`
}

/**
 * Convert anything thrown by a handler into a tool result.
 *
 * The return type is inferred rather than annotated: the SDK's result union is
 * narrower than a hand-written interface and rejects one.
 */
export function toolError(err: unknown, toolName: string) {
  if (err instanceof ZodError) {
    const text = [
      `Invalid arguments for ${toolName}.`,
      ...err.issues.map((i) => `  ${describeIssue(i)}`),
      '',
      'Correct the arguments and call the tool again.',
    ].join('\n')
    return { content: [{ type: 'text', text }], isError: true }
  }
  const message = err instanceof Error ? err.message : String(err)
  return {
    content: [{ type: 'text', text: `${toolName} failed: ${message}` }],
    isError: true,
  }
}
