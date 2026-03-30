import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getChecklist, countProgress, RISK_TIERS } from '@eu-ai-act/sdk';
import type { RiskTier, ChecklistProgress } from '@eu-ai-act/sdk';
import { readState, writeState, findStateFile } from '../state.js';
import { readFileSync } from 'node:fs';

export const checklistCommand = new Command('checklist')
  .description('Display the compliance checklist for a risk tier')
  .argument('<tier>', 'Risk tier (prohibited, high-risk, gpai, gpai-systemic, limited, minimal)')
  .option('--track', 'Enter interactive tracking mode')
  .option('--filter <value>', 'Filter by article number or status (complete/incomplete)')
  .option('--json', 'Output as JSON')
  .action(async (tierArg: string, opts) => {
    if (!RISK_TIERS.includes(tierArg as RiskTier)) {
      console.error(chalk.red(`Invalid tier: ${tierArg}. Must be one of: ${RISK_TIERS.join(', ')}`));
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
    console.log(chalk.bold(`${tier.toUpperCase()} Compliance Checklist`));
    console.log(chalk.dim(`${completed}/${total} items complete (${percent}%)`));
    console.log();

    const table = new Table({
      head: ['', 'ID', 'Article', 'Requirement'],
      colWidths: [4, 25, 10, 60],
      wordWrap: true,
    });

    for (const item of items) {
      const checked = progress[item.id]?.checked ?? false;
      const mark = checked ? chalk.green('✓') : chalk.dim('○');
      const text = checked ? chalk.dim(item.text) : item.text;

      table.push([mark, item.id, `Art. ${item.article}`, text]);
    }

    console.log(table.toString());
    console.log();
    console.log(chalk.dim('This tool does not constitute legal advice.'));
  });
