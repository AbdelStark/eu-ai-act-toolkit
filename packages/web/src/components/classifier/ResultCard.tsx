'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ClassificationResult } from '@eu-ai-act/sdk';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { ArticleReference } from '@/components/shared/ArticleReference';

interface ResultCardProps {
  result: ClassificationResult;
  shareUrl: string;
}

export function ResultCard({ result, shareUrl }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-xl font-bold text-navy">Classification Result</h2>
        <RiskBadge tier={result.tier} size="lg" />
      </div>

      {/* Enforcement date */}
      <p className="mb-4 text-sm text-gray-600">
        Enforcement date:{' '}
        <span className="font-semibold text-navy">{result.enforcementDate}</span>
      </p>

      {/* Applicable articles */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-semibold text-navy">
          Applicable Articles
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.articles.map((article) => (
            <ArticleReference key={article} article={article} />
          ))}
        </div>
      </div>

      {/* Reasoning chain */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-semibold text-navy">
          Reasoning
        </h3>
        <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700">
          {result.reasoning.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
        {result.tier !== 'prohibited' && result.tier !== 'minimal' && (
          <Link
            href={`/checklist/${result.tier}`}
            className="inline-flex items-center rounded-lg bg-eu-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-eu-blue/90 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
          >
            View Compliance Checklist
          </Link>
        )}

        <button
          type="button"
          onClick={handleCopyUrl}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2"
        >
          {copied ? 'Copied!' : 'Share Result'}
        </button>
      </div>
    </div>
  );
}
