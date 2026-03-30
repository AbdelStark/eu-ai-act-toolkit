import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync } from 'node:fs';
import { getChecklist, countProgress, getTimeline } from '@eu-ai-act/sdk';
import { readState } from '../state.js';

export const reportCommand = new Command('report')
  .description('Export a compliance report (Markdown or JSON)')
  .option('--format <type>', 'Output format: md or json (default: md)', 'md')
  .option('--output <path>', 'Write to file instead of stdout')
  .option('--json', 'Shorthand for --format json')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Generate a full compliance report combining your classification,
  checklist progress, and upcoming deadlines. Useful for audits,
  stakeholder updates, or compliance reviews.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act report                        ${chalk.dim('Print Markdown report')}
  ${chalk.dim('$')} eu-ai-act report --output report.md      ${chalk.dim('Save to file')}
  ${chalk.dim('$')} eu-ai-act report --json                  ${chalk.dim('JSON output')}
  ${chalk.dim('$')} eu-ai-act report --format json -o r.json ${chalk.dim('Save JSON to file')}`,
  )
  .action((opts) => {
    const state = readState();

    if (!state) {
      console.error();
      console.error(chalk.red('  Error: No .eu-ai-act.json found.'));
      console.error();
      console.error(`  Run ${chalk.cyan('eu-ai-act classify')} first to classify your AI system.`);
      console.error();
      process.exit(1);
    }

    const format = opts.json ? 'json' : (opts.format ?? 'md');

    if (format !== 'md' && format !== 'json') {
      console.error();
      console.error(chalk.red(`  Error: Invalid format "${format}"`));
      console.error(chalk.dim('  Valid formats: md, json'));
      console.error();
      process.exit(1);
    }

    const checklist = getChecklist(state.classification.tier);
    const { completed, total, percent } = countProgress(checklist.items, state.checklist);
    const timeline = getTimeline();
    const nextEvent = timeline.find((e) => e.status === 'upcoming' || e.status === 'future');

    let output: string;

    if (format === 'json') {
      output = JSON.stringify({
        generatedAt: new Date().toISOString(),
        system: state.system,
        classification: state.classification,
        progress: { completed, total, percent },
        checklist: checklist.items.map((item) => ({
          id: item.id,
          article: item.article,
          text: item.text,
          checked: state.checklist[item.id]?.checked ?? false,
          evidence: state.checklist[item.id]?.evidence ?? null,
        })),
        nextDeadline: nextEvent ? {
          title: nextEvent.title,
          date: nextEvent.date,
          daysUntil: nextEvent.daysUntil,
        } : null,
      }, null, 2);
    } else {
      const lines: string[] = [
        '# EU AI Act Compliance Report',
        '',
        `**Generated**: ${new Date().toISOString().split('T')[0]}`,
        `**System**: ${state.system.name}`,
        `**Provider**: ${state.system.provider}`,
        `**Classification**: ${state.classification.tier.toUpperCase()}${state.classification.subTier ? ` (${state.classification.subTier})` : ''}`,
        `**Classified**: ${state.system.classifiedAt.split('T')[0]}`,
        '',
        `## Compliance Progress: ${completed}/${total} (${percent}%)`,
        '',
      ];

      for (const item of checklist.items) {
        const p = state.checklist[item.id];
        const mark = p?.checked ? '[x]' : '[ ]';
        lines.push(`- ${mark} **Art. ${item.article}** — ${item.text}`);
        if (p?.evidence) {
          lines.push(`  - Evidence: ${p.evidence}`);
        }
      }

      if (nextEvent) {
        lines.push('', `## Next Deadline`, '', `**${nextEvent.title}**: ${nextEvent.date} (${nextEvent.daysUntil} days)`);
      }

      lines.push('', '---', '*This report does not constitute legal advice.*');
      output = lines.join('\n');
    }

    if (opts.output) {
      try {
        writeFileSync(opts.output, output, 'utf-8');
        console.log();
        console.log(chalk.green(`  ✓ Report written to ${opts.output}`));
        console.log();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error();
        console.error(chalk.red(`  Error: Failed to write "${opts.output}"`));
        console.error(chalk.dim(`  ${msg}`));
        console.error();
        process.exit(1);
      }
    } else {
      console.log(output);
    }
  });
