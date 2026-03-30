import { Command } from 'commander';
import chalk from 'chalk';
import { getChecklist, getTimeline, countProgress } from '@eu-ai-act/sdk';
import { readState } from '../state.js';

export const statusCommand = new Command('status')
  .description('Show compliance summary')
  .option('--json', 'Output as JSON')
  .action((opts) => {
    const state = readState();

    if (!state) {
      console.error(chalk.red('No .eu-ai-act.json found.'));
      console.error(chalk.dim('Run `eu-ai-act classify` first to classify your AI system.'));
      process.exit(1);
    }

    const checklist = getChecklist(state.classification.tier);
    const { completed, total, percent } = countProgress(checklist.items, state.checklist);

    const timeline = getTimeline();
    const nextEvent = timeline.find((e) => e.status === 'upcoming' || e.status === 'future');

    if (opts.json) {
      console.log(JSON.stringify({
        system: state.system,
        classification: state.classification,
        progress: { completed, total, percent },
        nextDeadline: nextEvent
          ? { title: nextEvent.title, date: nextEvent.date, daysUntil: nextEvent.daysUntil }
          : null,
      }, null, 2));
      return;
    }

    console.log();
    console.log(`System: ${chalk.bold(state.system.name)} (${state.system.provider})`);
    console.log(`Tier: ${chalk.bold(state.classification.tier.toUpperCase())}${state.classification.subTier ? ` (${state.classification.subTier})` : ''}`);
    console.log(`Classified: ${state.system.classifiedAt.split('T')[0]}`);
    console.log();
    console.log(`Compliance: ${completed}/${total} items (${percent}%)`);

    // Progress bar
    const barWidth = 20;
    const filled = Math.round((percent / 100) * barWidth);
    const empty = barWidth - filled;
    const bar = chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
    console.log(`  ${bar} ${percent}%`);

    if (nextEvent) {
      console.log();
      console.log(`Next deadline: ${nextEvent.title}`);
      console.log(`  ${nextEvent.date} (${nextEvent.daysUntil} days)`);
    }

    console.log();
    console.log(chalk.dim(`Run \`eu-ai-act checklist ${state.classification.tier} --track\` to continue.`));
    console.log(chalk.dim('This tool does not constitute legal advice.'));
  });
