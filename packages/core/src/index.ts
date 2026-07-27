/**
 * @proof-of-coord/evidence-core
 *
 * TypeScript types, Zod schemas, audit logic, primitives, and prompt templates
 * for the evidence integrity standards: CROSS and WALKRI at the grant boundary,
 * ORE at the source boundary, and the finding contract at the output boundary.
 *
 * Version 0.4.0 | CC0
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

// ORE and the finding contract
export type {
  OreDimensionName,
  OreConfirmationMode,
  OrePosture,
  OreDimensionScaffold,
  OreSourceInput,
  OreGradingScaffold,
  OreEvidenceItem,
  OreIndependenceResult,
  OreObligationName,
  OreObligationStatus,
  OreObligationCheck,
  OreFindingAudit,
  OrePostureSpec,
  OreBenchmarkSource,
  OreBenchmarkSeededItem,
} from './ore.js'
export {
  gradeSourceScaffold,
  checkIndependence,
  auditFinding,
  getPostures,
  getPosture,
  POSTURE_DECLARATION_REQUIREMENTS,
  BENCHMARK_NOTICE,
  BENCHMARK_CLAIM,
  BENCHMARK_SOURCES,
  BENCHMARK_TASK,
  BENCHMARK_KEY,
  BENCHMARK_CLEAN_SOURCES,
  BENCHMARK_SCORING,
  BENCHMARK_LIMITS,
  gradeSourcePrompt,
  independencePrompt,
  auditFindingPrompt,
  declarePosturePrompt,
  scoreBenchmarkPrompt,
} from './ore.js'
