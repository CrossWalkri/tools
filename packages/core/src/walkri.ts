/**
 * Core WALKRI audit logic.
 *
 * auditField() checks all five WALKRI criterion specification elements against
 * a field definition and returns a full WalkriAuditResult with per-criterion
 * assessment and a binary verdict.
 *
 * Version 0.1.0 | CC0
 */

import type {
  WalkriField,
  WalkriCriterion,
  WalkriAuditResult,
  WalkriCriterionName,
  WalkriVerdict,
} from './types.js'

// ---------------------------------------------------------------------------
// Criterion checkers
// ---------------------------------------------------------------------------

/**
 * Criterion 1 - Criterion intent.
 * The field must specify what it measures via a written statement distinct from
 * the label. A description field that merely restates the label does not pass.
 */
function checkCriterionIntent(field: WalkriField): WalkriCriterion {
  const name: WalkriCriterionName = 'criterion-intent'

  if (!field.description || field.description.trim().length < 20) {
    return {
      name,
      passes: false,
      gap: 'No written statement of what this field measures, or the statement is too brief to be distinct from the label.',
      suggestion:
        'Add a description field that answers: what does a true response to this field tell us about the applicant or subject? The statement must be distinct from the label and name the underlying construct being assessed.',
    }
  }

  const descLower = field.description.toLowerCase()
  const labelLower = field.label.toLowerCase()
  // Check for description that merely echoes the label
  if (descLower.startsWith(labelLower) || labelLower.startsWith(descLower)) {
    return {
      name,
      passes: false,
      gap: 'The description appears to restate the label rather than name the underlying construct being measured.',
      suggestion:
        'Rewrite the description to answer: what construct does this field measure? Why is that construct relevant to the grant decision? What would a true response tell an evaluator?',
    }
  }

  return { name, passes: true, gap: null, suggestion: null }
}

/**
 * Criterion 2 - Operational definition.
 * The field must define valid response categories with qualifying and
 * non-qualifying examples. For select/multiselect fields this is the options
 * list. For text fields it requires a caption or description that specifies
 * scope and minimum content.
 */
function checkOperationalDefinition(field: WalkriField): WalkriCriterion {
  const name: WalkriCriterionName = 'operational-definition'

  if (field.fieldType === 'select' || field.fieldType === 'multiselect') {
    if (!field.options || field.options.length < 2) {
      return {
        name,
        passes: false,
        gap: 'Select/multiselect fields must enumerate at least two options with qualifying and non-qualifying examples.',
        suggestion:
          'Add an options array that includes qualifying examples (what counts) and optionally a non-qualifying note in the caption or description (what does not count).',
      }
    }
    return { name, passes: true, gap: null, suggestion: null }
  }

  if (field.fieldType === 'boolean') {
    // Boolean fields are self-defining in response form but need description to clarify what true/false mean
    if (!field.description || field.description.trim().length < 15) {
      return {
        name,
        passes: false,
        gap: 'Boolean fields require a description that specifies what a true response means versus a false response, including qualifying and non-qualifying examples.',
        suggestion:
          'Add a description specifying: what conditions qualify as true? Which edge cases do not qualify? Include at least one qualifying and one non-qualifying example.',
      }
    }
    return { name, passes: true, gap: null, suggestion: null }
  }

  // For text, textarea, url, number, file: check for operational content in description or caption
  const operationalContent = [field.description ?? '', field.caption ?? ''].join(' ')
  if (operationalContent.trim().length < 30) {
    return {
      name,
      passes: false,
      gap: 'No operational definition found. The field lacks qualifying and non-qualifying examples that constrain interpretation.',
      suggestion:
        'Add a caption or expand the description to include: the unit of measurement or valid response categories, at least one qualifying example, and at least one non-qualifying example.',
    }
  }

  return { name, passes: true, gap: null, suggestion: null }
}

/**
 * Criterion 3 - Response form.
 * The field type must be appropriate for the criterion intent, with a written
 * justification. A URL field when a narrative is needed, or a boolean when
 * nuance is required, is a response form mismatch.
 */
