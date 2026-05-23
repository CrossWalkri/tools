# CROSS+WALKRI Tools

CROSS (Common Reporting Outcome Standards Schema) and WALKRI (Working Architecture for Legible, Knowledge-Ready Intake) are two companion grant standards that fix the root cause of bad grants data before any application is submitted. CROSS specifies the obligation architecture of a funding round: what grantees must demonstrate at each payment gate, in one of three obligation modes (build a deliverable, produce a measurable change, or recognize past contribution). WALKRI specifies the quality of the intake fields that collect that demonstration, requiring that every field carry a written criterion intent, an operational definition with qualifying and non-qualifying examples, a justified response type, a specified evidence artifact and access path, and a compliance threshold where external standards are referenced. Together they are published CC0 under the CROSS+WALKRI project at github.com/CrossWalkri.

This repository contains the TypeScript tooling infrastructure for CROSS+WALKRI: a core library with types, schemas, audit logic, and prompt templates, and an MCP server that exposes CROSS+WALKRI as AI tools in Claude Code, Cursor, and any MCP-compatible client. Both packages are published on JSR at jsr.io/@cross-walkri.

---

## What this repo contains

**packages/core** (@cross-walkri/core)

TypeScript types and Zod schemas for every CROSS+WALKRI data structure. The WALKRI audit engine (`auditField`) that checks a field definition against all five criterion specification elements and returns a binary instrument/label verdict with per-criterion gap analysis. The CROSS gate logic (`getGateRequirements`, `validateRoundConfig`, `classifyObligationMode`) for checking round configurations. All 50 CROSS+WALKRI primitives as a typed constant array (Primitives Foundation v0.1.7), searchable by name, layer, or keyword. Prompt templates as functions that return fully-formed prompts for language model use.

Zero runtime dependencies. Pure TypeScript.

**packages/mcp-server** (@cross-walkri/mcp-server)

MCP server that wraps the core package and exposes eight tools via stdio transport. Install once in your MCP client and use CROSS+WALKRI from any AI assistant.

---

## MCP server installation

### Zero-install option (recommended)

Clone this repo and point your MCP client at `server.mjs` in the root. No build step, no package manager required.

```json
{
  "mcpServers": {
    "cross-walkri": {
      "command": "node",
      "args": ["/path/to/cross-walkri-tools/server.mjs"]
    }
  }
}
```

### Via JSR

Install the package from JSR, then reference the installed binary.

```bash
npx jsr add @cross-walkri/mcp-server
```

Then in your MCP client config:

```json
{
  "mcpServers": {
    "cross-walkri": {
      "command": "npx",
      "args": ["jsr", "run", "@cross-walkri/mcp-server"]
    }
  }
}
```

This works for Claude Code, Cursor, and any other MCP-compatible client that supports stdio transport.

---

## Core library installation

Published on JSR at jsr.io/@cross-walkri/core.

```bash
npx jsr add @cross-walkri/core
```

---

## The eight MCP tools

**walkri_audit_field**

Audits a grant application field against WALKRI's five pre-publication requirements. Returns a per-criterion assessment (pass/fail with gap and fix suggestion) and a binary verdict: `instrument` (all five pass) or `label` (any fail). Also returns systemic patterns across failing criteria and a prompt template for revising the field with a language model.

Use before publishing any application form. A field that goes live as a label cannot be fixed retroactively.

**walkri_generate_field**

Generates a WALKRI-conformant field specification from a plain-language description of what you want to measure. Returns a draft structural audit and a fully-formed prompt template ready to pass to a language model to produce the complete specification.

**cross_check_gate**

Returns the complete list of requirements for a CROSS gate of a given type (entry-specification, completion, continuation) operating in a given obligation mode (build, change, retroactive). Optionally accepts the gate content to run against the requirements and identify what is missing.

**cross_configure_round**

Accepts a plain-language program description and infers an obligation mode, then recommends a gate structure with evidence scope and evidence strength, validates the configuration for internal consistency, and returns a fully-formed prompt template for generating the complete configuration with a language model.

**cross_classify_framework**

