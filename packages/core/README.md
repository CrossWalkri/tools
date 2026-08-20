# @proof-of-coord/evidence-core

The typed core of the evidence integrity standards: TypeScript types, Zod schemas, audit logic, primitives and prompt templates, with no transport and no I/O.

This package is what [`@proof-of-coord/evidence-integrity`](https://jsr.io/@proof-of-coord/evidence-integrity) wraps as MCP tools. Use it directly when you want the audit logic inside your own application rather than inside an AI assistant.

Four published standards sit underneath it, all CC0 at [github.com/CrossWalkri](https://github.com/CrossWalkri):

**CROSS** specifies the obligation architecture of a funding round: what a grantee must demonstrate at each payment gate, in one of three obligation modes.

**WALKRI** specifies what makes an intake field a measurement rather than a label: a written criterion intent, an operational definition with qualifying and non-qualifying examples, a justified response type, a specified evidence artifact and access path, and a conformance threshold where an external standard is referenced.

**ORE** (Origin, Reliability, Exposure) governs the source boundary: what a system may assume about material it did not produce.

**STRUCK** governs the exit boundary: what a finding owes before anyone acts on it.

## Install

```bash
deno add jsr:@proof-of-coord/evidence-core
```

```bash
npx jsr add @proof-of-coord/evidence-core
```

## What it exports

**WALKRI field auditing.** `auditField` takes a field and returns a verdict of instrument or label, the specific gap on each failing criterion, the systemic pattern across the failures, and a revision template. `walkriFieldSchema` and the criterion schemas validate input before you get there.

```ts
import { auditField } from '@proof-of-coord/evidence-core'

const result = auditField({
  label: 'Describe the expected impact of your project',
  type: 'long_text',
})
// verdict: 'label'
// criterion-intent, operational-definition, response-form and evidence-form
// all fail, each with its own gap and a suggestion that would close it.
// conformance-threshold passes because it only binds when the field
// references an external standard, and this one does not.
```

**CROSS gate logic.** `getGateRequirements` returns what a given gate type demands. `validateRoundConfig` checks a round configuration against the standard. `classifyObligationMode` and `classifyObligationModeWithBasis` place a funding round in one of the three obligation modes, the second reporting the basis for the classification rather than the classification alone.

**ORE source grading and STRUCK finding auditing.** ORE declines to specify how any of its five dimensions is computed, so nothing in this package returns a grade. `gradeSourceScaffold` returns the structure a conformant grading must fill and the gaps the supplied account leaves open. `checkIndependence` walks an evidence set for shared origin and returns the chain structure each item needs, the flags the account already warrants, and the number of distinct origins claimed against the number established, which is null when the account does not establish any. Agreement counts as evidence only when the agreeing sources are distinct in origin; sources sharing an origin agree because they must. `auditFinding` checks a finding against STRUCK's five obligations: graded evidence, refutation conditions, contested regions rather than averages, derivation chains walked to origin with labeled rungs, and the sufficiency judgment left with the consumer. `getPostures` and `getPosture` return the declarable postures and what each one commits to.

**The Meridian Basin benchmark.** `BENCHMARK_SOURCES`, `BENCHMARK_TASK`, `BENCHMARK_KEY` and the surrounding constants hold a fabricated twelve-source dossier with known ground truth, seeded with circular corroboration, impossible provenance, a phantom entity merge, a proxy attribution and one genuine disagreement a system must represent rather than resolve. It scores out of nine and tells you about your own pipeline rather than about the corpus.

**Primitives.** `PRIMITIVES` holds the primitive vocabulary with its foundation version and date. `getPrimitiveByName`, `getPrimitivesByLayer` and `searchPrimitives` read it.

**The Lenses Framework.** `LENSES`, `getLens`, `getLensValue` and `getAllLensIds` expose the lens vocabulary used to classify a framework's evaluative stance.

**The Falsifiability Architecture.** `FALSIFIABILITY_ELEMENTS`, `FALSIFIABILITY_TYPES` and `FALSIFIABILITY_FAILURE_MODES`, with lookups, cover what makes a claim testable and the named ways a claim can fail to be.

**Prompt templates.** `auditFieldPrompt`, `configureRoundPrompt`, `classifyFrameworkPrompt`, `evaluateRoundPrompt`, `gradeSourcePrompt`, `independencePrompt`, `auditFindingPrompt`, `declarePosturePrompt` and `scoreBenchmarkPrompt` are the text an assistant runs. They are exported so you can read what the tools actually ask before trusting the answer.

## The design commitment

The tools return requirements and gaps, not verdicts. It would have been easy to compute a score, and a score invites the reader to stop thinking while hiding which requirement failed behind a number that looks objective. So every function answers what applies here, what is missing, and what would close it, and leaves the judgment with the person.

Every result reports the version of each standard it encodes, so an output can be traced to the specification that produced it. This matters when a specification moves and old findings are still in circulation.

The library generates its primitives from the published source documents rather than restating them, so it cannot drift from the standards by hand-editing.

## License

CC0-1.0. The standards underneath are CC0 as well.
