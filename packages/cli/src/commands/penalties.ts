import { Command } from 'commander';
import chalk from 'chalk';
import {
  getPenalties,
  getPenaltiesByTier,
  calculatePenaltyExposure,
  formatFineAmount,
} from '@eu-ai-act/sdk';
import type { RiskTier } from '@eu-ai-act/sdk';
import { readState } from '../state.js';

const VALID_TIERS = ['prohibited', 'high-risk', 'gpai', 'gpai-systemic', 'limited', 'minimal'];

export const penaltiesCommand = new Command('penalties')
  .description('Show penalty exposure under the EU AI Act (Article 99)')
  .argument('[tier]', 'Risk tier (prohibited, high-risk, gpai, gpai-systemic, limited, minimal)')
  .option('--turnover <amount>', 'Annual global turnover in EUR (for fine calculation)')
  .option('--sme', 'Apply SME/startup reduced fine rules (Art. 99(6))')
  .option('--all', 'Show all penalty tiers regardless of classification')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Display penalty exposure under Article 99 of the EU AI Act.
  Shows applicable fines, violation examples, and organization-specific
  calculations based on turnover and size.

  If no tier is specified, uses the tier from .eu-ai-act.json.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act penalties                        ${chalk.dim('Penalties for classified system')}
  ${chalk.dim('$')} eu-ai-act penalties high-risk               ${chalk.dim('Penalties for high-risk tier')}
  ${chalk.dim('$')} eu-ai-act penalties --turnover 500000000    ${chalk.dim('With turnover-based calculation')}
  ${chalk.dim('$')} eu-ai-act penalties --sme                   ${chalk.dim('With SME reduced fines')}
  ${chalk.dim('$')} eu-ai-act penalties --all                   ${chalk.dim('Show all penalty categories')}`,
  )
  .action((tierArg: string | undefined, opts) => {
    let tier: RiskTier | undefined;

    if (tierArg) {
      if (!VALID_TIERS.includes(tierArg)) {
        console.error(chalk.red(`  Invalid tier: ${tierArg}`));
        console.error(`  Valid tiers: ${VALID_TIERS.join(', ')}`);
        process.exit(1);
      }
      tier = tierArg as RiskTier;
    } else if (!opts.all) {
      const state = readState();
      if (state) {
        tier = state.classification.tier;
      }
    }

    const turnover = opts.turnover ? parseFloat(opts.turnover) : undefined;
    if (turnover != null && (isNaN(turnover) || turnover < 0)) {
      console.error(chalk.red('  Invalid turnover amount. Must be a non-negative number.'));
      process.exit(1);
    }

    const orgType = opts.sme ? 'sme' as const : 'large' as const;

    // Show all penalty tiers overview
    if (opts.all || !tier) {
      const allPenalties = getPenalties();

      if (opts.json) {
        console.log(JSON.stringify(allPenalties, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold('  EU AI Act Penalties — Article 99'));
      console.log(chalk.dim('  ' + '─'.repeat(50)));
      console.log();

      for (const p of allPenalties) {
        console.log(`  ${chalk.bold(p.description)}`);
        console.log(`  Article ${p.article} | Max fine: ${chalk.red.bold(formatFineAmount(p.maxFineEur))} or ${chalk.red.bold(p.maxFineTurnoverPercent + '%')} of global annual turnover`);
        console.log(`  Applies to: ${p.applicableTiers.map((t) => chalk.cyan(t)).join(', ')}`);
        console.log();
      }

      console.log(chalk.dim('  SME/startup reduction: the lower of the two amounts applies (Art. 99(6))'));
      console.log(chalk.dim('  EU institutions: capped at EUR 1,500,000 (Art. 99(7))'));
      console.log();
      console.log(chalk.dim('  This tool does not constitute legal advice.'));
      console.log();
      return;
    }

    // Calculate exposure for specific tier
    const exposure = calculatePenaltyExposure({
      tier,
      annualTurnoverEur: turnover,
      organizationType: orgType,
    });

    if (opts.json) {
      console.log(JSON.stringify(exposure, null, 2));
      return;
    }

    console.log();
    console.log(chalk.bold('  Penalty Exposure Assessment'));
    console.log(chalk.dim('  ' + '─'.repeat(50)));
    console.log();
    console.log(`  Risk Tier:    ${chalk.bold(tier.toUpperCase())}`);
    console.log(`  Org Type:     ${orgType === 'sme' ? 'SME/Startup (reduced fines)' : 'Standard'}`);
    if (turnover != null) {
      console.log(`  Turnover:     EUR ${turnover.toLocaleString('en-US')}`);
    }
    console.log();

    if (exposure.penalties.length === 0) {
      console.log(chalk.green('  No penalty provisions apply for this risk tier.'));
      console.log();
      return;
    }

    console.log(`  ${chalk.red.bold('Maximum exposure: ' + formatFineAmount(exposure.maxExposureEur))}`);
    if (exposure.smeReductionApplied) {
      console.log(chalk.dim('  (SME/startup reduction applied — lower of fixed/turnover amounts)'));
    }
    if (exposure.euInstitutionCapApplied) {
      console.log(chalk.dim('  (EU institution cap applied)'));
    }
    console.log();

    for (const p of exposure.penalties) {
      console.log(`  ${chalk.bold(p.description)}`);
      console.log(`  Art. ${p.article}(${p.paragraph}) | Effective max: ${chalk.red(formatFineAmount(p.effectiveMaxFineEur))}`);
      if (p.maxFineTurnoverEur != null) {
        console.log(chalk.dim(`    Fixed: ${formatFineAmount(p.maxFineFixedEur)} | Turnover-based: ${formatFineAmount(p.maxFineTurnoverEur)}`));
      }
      console.log();

      console.log(chalk.dim('  Example violations:'));
      for (const example of p.violationExamples.slice(0, 3)) {
        console.log(chalk.dim(`    • ${example}`));
      }
      if (p.violationExamples.length > 3) {
        console.log(chalk.dim(`    • ... and ${p.violationExamples.length - 3} more`));
      }
      console.log();
    }

    console.log(chalk.dim('  ' + exposure.summary));
    console.log();
    console.log(chalk.dim('  This tool does not constitute legal advice.'));
    console.log();
  });
