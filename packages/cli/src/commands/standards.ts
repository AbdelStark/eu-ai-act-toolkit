import { Command } from 'commander';
import chalk from 'chalk';
import {
  getStandards,
  getStandardsByTier,
  getStandardsByArticle,
  getStandardsMapping,
} from '@eu-ai-act/sdk';
import type { RiskTier } from '@eu-ai-act/sdk';
import { readState } from '../state.js';

const VALID_TIERS = ['prohibited', 'high-risk', 'gpai', 'gpai-systemic', 'limited', 'minimal'];

const STATUS_ICONS: Record<string, string> = {
  published: '✅',
  'in-development': '🔄',
  draft: '📝',
  withdrawn: '❌',
};

export const standardsCommand = new Command('standards')
  .description('Show harmonised standards mapped to EU AI Act requirements')
  .argument('[tier]', 'Filter by risk tier')
  .option('--article <number>', 'Filter by article number')
  .option('--mapping', 'Show category-to-standards compliance matrix')
  .option('--published', 'Show only published standards')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Display harmonised standards (ISO/IEC, CEN/CENELEC JTC 21) mapped
  to EU AI Act requirements. Shows which standards support compliance
  with specific articles and obligation categories.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act standards                   ${chalk.dim('All standards')}
  ${chalk.dim('$')} eu-ai-act standards high-risk          ${chalk.dim('Standards for high-risk systems')}
  ${chalk.dim('$')} eu-ai-act standards --article 9        ${chalk.dim('Standards for Article 9')}
  ${chalk.dim('$')} eu-ai-act standards --mapping          ${chalk.dim('Compliance matrix by category')}
  ${chalk.dim('$')} eu-ai-act standards --published        ${chalk.dim('Only published standards')}`,
  )
  .action((tierArg: string | undefined, opts) => {
    // Compliance matrix mode
    if (opts.mapping) {
      let tier: RiskTier | undefined;
      if (tierArg) {
        if (!VALID_TIERS.includes(tierArg)) {
          console.error(chalk.red(`  Invalid tier: ${tierArg}`));
          process.exit(1);
        }
        tier = tierArg as RiskTier;
      } else {
        const state = readState();
        if (state) tier = state.classification.tier;
      }

      const mapping = getStandardsMapping(tier);

      if (opts.json) {
        console.log(JSON.stringify(mapping, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold('  Standards Compliance Matrix'));
      if (tier) console.log(chalk.dim(`  Filtered for: ${tier.toUpperCase()}`));
      console.log(chalk.dim('  ' + '─'.repeat(50)));
      console.log();

      for (const entry of mapping) {
        const catName = formatCategoryName(entry.category);
        console.log(`  ${chalk.bold(catName)} (${entry.publishedCount} published, ${entry.inDevelopmentCount} in development)`);
        for (const std of entry.standards) {
          const icon = STATUS_ICONS[std.status] ?? '⚪';
          console.log(`    ${icon} ${chalk.cyan(std.name)} — ${std.title}`);
        }
        console.log();
      }

      console.log(chalk.dim('  This tool does not constitute legal advice.'));
      console.log();
      return;
    }

    // Article filter
    if (opts.article) {
      const articleNum = parseInt(opts.article, 10);
      if (isNaN(articleNum) || articleNum < 1) {
        console.error(chalk.red('  Invalid article number.'));
        process.exit(1);
      }

      const standards = getStandardsByArticle(articleNum);

      if (opts.json) {
        console.log(JSON.stringify(standards, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold(`  Standards for Article ${articleNum}`));
      console.log(chalk.dim('  ' + '─'.repeat(50)));
      console.log();

      if (standards.length === 0) {
        console.log(chalk.dim('  No standards mapped to this article.'));
      } else {
        for (const std of standards) {
          renderStandard(std);
        }
      }

      console.log(chalk.dim('  This tool does not constitute legal advice.'));
      console.log();
      return;
    }

    // Default: list all (or filtered by tier)
    let standards;
    let tierLabel = '';

    if (tierArg) {
      if (!VALID_TIERS.includes(tierArg)) {
        console.error(chalk.red(`  Invalid tier: ${tierArg}`));
        process.exit(1);
      }
      standards = getStandardsByTier(tierArg as RiskTier);
      tierLabel = ` for ${tierArg.toUpperCase()}`;
    } else {
      standards = getStandards();
    }

    if (opts.published) {
      standards = standards.filter((s) => s.status === 'published');
    }

    if (opts.json) {
      console.log(JSON.stringify(standards, null, 2));
      return;
    }

    console.log();
    console.log(chalk.bold(`  Harmonised Standards${tierLabel}`));
    console.log(chalk.dim('  ' + '─'.repeat(50)));
    console.log();

    if (standards.length === 0) {
      console.log(chalk.dim('  No standards found for this filter.'));
    } else {
      for (const std of standards) {
        renderStandard(std);
      }
      console.log(chalk.dim(`  ${standards.length} standard${standards.length !== 1 ? 's' : ''} total`));
    }

    console.log();
    console.log(chalk.dim('  This tool does not constitute legal advice.'));
    console.log();
  });

function renderStandard(std: { id: string; name: string; title: string; organization: string; status: string; description: string; applicableArticles: number[]; url: string | null }): void {
  const icon = STATUS_ICONS[std.status] ?? '⚪';
  const statusLabel = std.status === 'published'
    ? chalk.green('Published')
    : std.status === 'in-development'
    ? chalk.yellow('In Development')
    : std.status;

  console.log(`  ${icon} ${chalk.bold(std.name)}`);
  console.log(`     ${std.title}`);
  console.log(`     ${chalk.dim(std.organization)} | ${statusLabel}`);
  console.log(`     Articles: ${std.applicableArticles.map((a) => `Art. ${a}`).join(', ')}`);
  if (std.url) {
    console.log(`     ${chalk.dim(std.url)}`);
  }
  console.log();
}

function formatCategoryName(cat: string): string {
  return cat
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
