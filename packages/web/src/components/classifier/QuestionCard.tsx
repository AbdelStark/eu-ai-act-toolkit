'use client';

import type { Question } from '@eu-ai-act/sdk';
import { ArticleReference } from '@/components/shared/ArticleReference';

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answer: boolean) => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-lg font-medium text-navy">{question.text}</p>
        <ArticleReference
          article={question.article}
          paragraph={question.paragraph}
          subparagraph={question.subparagraph}
          className="flex-shrink-0"
        />
      </div>

      {question.help && (
        <p className="mb-6 text-sm text-gray-500">{question.help}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onAnswer(question.id, true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onAnswer(question.id, true);
            }
          }}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-navy transition-colors hover:border-eu-blue hover:bg-eu-blue/5 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onAnswer(question.id, false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onAnswer(question.id, false);
            }
          }}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-navy transition-colors hover:border-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          No
        </button>
      </div>
    </div>
  );
}