Accepts a description of an external framework and classifies it against the 50 CROSS+WALKRI primitives across seven layers. Returns which layers the framework addresses, which primitives it exemplifies, which are absent, and a prompt template for generating a formal compatibility statement.

**cross_lookup_lens**

Looks up a dimension of the CROSS+WALKRI Lenses Framework. Five lenses sit above the primitives as cross-cutting metadata: calibration-tier (five tiers from impressionistic to falsifiable, with current-plus-target output shape), authority-source (where binding force comes from), cultural-methodological-lineage (the tradition the framework descends from, including Western institutional, Islamic finance jurisprudence, Indigenous Treaty partnership, Indigenous-led participatory non-Treaty, traditional without administrative infrastructure, and hybrid), funder-typology (ten kinds of funder including bilateral aid agency, multilateral bank or fund, private foundation, government non-aid, pooled fund, individual donor, DAO or protocol, corporate CSR, faith-based, and settlement-administered), and framework-scope-type (what kind of object the framework is). Returns the lens, its enumerated values, and detection criteria.

**cross_falsifiability_audit**

Applies the four-element falsifiability test from the Falsifiability Architecture document. A falsifiable claim has a pre-committed claim, a named verifying source outside the claimant's control, a drift detection mechanism, and a disclosure obligation. Returns the four structural elements with structural tests, the five gate-based falsifiability types (entry-gate, progress-gate, completion-gate, continuation-gate, portfolio-level), and the eight failure modes (transcendence-claim, declaration-exploit, precision-facade, partial-instantiation, direction-without-destination, vocabulary-without-architecture, correct-map-wrong-territory, frozen-map).

**cross_audit_round**

Evaluates whether a described grant round was run correctly under CROSS+WALKRI. Checks for entry specification gate, explicit obligation mode, completion gate, WALKRI-conformant field characteristics, and financial accountability. Returns a conformance verdict (conformant/partial/non-conformant) and a prioritized gap list, plus a prompt template for comprehensive AI-assisted evaluation.

---

## Core package exports

The `@cross-walkri/core` package exports:

**Types**: `WalkriField`, `WalkriCriterion`, `WalkriAuditResult`, `WalkriVerdict`, `CrossRound`, `CrossGate`, `CrossObligationMode`, `CrossGateType`, `CrossEvidenceScope`, `CrossEvidenceStrength`, `CrossPrimitive`, `PrimitiveLayer`

**Zod schemas**: `walkriFieldSchema`, `walkriCriterionSchema`, `walkriAuditResultSchema`, `crossGateSchema`, `crossRoundSchema` (and all constituent schemas)

**WALKRI audit**: `auditField(field: WalkriField): WalkriAuditResult`

**CROSS gate logic**: `getGateRequirements(gateType, obligationMode): string[]`, `validateRoundConfig(round: CrossRound): { valid: boolean; gaps: string[] }`, `classifyObligationMode(description: string): CrossObligationMode`

**Primitives**: `PRIMITIVES` (typed const array of all 50), `getPrimitiveByName(name: string)`, `getPrimitivesByLayer(layer: PrimitiveLayer)`, `searchPrimitives(keyword: string)`

**Lenses Framework**: `LENSES` (typed const array of the five lenses), `getLens(id)`, `getLensValue(lensId, valueId)`, `getAllLensIds()`

**Falsifiability Architecture**: `FALSIFIABILITY_ELEMENTS` (the four elements), `FALSIFIABILITY_TYPES` (the five gate-based types), `FALSIFIABILITY_FAILURE_MODES` (the eight failure modes), `getFalsifiabilityType(id)`, `getFalsifiabilityFailureMode(id)`

**Prompt templates**: `auditFieldPrompt(field)`, `configureRoundPrompt(description, programType)`, `classifyFrameworkPrompt(description)`, `evaluateRoundPrompt(description)`

---

## Development

This is a pnpm workspace monorepo.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Type-check all packages
pnpm typecheck
```

---

## License

Both packages are dedicated to the public domain under Creative Commons Zero v1.0 Universal (CC0). See github.com/CrossWalkri for the canonical standard documents and compatibility statement corpus.

Any grants ecosystem can adopt CROSS+WALKRI without licensing, attribution, or arrangements.