function checkResponseForm(field: WalkriField): WalkriCriterion {
  const name: WalkriCriterionName = 'response-form'

  // Check for obviously mismatched field types
  const desc = (field.description ?? '').toLowerCase()
  const label = field.label.toLowerCase()
  const combined = `${label} ${desc}`

  const measurementKeywords = ['how many', 'count', 'number of', 'quantity', 'total']
  const narrativeKeywords = ['describe', 'explain', 'why', 'how does', 'what is your']
  const urlKeywords = ['link', 'url', 'repository', 'website', 'evidence at']

  if (field.fieldType === 'boolean') {
    const hasNarrativeIntent = narrativeKeywords.some((kw) => combined.includes(kw))
    if (hasNarrativeIntent) {
      return {
        name,
        passes: false,
        gap: 'A boolean field type is used for what appears to be a nuanced narrative question. Binary response cannot capture the required information.',
        suggestion:
          'Change to textarea or select with defined options. Add a justification in the description for why the binary response type is appropriate if the binary is genuinely intended.',
      }
    }
  }

  if (field.fieldType === 'text' || field.fieldType === 'textarea') {
    const hasMeasurementIntent = measurementKeywords.some((kw) => combined.includes(kw))
    if (hasMeasurementIntent) {
      return {
        name,
        passes: false,
        gap: 'A text field is used for what appears to be a numeric measurement. Free text cannot be aggregated or compared.',
        suggestion:
          'Change to a number field type and add unit, counting rule, and boundary conditions to the operational definition.',
      }
    }
    const hasUrlIntent = urlKeywords.some((kw) => combined.includes(kw))
    if (hasUrlIntent) {
      return {
        name,
        passes: false,
        gap: 'A text field is used where a URL field is indicated. URL validation cannot occur on a plain text field.',
        suggestion:
          'Change to a url field type to enable format validation and ensure the evidence form requirement can be satisfied.',
      }
    }
  }

  // Check that a justification exists in the description or caption
  const hasJustification =
    (field.description ?? '').length > 40 || (field.caption ?? '').length > 20
  if (!hasJustification) {
    return {
      name,
      passes: false,
      gap: 'No written justification for why this response type is appropriate for the criterion intent.',
      suggestion:
        'Add to the description or caption an explanation of why this field type is appropriate. Response type is a measurement decision, not a formatting decision.',
    }
  }

  return { name, passes: true, gap: null, suggestion: null }
}

/**
 * Criterion 4 - Evidence form.
 * The field must specify the artifact type and access path required to answer
 * it. This is typically present in the caption or description as a named
 * document type, repository path, or data source.
 */
function checkEvidenceForm(field: WalkriField): WalkriCriterion {
  const name: WalkriCriterionName = 'evidence-form'

  const evidenceKeywords = [
    'url',
    'link',
    'attach',
    'upload',
    'repository',
    'file',
    'document',
    'evidence',
    'provide',
    'submit',
    'artifact',
    'source',
    'access path',
    'license file',
    'public record',
    'on-chain',
    'transaction',
    'published',
  ]

  const combined = [
    field.description ?? '',
    field.caption ?? '',
    field.placeholder ?? '',
  ]
    .join(' ')
    .toLowerCase()

  // URL and file fields have implicit evidence forms if they also have descriptions
  if (field.fieldType === 'url' || field.fieldType === 'file') {
    if ((field.description ?? '').length > 15 || (field.caption ?? '').length > 10) {
      return { name, passes: true, gap: null, suggestion: null }
    }
    return {
      name,
      passes: false,
      gap: 'URL/file field lacks a specification of what artifact should be submitted and where it must be accessible from.',
      suggestion:
        'Add a description or caption specifying the artifact type (e.g., LICENSE file, audit report, on-chain transaction), the required location (public repository root, named registry), and whether the artifact must be accessible without authentication.',
    }
  }

  const hasEvidenceSpecification = evidenceKeywords.some((kw) => combined.includes(kw))
  if (!hasEvidenceSpecification) {
    return {
      name,
      passes: false,
      gap: 'No artifact type or access path specified. The field does not tell the applicant what evidence to produce or where it must be accessible from.',
      suggestion:
        'Add to the caption or description: the specific artifact type required (document, URL, on-chain address, public dataset), the access path (public URL, named registry, attached file), and any authentication or access restrictions that would prevent independent review.',
    }
  }

  return { name, passes: true, gap: null, suggestion: null }
}

