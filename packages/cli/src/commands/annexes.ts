import { Command } from 'commander';
import chalk from 'chalk';
import { getAnnexes, getAnnex, ANNEX_III_CATEGORIES } from '@eu-ai-act/sdk';
import type { AnnexIIICategory } from '@eu-ai-act/sdk';

export const annexesCommand = new Command('annexes')
  .description('Browse Annex III high-risk use case categories')
  .argument('[category]', 'Show details for a category (e.g., employment, biometrics)')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Browse the eight Annex III high-risk use case categories from the
  EU AI Act. Each category lists specific AI system types that are
  considered high-risk when used in that domain.

${chalk.bold('Categories:')}
  ${ANNEX_III_CATEGORIES.map((c) => chalk.cyan(c)).join(', ')}

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act annexes              ${chalk.dim('List all Annex III categories')}
  ${chalk.dim('$')} eu-ai-act annexes employment    ${chalk.dim('Show employment category details')}
  ${chalk.dim('$')} eu-ai-act annexes --json         ${chalk.dim('Output all as JSON')}`,
  )
  .action((category: string | undefined, opts) => {
    if (category) {
      showCategory(category, opts);
    } else {
      listCategories(opts);
    }
  });

function listCategories(opts: { json?: boolean }): void {
  const annexes = getAnnexes();

  if (opts.json) {
    console.log(JSON.stringify(annexes, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold('  EU AI Act — Annex III High-Risk Categories'));
  console.log(chalk.dim('  ' + '─'.repeat(50)));
  console.log();

  for (const annex of annexes) {
    console.log(`  ${chalk.cyan(`${annex.categoryNumber}.`)} ${chalk.bold(annex.title)} ${chalk.dim(`(${annex.category})`)}`);
    for (const item of annex.items) {
      console.log(`     ${chalk.dim('•')} ${item}`);
    }
    console.log();
  }

  console.log(chalk.dim(`  ${annexes.length} categories, ${annexes.reduce((sum, a) => sum + a.items.length, 0)} listed AI system types.`));
  console.log(chalk.dim(`  Run ${chalk.white('eu-ai-act annexes <category>')} for details.`));
  console.log();
}

function showCategory(categoryArg: string, opts: { json?: boolean }): void {
  if (!ANNEX_III_CATEGORIES.includes(categoryArg as AnnexIIICategory)) {
    console.error();
    console.error(chalk.red(`  Error: Unknown Annex III category "${categoryArg}"`));
    console.error();
    console.error(`  Available: ${ANNEX_III_CATEGORIES.map((c) => chalk.cyan(c)).join(', ')}`);
    console.error();
    process.exit(1);
  }

  const annex = getAnnex(categoryArg as AnnexIIICategory);

  if (!annex) {
    console.error(chalk.red(`  Error: Category "${categoryArg}" not found.`));
    process.exit(1);
  }

  if (opts.json) {
    console.log(JSON.stringify(annex, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold(`  Annex III Category ${annex.categoryNumber} — ${annex.title}`));
  console.log(chalk.dim('  ' + '─'.repeat(50)));
  console.log();
  console.log(chalk.dim(`  Category ID: ${annex.category}`));
  console.log();

  console.log(chalk.bold('  Listed High-Risk AI System Types:'));
  console.log();

  for (let i = 0; i < annex.items.length; i++) {
    console.log(`  ${chalk.cyan(`${i + 1}.`)} ${annex.items[i]}`);
  }

  console.log();
  console.log(chalk.dim('  AI systems used for these purposes are classified as high-risk'));
  console.log(chalk.dim('  under Article 6(2) of Regulation (EU) 2024/1689.'));
  console.log();
  console.log(chalk.dim('  This information does not constitute legal advice.'));
  console.log();
}
