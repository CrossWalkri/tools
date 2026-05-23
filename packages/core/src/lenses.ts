/**
 * The five dimensions of the CROSS+WALKRI Lenses Framework.
 *
 * Lenses sit above primitives as cross-cutting metadata. Each Part XII
 * compatibility statement, gap map entry, and partial coverage map entry
 * carries one value per lens. The lenses make the corpus queryable across
 * cross-cutting dimensions independent of the primitive vocabulary.
 *
 * Source: CROSS-WALKRI-lenses-framework-0_1_0.md.
 *
 * Version 0.1.0 | CC0
 */

export type LensId =
  | 'calibration-tier'
  | 'authority-source'
  | 'cultural-methodological-lineage'
  | 'funder-typology'
  | 'framework-scope-type'

export interface LensValue {
  /** Enumerated value identifier. */
  id: string
  /** Human-readable name. */
  name: string
  /** Brief description. */
  description: string
}

export interface Lens {
  /** Lens identifier. */
  id: LensId
  /** Canonical lens name. */
  name: string
  /** What this lens organizes. */
  what_it_organizes: string
  /** The enumerated values. */
  values: readonly LensValue[]
  /** Detection criteria for assigning a value. */
  detection_criteria: string
  /** Runbook output shape: current+target where applicable. */
  output_shape_note: string | null
}

