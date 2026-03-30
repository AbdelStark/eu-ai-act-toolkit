import { Command } from 'commander';
import chalk from 'chalk';
import { getChecklist, getTimeline, countProgress } from '@eu-ai-act/sdk';
import { readState } from '../state.js';

const TIER_COLORS: Record<string, (s: string) => string> = {
  prohibited: chalk.red,
  'high-risk': chalk.hex('#ea580c'),
  gpai: chalk.yellow,
  'gpai-systemic': chalk.hex('#c2410c'),
  limited: chalk.blue,
  minimal: chalk.green,
};

export const statusCommand = new Command('status')
  .description('Show compliance summary for your classified AI system')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Show a summary of your AI system's classification and compliance
  progress. Reads from .eu-ai-act.json in the current directory.
  Run "eu-ai-act classify" first to create the state file.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act status          ${chalk.dim('Show compliance dashboard')}
  ${chalk.dim('$')} eu-ai-act status --json    ${chalk.dim('JSON output for scripting')}`,
  )
  .action((opts) => {
    const state = readState();

    if (!state) {
      console.error();
      console.error(chalk.red('  Error: No .eu-ai-act.json found in current directory tree.'));
      console.error();
      console.error(`  Run ${chalk.cyan('eu-ai-act classify')} first to classify your AI system.`);
      console.error();
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

    const colorFn = TIER_COLORS[state.classification.tier] ?? chalk.white;

    console.log();
    console.log(chalk.bold('  📊 Compliance Status'));
    console.log(chalk.dim('  ' + '─'.repeat(40)));
    console.log();
    console.log(`  System:     ${chalk.bold(state.system.name)} ${chalk.dim('(' + state.system.provider + ')')}`);
    console.log(`  Tier:       ${colorFn(chalk.bold(state.classification.tier.toUpperCase()))}${state.classification.subTier ? chalk.dim(` (${state.classification.subTier})`) : ''}`);
    console.log(`  Classified: ${state.system.classifiedAt.split('T')[0]}`);
    console.log();

    // Progress bar
    const barWidth = 30;
    const filled = Math.round((percent / 100) * barWidth);
    const empty = barWidth - filled;
    const barColor = percent === 100 ? chalk.green : percent >= 50 ? chalk.yellow : chalk.red;
    const bar = barColor('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
    console.log(`  Compliance: ${bar} ${percent}% (${completed}/${total})`);

    if (nextEvent) {
      console.log();
      const urgencyColor = nextEvent.daysUntil <= 30 ? chalk.red : nextEvent.daysUntil <= 90 ? chalk.yellow : chalk.dim;
      console.log(`  Next deadline: ${chalk.bold(nextEvent.title)}`);
      console.log(`  ${urgencyColor(`${nextEvent.date} (${nextEvent.daysUntil} days remaining)`)}`);
    }

    console.log();
    console.log(chalk.cyan(`  → Run \`eu-ai-act checklist ${state.classification.tier}\` to view obligations.`));
    console.log(chalk.cyan(`  → Run \`eu-ai-act report\` to export a compliance report.`));
    console.log();
    console.log(chalk.dim('  This tool does not constitute legal advice.'));
    console.log();
  });
