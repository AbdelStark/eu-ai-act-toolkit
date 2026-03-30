import type { TemplateName, TemplateInput } from '../data/types.js';
import { TEMPLATE_NAMES } from '../data/types.js';

/**
 * Required fields per template type (beyond the base fields).
 */
const TEMPLATE_SCHEMAS: Record<TemplateName, string[]> = {
  'technical-documentation': [],
  'risk-management-system': [],
  'data-governance': [],
  'human-oversight-plan': [],
  'monitoring-plan': [],
  'declaration-of-conformity': [],
};

/**
 * Validate template input against the template's schema.
 *
 * @param name - Template type
 * @param input - Template input to validate
 * @throws {TypeError} If required fields are missing or invalid
 * @throws {RangeError} If template name is invalid
 */
export function validateTemplateInput(name: TemplateName, input: TemplateInput): void {
  if (!TEMPLATE_NAMES.includes(name)) {
    throw new RangeError(
      `Invalid template name: '${name}'. Must be one of: ${TEMPLATE_NAMES.join(', ')}`,
    );
  }

  if (!input.systemName || typeof input.systemName !== 'string') {
    throw new TypeError('TemplateInput.systemName is required and must be a non-empty string');
  }

  if (!input.provider || typeof input.provider !== 'string') {
    throw new TypeError('TemplateInput.provider is required and must be a non-empty string');
  }

  if (!input.intendedPurpose || typeof input.intendedPurpose !== 'string') {
    throw new TypeError('TemplateInput.intendedPurpose is required and must be a non-empty string');
  }

  const extraRequired = TEMPLATE_SCHEMAS[name];
  for (const field of extraRequired) {
    if (!input[field]) {
      throw new TypeError(`TemplateInput.${field} is required for template '${name}'`);
    }
  }
}
