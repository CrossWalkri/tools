/**
 * Zod schemas for CROSS+WALKRI data validation.
 * Version 0.1.0 | CC0
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// WALKRI schemas
// ---------------------------------------------------------------------------

export const walkriFieldTypeSchema = z.enum([
  'text',
  'textarea',
  'url',
  'number',
  'boolean',
  'select',
  'multiselect',
  'file',
])

/** Validates a WALKRI field definition submitted for audit. */
export const walkriFieldSchema = z.object({
  label: z.string().min(1, 'Field label is required'),
  description: z.string().optional(),
  fieldType: walkriFieldTypeSchema,
  options: z.array(z.string()).optional(),
  caption: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean(),
})

export const walkriCriterionNameSchema = z.enum([
  'criterion-intent',
  'operational-definition',
  'response-form',
  'evidence-form',
  'compliance-threshold',
])

/** Validates a single WALKRI criterion assessment result. */
export const walkriCriterionSchema = z.object({
  name: walkriCriterionNameSchema,
  passes: z.boolean(),
  gap: z.string().nullable(),
  suggestion: z.string().nullable(),
})

/** Validates the full WALKRI audit result for a field. */
export const walkriAuditResultSchema = z.object({
  field: walkriFieldSchema,
  criteria: z.array(walkriCriterionSchema).length(5),
  verdict: z.enum(['instrument', 'label']),
  systemicPatterns: z.array(z.string()),
})

// ---------------------------------------------------------------------------
// CROSS schemas
// ---------------------------------------------------------------------------

export const crossObligationModeSchema = z.enum(['build', 'change', 'retroactive'])

export const crossGateTypeSchema = z.enum([
  'entry-specification',
  'application',
  'completion',
  'continuation',
])

export const crossEvidenceScopeSchema = z.enum(['output', 'usage', 'outcome', 'impact'])

export const crossEvidenceStrengthSchema = z.enum([
  'self-report',
  'third-party-verifiable',
  'independent-review',
  'independent-evaluation',
])

/** Validates a single CROSS gate configuration. */
export const crossGateSchema = z.object({
  type: crossGateTypeSchema,
  obligationMode: crossObligationModeSchema,
  evidenceScope: crossEvidenceScopeSchema,
  evidenceStrength: crossEvidenceStrengthSchema,
  required: z.boolean(),
})

/** Validates a CROSS round configuration. */
export const crossRoundSchema = z.object({
  obligationMode: crossObligationModeSchema,
  gates: z.array(crossGateSchema).min(1, 'A round must have at least one gate'),
  indicatorFields: z.array(z.string()).min(1, 'A round must declare at least one indicator field'),
  publicBenefitMechanism: z.enum([
    'output-production',
    'access-provision',
    'condition-change',
    'ecosystem-shift',
  ]),
})

export type WalkriFieldInput = z.infer<typeof walkriFieldSchema>
export type CrossRoundInput = z.infer<typeof crossRoundSchema>
export type CrossGateInput = z.infer<typeof crossGateSchema>
