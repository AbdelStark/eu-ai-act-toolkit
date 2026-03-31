import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getChecklist, countProgress, RISK_TIERS } from '@eu-ai-act/sdk';
import type { RiskTier } from '@eu-ai-act/sdk';
import { readState } from '../state.js';

export const checklistCommand = new Command('checklist')
  .description('Display the compliance checklist for a risk tier')
  .argument('<tier>', `Risk tier: ${RISK_TIERS.join(', ')}`)
  .option('--track', 'Enter interactive tracking mode')
  .option('--filter <value>', 'Filter: complete, incomplete, or article number (e.g., 9)')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Display all compliance obligations for a given EU AI Act risk tier.
  Each item shows the relevant article number and requirement text.
  Use --filter to narrow results and --json for scripted access.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act checklist high-risk                  ${chalk.dim('View all high-risk items')}
  ${chalk.dim('$')} eu-ai-act checklist gpai --filter incomplete    ${chalk.dim('Show only incomplete items')}
  ${chalk.dim('$')} eu-ai-act checklist limited --json              ${chalk.dim('JSON output')}
  ${chalk.dim('$')} eu-ai-act checklist high-risk --filter 9        ${chalk.dim('Show Article 9 items only')}`,
  )
  .action(async (tierArg: string, opts) => {
    if (!RISK_TIERS.includes(tierArg as RiskTier)) {
      console.error();
      console.error(chalk.red(`  Error: Invalid tier "${tierArg}"`));
      console.error();
      console.error(`  Valid tiers: ${RISK_TIERS.map((t) => chalk.cyan(t)).join(', ')}`);
      console.error();
      console.error(chalk.dim(`  Run ${chalk.white('eu-ai-act classify')} to determine your tier.`));
      console.error();
      process.exit(1);
    }

    const tier = tierArg as RiskTier;
    const checklist = getChecklist(tier);
    const state = readState();
    const progress = state?.checklist ?? {};

    let items = checklist.items;

    // Apply filter
    if (opts.filter) {
      const filter = opts.filter as string;
      if (filter === 'complete') {
        items = items.filter((item) => progress[item.id]?.checked);
      } else if (filter === 'incomplete') {
        items = items.filter((item) => !progress[item.id]?.checked);
      } else {
        const articleNum = parseInt(filter, 10);
        if (!isNaN(articleNum)) {
          items = items.filter((item) => item.article === articleNum);
        } else {
          console.error();
          console.error(chalk.red(`  Error: Invalid filter "${filter}"`));
          console.error(chalk.dim('  Use: complete, incomplete, or an article number'));
          console.error();
          process.exit(1);
        }
      }
    }

    const { completed, total, percent } = countProgress(checklist.items, progress);

    if (opts.json) {
      console.log(JSON.stringify({
        tier,
        items: items.map((item) => ({
          ...item,
          checked: progress[item.id]?.checked ?? false,
          evidence: progress[item.id]?.evidence ?? null,
        })),
        progress: { completed, total, percent },
      }, null, 2));
      return;
    }

    console.log();
    console.log(chalk.bold(`  📋 ${tier.toUpperCase()} Compliance Checklist`));
    console.log(chalk.dim('  ' + '─'.repeat(40)));

    // Progress bar
    const barWidth = 20;
    const filled = Math.round((percent / 100) * barWidth);
    const empty = barWidth - filled;
    const bar = chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
    console.log(`  ${bar} ${completed}/${total} complete (${percent}%)`);
    console.log();

    if (items.length === 0) {
      console.log(chalk.dim('  No items match the current filter.'));
      console.log();
      return;
    }

    const table = new Table({
      head: [
        chalk.dim(''),
        chalk.bold('ID'),
        chalk.bold('Article'),
        chalk.bold('Requirement'),
      ],
      colWidths: [4, 25, 10, 60],
      wordWrap: true,
      style: {
        head: [],
        border: ['dim'],
      },
    });

    for (const item of items) {
      const checked = progress[item.id]?.checked ?? false;
      const mark = checked ? chalk.green('✓') : chalk.dim('○');
      const text = checked ? chalk.dim(item.text) : item.text;

      table.push([mark, item.id, `Art. ${item.article}`, text]);
    }

    console.log(table.toString());
    console.log();
    console.log(chalk.dim('  This tool does not constitute legal advice.'));
    console.log();
  });
