/**
 * @cross-walkri/core
 *
 * TypeScript types, Zod schemas, audit logic, primitives, and prompt templates
 * for the CROSS+WALKRI grant standards.
 *
 * Version 0.1.0 | CC0
 */

// Types
export type {
  WalkriCriterionName,
  WalkriCriterion,
  WalkriField,
  WalkriVerdict,
  WalkriAuditResult,
  CrossObligationMode,
  CrossGateType,
  CrossEvidenceScope,
  CrossEvidenceStrength,
  CrossGate,
  CrossRound,
  PrimitiveLayer,
  CrossPrimitive,
} from './types.js'

// Zod schemas
export {
  walkriFieldTypeSchema,
  walkriFieldSchema,
  walkriCriterionNameSchema,
  walkriCriterionSchema,
  walkriAuditResultSchema,
  crossObligationModeSchema,
  crossGateTypeSchema,
  crossEvidenceScopeSchema,
  crossEvidenceStrengthSchema,
  crossGateSchema,
  crossRoundSchema,
} from './schemas.js'

export type { WalkriFieldInput, CrossRoundInput, CrossGateInput } from './schemas.js'

// WALKRI audit logic
export { auditField } from './walkri.js'

// CROSS gate logic
export {
  getGateRequirements,
  validateRoundConfig,
  classifyObligationMode,
} from './cross.js'

// Primitives
export {
  PRIMITIVES,
  getPrimitiveByName,
  getPrimitivesByLayer,
  searchPrimitives,
} from './primitives.js'

// Lenses Framework
export type { LensId, LensValue, Lens } from './lenses.js'
export { LENSES, getLens, getLensValue, getAllLensIds } from './lenses.js'

// Falsifiability Architecture
export type {
  FalsifiabilityElement,
  FalsifiabilityType,
  FalsifiabilityFailureMode,
} from './falsifiability.js'
export {
  FALSIFIABILITY_ELEMENTS,
  FALSIFIABILITY_TYPES,
  FALSIFIABILITY_FAILURE_MODES,
  getFalsifiabilityElements,
  getFalsifiabilityType,
  getFalsifiabilityFailureMode,
} from './falsifiability.js'

// Prompt templates
export {
  auditFieldPrompt,
  configureRoundPrompt,
  classifyFrameworkPrompt,
  evaluateRoundPrompt,
} from './prompts.js'
