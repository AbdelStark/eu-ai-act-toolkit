import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import {
  generateTemplate,
  getChecklist,
  TEMPLATE_NAMES,
  RISK_TIERS,
} from '@eu-ai-act/sdk';
import type { TemplateName, RiskTier } from '@eu-ai-act/sdk';

export const generateCommand = new Command('generate')
  .description('Generate compliance documentation templates')
  .argument('[template]', 'Template name')
  .option('--system <name>', 'AI system name')
  .option('--provider <name>', 'Provider/organization name')
  .option('--purpose <text>', 'Intended purpose')
  .option('--output <path>', 'Output file path (default: stdout)')
  .option('--tier <tier>', 'Generate ALL templates for a tier')
  .option('--json', 'Output as JSON')
  .action((templateArg: string | undefined, opts) => {
    if (opts.tier) {
      if (!RISK_TIERS.includes(opts.tier as RiskTier)) {
        console.error(chalk.red(`Invalid tier: ${opts.tier}`));
        process.exit(1);
      }
      generateAllForTier(opts);
      return;
    }

    if (!templateArg) {
      console.error(chalk.red('Template name required. Available: ' + TEMPLATE_NAMES.join(', ')));
      process.exit(1);
    }

    if (!TEMPLATE_NAMES.includes(templateArg as TemplateName)) {
      console.error(chalk.red(`Invalid template: ${templateArg}. Available: ${TEMPLATE_NAMES.join(', ')}`));
      process.exit(1);
    }

    if (!opts.system || !opts.provider || !opts.purpose) {
      console.error(chalk.red('Required: --system, --provider, --purpose'));
      process.exit(2);
    }

    const doc = generateTemplate(templateArg as TemplateName, {
      systemName: opts.system,
      provider: opts.provider,
      intendedPurpose: opts.purpose,
    });

    if (opts.output) {
      writeOutput(opts.output, doc);
      console.log(chalk.green(`Written to ${opts.output}`));
    } else {
      console.log(doc);
    }
  });

function generateAllForTier(opts: Record<string, string>): void {
  if (!opts.system || !opts.provider || !opts.purpose) {
    console.error(chalk.red('Required: --system, --provider, --purpose'));
    process.exit(2);
  }

  const outputDir = opts.output ?? '.';

  for (const name of TEMPLATE_NAMES) {
    const doc = generateTemplate(name, {
      systemName: opts.system,
      provider: opts.provider,
      intendedPurpose: opts.purpose,
    });

    const filePath = resolve(outputDir, `${name}.md`);
    writeOutput(filePath, doc);
    console.log(chalk.green(`✓ ${name}.md`));
  }

  console.log(chalk.dim(`\nGenerated ${TEMPLATE_NAMES.length} templates in ${outputDir}`));
}

function writeOutput(path: string, content: string): void {
  const dir = dirname(resolve(path));
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(path), content, 'utf-8');
}
