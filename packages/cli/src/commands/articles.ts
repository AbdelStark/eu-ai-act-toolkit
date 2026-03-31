import { Command } from 'commander';
import chalk from 'chalk';
import {
  getArticles,
  getArticle,
  getArticlesByTier,
  RISK_TIERS,
} from '@eu-ai-act/sdk';
import type { RiskTier } from '@eu-ai-act/sdk';

const TIER_COLORS: Record<string, (s: string) => string> = {
  prohibited: chalk.red,
  'high-risk': chalk.hex('#ea580c'),
  gpai: chalk.yellow,
  'gpai-systemic': chalk.hex('#c2410c'),
  limited: chalk.blue,
  minimal: chalk.green,
};

export const articlesCommand = new Command('articles')
  .description('Look up EU AI Act article references')
  .argument('[article-number]', 'Show details for a specific article number')
  .option('--tier <tier>', 'Filter articles by risk tier')
  .option('--json', 'Output as JSON')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Browse and look up articles from Regulation (EU) 2024/1689.
  Each article includes its title, summary, applicable risk tiers,
  and a link to the full text on EUR-Lex.

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act articles               ${chalk.dim('List all indexed articles')}
  ${chalk.dim('$')} eu-ai-act articles 9              ${chalk.dim('Show Article 9 details')}
  ${chalk.dim('$')} eu-ai-act articles --tier high-risk  ${chalk.dim('Articles for high-risk tier')}
  ${chalk.dim('$')} eu-ai-act articles --json          ${chalk.dim('Output all articles as JSON')}`,
  )
  .action((articleNum: string | undefined, opts) => {
    if (articleNum) {
      showArticle(articleNum, opts);
    } else if (opts.tier) {
      listArticlesByTier(opts.tier, opts);
    } else {
      listAllArticles(opts);
    }
  });

function listAllArticles(opts: { json?: boolean }): void {
  const articles = getArticles();

  if (opts.json) {
    console.log(JSON.stringify(articles, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold('  EU AI Act — Article Reference'));
  console.log(chalk.dim('  ' + '─'.repeat(50)));
  console.log();

  for (const art of articles) {
    const tiers = art.applicableTiers.map((t) => {
      const fn = TIER_COLORS[t] ?? chalk.white;
      return fn(t);
    }).join(', ');
    console.log(`  ${chalk.cyan(`Art. ${String(art.number).padEnd(4)}`)} ${art.title.padEnd(55)} ${chalk.dim(tiers)}`);
  }

  console.log();
  console.log(chalk.dim(`  ${articles.length} articles indexed.`));
  console.log(chalk.dim(`  Run ${chalk.white('eu-ai-act articles <number>')} for details.`));
  console.log();
}

function listArticlesByTier(tier: string, opts: { json?: boolean }): void {
  if (!RISK_TIERS.includes(tier as RiskTier)) {
    console.error();
    console.error(chalk.red(`  Error: Invalid tier "${tier}"`));
    console.error(`  Valid tiers: ${RISK_TIERS.map((t) => chalk.cyan(t)).join(', ')}`);
    console.error();
    process.exit(1);
  }

  const articles = getArticlesByTier(tier as RiskTier);

  if (opts.json) {
    console.log(JSON.stringify(articles, null, 2));
    return;
  }

  const colorFn = TIER_COLORS[tier] ?? chalk.white;

  console.log();
  console.log(chalk.bold(`  EU AI Act — Articles for ${colorFn(tier.toUpperCase())} Tier`));
  console.log(chalk.dim('  ' + '─'.repeat(50)));
  console.log();

  if (articles.length === 0) {
    console.log(chalk.dim('  No articles indexed for this tier.'));
  } else {
    for (const art of articles) {
      console.log(`  ${chalk.cyan(`Art. ${String(art.number).padEnd(4)}`)} ${art.title}`);
    }
  }

  console.log();
  console.log(chalk.dim(`  ${articles.length} articles.`));
  console.log();
}

function showArticle(num: string, opts: { json?: boolean }): void {
  const articleNumber = parseInt(num, 10);

  if (isNaN(articleNumber) || articleNumber < 1) {
    console.error();
    console.error(chalk.red(`  Error: Invalid article number "${num}"`));
    console.error(chalk.dim('  Provide a positive integer (e.g., 9, 50, 55).'));
    console.error();
    process.exit(1);
  }

  const article = getArticle(articleNumber);

  if (!article) {
    console.error();
    console.error(chalk.red(`  Error: Article ${articleNumber} not found in the index.`));
    console.error();
    console.error(chalk.dim('  The index covers key articles referenced by the compliance toolkit.'));
    console.error(chalk.dim(`  Run ${chalk.white('eu-ai-act articles')} to see all indexed articles.`));
    console.error();
    process.exit(1);
  }

  if (opts.json) {
    console.log(JSON.stringify(article, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold(`  Article ${article.number} — ${article.title}`));
  console.log(chalk.dim('  ' + '─'.repeat(50)));
  console.log();

  // Summary (word-wrap at ~70 chars)
  const words = article.summary.split(' ');
  let line = '  ';
  for (const word of words) {
    if (line.length + word.length > 72) {
      console.log(line);
      line = '  ' + word;
    } else {
      line += (line.length > 2 ? ' ' : '') + word;
    }
  }
  if (line.trim()) console.log(line);
  console.log();

  // Applicable tiers
  const tiers = article.applicableTiers.map((t) => {
    const fn = TIER_COLORS[t] ?? chalk.white;
    return fn(t);
  }).join(', ');
  console.log(`  ${chalk.dim('Applicable tiers:')} ${tiers}`);

  // EUR-Lex link
  if (article.url) {
    console.log(`  ${chalk.dim('Full text:')}        ${chalk.underline(article.url)}`);
  }

  console.log();
  console.log(chalk.dim('  This summary does not constitute legal advice.'));
  console.log();
}
