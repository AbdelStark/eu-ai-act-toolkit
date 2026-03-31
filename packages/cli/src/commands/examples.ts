import { Command } from 'commander';
import chalk from 'chalk';
import {
  getExamples,
  getExampleBySlug,
  classify,
  formatTierSummary,
  buildReasoning,
} from '@eu-ai-act/sdk';

const TIER_COLORS: Record<string, (s: string) => string> = {
  prohibited: chalk.red,
  'high-risk': chalk.hex('#ea580c'),
  gpai: chalk.yellow,
  'gpai-systemic': chalk.hex('#c2410c'),
  limited: chalk.blue,
  minimal: chalk.green,
};

export const examplesCommand = new Command('examples')
  .description('Browse worked classification examples')
  .argument('[slug]', 'Show details for a specific example (e.g., chatbot, hiring-tool)')
  .option('--json', 'Output as JSON')
  .option('--classify', 'Run the classification engine on the example')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Browse pre-configured AI system scenarios that demonstrate how the
  EU AI Act classification engine works. Each example includes a
  step-by-step walkthrough explaining the classification reasoning.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act examples                   ${chalk.dim('List all worked examples')}
  ${chalk.dim('$')} eu-ai-act examples chatbot            ${chalk.dim('Show chatbot example details')}
  ${chalk.dim('$')} eu-ai-act examples hiring-tool --classify  ${chalk.dim('Classify the hiring tool example')}
  ${chalk.dim('$')} eu-ai-act examples --json              ${chalk.dim('Output all examples as JSON')}`,
  )
  .action((slug: string | undefined, opts) => {
    if (slug) {
      showExample(slug, opts);
    } else {
      listExamples(opts);
    }
  });

function listExamples(opts: { json?: boolean }): void {
  const examples = getExamples();

  if (opts.json) {
    console.log(JSON.stringify(examples, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold('  EU AI Act — Worked Classification Examples'));
  console.log(chalk.dim('  ' + '─'.repeat(50)));
  console.log();

  for (const ex of examples) {
    const colorFn = TIER_COLORS[ex.expectedTier] ?? chalk.white;
    const tierLabel = colorFn(ex.expectedTier.toUpperCase());
    console.log(`  ${chalk.cyan(ex.slug.padEnd(24))} ${tierLabel.padEnd(30)} ${chalk.dim(ex.title)}`);
  }

  console.log();
  console.log(chalk.dim(`  ${examples.length} examples covering all risk tiers.`));
  console.log(chalk.dim(`  Run ${chalk.white('eu-ai-act examples <slug>')} for details.`));
  console.log();
}

function showExample(slug: string, opts: { json?: boolean; classify?: boolean }): void {
  const example = getExampleBySlug(slug);

  if (!example) {
    const examples = getExamples();
    console.error();
    console.error(chalk.red(`  Error: Unknown example "${slug}"`));
    console.error();
    console.error(`  Available: ${examples.map((e) => chalk.cyan(e.slug)).join(', ')}`);
    console.error();
    process.exit(1);
  }

  if (opts.json) {
    const output: Record<string, unknown> = { ...example };
    if (opts.classify) {
      output.classificationResult = classify(example.classificationInput);
    }
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  const colorFn = TIER_COLORS[example.expectedTier] ?? chalk.white;

  console.log();
  console.log(chalk.bold(`  ${example.title}`));
  console.log(chalk.dim('  ' + '─'.repeat(50)));
  console.log();
  console.log(`  ${chalk.dim('Slug:')}   ${example.slug}`);
  console.log(`  ${chalk.dim('Tier:')}   ${colorFn(example.expectedTier.toUpperCase())}`);
  console.log();
  console.log(`  ${example.description}`);
  console.log();

  // Walkthrough
  console.log(chalk.bold('  Classification Walkthrough:'));
  console.log();
  for (const step of example.walkthrough) {
    console.log(`  ${step}`);
  }
  console.log();

  // Run classification if requested
  if (opts.classify) {
    console.log(chalk.bold('  Live Classification Result:'));
    console.log(chalk.dim('  ' + '─'.repeat(40)));
    console.log();

    const result = classify(example.classificationInput);
    const summary = formatTierSummary(result);
    const reasoning = buildReasoning(result);
    const match = result.tier === example.expectedTier;

    console.log(`  ${chalk.dim('Result:')}     ${colorFn(summary)}`);
    console.log(`  ${chalk.dim('Expected:')}   ${colorFn(example.expectedTier.toUpperCase())}`);
    console.log(`  ${chalk.dim('Match:')}      ${match ? chalk.green('✓ PASS') : chalk.red('✗ FAIL')}`);
    console.log();
    console.log(`  ${chalk.dim('Reasoning:')}`);
    for (const line of reasoning.split('\n')) {
      console.log(`  ${line}`);
    }
    console.log();
  }

  console.log(chalk.dim('  This example does not constitute legal advice.'));
  console.log();
}