/**
 * Criterion 5 - Conformance threshold.
 * For fields referencing external standards, the field must enumerate which
 * components apply and what passage looks like. Detected via keywords
 * referencing standards, certifications, or regulatory requirements.
 */
function checkComplianceThreshold(field: WalkriField): WalkriCriterion {
  const name: WalkriCriterionName = 'conformance-threshold'

  const standardKeywords = [
    'standard',
    'certification',
    'iso',
    'rfc',
    'spec',
    'comply',
    'compliance',
    'requirement',
    'regulation',
    'policy',
    'osi',
    'spdx',
    'approved',
    'accredited',
    'certified',
    'licensed under',
  ]

  const combined = [field.description ?? '', field.caption ?? '', field.label]
    .join(' ')
    .toLowerCase()

  const referencesStandard = standardKeywords.some((kw) => combined.includes(kw))

  if (!referencesStandard) {
    // Criterion is not applicable; fields that do not reference external standards
    // pass this criterion by default.
    return { name, passes: true, gap: null, suggestion: null }
  }

  const thresholdKeywords = [
    'qualifying',
    'non-qualifying',
    'does not qualify',
    'minimum',
    'at least',
    'required component',
    'must include',
    'passage',
    'passes if',
    'satisfies',
  ]

  const hasThreshold = thresholdKeywords.some((kw) => combined.includes(kw))
  if (!hasThreshold) {
    return {
      name,
      passes: false,
      gap: 'This field references an external standard but does not specify which components of that standard apply or what constitutes passage.',
      suggestion:
        'Add a conformance threshold to the caption or description: name the specific standard version, list which components or clauses apply, provide qualifying examples, provide at least one non-qualifying example, and state the minimum threshold for passage.',
    }
  }

  return { name, passes: true, gap: null, suggestion: null }
}

// ---------------------------------------------------------------------------
// Systemic pattern detection
// ---------------------------------------------------------------------------

function detectSystemicPatterns(criteria: WalkriCriterion[]): string[] {
  const patterns: string[] = []
  const failing = criteria.filter((c) => !c.passes).map((c) => c.name)

  if (failing.includes('criterion-intent') && failing.includes('operational-definition')) {
    patterns.push(
      'Label-only field: the field has no written measurement intent and no operational definition. It is a bare label that will produce incomparable free-text responses.',
    )
  }

  if (failing.includes('evidence-form') && failing.includes('conformance-threshold')) {
    patterns.push(
      'Unverifiable standard reference: the field references a standard but specifies neither what evidence satisfies it nor what passage looks like.',
    )
  }

  if (
    failing.includes('criterion-intent') &&
    failing.includes('response-form') &&
    failing.includes('evidence-form')
  ) {
    patterns.push(
      'Three-failure pattern: missing criterion intent, response form justification, and evidence specification. This field will produce reviewer inconsistency, format mismatches, and unverifiable responses.',
    )
  }

  if (failing.length === 0) {
    // No patterns to report for passing fields
  } else if (failing.length === 5) {
    patterns.push(
      'All five criteria fail. This field is a bare label and will not produce usable data. Full specification is required before publication.',
    )
  }

  return patterns
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Audit a field definition against WALKRI's five pre-publication requirements.
 *
 * Returns a WalkriAuditResult with per-criterion assessment and a binary
 * verdict: 'instrument' if all five criteria pass, 'label' if any fail.
 */
export function auditField(field: WalkriField): WalkriAuditResult {
  const criteria: WalkriCriterion[] = [
    checkCriterionIntent(field),
    checkOperationalDefinition(field),
    checkResponseForm(field),
    checkEvidenceForm(field),
    checkComplianceThreshold(field),
  ]

  const verdict: WalkriVerdict = criteria.every((c) => c.passes) ? 'instrument' : 'label'
  const systemicPatterns = detectSystemicPatterns(criteria)

  return { field, criteria, verdict, systemicPatterns }
}
