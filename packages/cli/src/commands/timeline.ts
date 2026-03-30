import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getTimeline } from '@eu-ai-act/sdk';

export const timelineCommand = new Command('timeline')
  .description('Display the EU AI Act enforcement timeline')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Display key enforcement dates for the EU AI Act. Shows which
  deadlines have passed, are imminent, or are still in the future.
  Use this to plan your compliance roadmap.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act timeline          ${chalk.dim('Display timeline table')}
  ${chalk.dim('$')} eu-ai-act timeline --json    ${chalk.dim('JSON output for scripting')}`,
  )
  .action((opts) => {
    const events = getTimeline();

    if (opts.json) {
      console.log(JSON.stringify(events, null, 2));
      return;
    }

    console.log();
    console.log(chalk.bold('  📅 EU AI Act Enforcement Timeline'));
    console.log(chalk.dim('  ' + '─'.repeat(40)));
    console.log();

    const table = new Table({
      head: [
        chalk.bold('Date'),
        chalk.bold('Milestone'),
        chalk.bold('Status'),
        chalk.bold('Countdown'),
      ],
      colWidths: [14, 45, 12, 18],
      wordWrap: true,
      style: {
        head: [],
        border: ['dim'],
      },
    });

    for (const event of events) {
      let statusText: string;
      let dateText: string;
      let countdownText: string;

      switch (event.status) {
        case 'past':
          statusText = chalk.green('✓ Done');
          dateText = chalk.green(event.date);
          countdownText = chalk.dim(`${Math.abs(event.daysUntil)}d ago`);
          break;
        case 'upcoming':
          if (event.daysUntil <= 30) {
            statusText = chalk.red.bold('⚠ IMMINENT');
            dateText = chalk.red.bold(event.date);
            countdownText = chalk.red.bold(`${event.daysUntil}d left`);
          } else {
            statusText = chalk.yellow('● Soon');
            dateText = chalk.yellow(event.date);
            countdownText = chalk.yellow(`${event.daysUntil}d left`);
          }
          break;
        default:
          statusText = chalk.dim('○ Future');
          dateText = chalk.dim(event.date);
          countdownText = chalk.dim(`${event.daysUntil}d left`);
      }

      table.push([dateText, event.title, statusText, countdownText]);
    }

    console.log(table.toString());
    console.log();
    console.log(chalk.dim('  This tool does not constitute legal advice.'));
    console.log();
  });
