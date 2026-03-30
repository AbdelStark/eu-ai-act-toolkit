import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync } from 'node:fs';
import { getChecklist, countProgress, getTimeline } from '@eu-ai-act/sdk';
import { readState } from '../state.js';

export const reportCommand = new Command('report')
  .description('Export a compliance report')
  .option('--format <type>', 'Output format: md (default), json', 'md')
  .option('--output <path>', 'Output file path (default: stdout)')
  .option('--json', 'Output as JSON (alias for --format json)')
  .action((opts) => {
    const state = readState();

    if (!state) {
      console.error(chalk.red('No .eu-ai-act.json found.'));
      console.error(chalk.dim('Run `eu-ai-act classify` first.'));
      process.exit(1);
    }

    const format = opts.json ? 'json' : (opts.format ?? 'md');
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
      writeFileSync(opts.output, output, 'utf-8');
      console.log(chalk.green(`Report written to ${opts.output}`));
    } else {
      console.log(output);
    }
  });
