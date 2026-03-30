import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getTimeline } from '@eu-ai-act/sdk';

export const timelineCommand = new Command('timeline')
  .description('Display the EU AI Act enforcement timeline')
  .option('--json', 'Output as JSON')
  .action((opts) => {
    const events = getTimeline();

    if (opts.json) {
      console.log(JSON.stringify(events, null, 2));
      return;
    }

    console.log();
    console.log(chalk.bold('EU AI Act Enforcement Timeline'));
    console.log();

    const table = new Table({
      head: ['Date', 'Milestone', 'Status', 'Countdown'],
      colWidths: [14, 45, 12, 18],
      wordWrap: true,
    });

    for (const event of events) {
      let statusText: string;
      let dateText: string;
      let countdownText: string;

      switch (event.status) {
        case 'past':
          statusText = chalk.green('In effect');
          dateText = chalk.green(event.date);
          countdownText = chalk.dim(`${Math.abs(event.daysUntil)} days ago`);
          break;
        case 'upcoming':
          if (event.daysUntil <= 30) {
            statusText = chalk.red('IMMINENT');
            dateText = chalk.red(event.date);
            countdownText = chalk.red.bold(`${event.daysUntil} days`);
          } else {
            statusText = chalk.yellow('Upcoming');
            dateText = chalk.yellow(event.date);
            countdownText = chalk.yellow(`${event.daysUntil} days`);
          }
          break;
        default:
          statusText = chalk.dim('Future');
          dateText = chalk.dim(event.date);
          countdownText = chalk.dim(`${event.daysUntil} days`);
      }

      table.push([dateText, event.title, statusText, countdownText]);
    }

    console.log(table.toString());
    console.log();
    console.log(chalk.dim('This tool does not constitute legal advice.'));
  });
