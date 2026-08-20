# @proof-of-coord/evidence-integrity

Thirteen MCP tools putting four published evidence integrity standards inside Claude Code, Cursor, or any MCP-compatible assistant.

The standards are CC0 at [github.com/CrossWalkri](https://github.com/CrossWalkri). This package wraps [`@proof-of-coord/evidence-core`](https://jsr.io/@proof-of-coord/evidence-core), which holds the types, schemas and audit logic with no transport attached.

## Quick start

Clone [the repository](https://github.com/CrossWalkri/tools) and point your MCP client at `server.mjs` in the root. It is a single bundled file, so there is no build step and no package manager.

```json
{
  "mcpServers": {
    "evidence-integrity": {
      "command": "node",
      "args": ["/path/to/cross-walkri-tools/server.mjs"]
    }
  }
}
```

Claude Code reads this from `~/.claude/settings.json`; Cursor from `.cursor/mcp.json`. Any stdio-transport MCP client works. An HTTP transport is available at `server-http.mjs` for clients that need it.

## The four standards

**CROSS** specifies the obligation architecture of a funding round: what a grantee must demonstrate at each payment gate, in one of three obligation modes (build a deliverable, produce a measurable change, or recognize past contribution).

**WALKRI** specifies what makes an intake field a measurement rather than a label: a written criterion intent, an operational definition with qualifying and non-qualifying examples, a justified response type, a specified evidence artifact and access path, and a conformance threshold where an external standard is referenced.

**ORE** (Origin, Reliability, Exposure) governs the source boundary: what a system may assume about material it did not produce.

**STRUCK** governs the exit boundary: what a finding owes before anyone acts on it.

## The tools

**Field and form design.** `walkri_audit_field` audits a field against WALKRI's five requirements and returns per-criterion gaps with a binary verdict of instrument or label. `walkri_generate_field` goes the other way, producing a conformant field specification from a plain-language description of what you want to measure. Reach for the audit before any form goes live: a field published as a label cannot be fixed retroactively, because the responses it already collected are not comparable.

**Round and gate configuration.** `cross_check_gate` returns the full requirements for a gate by type and obligation mode, and will audit supplied gate content against them. `cross_configure_round` infers an obligation mode from a program description and recommends a validated gate structure. `cross_audit_round` evaluates whether a round already run conformed, with a verdict and prioritized gaps, which is the tool for post-round review or for due diligence on someone else's round.

**Placing a framework.** `cross_classify_framework` classifies an external framework against the CROSS+WALKRI primitives across seven layers. `cross_lookup_lens` returns the five cross-cutting lenses: calibration tier, authority source, cultural and methodological lineage, funder typology, and framework scope.

**Testing whether a claim can be checked.** `cross_falsifiability_audit` applies the four-element falsifiability test with its five gate-based types and eight failure modes.

**The source boundary.** `ore_grade_source` builds the ORE grading scaffold: three core dimensions plus two declared extension dimensions, with what a conformant grading must record on each, the named gaps the supplied account leaves open, and the opacity and monitoring obligations. It returns structure and gaps rather than a grade, because ORE deliberately does not specify how any dimension is computed. `ore_check_independence` walks an evidence set for shared origin, flagging restatements, uncited items and declared relationships, and counting origins claimed against origins established. Reach for it whenever sources agree and that agreement is about to carry weight, because sources sharing an origin agree because they must. `ore_declare_posture` returns the three intake postures with their downstream conditions, cautions and declaration requirements.

**The exit boundary.** `ore_audit_finding` audits a finding against STRUCK's five obligations: graded evidence, refutation conditions, contested regions rather than averages, derivation to origin with labeled rungs, and the sufficiency judgment left with the consumer. It returns per-obligation status with what was observed, the gap and the fix, plus systemic patterns across failing obligations. Statuses read `indicated`, `absent` or `undetermined` rather than pass or fail, because whether an obligation is genuinely met is a judgment the accompanying prompt hands to a reader.

**The benchmark.** `ore_run_benchmark` serves the Meridian Basin dossier: twelve fabricated sources with known ground truth, seeded with four failures and one genuine disagreement a system must represent rather than resolve. Six of the twelve are clean controls. It scores out of nine, with points for catching the seeded failures by substance rather than by name, for not flagging the clean sources, and for leaving the sufficiency judgment to the reader. Modes are `case`, `key` and `score`. It tells you about your own pipeline rather than about the corpus.

## The design commitment

The tools return requirements and gaps, not verdicts. Computing a score would have been easy, and a score invites the reader to stop thinking while hiding which requirement failed behind a number that looks objective. Every tool answers what applies here, what is missing, and what would close it, and leaves the judgment with the person.

Every response carries its provenance: the server version and the version of each standard it encodes. An output can be traced back to the specification that produced it, which matters when a specification moves and old findings are still in circulation.

## License

CC0-1.0.
