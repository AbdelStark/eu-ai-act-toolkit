import { Command } from 'commander';
import chalk from 'chalk';
import { confirm, select } from '@inquirer/prompts';
import {
  classify,
  getQuestions,
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

export const classifyCommand = new Command('classify')
  .description('Classify an AI system\'s risk tier under the EU AI Act')
  .option('--social-scoring', 'Article 5(1)(c) — social scoring')
  .option('--realtime-biometrics', 'Article 5(1)(h) — real-time biometric ID')
  .option('--subliminal', 'Article 5(1)(a) — subliminal techniques')
  .option('--exploits-vulnerabilities', 'Article 5(1)(b) — exploits vulnerabilities')
  .option('--facial-scraping', 'Article 5(1)(e) — untargeted facial scraping')
  .option('--emotion-workplace', 'Article 5(1)(f) — emotion in workplace')
  .option('--biometric-categorization', 'Article 5(1)(g) — biometric categorization')
  .option('--predictive-policing', 'Article 5(1)(d) — predictive policing')
  .option('--gpai', 'General-purpose AI model')
  .option('--flops <number>', 'Training compute in FLOPs', parseFloat)
  .option('--open-source', 'Open source GPAI model')
  .option('--systemic-risk', 'Designated systemic risk')
  .option('--annex-i', 'Safety component (Annex I)')
  .option('--annex-i-third-party', 'Requires third-party assessment')
  .option('--annex-iii <category>', 'Annex III category')
  .option('--interacts-persons', 'Interacts with natural persons')
  .option('--synthetic-content', 'Generates synthetic content')
  .option('--emotion-recognition', 'Performs emotion recognition')
  .option('--biometric-categorizing', 'Biometric categorization')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
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

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log();
      console.log(`Risk Tier: ${colorFn(formatTierSummary(result))}`);
      console.log(`Enforcement: ${result.enforcementDate}`);
      console.log(`Conformity: ${result.conformityAssessment}`);
      console.log();
      console.log(`Applicable Articles: ${result.articles.join(', ')}`);
      console.log();
      console.log('Reasoning:');
      result.reasoning.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });
      console.log();
      if (result.tier !== 'prohibited' && result.tier !== 'minimal') {
        console.log(
          chalk.dim(`Next: Run \`eu-ai-act checklist ${result.tier}\` to see your obligations.`),
        );
      }
      console.log();
      console.log(chalk.dim('This tool does not constitute legal advice.'));
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
      console.log(chalk.dim(`\nState saved to ${path}`));
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

  console.log(chalk.bold('\nEU AI Act Risk Classification Wizard\n'));
  console.log(chalk.dim('Answer the following questions about your AI system.\n'));

  // Step 1: Prohibited practices
  console.log(chalk.bold.underline('Step 1: Prohibited Practices (Article 5)\n'));

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
    (input as Record<string, boolean>)[q.field] = await confirm({
      message: q.text,
      default: false,
    });
    if ((input as Record<string, boolean>)[q.field]) {
      console.log(chalk.red('\n⚠ This practice is prohibited under Article 5.\n'));
      return input;
    }
  }

  // Step 2: GPAI
  console.log(chalk.bold.underline('\nStep 2: General-Purpose AI Model\n'));
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
  console.log(chalk.bold.underline('\nStep 3: High-Risk Classification\n'));
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
  console.log(chalk.bold.underline('\nStep 4: Transparency Triggers\n'));
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
