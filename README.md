# CROSS+WALKRI Tools

CROSS (Common Reporting Outcome Standards Schema) and WALKRI (Working Architecture for Legible, Knowledge-Ready Intake) are two companion grant standards that fix the root cause of bad grants data before any application is submitted. CROSS specifies the obligation architecture of a funding round: what grantees must demonstrate at each payment gate, in one of three obligation modes (build a deliverable, produce a measurable change, or recognize past contribution). WALKRI specifies the quality of the intake fields that collect that demonstration, requiring that every field carry a written criterion intent, an operational definition with qualifying and non-qualifying examples, a justified response type, a specified evidence artifact and access path, and a compliance threshold where external standards are referenced. Together they are published CC0 under the CROSS+WALKRI project at github.com/cross-walkri.

This repository contains the TypeScript tooling infrastructure for CROSS+WALKRI: a core npm package with types, schemas, audit logic, and prompt templates, and an MCP server that exposes CROSS+WALKRI as AI tools in Claude Code, Cursor, and any MCP-compatible client.

---

## What this repo contains

**packages/core** (@cross-walkri/core)

TypeScript types and Zod schemas for every CROSS+WALKRI data structure. The WALKRI audit engine (`auditField`) that checks a field definition against all five criterion specification elements and returns a binary instrument/label verdict with per-criterion gap analysis. The CROSS gate logic (`getGateRequirements`, `validateRoundConfig`, `classifyObligationMode`) for checking round configurations. All 36 CROSS+WALKRI primitives as a typed constant array, searchable by name, layer, or keyword. Prompt templates as functions that return fully-formed prompts for language model use.

Zero runtime dependencies. Pure TypeScript.

**packages/mcp-server** (@cross-walkri/mcp-server)

MCP server that wraps the core package and exposes six tools via stdio transport. Install once in your MCP client and use CROSS+WALKRI from any AI assistant.

---

## MCP server installation

### Claude Code

Add to your `.claude/settings.json` (project-level) or `~/.claude/settings.json` (global):

```json
{
  "mcpServers": {
    "cross-walkri": {
      "command": "npx",
      "args": ["@cross-walkri/mcp-server"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project or user settings:

```json
{
  "mcpServers": {
    "cross-walkri": {
      "command": "npx",
      "args": ["@cross-walkri/mcp-server"]
    }
  }
}
```

### Other MCP clients

Any client that supports stdio MCP servers can use the same pattern. The server binary is `cross-walkri` after installation, so you can also run it directly with `npx @cross-walkri/mcp-server`.

---

## npm package installation

```bash
pnpm add @cross-walkri/core
# or
npm install @cross-walkri/core
```

---

## The six MCP tools

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

Accepts a description of an external framework and classifies it against the 36 CROSS+WALKRI primitives across seven layers. Returns which layers the framework addresses, which primitives it exemplifies, which are absent, and a prompt template for generating a formal compatibility statement.

**cross_audit_round**

Evaluates whether a described grant round was run correctly under CROSS+WALKRI. Checks for entry specification gate, explicit obligation mode, completion gate, WALKRI-conformant field characteristics, and financial accountability. Returns a conformance verdict (conformant/partial/non-conformant) and a prioritized gap list, plus a prompt template for comprehensive AI-assisted evaluation.

---

## npm package exports

The `@cross-walkri/core` package exports:

**Types**: `WalkriField`, `WalkriCriterion`, `WalkriAuditResult`, `WalkriVerdict`, `CrossRound`, `CrossGate`, `CrossObligationMode`, `CrossGateType`, `CrossEvidenceScope`, `CrossEvidenceStrength`, `CrossPrimitive`, `PrimitiveLayer`

**Zod schemas**: `walkriFieldSchema`, `walkriCriterionSchema`, `walkriAuditResultSchema`, `crossGateSchema`, `crossRoundSchema` (and all constituent schemas)

**WALKRI audit**: `auditField(field: WalkriField): WalkriAuditResult`

**CROSS gate logic**: `getGateRequirements(gateType, obligationMode): string[]`, `validateRoundConfig(round: CrossRound): { valid: boolean; gaps: string[] }`, `classifyObligationMode(description: string): CrossObligationMode`

**Primitives**: `PRIMITIVES` (typed const array of all 36), `getPrimitiveByName(name: string)`, `getPrimitivesByLayer(layer: PrimitiveLayer)`, `searchPrimitives(keyword: string)`

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

Both packages are dedicated to the public domain under Creative Commons Zero v1.0 Universal (CC0). See github.com/cross-walkri for the canonical standard documents and compatibility statement corpus.

Any grants ecosystem can adopt CROSS+WALKRI without licensing, attribution, or arrangements.
