'use client';

import { useTranslations } from 'next-intl';
import type { Question } from '@eu-ai-act/sdk';
import { ArticleReference } from '@/components/shared/ArticleReference';

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answer: boolean) => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const t = useTranslations('classifier');
  const sdkT = useTranslations('sdk');
  const qKey = `questions.${question.id}`;
  const questionText = sdkT.has(`${qKey}.text`) ? sdkT(`${qKey}.text`) : question.text;
  const questionHelp = question.help ? (sdkT.has(`${qKey}.help`) ? sdkT(`${qKey}.help`) : question.help) : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-lg font-medium leading-relaxed text-navy">{questionText}</p>
        <ArticleReference
          article={question.article}
          paragraph={question.paragraph}
          subparagraph={question.subparagraph}
          className="flex-shrink-0"
        />
      </div>

      {questionHelp && (
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
          <svg className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-sm text-amber-700">{questionHelp}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onAnswer(question.id, true)}
          className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-navy transition-all duration-200 hover:border-eu-blue hover:bg-eu-blue/5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 active:scale-[0.98]"
        >
          {t('answers.yes')}
        </button>
        <button
          type="button"
          onClick={() => onAnswer(question.id, false)}
          className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-navy transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-[0.98]"
        >
          {t('answers.no')}
        </button>
      </div>
    </div>
  );
}
