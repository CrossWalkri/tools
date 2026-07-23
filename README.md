# CROSS+WALKRI Tools

The grants standards as callable AI tools: a typed core library and an MCP server that put CROSS and WALKRI inside Claude Code, Cursor, and any MCP-compatible assistant.

CROSS (Common Reporting Outcome Standards Schema) specifies the obligation architecture of a funding round: what grantees must demonstrate at each payment gate, in one of three obligation modes (build a deliverable, produce a measurable change, or recognize past contribution). WALKRI (Working Architecture for Legible, Knowable, Reliable Instrumentation) specifies the quality of the intake fields that collect that demonstration: every field carries a written criterion intent, an operational definition with qualifying and non-qualifying examples, a justified response type, a specified evidence artifact and access path, and a conformance threshold where external standards are referenced. Both are published CC0 at [github.com/CrossWalkri](https://github.com/CrossWalkri).

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/tools-flow-0_1_0-dark.svg">
  <img alt="The standards (CROSS and WALKRI, published CC0) feed the core library (types, schemas, audit engine), which the MCP server wraps as eight tools over stdio, reaching any AI assistant: Claude Code, Cursor, any MCP client." src="images/tools-flow-0_1_0-light.svg" width="880">
</picture>
</p>

## Quick start

Clone this repo and point your MCP client at `server.mjs` in the root. No build step, no package manager.

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

Claude Code reads this from `~/.claude/settings.json`; Cursor from `.cursor/mcp.json`. Any stdio-transport MCP client works.

<details>
<summary>Alternative: install from JSR</summary>

Both packages are published on JSR at [jsr.io/@cross-walkri](https://jsr.io/@cross-walkri).

```bash
npx jsr add @cross-walkri/mcp-server
```

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

For the core library alone: `npx jsr add @cross-walkri/core`.

</details>

## The eight tools

| Tool | What it does | Reach for it when |
|---|---|---|
| `walkri_audit_field` | Audits a field against WALKRI's five requirements; returns per-criterion gaps and a binary verdict: instrument or label | Before any application form goes live; a label cannot be fixed retroactively |
| `walkri_generate_field` | Generates a WALKRI-conformant field specification from a plain-language description | Designing a form from scratch |
| `cross_check_gate` | Returns the full requirements for a CROSS gate by type and obligation mode; optionally audits supplied gate content | Configuring or reviewing a payment gate |
| `cross_configure_round` | Infers an obligation mode from a program description and recommends a validated gate structure | Setting up a round |
| `cross_classify_framework` | Classifies an external framework against the 50 CROSS+WALKRI primitives across seven layers | Mapping a new framework into the compatibility corpus |
| `cross_lookup_lens` | Looks up the five cross-cutting lenses (calibration tier, authority source, cultural-methodological lineage, funder typology, framework scope) | Placing a framework or funder in context |
| `cross_falsifiability_audit` | Applies the four-element falsifiability test, with the five gate-based types and eight failure modes | Testing whether a claim can actually be checked |
| `cross_audit_round` | Evaluates whether a described round was run correctly under CROSS+WALKRI; verdict plus prioritized gaps | Post-round review, or due diligence on someone else's round |

<details>
<summary>Full tool reference</summary>

**walkri_audit_field.** Audits a grant application field against WALKRI's five pre-publication requirements. Returns a per-criterion assessment (pass/fail with gap and fix suggestion) and a binary verdict: `instrument` (all five pass) or `label` (any fail). Also returns systemic patterns across failing criteria and a prompt template for revising the field with a language model. Use before publishing any application form; a field that goes live as a label cannot be fixed retroactively.

**walkri_generate_field.** Generates a WALKRI-conformant field specification from a plain-language description of what you want to measure. Returns a draft structural audit and a fully-formed prompt template ready to pass to a language model to produce the complete specification.

**cross_check_gate.** Returns the complete list of requirements for a CROSS gate of a given type (entry-specification, completion, continuation) operating in a given obligation mode (build, change, retroactive). Optionally accepts the gate content to run against the requirements and identify what is missing.

**cross_configure_round.** Accepts a plain-language program description and infers an obligation mode, then recommends a gate structure with evidence scope and evidence strength, validates the configuration for internal consistency, and returns a fully-formed prompt template for generating the complete configuration with a language model.

**cross_classify_framework.** Accepts a description of an external framework and classifies it against the 50 CROSS+WALKRI primitives across seven layers. Returns which layers the framework addresses, which primitives it exemplifies, which are absent, and a prompt template for generating a formal compatibility statement.

**cross_lookup_lens.** Looks up a dimension of the CROSS+WALKRI Lenses Framework. Five lenses sit above the primitives as cross-cutting metadata: calibration-tier (five tiers from impressionistic to falsifiable, with current-plus-target output shape), authority-source (where binding force comes from), cultural-methodological-lineage (the tradition the framework descends from, including Western institutional, Islamic finance jurisprudence, Indigenous Treaty partnership, Indigenous-led participatory non-Treaty, traditional without administrative infrastructure, and hybrid), funder-typology (ten kinds of funder including bilateral aid agency, multilateral bank or fund, private foundation, government non-aid, pooled fund, individual donor, DAO or protocol, corporate CSR, faith-based, and settlement-administered), and framework-scope-type (what kind of object the framework is). Returns the lens, its enumerated values, and detection criteria.

**cross_falsifiability_audit.** Applies the four-element falsifiability test from the Falsifiability Architecture document. A falsifiable claim has a pre-committed claim, a named verifying source outside the claimant's control, a drift detection mechanism, and a disclosure obligation. Returns the four structural elements with structural tests, the five gate-based falsifiability types (entry-gate, progress-gate, completion-gate, continuation-gate, portfolio-level), and the eight failure modes (transcendence-claim, declaration-exploit, precision-facade, partial-instantiation, direction-without-destination, vocabulary-without-architecture, correct-map-wrong-territory, frozen-map).

**cross_audit_round.** Evaluates whether a described grant round was run correctly under CROSS+WALKRI. Checks for entry specification gate, explicit obligation mode, completion gate, WALKRI-conformant field characteristics, and financial accountability. Returns a conformance verdict (conformant/partial/non-conformant) and a prioritized gap list, plus a prompt template for comprehensive AI-assisted evaluation.

</details>

## What this repo contains

**packages/core** (`@cross-walkri/core`): TypeScript types and Zod schemas for every CROSS+WALKRI data structure; the WALKRI audit engine (`auditField`); the CROSS gate logic (`getGateRequirements`, `validateRoundConfig`, `classifyObligationMode`); all 50 primitives as a typed constant array (Primitives Foundation v0.1.7), searchable by name, layer, or keyword; and prompt templates as functions. Zero runtime dependencies, pure TypeScript.

**packages/mcp-server** (`@cross-walkri/mcp-server`): wraps the core package and exposes the eight tools via stdio transport.

<details>
<summary>Core package exports</summary>

**Types**: `WalkriField`, `WalkriCriterion`, `WalkriAuditResult`, `WalkriVerdict`, `CrossRound`, `CrossGate`, `CrossObligationMode`, `CrossGateType`, `CrossEvidenceScope`, `CrossEvidenceStrength`, `CrossPrimitive`, `PrimitiveLayer`

**Zod schemas**: `walkriFieldSchema`, `walkriCriterionSchema`, `walkriAuditResultSchema`, `crossGateSchema`, `crossRoundSchema` (and all constituent schemas)

**WALKRI audit**: `auditField(field: WalkriField): WalkriAuditResult`

**CROSS gate logic**: `getGateRequirements(gateType, obligationMode): string[]`, `validateRoundConfig(round: CrossRound): { valid: boolean; gaps: string[] }`, `classifyObligationMode(description: string): CrossObligationMode`

**Primitives**: `PRIMITIVES` (typed const array of all 50), `getPrimitiveByName(name: string)`, `getPrimitivesByLayer(layer: PrimitiveLayer)`, `searchPrimitives(keyword: string)`

**Lenses Framework**: `LENSES` (typed const array of the five lenses), `getLens(id)`, `getLensValue(lensId, valueId)`, `getAllLensIds()`

**Falsifiability Architecture**: `FALSIFIABILITY_ELEMENTS` (the four elements), `FALSIFIABILITY_TYPES` (the five gate-based types), `FALSIFIABILITY_FAILURE_MODES` (the eight failure modes), `getFalsifiabilityType(id)`, `getFalsifiabilityFailureMode(id)`

**Prompt templates**: `auditFieldPrompt(field)`, `configureRoundPrompt(description, programType)`, `classifyFrameworkPrompt(description)`, `evaluateRoundPrompt(description)`

</details>

## The family

These tools implement the grants standards: [CROSS](https://github.com/CrossWalkri/CROSS), [WALKRI](https://github.com/CrossWalkri/WALKRI), and [GRAIN](https://github.com/CrossWalkri/GRAIN), with [CRAFT](https://github.com/CrossWalkri/craft-meta-standard) and [ORE](https://github.com/CrossWalkri/ORE) beneath them as the evidence layer. A sibling repository serves the Coordination Structural Integrity Suite and the Frame Language vocabulary discipline as MCP servers of the same shape: [coordination-structural-integrity-suite/tools](https://github.com/coordination-structural-integrity-suite/tools). The standards' public home, with a working round configurator and prompt library, is [crosswalkri.com](https://crosswalkri.com).

## Development

This is a pnpm workspace monorepo.

```bash
pnpm install    # install dependencies
pnpm build      # build all packages
pnpm typecheck  # type-check all packages
```

## License

Both packages are dedicated to the public domain under Creative Commons Zero v1.0 Universal (CC0). See [github.com/CrossWalkri](https://github.com/CrossWalkri) for the canonical standard documents and the compatibility statement corpus. Any grants ecosystem can adopt CROSS+WALKRI without licensing, attribution, or arrangements.
