import { Command } from 'commander';
import chalk from 'chalk';
import { confirm, select } from '@inquirer/prompts';
import {
  classify,
  formatTierSummary,
  ANNEX_III_CATEGORIES,
} from '@eu-ai-act/sdk';
import type { ClassificationInput, AnnexIIICategory } from '@eu-ai-act/sdk';
import { createState, writeState } from '../state.js';

const TIER_COLORS: Record<string, (s: string) => string> = {
  prohibited: chalk.red,
  'high-risk': chalk.hex('#ea580c'),
  gpai: chalk.yellow,
  'gpai-systemic': chalk.hex('#c2410c'),
  limited: chalk.blue,
  minimal: chalk.green,
};

const TIER_ICONS: Record<string, string> = {
  prohibited: '🚫',
  'high-risk': '⚠️',
  gpai: '🤖',
  'gpai-systemic': '🔴',
  limited: 'ℹ️',
  minimal: '✅',
};

export const classifyCommand = new Command('classify')
  .description('Classify an AI system\'s risk tier under the EU AI Act')
  .addHelpText(
    'after',
    `
${chalk.bold('Description:')}
  Walk through the EU AI Act classification decision tree to determine
  which risk tier applies to your AI system. Runs an interactive wizard
  by default, or accepts flags for CI/scripting.

${chalk.bold('Risk Tiers:')}
  ${chalk.red('prohibited')}       Banned AI practices (Article 5)
  ${chalk.hex('#ea580c')('high-risk')}        Subject to strict obligations (Annex I/III)
  ${chalk.yellow('gpai')}              General-purpose AI model
  ${chalk.hex('#c2410c')('gpai-systemic')}    GPAI with systemic risk
  ${chalk.blue('limited')}          Transparency obligations only
  ${chalk.green('minimal')}          No specific obligations

${chalk.bold('Examples:')}
  ${chalk.dim('$')} eu-ai-act classify                          ${chalk.dim('Interactive wizard')}
  ${chalk.dim('$')} eu-ai-act classify --gpai --flops 1e25      ${chalk.dim('Classify a GPAI model')}
  ${chalk.dim('$')} eu-ai-act classify --annex-iii biometrics   ${chalk.dim('High-risk by category')}
  ${chalk.dim('$')} eu-ai-act classify --json                   ${chalk.dim('JSON output for scripts')}`,
  )
  .option('--social-scoring', 'Article 5(1)(c) — social scoring by public authorities')
  .option('--realtime-biometrics', 'Article 5(1)(h) — real-time biometric identification')
  .option('--subliminal', 'Article 5(1)(a) — subliminal or manipulative techniques')
  .option('--exploits-vulnerabilities', 'Article 5(1)(b) — exploits age/disability vulnerabilities')
  .option('--facial-scraping', 'Article 5(1)(e) — untargeted facial image scraping')
  .option('--emotion-workplace', 'Article 5(1)(f) — emotion inference in workplace/education')
  .option('--biometric-categorization', 'Article 5(1)(g) — biometric categorization by sensitive attributes')
  .option('--predictive-policing', 'Article 5(1)(d) — individual predictive policing')
  .option('--gpai', 'General-purpose AI model (foundation model, LLM, etc.)')
  .option('--flops <number>', 'Training compute in FLOPs (e.g., 1e25)', parseFloat)
  .option('--open-source', 'Model released under an open-source licence')
  .option('--systemic-risk', 'Designated as posing systemic risk by AI Office')
  .option('--annex-i', 'Safety component of product under Annex I EU legislation')
  .option('--annex-i-third-party', 'Product requires third-party conformity assessment')
  .option('--annex-iii <category>', `Annex III high-risk category`)
  .option('--interacts-persons', 'System interacts directly with natural persons')
  .option('--synthetic-content', 'System generates synthetic content (deepfakes, AI media)')
  .option('--emotion-recognition', 'System performs emotion recognition')
  .option('--biometric-categorizing', 'System performs biometric categorization')
  .option('--json', 'Output result as JSON')
  .action(async (opts) => {
    try {
      const hasFlags = Object.keys(opts).some(
        (k) => k !== 'json' && opts[k] !== undefined,
      );

      let input: ClassificationInput;

      if (hasFlags || !process.stdin.isTTY) {
        input = buildInputFromFlags(opts);
      } else {
        input = await runInteractiveWizard();
      }

      const result = classify(input);
      const colorFn = TIER_COLORS[result.tier] ?? chalk.white;
      const icon = TIER_ICONS[result.tier] ?? '';

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log();
        console.log(chalk.bold('  Classification Result'));
        console.log(chalk.dim('  ' + '─'.repeat(40)));
        console.log();
        console.log(`  ${icon} Risk Tier:    ${colorFn(chalk.bold(formatTierSummary(result)))}`);
        console.log(`  📅 Enforcement: ${result.enforcementDate}`);
        console.log(`  📋 Conformity:  ${result.conformityAssessment}`);
        console.log();
        console.log(chalk.bold('  Applicable Articles'));
        console.log(`  ${result.articles.join(', ')}`);
        console.log();
        console.log(chalk.bold('  Reasoning'));
        result.reasoning.forEach((step, i) => {
          console.log(`  ${chalk.dim(`${i + 1}.`)} ${step}`);
        });

        if (result.tier !== 'prohibited' && result.tier !== 'minimal') {
          console.log();
          console.log(
            chalk.cyan(`  → Next: Run \`eu-ai-act checklist ${result.tier}\` to see your obligations.`),
          );
        }
        console.log();
        console.log(chalk.dim('  This tool does not constitute legal advice.'));
      }

      // Save state
      const state = createState(
        'AI System',
        'Provider',
        {
          tier: result.tier,
          subTier: result.subTier,
          conformityAssessment: result.conformityAssessment,
        },
      );
      const path = writeState(state);
      if (!opts.json) {
        console.log(chalk.dim(`  State saved to ${path}`));
        console.log();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('User force closed')) {
        console.log(chalk.dim('\n  Classification cancelled.'));
        process.exit(0);
      }
      throw err;
    }
  });

