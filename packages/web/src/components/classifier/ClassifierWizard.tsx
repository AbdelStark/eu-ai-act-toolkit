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
  const [transitioning, setTransitioning] = useState(false);

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

      // Smooth transition
      setTransitioning(true);
      setTimeout(() => {
        // Advance to next question or step
        if (currentStep && currentQuestionIndex < currentStep.questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
          setCurrentQuestionIndex(0);
        } else {
          setResult(classify(updated));
        }
        setTransitioning(false);
      }, 200);
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
      <div className="space-y-6 animate-scale-in">
        <ResultCard result={result} shareUrl={shareUrl} />
        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 min-h-[44px]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
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
      {/* Step indicators */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.title} className="flex items-center">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              i < currentStepIndex
                ? 'bg-green-100 text-green-700'
                : i === currentStepIndex
                  ? 'bg-eu-blue text-white'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {i < currentStepIndex ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-px w-4 ${i < currentStepIndex ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <ProgressBar current={questionsBeforeCurrent + 1} total={totalQuestions} />

      <div className="mb-2">
        <h2 className="text-lg font-bold text-navy">{currentStep.title}</h2>
        <p className="text-sm text-slate-500">{currentStep.description}</p>
      </div>

      <div className={`transition-all duration-200 ${transitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
        <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
      </div>

      {(currentStepIndex > 0 || currentQuestionIndex > 0) && (
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
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-navy hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 min-h-[44px]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Previous question
        </button>
      )}
    </div>
  );
}
