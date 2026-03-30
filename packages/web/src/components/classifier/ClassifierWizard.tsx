'use client';

import { useState, useCallback, useMemo } from 'react';
import { getQuestions, classify, type ClassificationInput, type ClassificationResult, type QuestionStep } from '@eu-ai-act/sdk';
import { encodeClassificationInput } from '@/lib/url-state';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { ResultCard } from './ResultCard';

/** Map question IDs to ClassificationInput field names. */
const Q: Record<string, keyof ClassificationInput> = {
  'social-scoring': 'socialScoring', 'realtime-biometrics': 'realtimeBiometrics',
  'subliminal-manipulation': 'subliminalManipulation', 'exploits-vulnerabilities': 'exploitsVulnerabilities',
  'untargeted-facial-scraping': 'untargetedFacialScraping', 'emotion-inference-workplace': 'emotionInferenceWorkplace',
  'biometric-categorization': 'biometricCategorization', 'predictive-policing': 'predictivePolicing',
  'is-gpai': 'isGPAI', 'annex-i-product': 'annexIProduct',
  'interacts-with-persons': 'interactsWithPersons', 'generates-synthetic-content': 'generatesSyntheticContent',
  'emotion-recognition': 'emotionRecognition', 'biometric-categorizing': 'biometricCategorizing',
};

const DEFAULT_INPUT: ClassificationInput = {
  socialScoring: false, realtimeBiometrics: false, subliminalManipulation: false,
  exploitsVulnerabilities: false, untargetedFacialScraping: false, emotionInferenceWorkplace: false,
  biometricCategorization: false, predictivePolicing: false, isGPAI: false,
  annexIProduct: false, annexIIICategory: null, interactsWithPersons: false,
  generatesSyntheticContent: false, emotionRecognition: false, biometricCategorizing: false,
};

interface ClassifierWizardProps {
  initialInput?: ClassificationInput | null;
}

export function ClassifierWizard({ initialInput }: ClassifierWizardProps) {
  const steps = useMemo(() => getQuestions(), []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ClassificationInput>(
    initialInput ?? DEFAULT_INPUT,
  );
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const totalQuestions = useMemo(
    () => steps.reduce((sum, s) => sum + s.questions.length, 0),
    [steps],
  );

  const questionsBeforeCurrent = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentStepIndex; i++) {
      count += steps[i]!.questions.length;
    }
    return count + currentQuestionIndex;
  }, [steps, currentStepIndex, currentQuestionIndex]);

  const currentStep: QuestionStep | undefined = steps[currentStepIndex];
  const currentQuestion = currentStep?.questions[currentQuestionIndex];

  const handleAnswer = useCallback(
    (questionId: string, answer: boolean) => {
      const fieldName = Q[questionId];
      const updated = { ...answers };
      if (fieldName) {
        (updated as Record<string, unknown>)[fieldName] = answer;
      }
      setAnswers(updated);

      // Advance to next question or step
      if (currentStep && currentQuestionIndex < currentStep.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        setCurrentQuestionIndex(0);
      } else {
        setResult(classify(updated));
      }
    },
    [answers, currentStep, currentQuestionIndex, currentStepIndex, steps],
  );

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers(DEFAULT_INPUT);
    setResult(null);
  };

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const encoded = encodeClassificationInput(answers);
    return `${window.location.origin}/classify?q=${encoded}`;
  }, [answers]);

  // Show result when classification is complete
  if (result) {
    return (
      <div className="space-y-6">
        <ResultCard result={result} shareUrl={shareUrl} />
        <button
          type="button"
          onClick={handleRestart}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
        >
          Start Over
        </button>
      </div>
    );
  }

  if (!currentStep || !currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ProgressBar current={questionsBeforeCurrent + 1} total={totalQuestions} />

      <div className="mb-2">
        <h2 className="text-lg font-bold text-navy">{currentStep.title}</h2>
        <p className="text-sm text-gray-500">{currentStep.description}</p>
      </div>

      <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />

      {currentStepIndex > 0 && (
        <button
          type="button"
          onClick={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex((prev) => prev - 1);
            } else if (currentStepIndex > 0) {
              const prevStep = steps[currentStepIndex - 1]!;
              setCurrentStepIndex((prev) => prev - 1);
              setCurrentQuestionIndex(prevStep.questions.length - 1);
            }
          }}
          className="text-sm font-medium text-gray-500 transition-colors hover:text-navy focus:outline-none focus:underline"
        >
          Previous question
        </button>
      )}
    </div>
  );
}