function buildInputFromFlags(opts: Record<string, unknown>): ClassificationInput {
  return {
    socialScoring: opts.socialScoring === true,
    realtimeBiometrics: opts.realtimeBiometrics === true,
    subliminalManipulation: opts.subliminal === true,
    exploitsVulnerabilities: opts.exploitsVulnerabilities === true,
    untargetedFacialScraping: opts.facialScraping === true,
    emotionInferenceWorkplace: opts.emotionWorkplace === true,
    biometricCategorization: opts.biometricCategorization === true,
    predictivePolicing: opts.predictivePolicing === true,
    isGPAI: opts.gpai === true,
    gpaiFlops: opts.flops as number | undefined,
    isOpenSource: opts.openSource === true ? true : undefined,
    designatedSystemicRisk: opts.systemicRisk === true ? true : undefined,
    annexIProduct: opts.annexI === true,
    annexIRequiresThirdParty: opts.annexIThirdParty === true ? true : undefined,
    annexIIICategory: (opts.annexIii as AnnexIIICategory) ?? null,
    interactsWithPersons: opts.interactsPersons === true,
    generatesSyntheticContent: opts.syntheticContent === true,
    emotionRecognition: opts.emotionRecognition === true,
    biometricCategorizing: opts.biometricCategorizing === true,
  };
}

