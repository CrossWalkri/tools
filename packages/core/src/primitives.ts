/**
 * All 50 CROSS+WALKRI primitives from the Primitives Foundation v0.1.7.
 *
 * Organized by the seven conceptual layers. Each primitive is a typed
 * constant with name, layer, description, relationships, and applications.
 *
 * Version 0.2.0 | CC0
 *
 * Changelog:
 * - v0.2.0 (2026-05-23): Updated to Primitives Foundation v0.1.7. Added 7 primitives
 *   (Format Agnosticism, Independent Verifiability, Pre-Award Indicator Confirmation
 *   Stage, Downstream-Use Restriction, Beneficiary Validation Mechanism, Determination
 *   Body Separation, Disaggregation Floor). Applied 2 renames: Governance Resilience
 *   to Continuity Capacity; Beneficiary Accountability Gate to Affected Population
 *   Verification Gate. Total: 50 primitives across 7 layers (was 43).
 * - v0.1.0 (initial): 43 primitives across 7 layers, Primitives Foundation v0.1.4.
 */

import type { CrossPrimitive } from './types.js'

export const PRIMITIVES: readonly CrossPrimitive[] = [
  // ---------------------------------------------------------------------------
  // Layer 1: Methodological Primitives
  // ---------------------------------------------------------------------------
  {
    name: 'Bidirectional Precision',
    layer: 'methodological',
    description:
      'The same operational definition rigor that obligation standards require of applicants specifying indicators must be applied by funders to the fields they use to collect those specifications. Precision obligations run in both directions: from funder to applicant and from applicant to funder.',
    relationships: [
      'Generates criterion specification elements (Layer 5)',
      'Constrains gate criterion specification in CROSS',
      'Foundational principle of the WALKRI field instrument architecture',
    ],
    applications: [
      'Every WALKRI criterion specification requirement',
      'Every CROSS gate criterion specification requirement',
      'The applicant identity field specification in WALKRI',
    ],
  },
  {
    name: 'Transclusion',
    layer: 'methodological',
    description:
      'A primitive defined once in a canonical location is included by reference wherever it applies, rather than restated. Restatement produces definitional drift; reference preserves consistency.',
    relationships: [
      'Governs how primitives relate to provisions',
      'Enables the standards to grow without redundancy',
    ],
    applications: [
      'Every provision in CROSS and WALKRI that references a concept defined in the Primitives Foundation',
    ],
  },
  {
    name: 'Frame Language: Pre-Replacement Admissibility',
    layer: 'methodological',
    description:
      'A Frame 1 term is admissible without replacement in seven cases: citation use, detection use, contextual description use, developmental bridge use, naming the stage, communication medium use, and documentary record use. In all other cases, replacement is required.',
    relationships: [
      'Governs which terms require replacement in the standards and in applicant-facing documents',
      'Pairs with the Frame 2 functioning check',
    ],
    applications: [
      'Term selection in CROSS and WALKRI provisions',
      'Evaluation of applicant language in proposal narratives',
    ],
  },
  {
    name: 'Frame Language: Replacement Procedure Categories',
    layer: 'methodological',
    description:
      'When a Frame 1 term requires replacement, the replacement falls into one of four procedure categories: plain-English mechanism specification, technical corpus vocabulary, deference claims, or relational inversion.',
    relationships: [
      'Pairs with pre-replacement admissibility',
      'Generates specific replacement decisions for individual terms',
    ],
    applications: [
      'CROSS and WALKRI provision drafting',
      'Frame Language skill',
    ],
  },
  {
    name: 'Frame Language: Frame 2 Functioning Check',
    layer: 'methodological',
    description:
      'A term expressed in Frame 2 vocabulary may still fail to function as Frame 2 in one of eight ways: Transcendence Claim, Declaration Exploit, Precision Facade, Partial Instantiation, Direction Without Destination, Vocabulary Without Architecture, Correct Map/Wrong Territory, and Frozen Map.',
    relationships: [
      'Applies after replacement procedure has been applied',
      'Catches provisions that use correct vocabulary but fail to function as intended',
    ],
    applications: [
      'Quality check on all CROSS and WALKRI provisions',
      'Evaluation of applicant specification language',
    ],
  },
  {
    name: 'Format Agnosticism',
    layer: 'methodological',
    description:
      'A methodological commitment that conformance is content-based rather than format-based. Any infrastructure meeting the content requirements specified by the relevant primitives satisfies conformance, regardless of the format the infrastructure uses. Format prescription is excluded from the standards except where format is itself a primitive requirement (SPDX identifier in Access Condition; published-URL requirement in Attestation Corpus). Different methodologies producing the same content are equivalent.',
    relationships: [
      'Foundational methodological primitive alongside Bidirectional Precision and Transclusion',
      'Generates CROSS Part I content-vs-format separation',
      'Constrains every Layer 4 Evidence primitive (evidence requirement specifies what must be evidenced, not the format)',
      'Cross-references Modularity Preservation: format agnosticism allows drop-in adoption across heterogeneous infrastructure',
    ],
    applications: [
      'CROSS Part I content-vs-format separation',
      'Every compatibility statement that maps a source framework specific format onto CROSS content requirements',
      'Te Puni Kokiri Effectiveness for Maori (tikanga methodologies satisfy content requirements)',
      'AAOIFI Islamic finance standards (jurisprudential reporting formats satisfy content requirements)',
      'Hypercerts integration (on-chain attestation format satisfies attestation content requirements)',
    ],
  },
  {
    name: 'Independent Verifiability from Sources Outside the Applicant\'s Control',
    layer: 'methodological',
    description:
      'A methodological commitment that every checkable claim in the standards must be verifiable from a source outside the claimant control. The applicant cannot serve as the sole verifier of their own claims. The verifying source must be independently queryable (Attestation Corpus, published registries, regulatory filings, independent reviewers, third-party data sources, affected-population participation under Affected Population Verification Gate). Structural counterpart to Falsifiability: falsifiability says claims must be checkable; independent verifiability says the checking source must lie outside the claimant.',
    relationships: [
      'Foundational methodological primitive alongside Bidirectional Precision, Transclusion, Format Agnosticism, and the Frame Language primitives',
      'Constrains every Layer 4 Evidence primitive: evidence form must specify the source of verification outside the applicant',
      'Connects to Falsifiability (Commitment 1 in Evolution Rules)',
    ],
    applications: [
      'Every appearance of "independently verifiable" or "from a source outside the applicant\'s control" across the Primitives Foundation and the CROSS schema',
      'Development Stage state declarations',
      'Sufficiency declarations',
      'Obligation Fulfillment Record',
      'Attestation Corpus by definition',
      'Public Benefit Mechanism access condition verification',
      'Every Evidence Strength level above self-report',
    ],
  },

  // ---------------------------------------------------------------------------
  // Layer 2: Identity Primitives
  // ---------------------------------------------------------------------------
  {
    name: 'Entity Boundary',
    layer: 'identity',
    description:
      'The declared boundary of a legal, operational, or organizational entity that determines what is inside (attributable to that entity) versus outside. Three states: applying entity, contributing entity, and affiliated entity.',
    relationships: [
      'Generates organizational identity declaration',
      'Generates prior work attribution statement',
      'Generates applicant identity instrument in WALKRI',
      'Constrains scope (scope cannot exceed entity boundary)',
      'Constrains sufficiency (sufficiency is measured within a declared entity boundary)',
    ],
    applications: [
      'CROSS organizational identity declaration',
      'CROSS prior work attribution statement',
      'WALKRI applicant identity instruments',
      'Conflict of interest Tier 1 and Tier 2 classifications',
    ],
  },
  {
    name: 'Scope',
    layer: 'identity',
    description:
      'The declared portion of an entity\'s full program or work portfolio that a specific application, grant, or obligation covers. Scope is always relative to an entity boundary. A scope hierarchy runs from specific deliverable to specific program to full entity operation.',
    relationships: [
      'Requires entity boundary to be declared first',
      'Determines what falls within concurrent funding disclosure',
      'Constrains additionality (additionality is assessed at the declared scope)',
      'Determines sufficiency position (sufficiency is assessed at the declared scope)',
    ],
    applications: [
      'CROSS concurrent funding disclosure',
      'CROSS additionality declaration',
      'CROSS scope attribution',
      'Funding ask field in any application',
      'WALKRI applicant identity instruments',
    ],
  },
  {
    name: 'Sufficiency',
    layer: 'identity',
    description:
      'The relationship between an entity\'s current resources at a declared scope and the resources required to fulfill the obligations at that scope completely. Four positions: critical gap, partial, approaching, and surplus.',
    relationships: [
      'Requires scope to be declared first',
      'Connects to the continuation gate sustainability assessment',
      'Connects to the additionality declaration',
      'Connects to portfolio analysis sufficiency dimension',
    ],
    applications: [
      'Funding ask field (what gap does this grant address at this scope)',
      'Continuation gate sufficiency assessment',
      'Portfolio analysis sufficiency dimension',
      'Additionality declaration',
    ],
  },
  {
    name: 'Revenue Architecture',
    layer: 'identity',
    description:
      'The declared model by which the applying entity generates income outside of grants and donations. Four types: grant-only, fee-for-service, commercial, and hybrid.',
    relationships: [
      'Determines what additionality means for this applicant',
      'Commercial entities must delineate non-commercial scope for the additionality argument',
      'Distinct from sufficiency position and concurrent funding disclosure',
    ],
    applications: [
      'CROSS Part II revenue architecture dimension',
      'CROSS Part IV sufficiency architecture declaration',
      'CROSS Part VI-A additionality declaration',
      'Evaluator sufficiency assessment',
    ],
  },
  {
    name: 'Disbursement Authority',
    layer: 'identity',
    description:
      'The named person or persons who have legal authority to receive grant funds on behalf of the applying entity and approve their deployment. Three states: individual, governed, and delegated.',
    relationships: [
      'Derived from the entity boundary primitive',
      'The operational anchor of the accountability relationship',
    ],
    applications: [
      'CROSS Part IV organizational identity declaration (fifth required field)',
      'WALKRI legal entity instrument (evidence form for disbursement authority confirmation)',
    ],
  },
  {
    name: 'Continuity Capacity',
    layer: 'identity',
    description:
      'The declared capacity of the applying entity to continue operating in its stated form if the primary contributor or key personnel become unavailable. Three states: single, partial, and resilient. Renamed at Primitives Foundation v0.1.7 from Governance Resilience per Frame Language audit; the rename specifies the structural capacity the primitive measures without importing Frame 1 vocabulary.',
    relationships: [
      'Derived from entity boundary and scope',
      'Constrains what sustainability stance is credible at the continuation gate',
      'Single-point-of-failure continuity is a disclosure, not a disqualifier',
    ],
    applications: [
      'CROSS Part II continuity capacity dimension',
      'CROSS Part IV continuation specification gate assessment',
      'Sustainability stance constraint at continuation',
    ],
  },
  {
    name: 'On-chain Identity Anchor',
    layer: 'identity',
    description:
      'A wallet address (externally owned account or smart contract) that serves as the canonical verifiable identity root for an entity\'s blockchain interactions. Distinguished from Disbursement Authority by being the identity root rather than the fund receipt mechanism.',
    relationships: [
      'Derived from the entity boundary primitive',
      'Distinct from Disbursement Authority',
      'Feeds the Attestation Corpus primitive (Layer 4)',
    ],
    applications: [
      'CROSS Part IV organizational identity declaration (sixth required field)',
      'Cross-program identity matching',
      'Attestation Corpus query input',
      'Cohort Position assessment',
    ],
  },

  // ---------------------------------------------------------------------------
  // Layer 3: Obligation Primitives
  // ---------------------------------------------------------------------------
  {
    name: 'Obligation Mode',
    layer: 'obligation',
    description:
      'The classification of what type of commitment a grant creates. Three modes: build obligation (deliver a specified artifact), change obligation (produce a measurable shift in a condition), and retroactive obligation (reward demonstrated past contribution).',
    relationships: [
      'Determines what the entry specification gate asks',
      'Determines what evidence scope is appropriate at the completion gate',
      'Determines whether Theory of Build is correct (build mode) or a failure mode (change mode)',
      'Maps to the ToC hierarchy: build at Output layer, change at Outcome layers',
    ],
    applications: [
      'CROSS round configuration',
      'Entry gate content determination',
      'Completion gate evidence scope setting',
    ],
  },
  {
    name: 'Development Stage',
    layer: 'obligation',
    description:
      'The declared position of the applying work on a five-position maturity scale. Stages: proof of concept, early adoption, growth, established infrastructure, and retroactive recognition.',
    relationships: [
      'Constrains coherent obligation mode assignment',
      'Declared stage must be consistent with available evidence at entry gate',
      'Funder round configurations declare which stages are within scope',
    ],
    applications: [
      'CROSS Part II development stage dimension',
      'CROSS Part IV entry gate declaration',
      'CROSS round configuration stage targeting',
      'Evaluator assessment of stage-evidence alignment',
    ],
  },
  {
    name: 'Gate Type',
    layer: 'obligation',
    description:
      'The classification of when in the funding lifecycle an assessment occurs. Four types: entry specification gate, progress verification gate, completion verification gate, and continuation specification gate.',
    relationships: [
      'Gate character (developmental vs summative) is determined by gate type',
      'Evidence scope and evidence strength requirements are configured per gate type',
      'Organizational identity declaration is required at the entry specification gate',
    ],
    applications: [
      'CROSS four-gate sequence',
      'Evidence configuration per gate',
      'Grantee rights determination (iteration vs redress)',
    ],
  },
  {
    name: 'Gate Character',
    layer: 'obligation',
    description:
      'The functional classification of a gate that determines grantee rights and funder obligations during assessment. Developmental (progress verification) gates give iteration rights; summative (completion) gates give redress rights.',
    relationships: [
      'Derived from gate type',
      'Determines whether grantee iteration rights apply',
      'Constrains funder behavior during assessment',
    ],
    applications: [
      'Funder posture determination (formative vs final)',
      'Grantee rights in assessment',
    ],
  },
  {
    name: 'Obligation Fulfillment Record',
    layer: 'obligation',
    description:
      'The documented history of commitments made under prior grants and whether those commitments were met. Three states per prior obligation: fulfilled, partially fulfilled, and unfulfilled.',
    relationships: [
      'Required for returning applicants at the entry gate',
      'Required when citing prior work as capability evidence',
      'Primary track record evidence at the continuation gate',
    ],
    applications: [
      'CROSS Part IV entry specification gate (returning applicants)',
      'CROSS Part IV continuation specification gate',
      'CROSS prior work attribution statement activation',
      'Returning applicant eligibility assessment',
    ],
  },
  {
    name: 'Conflict of Interest',
    layer: 'obligation',
    description:
      'The classification of a relationship between a reviewer and an applicant that affects review integrity. Three tiers: categorical bar (Tier 1), disclosure required with qualified waiver (Tier 2), and disclosure encouraged (Tier 3).',
    relationships: [
      'Governs reviewer access to applications',
      'Generates the conflict of interest declaration requirement at the reviewer entry gate',
    ],
    applications: [
      'Reviewer eligibility determination',
      'Conflict of interest declaration in reviewer process',
    ],
  },
  {
    name: 'Public Benefit Mechanism',
    layer: 'obligation',
    description:
      'The declared mechanism by which the funded work produces benefit to parties outside the applicant\'s organization, in a form that is non-excludable or non-rivalrous at the point of delivery. Four types: output production, access provision, condition change, and ecosystem shift.',
    relationships: [
      'Derived from Evidence Scope (Layer 4)',
      'Determines which access condition type is required',
      'Mechanism type declared at entry determines evidence scope required at completion',
    ],
    applications: [
      'CROSS eligibility declaration',
      'CROSS entry gate public benefit mechanism declaration',
      'WALKRI output license declaration, access provision declaration, beneficiary population instrument',
    ],
  },
  {
    name: 'Access Condition',
    layer: 'obligation',
    description:
      'The declared terms under which the public benefit mechanism holds and can be independently verified. Specifies the mechanism-specific terms, the evidence form for confirmation, and whether the terms apply at application time, at reporting time, or both.',
    relationships: [
      'Derived from Public Benefit Mechanism (Layer 3) and Evidence Form (Layer 5)',
      'Specifies the evidence form for the public benefit mechanism claim',
    ],
    applications: [
      'CROSS Part II public benefit mechanism dimension',
      'CROSS Part IV entry gate access condition declaration',
      'WALKRI output license declaration, access provision declaration',
    ],
  },
  {
    name: 'Pre-Award Indicator Confirmation Stage',
    layer: 'obligation',
    description:
      'A structured stage between funder selection of an applicant and the start of disbursement, during which the funder and the selected applicant finalize the indicator definitions, milestone bindings, and evidence form specifications that will govern subsequent gate assessments. The written confirmation produced at the close of this stage is the operative specification for the round; subsequent gate determinations are made against the confirmed specification, not against the applicant\'s original entry-gate submission. Distinguished from the Entry Specification Gate (which selects among applicants) and from the Progress Verification Gate (which assesses delivery against a specification already in force).',
    relationships: [
      'Configured at Layer 3 alongside Gate Type and Gate Character',
      'References Criterion Specification Elements (Layer 5) for the substantive content of the confirmation',
      'Output binds subsequent gate assessments under the Attestation Corpus and the Obligation Fulfillment Record',
    ],
    applications: [
      'CROSS Part XII (OTF program-manager negotiation; Sovereign Tech Fund scoping phase; What Works Cities Rigorous Evaluations criterion; CDC Program Evaluation Framework Step 3)',
      'Any program where the entry gate selects on competitive criteria that differ from the operative measurement specification at completion',
    ],
  },
  {
    name: 'Downstream-Use Restriction',
    layer: 'obligation',
    description:
      'A funder-published declared restriction on the intended use or downstream application of grant outputs, operationalized as a categorical eligibility condition at the entry gate. The restriction names a class of uses, applications, or deployment contexts that disqualify an otherwise license-conformant output from being supported by the program. Distinct from Access Condition (which specifies how the output is made available) by constraining what the output may be built for. Three configuration elements: restriction predicate, verification mechanism, disclosure obligation.',
    relationships: [
      'Layer 3 primitive sitting alongside Access Condition and Public Benefit Mechanism',
      'Declared in CROSS Part IV round configuration',
      'WALKRI Section 3 criterion specification applies to the disclosure obligation field',
    ],
    applications: [
      'CROSS Part XII (NLnet Foundation peaceful-and-humane-use clause; OTF statutory open-source-and-audit mandate per 22 U.S.C. § 6208a; IPAF Free Prior and Informed Consent requirement; Wikimedia Universal Code of Conduct compliance condition)',
      'Any program whose mandate restricts downstream use of funded outputs by named conditions',
    ],
  },
  {
    name: 'Beneficiary Validation Mechanism',
    layer: 'obligation',
    description:
      'A structural mechanism by which the claimed FROM state, population definition, or need claim of an applying entity is independently validated by parties drawn from or bound by obligation directions to the affected population at the entry specification gate. Distinct from the Affected Population Verification Gate (Layer 4), which operates at completion to verify what was delivered. Beneficiary Validation Mechanism operates at entry, before disbursement, to confirm that the applying entity\'s characterization of the population, the need, and the FROM state is grounded in the affected population\'s own assessment rather than imposed from outside. Three configuration elements: validating parties, validation procedure, disqualification condition.',
    relationships: [
      'Layer 3 primitive operating alongside Public Benefit Mechanism and Affected Population Verification Gate as a three-part architecture for population-anchored programs (validation at entry, mechanism declaration at entry, verification at completion)',
      'Connects to Independent Verifiability (Layer 1): validating parties must be structurally outside the applicant',
      'Cross-references the Te Puni Kokiri Treaty partnership pattern and the IPAF co-management structure',
    ],
    applications: [
      'CROSS Part XII (Te Puni Kokiri Effectiveness for Maori framework; IPAF FIMI/Samburu Women Trust/Tebtebba co-management; CRS ProPack baseline community validation; Hopkins Opioid Litigation Principles Principle 5 affected-community input; Core Humanitarian Standard Commitments 1-4 community engagement requirements)',
      'Any program claiming a condition change or access provision public benefit mechanism in a named population',
    ],
  },

  // ---------------------------------------------------------------------------
  // Layer 4: Evidence Primitives
  // ---------------------------------------------------------------------------
  {
    name: 'Evidence Scope',
    layer: 'evidence',
    description:
      'The classification of how strong an evidential claim is at a given gate. Four levels in ascending order: output evidence, usage evidence, outcome evidence, and impact evidence.',
    relationships: [
      'Configured per gate type',
      'Minimum evidence scope at completion gate set by grant scale',
      'Determines which WALKRI evidence types are required',
    ],
    applications: [
      'CROSS gate configuration',
      'Completion gate minimum evidence requirement',
      'Evidence type determination',
    ],
  },
  {
    name: 'Evidence Strength',
    layer: 'evidence',
    description:
      'The classification of how rigorous the verification mechanism is at a given gate. Four levels in ascending order: self-report with documentation, third-party verifiable, independent review, and independent evaluation.',
    relationships: [
      'Configured per gate type, independently from evidence scope',
      'Minimum evidence strength at completion gate set by grant scale',
      'Higher strength does not substitute for higher scope; both configured independently',
    ],
    applications: [
      'CROSS gate configuration',
      'Completion gate verification mechanism',
    ],
  },
  {
    name: 'Evidence Type',
    layer: 'evidence',
    description:
      'The classification of what kind of proof a submission constitutes. Five types: standing evidence, activity evidence, outcome evidence, planning evidence, and financial accountability evidence.',
    relationships: [
      'Governs what a reviewer must look for when assessing a submission',
      'Generates the evidence form requirement in WALKRI\'s criterion specification',
    ],
    applications: [
      'Reviewer assessment guidance',
      'Evidence form requirement in WALKRI',
      'Completion gate review',
    ],
  },
  {
    name: 'Causality Stance',
    layer: 'evidence',
    description:
      'The declared position on what kind of causal claim an intervention makes at a given gate or pathway. Two stances: attribution (the intervention caused the outcome) and contribution (the intervention contributed among other factors).',
    relationships: [
      'Configured at the gate level and at the pathway level',
      'Attribution stance requires counterfactual methodology',
      'Contribution stance is appropriate for most public goods and Web3 contexts',
    ],
    applications: [
      'CROSS gate causal claim configuration',
      'Theory of Change pathway declaration',
      'Evaluator assessment of causal claims',
    ],
  },
  {
    name: 'Intended vs. Unintended Effects',
    layer: 'evidence',
    description:
      'The classification of whether an effect was specified in the entry gate or discovered during or after the grant period. Both positive and negative unintended effects must be disclosed at the completion gate.',
    relationships: [
      'Generates the unintended outcomes disclosure requirement at the completion gate',
      'Connects to the Adverse Signal Engagement Principle',
    ],
    applications: [
      'Completion gate disclosure requirement',
      'Adverse signal detection',
    ],
  },
  {
    name: 'Affected Population Verification Gate',
    layer: 'evidence',
    description:
      'A gate element requiring that the people or communities served by a funded program participate in verifying what was delivered, not merely that independent third parties confirm delivery. Three configuration elements: affected population, participation mechanism, and minimum participation threshold. Renamed at Primitives Foundation v0.1.7 from Beneficiary Accountability Gate per Frame Language audit; the rename aligns with relational triad terminology (affected population) and names the structural mechanism (verification) rather than Frame 1 framing.',
    relationships: [
      'Extension of Evidence Strength: independent review where the reviewer must be or include the affected population',
      'Connects to Public Benefit Mechanism: most applicable to condition change and access provision types',
      'Cross-references Beneficiary Validation Mechanism (Layer 3, entry-stage primitive) by temporal distinction (validation at entry; verification at completion)',
    ],
    applications: [
      'Humanitarian and community-development grant programs',
      'Any program claiming condition change with a named affected population',
      'CROSS Part XII (CRS ProPack, World Vision LEAP; citation use of source frameworks\' beneficiary terminology)',
    ],
  },
  {
    name: 'Attestation Corpus',
    layer: 'evidence',
    description:
      'The set of claims about an entity made by parties outside the entity\'s control, retrievable from named public sources without the entity\'s participation. Includes on-chain attestations, off-chain program completion records, and named endorsements.',
    relationships: [
      'Queried against the On-chain Identity Anchor (Layer 2)',
      'Distinguished from the Obligation Fulfillment Record by being independently queryable without applicant participation',
      'Corpus discrepancies vs the Obligation Fulfillment Record are adverse signals',
    ],
    applications: [
      'CROSS Part IV funder-side Attestation Corpus query procedure',
      'Cross-program track record assessment',
      'Adverse signal detection in returning applicant review',
    ],
  },
  {
    name: 'Determination Body Separation',
    layer: 'evidence',
    description:
      'A funder-side architectural condition requiring that completion-gate determinations be made by a named body structurally outside program management, with a named charter or policy document specifying the body composition, scope, authority, and removal mechanism. The body must be named; charter must be publicly accessible at a stable URL; document must specify how members are appointed and removed, what determination scope the body has authority over, and what relationship the body has to the funder program management chain.',
    relationships: [
      'Extension of Evidence Strength (Layer 4) for the institutional-layer separation that per-gate independent review cannot guarantee on its own',
      'Connects to Conflict of Interest (Layer 3): governs reviewer-applicant relationships at the individual reviewer level; Determination Body Separation governs the structural independence of the evaluation function itself from program operations',
      'Cross-references Part XI funder obligations and redress',
    ],
    applications: [
      'CROSS Part XII (IFAD Independent Office of Evaluation per IFAD Evaluation Policy; OGP Independent Reporting Mechanism per Procedures Manual 2025; TWCF Research Assessment Policy with DORA-aligned external assessment; CDC Program Evaluation Framework Standard 3 on independence and objectivity; Innovate UK Level 2 and Level 3 externally commissioned evaluations; AEA Program Evaluation Standards E1 through E3 on evaluation accountability)',
    ],
  },

  // ---------------------------------------------------------------------------
  // Layer 5: Specification Primitives
  // ---------------------------------------------------------------------------
  {
    name: 'Criterion Specification Elements',
    layer: 'specification',
    description:
      'The five elements that a field must carry before it is a measurement instrument rather than a label: criterion intent, operational definition, response form, evidence form, and compliance threshold. All five are required.',
    relationships: [
      'Generated by the bidirectional precision primitive',
      'Applies to all fields in any WALKRI-conformant form',
      'Generates data quality standards as quality checks on the specification itself',
    ],
    applications: [
      'Every WALKRI field audit',
      'WALKRI pre-publication checklist',
      'AI-assisted field review criterion reference',
    ],
  },
  {
    name: 'Data Quality Standards',
    layer: 'specification',
    description:
      'The five standards against which a WALKRI-conformant field specification is assessed: validity, integrity, precision, reliability, and timeliness. These are quality checks on criterion specification elements, not independent requirements.',
    relationships: [
      'Quality checks on criterion specification elements',
      'Maps to USAID data quality criteria (Validity, Reliability, Precision, Integrity, Timeliness)',
    ],
    applications: [
      'WALKRI field audit quality assessment',
      'USAID DQA structural compliance',
    ],
  },
  {
    name: 'External Standard Identifier Types',
    layer: 'specification',
    description:
      'The classification of how an external standard is identified in a WALKRI compliance threshold or CROSS reference. Ten types: DOI, ISO number, IETF RFC number, SPDX identifier, W3C dated URL, ELI URI, regulatory citation, repository version tag, IRIS+ indicator identifier, and URL (general, least preferred).',
    relationships: [
      'Each identifier type has an associated access model and archival anchor requirement',
      'Identifier type determines the appropriate version anchor',
    ],
    applications: [
      'WALKRI compliance threshold field specification',
      'CROSS external standard reference fields',
    ],
  },
  {
    name: 'Access Models',
    layer: 'specification',
    description:
      'The classification of how an external standard is accessed. Four models: open and free, open with registration, paid and licensed, and government and regulatory.',
    relationships: [
      'Constrains compliance threshold language (paid standards cannot require evidence only a subscriber could produce)',
      'Access model must be declared alongside the external standard reference',
    ],
    applications: [
      'WALKRI compliance threshold access requirement',
      'External standard reference declarations',
    ],
  },
  {
    name: 'Applicant Identity Instrument Types',
    layer: 'specification',
    description:
      'The classification of identity fields as WALKRI instruments. Three types: legal entity instrument, display name instrument, and prior entity relationship instrument.',
    relationships: [
      'Generated by the entity boundary primitive applied at the field level',
      'Generates the self-reference consistency requirement',
    ],
    applications: [
      'WALKRI applicant identity field specification',
      'Self-reference consistency check across application',
    ],
  },
  {
    name: 'Disaggregation Floor',
    layer: 'specification',
    description:
      'A constraint that disaggregation categories declared at the entry gate are carried forward unchanged to every subsequent gate within the same program; the set may be added to at later gates, but established categories cannot be dropped, collapsed, or replaced. Disaggregation floors ratchet only upward. Addresses the recurring pattern where disaggregation categories established to satisfy entry-gate equity, inclusion, or population-scope commitments quietly disappear at progress and completion gates. Two configuration elements: floor categories, addition protocol.',
    relationships: [
      'Layer 5 primitive operating in conjunction with Criterion Specification Elements (each field bound by the floor must satisfy operational definition requirements for each declared category)',
      'Connects to Public Benefit Mechanism (Layer 3): floor categories typically derive from the population scope declared with the public benefit mechanism',
      'Connects to Obligation Fulfillment Record: drift below the floor at any gate is an adverse signal recorded against the funder program',
    ],
    applications: [
      'CROSS Part XII (NCRP Criteria for Philanthropy at Its Best disaggregation requirements; IPAF Indigenous well-being indicators disaggregation; CDC framework rigor standard on disaggregated reporting)',
      'Any program declaring equity, inclusion, or population-targeted public benefit mechanisms with named disaggregation categories',
    ],
  },

  // ---------------------------------------------------------------------------
  // Layer 6: Causal Architecture Primitives
  // ---------------------------------------------------------------------------
  {
    name: 'Theory of Change Hierarchy',
    layer: 'causal-architecture',
    description:
      'The classification of levels in a causal chain from intervention to goal. Six levels following the Compact Logic structure: Process, Outputs, Short-term Outcomes, Intermediate Outcomes, Long-term Outcomes, and Goal.',
    relationships: [
      'Determines what evidence is appropriate at each gate',
      'Determines what attribution claims are credible at each level',
      'Determines the directionality primitive\'s application',
    ],
    applications: [
      'CROSS Theory of Change architecture',
      'Gate evidence scope determination by outcome level',
      'Attribution claim credibility assessment',
    ],
  },
  {
    name: 'Theory Layer',
    layer: 'causal-architecture',
    description:
      'The classification of which layer of the Theory of Change an intervention primarily operates in. Two values: Build (Process-to-Outputs, producing artifacts) and Change (Outputs-to-Outcomes, producing measurable shifts).',
    relationships: [
      'Applied at the pathway level in the program-level ToC declaration',
      'A build-layer pathway declares an intended outcome level identifying what outcomes the artifact is designed to enable downstream',
    ],
    applications: [
      'Theory of Change pathway tagging',
      'Obligation mode assignment at the pathway level',
    ],
  },
  {
    name: 'Specification Directionality',
    layer: 'causal-architecture',
    description:
      'The classification of whether a pathway was specified from the desired outcome backward (planning mode) or from available capacity forward (delivery mode). Delivery mode clusters at short-term outcomes; planning mode is required to reach intermediate and long-term outcomes.',
    relationships: [
      'Delivery-mode pathways cluster at short-term outcomes',
      'Planning mode is required to reach intermediate and long-term outcomes',
    ],
    applications: [
      'Theory of Change pathway specification',
      'Portfolio outcome level distribution analysis',
    ],
  },
  {
    name: 'Pathway',
    layer: 'causal-architecture',
    description:
      'A numbered causal claim declaring the relationship between a source node at one ToC hierarchy level and a target node at the next level up. Each pathway carries: unique identifier, source node, target node, causal mechanism statement, critical assumptions, external risks, dependency declarations, theory layer tag, intended outcome level, causality stance tag, and specification directionality tag.',
    relationships: [
      'The pathway is the unit of causal architecture',
      'Dependency declarations generate the dependency map for portfolio analysis',
      'Causality stance tag should match the gate configuration for rounds advancing that pathway',
    ],
    applications: [
      'CROSS Theory of Change registry',
      'Portfolio dependency mapping',
      'Grants Causeway tool',
    ],
  },
  {
    name: 'Sustainability Stance',
    layer: 'causal-architecture',
    description:
      'The declared position on whether outcomes produced by prior rounds are self-sustaining or dependent on continued intervention. Three positions: sustained, conditional, and dependent.',
    relationships: [
      'Required at the continuation gate',
      'Distinct from the impact question and the cost-effectiveness question',
      'A program can pass both and still have a dependent sustainability stance',
    ],
    applications: [
      'Continuation gate assessment',
      'Program sustainability declaration',
    ],
  },

  // ---------------------------------------------------------------------------
  // Layer 7: Portfolio Primitives
  // ---------------------------------------------------------------------------
  {
    name: 'Portfolio Position',
    layer: 'portfolio',
    description:
      'The classification of a round\'s relationship to prior rounds in the same program or portfolio. Three positions: initiating, continuation, and convergence.',
    relationships: [
      'Determines what prior work attribution is required',
      'Convergence rounds require dependency declarations naming the pathways they depend on',
    ],
    applications: [
      'CROSS round configuration',
      'Prior work attribution requirement determination',
    ],
  },
  {
    name: 'Portfolio-level Continuation Benchmark',
    layer: 'portfolio',
    description:
      'A funder-declared threshold that the program as a whole must meet to justify continued operation, distinct from individual grantee continuation gates. Three configuration elements: metric, threshold, and review period. Holds the funder\'s program accountable rather than its individual grantees.',
    relationships: [
      'Derived from Portfolio Position and Evidence Scope',
      'Benchmark metric must be at least as rigorous as the evidence scope at individual completion gates',
      'Distinct from individual continuation gate and from portfolio analysis outputs',
    ],
    applications: [
      'CROSS Part XII (SBIR/STTR portfolio-level commercialization benchmarks)',
      'Program operator accountability in multi-cycle programs',
      'Program continuation decision at the funder level',
    ],
  },
  {
    name: 'Inter-cycle Reflection Stage',
    layer: 'portfolio',
    description:
      'A structured learning artifact produced between grant cycles that captures what the prior cycle demonstrated, what assumptions were confirmed or disconfirmed, and how that learning will change the design of the next cycle. Three required elements: reflection artifact, design response, and publication timing.',
    relationships: [
      'Derived from Obligation Fulfillment Record and Sustainability Stance at the program level',
      'The program-level analogue of the applicant\'s Obligation Fulfillment Record',
      'The reflection artifact is input to the next cycle\'s entry specification gate',
    ],
    applications: [
      'CROSS Part XII (World Vision LEAP)',
      'Multi-cycle program design',
      'Program-level learning loop',
    ],
  },
  {
    name: 'Multi-cycle Retrospective Assessment',
    layer: 'portfolio',
    description:
      'An assessment spanning multiple grant cycles that evaluates cumulative progress rather than single-cycle delivery. Three forms: cumulative outcome assessment, longitudinal grantee assessment, and cross-cycle learning assessment. The only gate type that can substantiate intermediate and long-term ToC outcomes.',
    relationships: [
      'Derived from Theory of Change Hierarchy and Obligation Fulfillment Record',
      'Single-cycle completion gates can only reach short-term outcomes',
      'Requires a series of Obligation Fulfillment Records across cycles as evidence base',
    ],
    applications: [
      'CROSS Part XII (NED Cumulative Assessment Report)',
      'Long-term outcome substantiation',
      'Multi-year program evaluation',
    ],
  },
  {
    name: 'Portfolio Analysis Outputs',
    layer: 'portfolio',
    description:
      'The five analytical outputs that a portfolio with declared ToC pathway registries enables: convergence analysis, gap analysis, leverage point identification, sequencing analysis, and efficiency analysis.',
    relationships: [
      'Enabled by ToC pathway registry declarations, dependency declarations, causality stance tags, round linkage records, and sufficiency position declarations',
      'Rendered by the Grants Scaffold tool',
    ],
    applications: [
      'Portfolio intelligence dashboard',
      'Grants Scaffold tool',
      'Cross-program funder analysis',
    ],
  },
  {
    name: 'Cohort Position',
    layer: 'portfolio',
    description:
      'An applicant entity\'s relationships to other entities applying to the same funding round. Encompasses personnel overlap, wallet overlap, endorser overlap, and prior co-applicant history. A funder-side assessment, not an applicant self-report.',
    relationships: [
      'Derived from the entity boundary primitive',
      'Wallet overlap checked against the On-chain Identity Anchor',
      'Personnel overlap activates affiliated entity disclosure and may trigger Tier 2 conflict of interest procedures',
    ],
    applications: [
      'CROSS Part VII Cohort Position assessment',
      'Cross-applicant integrity check before final gate determinations',
      'Personnel and wallet overlap disclosure',
    ],
  },
] as const

/** Return a primitive by its canonical name, or undefined if not found. */
export function getPrimitiveByName(name: string): CrossPrimitive | undefined {
  return PRIMITIVES.find((p) => p.name === name)
}

/** Return all primitives belonging to a given layer. */
export function getPrimitivesByLayer(
  layer: CrossPrimitive['layer'],
): CrossPrimitive[] {
  return PRIMITIVES.filter((p) => p.layer === layer)
}

/** Search primitives by keyword across name, description, and applications. */
export function searchPrimitives(keyword: string): CrossPrimitive[] {
  const lower = keyword.toLowerCase()
  return PRIMITIVES.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.applications.some((a) => a.toLowerCase().includes(lower)),
  )
}
