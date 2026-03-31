import type {
  ClassificationResult,
  Checklist,
  ChecklistProgress,
  RiskTier,
} from '../data/types.js';
import { buildReasoning, formatTierSummary } from '../classifier/reasoning.js';
import { countProgress } from '../checklists/scoring.js';
import { getArticlesByTier } from '../articles/lookup.js';
import { calculatePenaltyExposure, formatFineAmount } from '../penalties/calculator.js';
import type { OrganizationType } from '../penalties/calculator.js';
import { analyzeGaps, formatCategoryName } from '../gap-analysis/analyzer.js';

/**
 * Options for compliance report generation.
 */
export interface ReportOptions {
  /** Name of the AI system being assessed. */
  systemName: string;

  /** Organization providing or deploying the AI system. */
  provider: string;

  /** Description of the system's intended purpose. */
  intendedPurpose: string;

  /** Report generation date in ISO 8601 format. Defaults to today. */
  date?: string;

  /** User's checklist progress tracking state. If omitted, no progress shown. */
  progress?: Record<string, ChecklistProgress>;

  /** Whether to include the full article reference appendix. Defaults to true. */
  includeArticleAppendix?: boolean;

  /** Whether to include penalty exposure section. Defaults to true. */
  includePenalties?: boolean;

  /** Whether to include gap analysis section. Defaults to true. */
  includeGapAnalysis?: boolean;

  /** Organization type for penalty calculation. Defaults to 'large'. */
  organizationType?: OrganizationType;

  /** Annual turnover in EUR for penalty calculation. */
  annualTurnoverEur?: number;
}

/** Tier display labels for report headings. */
const TIER_LABELS: Record<RiskTier, string> = {
  prohibited: 'Prohibited',
  'high-risk': 'High-Risk',
  gpai: 'General-Purpose AI (GPAI)',
  'gpai-systemic': 'GPAI with Systemic Risk',
  limited: 'Limited Risk',
  minimal: 'Minimal Risk',
};

/**
 * Generate a comprehensive compliance report as Markdown.
 *
 * Combines classification results, checklist status, applicable articles,
 * and enforcement timeline into a single document suitable for review,
 * export, or printing. Includes a legal disclaimer.
 *
 * @param classification - The classification result from `classify()`
 * @param checklist - The checklist from `getChecklist(tier)`
 * @param options - Report configuration and system details
 * @returns Complete Markdown compliance report
 * @throws {TypeError} If required options are missing
 *
 * @example
 * ```typescript
 * const report = generateReport(classification, checklist, {
 *   systemName: 'Hiring Screener',
 *   provider: 'Acme Corp',
 *   intendedPurpose: 'Automated resume screening',
 * });
 * ```
 */
export function generateReport(
  classification: ClassificationResult,
  checklist: Checklist,
  options: ReportOptions,
): string {
  validateReportOptions(options);

  const date = options.date ?? new Date().toISOString().split('T')[0]!;
  const includeAppendix = options.includeArticleAppendix !== false;
  const includePenalties = options.includePenalties !== false;
  const includeGapAnalysis = options.includeGapAnalysis !== false;

  const sections: string[] = [];
  let sectionNum = 0;

  // Title and metadata
  sections.push(renderHeader(classification, options, date));

  // Classification summary
  sections.push(renderNumberedSection(++sectionNum, 'Risk Classification', renderClassificationBody(classification)));

  // Obligations overview
  sections.push(renderNumberedSection(++sectionNum, 'Applicable Obligations', renderObligationsBody(classification)));

  // Checklist status
  sections.push(renderNumberedSection(++sectionNum, 'Compliance Checklist', renderChecklistBody(checklist, options.progress)));

  // Gap analysis
  if (includeGapAnalysis) {
    sections.push(renderNumberedSection(++sectionNum, 'Compliance Gap Analysis', renderGapAnalysisBody(classification, options)));
  }

  // Penalty exposure
  if (includePenalties) {
    sections.push(renderNumberedSection(++sectionNum, renderPenaltyTitle(classification), renderPenaltyBody(classification, options)));
  }

  // Enforcement timeline
  sections.push(renderNumberedSection(++sectionNum, 'Enforcement Timeline', renderEnforcementBody(classification)));

  // Article reference appendix
  if (includeAppendix) {
    sections.push(renderArticleAppendix(classification.tier));
  }

  // Legal disclaimer
  sections.push(renderDisclaimer());

  return sections.join('\n');
}

