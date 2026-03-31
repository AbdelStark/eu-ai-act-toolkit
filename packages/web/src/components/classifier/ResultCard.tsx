'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { ClassificationResult } from '@eu-ai-act/sdk';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { ArticleReference } from '@/components/shared/ArticleReference';
import { getState, setState } from '@/lib/storage';

interface ResultCardProps {
  result: ClassificationResult;
  shareUrl: string;
}

const tierGradients: Record<string, string> = {
  prohibited: 'from-red-500 to-red-700',
  'high-risk': 'from-orange-500 to-orange-700',
  gpai: 'from-yellow-500 to-yellow-700',
  'gpai-systemic': 'from-orange-600 to-orange-800',
  limited: 'from-blue-500 to-blue-700',
  minimal: 'from-green-500 to-green-700',
};

export function ResultCard({ result, shareUrl }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [systemName, setSystemName] = useState('');
  const [provider, setProvider] = useState('');
  const [saved, setSaved] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const handleSaveSystemInfo = useCallback(() => {
    const existing = getState();
    if (!existing) return;
    existing.system.name = systemName.trim() || 'AI System';
    existing.system.provider = provider.trim() || 'Unknown';
    setState(existing);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [systemName, provider]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-layered-lg">
      {/* Colored header */}
      <div className={`bg-gradient-to-r ${tierGradients[result.tier] ?? 'from-eu-blue to-eu-blue-700'} px-6 py-8 text-center text-white`}>
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">Classification Result</p>
        <div className="mt-3 flex items-center justify-center">
          <RiskBadge tier={result.tier} size="lg" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* System Info Form */}
        <div className="rounded-xl border border-eu-blue/20 bg-eu-blue/5 p-4">
          <h3 className="text-sm font-semibold text-navy">Save Your System Details</h3>
          <p className="mt-1 text-xs text-slate-500">Optional — name your system for tracking on the dashboard.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="AI System Name"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
            />
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="Provider / Organization"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveSystemInfo}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              saved
                ? 'bg-green-100 text-green-700'
                : 'bg-eu-blue/10 text-eu-blue hover:bg-eu-blue/20'
            }`}
          >
            {saved ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Saved
              </>
            ) : (
              'Save Details'
            )}
          </button>
        </div>

        {/* Enforcement date */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <svg className="h-5 w-5 flex-shrink-0 text-eu-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <div>
            <p className="text-xs font-medium text-slate-500">Enforcement Date</p>
            <p className="font-semibold text-navy">{result.enforcementDate}</p>
          </div>
        </div>

        {/* Applicable articles */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-navy">
            Applicable Articles
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.articles.map((article) => (
              <ArticleReference key={article} article={article} />
            ))}
          </div>
        </div>

        {/* Reasoning chain */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-navy">
            Reasoning
          </h3>
          <ol className="space-y-2">
            {result.reasoning.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-eu-blue/10 text-xs font-bold text-eu-blue">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-eu-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-eu-blue/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 min-h-[44px]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
            </svg>
            Go to Dashboard
          </Link>
          {result.tier !== 'prohibited' && result.tier !== 'minimal' && (
            <Link
              href={`/checklist/${result.tier}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-navy shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 min-h-[44px]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              View Compliance Checklist
            </Link>
          )}

          <button
            type="button"
            onClick={handleCopyUrl}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-eu-blue focus:ring-offset-2 ${
              copied
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-300 bg-white text-navy hover:bg-gray-50'
            }`}
          >
            {copied ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            )}
            {copied ? 'Copied!' : 'Share Result'}
          </button>
        </div>
      </div>
    </div>
  );
}