export const LENSES: readonly Lens[] = [
  {
    id: 'calibration-tier',
    name: 'Calibration Tier',
    what_it_organizes:
      'The depth of measurement rigor a framework imposes on grantee evidence. Five values, ordered as a graduation. An organization moves up by adding (publishing more, specifying more, requiring more verification), not by switching methodology.',
    values: [
      {
        id: 'impressionistic',
        name: 'Tier 1: Impressionistic',
        description:
          'No published commitments tied to evidence. Decisions through reputation, narrative judgment, and trust.',
      },
      {
        id: 'process-conformant',
        name: 'Tier 2: Process Conformant',
        description:
          'Published process rules (eligibility, application procedures, administrative requirements). The program conforms to its own published process. Outcome specification minimal or absent.',
      },
      {
        id: 'outcome-specified-self-reported',
        name: 'Tier 3: Outcome Specified, Self-Reported',
        description:
          'Outcome commitments published. Grantees report against them. No independent party verifies.',
      },
      {
        id: 'independently-verified',
        name: 'Tier 4: Independently Verified',
        description:
          'Outcome commitments published. An independent party (per the Determination Body Separation primitive) verifies.',
      },
      {
        id: 'falsifiable',
        name: 'Tier 5: Falsifiable',
        description:
          'Commitments published at every CLEAR step. Evidence queryable from the Attestation Corpus. Drift detectable per step. Adverse Signal Engagement Principle active. Multi-cycle Retrospective Assessment published.',
      },
    ],
    detection_criteria:
      'Tier 1: an organization has published statements about how it makes decisions but those statements do not include checkable evidence requirements. Tier 2: published process rules exist without outcome specification. Tier 3: outcome commitments published but verification is grantee self-report. Tier 4: published commitments paired with an independent verification mechanism named in the framework documentation. Tier 5: commitments span all five CLEAR stages AND the framework has an explicit drift detection or audit mechanism.',
    output_shape_note:
      'Runbook produces current-plus-target: the organization\'s current tier and the realistic next tier achievable within a stated time horizon. For Octant at Epoch 13: current Tier 1, target Tier 2 by Epoch 13, target Tier 3 by Epoch 16 or 17. The runbook produces the path, not just the position.',
  },
  {
    id: 'authority-source',
    name: 'Authority Source',
    what_it_organizes: 'The source of the framework\'s binding force.',
    values: [
      {
        id: 'statutory',
        name: 'Statutory',
        description: 'Established by legislation. Examples: Companies Act 2013 (India CSR), Title V Higher Education Act (WIOA), Federal Demonstration Partnership RPPR.',
      },
      {
        id: 'regulatory',
        name: 'Regulatory',
        description: 'Established by a regulatory body under statutory authority. Examples: 2 CFR 200, GREAT Act implementation rules.',
      },
      {
        id: 'contractual',
        name: 'Contractual',
        description: 'Binds parties through grant agreement terms. Examples: BARDA Other Transactions, ARPA-H individual award agreements.',
      },
      {
        id: 'voluntary-published',
        name: 'Voluntary Published',
        description: 'Published by an organization that uses it for its own grantmaking; adoption by others is voluntary. Examples: Trust-Based Philanthropy, Annie E. Casey RBA.',
      },
      {
        id: 'civil-society-advisory',
        name: 'Civil-Society Advisory',
        description: 'Authored by an academic or coalition body, intended as advisory guidance for funders or grantees. Examples: NCRP Criteria for Philanthropy at Its Best, Hopkins Principles for Use of Funds from the Opioid Litigation.',
      },
      {
        id: 'professional-society-standard',
        name: 'Professional-Society Standard',
        description: 'Authored by a professional society for practitioners. Examples: AEA Program Evaluation Standards, COPE Ethical Guidelines for Peer Reviewers, IDEAS Competencies for Development Evaluation.',
      },
    ],
    detection_criteria:
      'Statutory: reference to a specific act or law. Regulatory: reference to a regulatory body operating under statutory authority. Contractual: reference to grant agreement instruments. Voluntary Published: organization publishes its own framework without claiming it authoritative for others. Civil-Society Advisory: academic or coalition body authors framework explicitly intended as advisory. Professional-Society Standard: professional society as authoring body.',
    output_shape_note: null,
  },
  {
    id: 'cultural-methodological-lineage',
    name: 'Cultural-Methodological Lineage',
    what_it_organizes:
      'The cultural, jurisprudential, or methodological tradition the framework descends from. Makes legible that the corpus covers traditions that operate by structurally different principles, and that compatibility means different things across lineages.',
    values: [
      {
        id: 'western-institutional',
        name: 'Western institutional',
        description: 'The dominant evaluation, accountability, and reporting tradition descended from Anglo-American institutional grantmaking. Most of Part XII.',
      },
      {
        id: 'islamic-finance-jurisprudence',
        name: 'Islamic finance jurisprudence',
        description: 'Descended from Islamic legal and accounting traditions; AAOIFI as the canonical body of standards. Treats charitable instruments (Zakat, Waqf) through jurisprudential rather than evaluation lenses.',
      },
      {
        id: 'indigenous-treaty-partnership',
        name: 'Indigenous Treaty partnership',
        description: 'Operating within a Treaty-based partnership relationship between an Indigenous nation and a settler-colonial state. Te Puni Kokiri Effectiveness for Maori Framework is the canonical example; IPAF carries strong Treaty partnership characteristics through UNDRIP.',
      },
      {
        id: 'indigenous-led-participatory-non-treaty',
        name: 'Indigenous-led participatory (non-Treaty)',
        description: 'Led by Indigenous communities or coalitions outside a Treaty partnership. NDN Collective, Indigenous Environmental Network, First Nations Development Institute. Operating principle: participatory design and Indigenous data sovereignty without a formal Treaty instrument.',
      },
      {
        id: 'traditional-without-administrative-infrastructure',
        name: 'Traditional without administrative infrastructure',
        description: 'Giving traditions that predate or operate outside formal measurement frameworks by design. Mecenat, Mazenatentum, Daana, Dana, Ubuntu-based giving. Documented in the Partial Coverage Map.',
      },
      {
        id: 'hybrid',
        name: 'Hybrid',
        description: 'Explicitly drawing from multiple lineages. IDB Invest DELTA combines Latin American institutional with multilateral development bank lineage. Some Gulf frameworks combine Islamic finance with Anglo-American institutional reporting.',
      },
    ],
    detection_criteria:
      'Western institutional: default when none of the other values apply. Islamic finance jurisprudence: AAOIFI reference or named Islamic legal scholarship in the framework\'s own documentation. Indigenous Treaty partnership: framework explicitly invokes a Treaty or constitutional instrument between an Indigenous nation and a state. Indigenous-led participatory non-Treaty: Indigenous authorship without Treaty anchoring. Traditional without administrative infrastructure: giving tradition predates formal measurement frameworks and the corpus does not document an evolution into administrative form. Hybrid: framework explicitly draws from two or more lineages.',
    output_shape_note: null,
  },
  {
    id: 'funder-typology',
    name: 'Funder Typology',
    what_it_organizes:
      'The kind of funder the framework authored or operates under. Makes legible the structural differences between funder types and lets the corpus answer questions about coverage distribution.',
    values: [
      { id: 'bilateral-aid-agency', name: 'Bilateral aid agency', description: 'USAID, FCDO, AFD, JICA, Global Affairs Canada, DFAT, Irish Aid, SDC, BMZ/GIZ, AICS, AECID, Enabel, LuxDev.' },
      { id: 'multilateral-bank-or-fund', name: 'Multilateral bank or fund', description: 'World Bank, IDB, IFC, AfDB, ADB, EBRD, Green Climate Fund, GEF, IFAD, IDB Invest, Global Fund, GAVI.' },
      { id: 'private-foundation', name: 'Private foundation', description: 'Gates, Ford, Hewlett, MacArthur, Rockefeller, WK Kellogg, Annie E. Casey, Open Society, Robert Wood Johnson, William Penn, Carnegie, Sloan, Knight, Mellon, Templeton World Charity, Wellcome.' },
      { id: 'government-non-aid', name: 'Government (non-aid)', description: 'US federal grant programs (NIH, NSF, CDC, USDA NIFA, NASA, EPA, ARPA-H, ARPA-E, BARDA, DOT, FEMA); UK government (UKRI, Innovate UK, Arts Council England); state and municipal grant programs.' },
      { id: 'pooled-fund-or-intermediary', name: 'Pooled fund / intermediary', description: 'Tides, Borealis, NEO Philanthropy, Hopewell Fund, Sixteen Thirty Fund, ClimateWorks, donor collaboratives generally.' },
      { id: 'individual-donor', name: 'Individual donor', description: 'MacKenzie Scott / Yield Giving, Schmidt Sciences (where it functions as individual-donor extension), Mike Bloomberg personal giving.' },
      { id: 'dao-or-protocol', name: 'DAO or protocol', description: 'Octant, Optimism Retro Funding, Gitcoin Grants, Arbitrum DAO, ENS DAO, Aave Grants, Compound Grants.' },
      { id: 'corporate-csr', name: 'Corporate CSR', description: 'Microsoft AI for Good, Google.org, Salesforce, corporate foundation giving.' },
      { id: 'faith-based', name: 'Faith-based', description: 'Caritas, World Vision, Lutheran World Relief, USCCB CCHD, Tzu Chi, Aga Khan, AAOIFI-aligned Islamic charitable bodies.' },
      { id: 'settlement-administered', name: 'Settlement-administered', description: 'Opioid Settlement allocations, VW Environmental Mitigation Trust, BP Settlement / RESTORE Act, tobacco MSA-funded foundations.' },
    ],
    detection_criteria:
      'The funder typology of a framework is identified by who the authoring or operating organization is. Where a framework is used by multiple typologies (OECD DAC criteria used by most bilaterals; AAOIFI used by many faith-based bodies), the framework gets a primary typology with secondary typologies noted.',
    output_shape_note: null,
  },
  {
    id: 'framework-scope-type',
    name: 'Framework Scope Type',
    what_it_organizes:
      'What kind of object the framework is, regardless of who authored it or what tier it operates at. Resolves an ambiguity in the corpus: Part XII statements have meant different things for different framework types.',
    values: [
      { id: 'grantee-outcome-measurement', name: 'Grantee outcome measurement framework', description: 'Specifies what grantees must measure and report at the outcome level. Annie E. Casey RBA, USAID PIRS, OECD DAC criteria, GRI, CGIAR MELIA, DCED Standard, ESF+ result indicators.' },
      { id: 'allocator-process', name: 'Allocator process framework', description: 'Specifies how a funder runs its grantmaking process (selection, allocation, oversight) without primarily specifying grantee outcome measurement. GovS 015, Trust-Based Philanthropy, NCRP Criteria for Philanthropy at Its Best.' },
      { id: 'third-party-rating', name: 'Third-party rating framework', description: 'Frameworks where an external party rates organizations against criteria the organization does not author. Charity Navigator, GiveWell top-charity methodology.' },
      { id: 'certification', name: 'Certification framework', description: 'Frameworks where organizations earn a certification by meeting published criteria, administered by a third party. What Works Cities, Candid Seals of Transparency, Community Foundation National Standards.' },
      { id: 'professional-practice-ethics', name: 'Professional practice / ethics framework', description: 'Frameworks that govern practitioner conduct rather than program measurement. AEA Program Evaluation Standards, COPE Ethical Guidelines for Peer Reviewers, IDEAS Competencies for Development Evaluation.' },
      { id: 'government-accountability', name: 'Government accountability framework', description: 'Frameworks for assessing government performance, not grantee performance. Open Government Partnership IRM, Auditor General independence standards.' },
      { id: 'accounting-financial', name: 'Accounting or financial reporting standard', description: 'Frameworks specifying financial disclosure rather than program measurement. AAOIFI FAS 37, FAS 39; IFRS where it applies to grant-receiving entities.' },
      { id: 'jurisprudential', name: 'Jurisprudential standard', description: 'Frameworks specifying the legal or jurisprudential conditions under which giving operates. AAOIFI Sharia Standards, French 2003 Law on Philanthropy, India Companies Act 2013 Schedule VII.' },
    ],
    detection_criteria:
      'Grantee outcome measurement: primary content addresses what grantees must measure. Allocator process: primary content addresses how the funder runs its process. Third-party rating: rating party is structurally distinct from the rated entity. Certification: organizations earn a status against published criteria. Professional practice: framework governs practitioner conduct. Government accountability: framework subject is government performance. Accounting standard: primary content addresses financial reporting. Jurisprudential standard: primary content addresses legal conditions for charitable activity.',
    output_shape_note: null,
  },
] as const

/** Return a lens by id. */
export function getLens(id: string): Lens | undefined {
  return LENSES.find((l) => l.id === id)
}

/** Return a specific value from a lens. */
export function getLensValue(lensId: string, valueId: string): LensValue | undefined {
  const lens = getLens(lensId)
  if (!lens) return undefined
  return lens.values.find((v) => v.id === valueId)
}

/** Return all lens ids. */
export function getAllLensIds(): readonly string[] {
  return LENSES.map((l) => l.id)
}