function validateReportOptions(options: ReportOptions): void {
  if (options == null || typeof options !== 'object') {
    throw new TypeError('generateReport() requires a ReportOptions object');
  }
  if (typeof options.systemName !== 'string' || options.systemName.trim().length === 0) {
    throw new TypeError('ReportOptions.systemName is required and must be a non-empty string');
  }
  if (typeof options.provider !== 'string' || options.provider.trim().length === 0) {
    throw new TypeError('ReportOptions.provider is required and must be a non-empty string');
  }
  if (typeof options.intendedPurpose !== 'string' || options.intendedPurpose.trim().length === 0) {
    throw new TypeError('ReportOptions.intendedPurpose is required and must be a non-empty string');
  }
}

function renderHeader(
  classification: ClassificationResult,
  options: ReportOptions,
  date: string,
): string {
  return `# EU AI Act Compliance Report

**System**: ${options.systemName}
**Provider**: ${options.provider}
**Intended Purpose**: ${options.intendedPurpose}
**Classification**: ${TIER_LABELS[classification.tier]}
**Date**: ${date}
**Enforcement Date**: ${classification.enforcementDate}

---
`;
}

function renderNumberedSection(num: number, title: string, body: string): string {
  return `## ${num}. ${title}\n\n${body}`;
}

function renderClassificationBody(classification: ClassificationResult): string {
  const summary = formatTierSummary(classification);
  const reasoning = buildReasoning(classification);

  let section = `**Result**: ${summary}

**Conformity Assessment**: ${formatConformity(classification.conformityAssessment)}
`;

  if (classification.openSourceExemption) {
    section += '\n**Open-Source Exemption**: Reduced obligations apply under Article 53.\n';
  }

  section += `
### Classification Reasoning

${reasoning}
`;

  return section;
}

function formatConformity(assessment: string): string {
  switch (assessment) {
    case 'self': return 'Self-assessment (internal control procedure, Annex VI)';
    case 'third-party': return 'Third-party assessment by a notified body (Annex VII)';
    case 'none': return 'No conformity assessment required';
    default: return assessment;
  }
}

function renderObligationsBody(classification: ClassificationResult): string {
  if (classification.obligations.length === 0) {
    return `No specific obligations apply for this risk tier under the EU AI Act.
`;
  }

  const lines = classification.obligations.map((o, i) =>
    `${i + 1}. **${o.title}** (Article ${o.article})\n   ${o.description}`,
  );

  return `The following obligations apply under Regulation (EU) 2024/1689:

${lines.join('\n\n')}

**Applicable Articles**: ${classification.articles.join(', ')}
`;
}

function renderChecklistBody(
  checklist: Checklist,
  progress?: Record<string, ChecklistProgress>,
): string {
  if (checklist.items.length === 0) {
    return `No checklist items for this risk tier.
`;
  }

  const prog = progress ?? {};
  const { completed, total, percent } = countProgress(checklist.items, prog);

  // Group items by category
  const grouped = new Map<string, typeof checklist.items>();
  for (const item of checklist.items) {
    const existing = grouped.get(item.category) ?? [];
    existing.push(item);
    grouped.set(item.category, existing);
  }

  let section = `**Progress**: ${completed}/${total} items complete (${percent}%)

`;

  for (const [category, items] of grouped) {
    section += `### ${formatCategoryName(category)}\n\n`;
    for (const item of items) {
      const checked = prog[item.id]?.checked === true;
      const mark = checked ? 'x' : ' ';
      const required = item.required ? '' : ' *(optional)*';
      section += `- [${mark}] **Art. ${item.article}${item.paragraph ? `(${item.paragraph})` : ''}**: ${item.text}${required}\n`;

      if (checked && prog[item.id]?.evidence) {
        section += `  - Evidence: ${prog[item.id]!.evidence}\n`;
      }
    }
    section += '\n';
  }

  return section;
}


