import { Command } from 'commander';
import chalk from 'chalk';
import { classifyCommand } from './commands/classify.js';
import { checklistCommand } from './commands/checklist.js';
import { timelineCommand } from './commands/timeline.js';
import { generateCommand } from './commands/generate.js';
import { statusCommand } from './commands/status.js';
import { reportCommand } from './commands/report.js';
import { examplesCommand } from './commands/examples.js';
import { articlesCommand } from './commands/articles.js';
import { annexesCommand } from './commands/annexes.js';
import { penaltiesCommand } from './commands/penalties.js';
import { gapsCommand } from './commands/gaps.js';
import { standardsCommand } from './commands/standards.js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

/**
 * Read version from package.json — works in both ESM and CJS.
 */
function getVersion(): string {
  try {
    // ESM path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const candidates = [
      resolve(__dirname, '..', 'package.json'),
      resolve(__dirname, '..', '..', 'package.json'),
    ];
    for (const p of candidates) {
      try {
        const pkg = JSON.parse(readFileSync(p, 'utf-8'));
        if (pkg.name === 'eu-ai-act' && pkg.version) return pkg.version;
      } catch { /* skip */ }
    }
  } catch {
    // CJS fallback — import.meta.url may be empty
    try {
      const req = createRequire(__filename ?? module.filename ?? '.');
      const pkg = req('../package.json');
      if (pkg.version) return pkg.version;
    } catch { /* skip */ }
  }
  return '0.1.0';
}

const version = getVersion();

const program = new Command()
  .name('eu-ai-act')
  .description(
    `${chalk.bold('EU AI Act Compliance Toolkit')}

  Classify AI systems, track compliance checklists, and generate
  documentation required under the EU AI Act.

  ${chalk.dim('This tool does not constitute legal advice.')}
  ${chalk.dim('Consult qualified legal counsel for compliance decisions.')}`,
  )
  .version(version, '-v, --version', 'Display the current version')
  .helpOption('-h, --help', 'Display help for a command')
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act classify              ${chalk.dim('Interactive risk classification wizard')}
  ${chalk.dim('$')} eu-ai-act classify --json        ${chalk.dim('Classify and output JSON')}
  ${chalk.dim('$')} eu-ai-act checklist high-risk    ${chalk.dim('View high-risk obligations')}
  ${chalk.dim('$')} eu-ai-act timeline               ${chalk.dim('View enforcement deadlines')}
  ${chalk.dim('$')} eu-ai-act status                 ${chalk.dim('Show compliance progress')}
  ${chalk.dim('$')} eu-ai-act generate conformity    ${chalk.dim('Generate conformity declaration')}
  ${chalk.dim('$')} eu-ai-act report --format md     ${chalk.dim('Export compliance report')}
  ${chalk.dim('$')} eu-ai-act examples               ${chalk.dim('Browse worked classification examples')}
  ${chalk.dim('$')} eu-ai-act articles 9              ${chalk.dim('Look up Article 9 details')}
  ${chalk.dim('$')} eu-ai-act penalties high-risk      ${chalk.dim('Show penalty exposure')}
  ${chalk.dim('$')} eu-ai-act gaps                     ${chalk.dim('Analyze compliance gaps')}
  ${chalk.dim('$')} eu-ai-act standards --mapping      ${chalk.dim('Standards compliance matrix')}

${chalk.bold('Getting started:')}
  Run ${chalk.cyan('eu-ai-act classify')} to classify your AI system, then
  ${chalk.cyan('eu-ai-act checklist <tier>')} to see your compliance obligations.

${chalk.dim('Documentation: https://github.com/nicepkg/eu-ai-act-toolkit')}`,
  );

program.addCommand(classifyCommand);
program.addCommand(checklistCommand);
program.addCommand(timelineCommand);
program.addCommand(generateCommand);
program.addCommand(statusCommand);
program.addCommand(reportCommand);
program.addCommand(examplesCommand);
program.addCommand(articlesCommand);
program.addCommand(annexesCommand);
program.addCommand(penaltiesCommand);
program.addCommand(gapsCommand);
program.addCommand(standardsCommand);

// Global error handler — no stack traces in production
program.exitOverride();

async function main() {
  try {
    await program.parseAsync();
  } catch (err: unknown) {
    // Commander throws on --help and --version with code 'commander.helpDisplayed' / 'commander.version'
    if (err instanceof Error && 'code' in err) {
      const code = (err as { code: string }).code;
      if (code === 'commander.helpDisplayed' || code === 'commander.version') {
        process.exit(0);
      }
    }

    // User-facing errors
    if (err instanceof Error) {
      console.error();
      console.error(chalk.red('  Error: ') + err.message);
      console.error();
      console.error(chalk.dim('  Run with --help for usage information.'));
      console.error();
    } else {
      console.error(chalk.red('An unexpected error occurred.'));
    }
    process.exit(1);
  }
}

main();
