import { Command } from 'commander';
import chalk from 'chalk';
import {
  analyzeGaps,
  classify,
  getReadinessScore,
  formatFineAmount,
} from '@eu-ai-act/sdk';
import type { RiskTier, ClassificationResult } from '@eu-ai-act/sdk';
import { readState } from '../state.js';

const VALID_TIERS = ['prohibited', 'high-risk', 'gpai', 'gpai-systemic', 'limited', 'minimal'];

const PRIORITY_COLORS: Record<string, (s: string) => string> = {
  critical: chalk.red.bold,
  high: chalk.hex('#ea580c'),
  medium: chalk.yellow,
  low: chalk.dim,
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

export const gapsCommand = new Command('gaps')
  .description('Analyze compliance gaps and get prioritized remediation plan')
  .argument('[tier]', 'Risk tier (auto-detected from .eu-ai-act.json if omitted)')
  .option('--turnover <amount>', 'Annual global turnover in EUR (for fine exposure)')
  .option('--sme', 'Apply SME/startup rules')
  .option('--top <n>', 'Show only top N gaps', '10')
  .option('--category <cat>', 'Filter gaps by obligation category')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Perform a compliance gap analysis for your AI system. Identifies
  outstanding obligations, prioritizes by deadline urgency, and
  estimates penalty exposure.

  Uses classification from .eu-ai-act.json if available. Pass a
  tier argument to analyze a specific tier without a state file.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act gaps                              ${chalk.dim('Gaps for classified system')}
  ${chalk.dim('$')} eu-ai-act gaps high-risk                     ${chalk.dim('Gaps for high-risk tier')}
  ${chalk.dim('$')} eu-ai-act gaps --turnover 500000000          ${chalk.dim('With fine exposure calculation')}
  ${chalk.dim('$')} eu-ai-act gaps --top 5                       ${chalk.dim('Show top 5 gaps only')}
  ${chalk.dim('$')} eu-ai-act gaps --category risk-management    ${chalk.dim('Filter by category')}`,
  )
  .action((tierArg: string | undefined, opts) => {
    let classification: ClassificationResult | undefined;
    let progress: Record<string, import('@eu-ai-act/sdk').ChecklistProgress> = {};

    // Try to get classification from state file
    const state = readState();
    if (state) {
      // Build a minimal ClassificationResult from state
      classification = buildClassificationFromState(state.classification.tier);
      progress = state.checklist;
    }

    // Override with explicit tier argument
    if (tierArg) {
      if (!VALID_TIERS.includes(tierArg)) {
        console.error(chalk.red(`  Invalid tier: ${tierArg}`));
        console.error(`  Valid tiers: ${VALID_TIERS.join(', ')}`);
        process.exit(1);
      }
      classification = buildClassificationFromState(tierArg as RiskTier);
      if (!state) progress = {};
    }

    if (!classification) {
      console.error();
      console.error(chalk.red('  Error: No tier specified and no .eu-ai-act.json found.'));
      console.error();
      console.error(`  Run ${chalk.cyan('eu-ai-act classify')} first, or specify a tier:`);
      console.error(`  ${chalk.cyan('eu-ai-act gaps high-risk')}`);
      console.error();
      process.exit(1);
    }

    const turnover = opts.turnover ? parseFloat(opts.turnover) : undefined;
    if (turnover != null && (isNaN(turnover) || turnover < 0)) {
      console.error(chalk.red('  Invalid turnover amount.'));
      process.exit(1);
    }

    const orgType = opts.sme ? 'sme' as const : 'large' as const;
    const topN = parseInt(opts.top, 10) || 10;

    const result = analyzeGaps({
      classification,
      progress,
      organizationType: orgType,
      annualTurnoverEur: turnover,
    });

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // Header
    console.log();
    console.log(chalk.bold('  Compliance Gap Analysis'));
    console.log(chalk.dim('  ' + '─'.repeat(50)));
    console.log();

    // Readiness overview
    const barWidth = 30;
    const filled = Math.round((result.readinessPercent / 100) * barWidth);
    const empty = barWidth - filled;
    const barColor = result.readinessPercent >= 80 ? chalk.green
      : result.readinessPercent >= 50 ? chalk.yellow
      : result.readinessPercent > 0 ? chalk.hex('#ea580c')
      : chalk.red;
    const bar = barColor('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));

    console.log(`  Tier:       ${chalk.bold(result.tier.toUpperCase())}`);
    console.log(`  Readiness:  ${bar} ${result.readinessPercent}%`);
    console.log(`  Progress:   ${result.completedItems}/${result.totalItems} items complete`);
    console.log(`  Gaps:       ${result.outstandingGaps} outstanding ${result.criticalGaps > 0 ? chalk.red(`(${result.criticalGaps} critical)`) : ''}`);
    console.log(`  Deadline:   ${result.enforcementDate} (${formatDeadline(result.daysUntilDeadline)})`);

    if (result.maxFineExposureEur > 0) {
      console.log(`  Max fine:   ${chalk.red(formatFineAmount(result.maxFineExposureEur))}`);
    }
    console.log();

    // Assessment
    console.log(chalk.bold('  Assessment'));
    console.log(`  ${result.assessment}`);
    console.log();

    // Category summary
    if (result.categorySummary.length > 0) {
      console.log(chalk.bold('  Category Summary'));
      console.log(chalk.dim('  ' + '─'.repeat(50)));

      for (const cat of result.categorySummary) {
        const catPercent = cat.completionPercent;
        const catColor = catPercent === 100 ? chalk.green
          : catPercent >= 50 ? chalk.yellow
          : chalk.red;
        const icon = cat.gaps > 0 ? PRIORITY_ICONS[cat.highestPriority] ?? '⚪' : '✅';
        console.log(`  ${icon} ${formatCategoryName(cat.category).padEnd(25)} ${catColor(`${catPercent}%`.padStart(4))} (${cat.completedItems}/${cat.totalItems})`);
      }
      console.log();
    }

    // Top gaps
    let displayGaps = result.gaps;
    if (opts.category) {
      displayGaps = displayGaps.filter((g) => g.item.category === opts.category);
    }

    if (displayGaps.length > 0) {
      console.log(chalk.bold(`  Top ${Math.min(topN, displayGaps.length)} Priority Gaps`));
      console.log(chalk.dim('  ' + '─'.repeat(50)));

      for (const gap of displayGaps.slice(0, topN)) {
        const colorFn = PRIORITY_COLORS[gap.priority] ?? chalk.white;
        const icon = PRIORITY_ICONS[gap.priority] ?? '⚪';
        console.log(`  ${icon} ${colorFn(`[${gap.priority.toUpperCase()}]`)} Art. ${gap.item.article}: ${gap.item.text}`);
        console.log(`     ${chalk.dim(gap.urgencyLabel)}`);
        if (gap.fineExposureEur > 0) {
          console.log(`     ${chalk.dim(`Fine exposure: ${formatFineAmount(gap.fineExposureEur)}`)}`);
        }
      }

      if (displayGaps.length > topN) {
        console.log(chalk.dim(`\n  ... and ${displayGaps.length - topN} more gaps`));
      }
      console.log();
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      console.log(chalk.bold('  Recommendations'));
      console.log(chalk.dim('  ' + '─'.repeat(50)));
      for (const rec of result.recommendations) {
        console.log(`  → ${rec}`);
      }
      console.log();
    }

    console.log(chalk.dim('  This tool does not constitute legal advice.'));
    console.log();
  });

function buildClassificationFromState(tier: RiskTier): ClassificationResult {
  // Use classify with a synthetic input to get proper enforcement dates
  // and obligations. This is a shortcut — we just need the result shape.
  const enforcementDates: Record<RiskTier, string> = {
    prohibited: '2025-02-02',
    'high-risk': '2026-08-02',
    gpai: '2025-08-02',
    'gpai-systemic': '2025-08-02',
    limited: '2026-08-02',
    minimal: '2026-08-02',
  };

  return {
    tier,
    subTier: null,
    articles: [],
    obligations: [],
    openSourceExemption: false,
    conformityAssessment: 'none',
    enforcementDate: enforcementDates[tier],
    reasoning: [],
  };
}

function formatDeadline(days: number): string {
  if (days < 0) return chalk.red(`${Math.abs(days)} days overdue`);
  if (days === 0) return chalk.red('TODAY');
  if (days <= 30) return chalk.red(`${days} days`);
  if (days <= 90) return chalk.yellow(`${days} days`);
  return chalk.dim(`${days} days`);
}

function formatCategoryName(cat: string): string {
  return cat
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