async function runInteractiveWizard(): Promise<ClassificationInput> {
  const input: ClassificationInput = {
    socialScoring: false,
    realtimeBiometrics: false,
    subliminalManipulation: false,
    exploitsVulnerabilities: false,
    untargetedFacialScraping: false,
    emotionInferenceWorkplace: false,
    biometricCategorization: false,
    predictivePolicing: false,
    isGPAI: false,
    annexIProduct: false,
    annexIIICategory: null,
    interactsWithPersons: false,
    generatesSyntheticContent: false,
    emotionRecognition: false,
    biometricCategorizing: false,
  };

  console.log();
  console.log(chalk.bold('  🏛️  EU AI Act Risk Classification Wizard'));
  console.log(chalk.dim('  ' + '─'.repeat(44)));
  console.log(chalk.dim('  Answer the following questions about your AI system.'));
  console.log(chalk.dim('  Press Ctrl+C to cancel at any time.'));
  console.log();

  // Step 1: Prohibited practices
  console.log(chalk.bold.hex('#ea580c')('  Step 1/4 ') + chalk.bold('Prohibited Practices (Article 5)'));
  console.log();

  const prohibitedQuestions: { field: keyof ClassificationInput; text: string }[] = [
    { field: 'socialScoring', text: 'Does your system perform social scoring by public authorities?' },
    { field: 'realtimeBiometrics', text: 'Does it use real-time remote biometric identification in public spaces?' },
    { field: 'subliminalManipulation', text: 'Does it deploy subliminal or manipulative techniques?' },
    { field: 'exploitsVulnerabilities', text: 'Does it exploit vulnerabilities due to age, disability, or social situation?' },
    { field: 'untargetedFacialScraping', text: 'Does it perform untargeted scraping of facial images?' },
    { field: 'emotionInferenceWorkplace', text: 'Does it infer emotions in the workplace or education?' },
    { field: 'biometricCategorization', text: 'Does it categorize persons by sensitive biometric attributes?' },
    { field: 'predictivePolicing', text: 'Does it perform individual predictive policing based on profiling?' },
  ];

  for (const q of prohibitedQuestions) {
    (input as unknown as Record<string, boolean>)[q.field] = await confirm({
      message: q.text,
      default: false,
    });
    if ((input as unknown as Record<string, boolean>)[q.field]) {
      console.log(chalk.red('\n  🚫 This practice is prohibited under Article 5.\n'));
      return input;
    }
  }

  // Step 2: GPAI
  console.log();
  console.log(chalk.bold.yellow('  Step 2/4 ') + chalk.bold('General-Purpose AI Model'));
  console.log();
  input.isGPAI = await confirm({
    message: 'Is this a general-purpose AI model (foundation model, LLM, etc.)?',
    default: false,
  });

  if (input.isGPAI) {
    input.isOpenSource = await confirm({
      message: 'Is the model released under an open-source licence?',
      default: false,
    });
    input.designatedSystemicRisk = await confirm({
      message: 'Has it been designated as posing systemic risk by the AI Office?',
      default: false,
    });
    return input;
  }

  // Step 3: High-risk
  console.log();
  console.log(chalk.bold.hex('#ea580c')('  Step 3/4 ') + chalk.bold('High-Risk Classification'));
  console.log();
  input.annexIProduct = await confirm({
    message: 'Is your system a safety component of a product under Annex I EU legislation?',
    default: false,
  });

  if (input.annexIProduct) {
    input.annexIRequiresThirdParty = await confirm({
      message: 'Does the product require third-party conformity assessment?',
      default: false,
    });
  }

  const annexIIIAnswer = await select({
    message: 'Does your system fall under an Annex III high-risk category?',
    choices: [
      { value: 'none', name: 'None of the below' },
      ...ANNEX_III_CATEGORIES.map((cat) => ({ value: cat, name: cat })),
    ],
  });

  input.annexIIICategory = annexIIIAnswer === 'none' ? null : annexIIIAnswer as AnnexIIICategory;

  // Step 4: Limited risk
  console.log();
  console.log(chalk.bold.blue('  Step 4/4 ') + chalk.bold('Transparency Triggers'));
  console.log();
  input.interactsWithPersons = await confirm({
    message: 'Does the system interact directly with natural persons?',
    default: false,
  });
  input.generatesSyntheticContent = await confirm({
    message: 'Does it generate synthetic content (deepfakes, AI-generated media)?',
    default: false,
  });
  input.emotionRecognition = await confirm({
    message: 'Does it perform emotion recognition?',
    default: false,
  });
  input.biometricCategorizing = await confirm({
    message: 'Does it perform biometric categorization?',
    default: false,
  });

  return input;
}
