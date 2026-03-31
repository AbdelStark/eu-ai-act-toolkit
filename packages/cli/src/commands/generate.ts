import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import {
  generateTemplate,
  TEMPLATE_NAMES,
  RISK_TIERS,
} from '@eu-ai-act/sdk';
import type { TemplateName, RiskTier } from '@eu-ai-act/sdk';

export const generateCommand = new Command('generate')
  .description('Generate compliance documentation templates')
  .argument('[template]', `Template: ${TEMPLATE_NAMES.join(', ')}`)
  .option('--system <name>', 'AI system name (required)')
  .option('--provider <name>', 'Provider/organization name (required)')
  .option('--purpose <text>', 'Intended purpose of the system (required)')
  .option('--output <path>', 'Output file path (default: stdout)')
  .option('--tier <tier>', 'Generate ALL templates for a tier at once')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Generate pre-filled compliance documentation from built-in templates.
  Supports conformity declarations, risk assessments, model cards,
  impact assessments, and transparency notices.

${chalk.bold('Available Templates:')}
  ${TEMPLATE_NAMES.map((t) => chalk.cyan(t)).join(', ')}

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act generate conformity --system "ChatBot" --provider "Acme" --purpose "Customer support"
  ${chalk.dim('$')} eu-ai-act generate risk-assessment --system "Scorer" --provider "Corp" --purpose "Credit scoring" --output risk.md
  ${chalk.dim('$')} eu-ai-act generate --tier high-risk --system "MyAI" --provider "Co" --purpose "Hiring" --output ./docs/`,
  )
  .action((templateArg: string | undefined, opts) => {
    if (opts.tier) {
      if (!RISK_TIERS.includes(opts.tier as RiskTier)) {
        console.error();
        console.error(chalk.red(`  Error: Invalid tier "${opts.tier}"`));
        console.error(`  Valid tiers: ${RISK_TIERS.map((t) => chalk.cyan(t)).join(', ')}`);
        console.error();
        process.exit(1);
      }
      generateAllForTier(opts);
      return;
    }

    if (!templateArg) {
      console.error();
      console.error(chalk.red('  Error: Template name required.'));
      console.error();
      console.error(`  Available templates: ${TEMPLATE_NAMES.map((t) => chalk.cyan(t)).join(', ')}`);
      console.error();
      console.error(chalk.dim(`  Run ${chalk.white('eu-ai-act generate --help')} for details.`));
      console.error();
      process.exit(1);
    }

    if (!TEMPLATE_NAMES.includes(templateArg as TemplateName)) {
      console.error();
      console.error(chalk.red(`  Error: Unknown template "${templateArg}"`));
      console.error();
      console.error(`  Available: ${TEMPLATE_NAMES.map((t) => chalk.cyan(t)).join(', ')}`);
      console.error();
      process.exit(1);
    }

    if (!opts.system || !opts.provider || !opts.purpose) {
      const missing = [];
      if (!opts.system) missing.push('--system');
      if (!opts.provider) missing.push('--provider');
      if (!opts.purpose) missing.push('--purpose');
      console.error();
      console.error(chalk.red(`  Error: Missing required options: ${missing.join(', ')}`));
      console.error();
      console.error(chalk.dim('  Example:'));
      console.error(chalk.dim(`  $ eu-ai-act generate ${templateArg} --system "MyAI" --provider "Company" --purpose "Description"`));
      console.error();
      process.exit(1);
    }

    const doc = generateTemplate(templateArg as TemplateName, {
      systemName: opts.system,
      provider: opts.provider,
      intendedPurpose: opts.purpose,
    });

    if (opts.output) {
      writeOutput(opts.output, doc);
      console.log();
      console.log(chalk.green(`  ✓ Written to ${opts.output}`));
      console.log();
    } else {
      console.log(doc);
    }
  });

function generateAllForTier(opts: Record<string, string>): void {
  if (!opts.system || !opts.provider || !opts.purpose) {
    const missing = [];
    if (!opts.system) missing.push('--system');
    if (!opts.provider) missing.push('--provider');
    if (!opts.purpose) missing.push('--purpose');
    console.error();
    console.error(chalk.red(`  Error: Missing required options: ${missing.join(', ')}`));
    console.error();
    process.exit(1);
  }

  const outputDir = opts.output ?? '.';

  console.log();
  console.log(chalk.bold('  📝 Generating compliance templates'));
  console.log(chalk.dim('  ' + '─'.repeat(40)));
  console.log();

  for (const name of TEMPLATE_NAMES) {
    const doc = generateTemplate(name, {
      systemName: opts.system,
      provider: opts.provider,
      intendedPurpose: opts.purpose,
    });

    const filePath = resolve(outputDir, `${name}.md`);
    writeOutput(filePath, doc);
    console.log(`  ${chalk.green('✓')} ${name}.md`);
  }

  console.log();
  console.log(chalk.dim(`  Generated ${TEMPLATE_NAMES.length} templates in ${outputDir}`));
  console.log();
}

function writeOutput(path: string, content: string): void {
  try {
    const dir = dirname(resolve(path));
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(path), content, 'utf-8');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error();
    console.error(chalk.red(`  Error: Failed to write file "${path}"`));
    console.error(chalk.dim(`  ${msg}`));
    console.error();
    process.exit(1);
  }
}