function renderEnforcementBody(classification: ClassificationResult): string {
  return `**Enforcement Date**: ${classification.enforcementDate}

The obligations for ${TIER_LABELS[classification.tier]} AI systems become enforceable on **${classification.enforcementDate}**. Providers and deployers must ensure full compliance by this date.

Key enforcement milestones under the EU AI Act:
- **2 February 2025**: Prohibited AI practices (Article 5) — enforceable
- **2 August 2025**: GPAI model obligations (Articles 51-55) — enforceable
- **2 August 2026**: High-risk, limited risk, and minimal risk obligations — enforceable
`;
}

function renderArticleAppendix(tier: RiskTier): string {
  const articles = getArticlesByTier(tier);

  if (articles.length === 0) return '';

  let section = `## Appendix: Applicable Article References

| Article | Title | EUR-Lex |
|---------|-------|---------|
`;

  for (const art of articles) {
    const link = art.url ? `[Link](${art.url})` : '—';
    section += `| Art. ${art.number} | ${art.title} | ${link} |\n`;
  }

  section += '\n';
  return section;
}

function renderGapAnalysisBody(
  classification: ClassificationResult,
  options: ReportOptions,
): string {
  const result = analyzeGaps({
    classification,
    progress: options.progress,
    organizationType: options.organizationType,
    annualTurnoverEur: options.annualTurnoverEur,
  });

  let section = `**Readiness**: ${result.readinessPercent}% (${result.completedItems}/${result.totalItems} items complete)
**Outstanding Gaps**: ${result.outstandingGaps}${result.criticalGaps > 0 ? ` (${result.criticalGaps} critical)` : ''}
**Deadline**: ${result.enforcementDate} (${result.daysUntilDeadline} days ${result.daysUntilDeadline < 0 ? 'overdue' : 'remaining'})

### Assessment

${result.assessment}

`;

  if (result.categorySummary.length > 0) {
    section += `### Category Readiness

| Category | Complete | Total | Progress |
|----------|----------|-------|----------|
`;
    for (const cat of result.categorySummary) {
      section += `| ${formatCategoryName(cat.category)} | ${cat.completedItems} | ${cat.totalItems} | ${cat.completionPercent}% |\n`;
    }
    section += '\n';
  }

  if (result.recommendations.length > 0) {
    section += '### Recommendations\n\n';
    for (const rec of result.recommendations) {
      section += `- ${rec}\n`;
    }
    section += '\n';
  }

  return section;
}

function renderPenaltyTitle(classification: ClassificationResult): string {
  const exposure = calculatePenaltyExposure({ tier: classification.tier });
  return exposure.penalties.length === 0 ? 'Penalty Exposure' : 'Penalty Exposure (Article 99)';
}

function renderPenaltyBody(
  classification: ClassificationResult,
  options: ReportOptions,
): string {
  const exposure = calculatePenaltyExposure({
    tier: classification.tier,
    organizationType: options.organizationType,
    annualTurnoverEur: options.annualTurnoverEur,
  });

  if (exposure.penalties.length === 0) {
    return `No specific penalty provisions apply for ${TIER_LABELS[classification.tier]} AI systems.
`;
  }

  let section = `**Maximum Exposure**: ${formatFineAmount(exposure.maxExposureEur)}
`;

  if (exposure.smeReductionApplied) {
    section += '**Note**: SME/startup reduced fines applied (Art. 99(6)).\n';
  }
  if (exposure.euInstitutionCapApplied) {
    section += '**Note**: EU institution cap applied (Art. 99(7)).\n';
  }

  section += '\n| Infringement | Article | Maximum Fine |\n|---|---|---|\n';
  for (const p of exposure.penalties) {
    section += `| ${p.description} | Art. ${p.article}(${p.paragraph}) | ${formatFineAmount(p.effectiveMaxFineEur)} |\n`;
  }

  section += `\n${exposure.summary}\n\n`;

  return section;
}

function renderDisclaimer(): string {
  return `---

**DISCLAIMER**: This report is generated by the EU AI Act Compliance Toolkit and does not constitute legal advice. The information provided is for general guidance purposes only. Organizations should consult qualified legal counsel for compliance decisions regarding Regulation (EU) 2024/1689.

*Generated by EU AI Act Compliance Toolkit — https://github.com/AbdelStark/eu-ai-act-toolkit*
`;
}
