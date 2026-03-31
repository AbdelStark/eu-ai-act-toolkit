'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import {
  getArticles,
  getArticlesByTier,
  RISK_TIERS,
  type RiskTier,
} from '@eu-ai-act/sdk';
import type { ArticleReference } from '@eu-ai-act/sdk';

export default function ArticlesPage() {
  const t = useTranslations('articles');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<RiskTier | 'all'>('all');

  const allArticles = useMemo(() => getArticles(), []);

  const filteredArticles = useMemo(() => {
    let result = tierFilter === 'all' ? allArticles : getArticlesByTier(tierFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          String(a.number).includes(q),
      );
    }

    return result;
  }, [allArticles, tierFilter, search]);

  return (
    <Layout>
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="page-header pb-8 pt-0">
            <h1>{t('title')}</h1>
            <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-eu-gold-400 to-eu-gold-200" />
          </div>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>

          {/* Stats */}
          <div className="mt-6 inline-flex items-center gap-2 chip-blue">
            {allArticles.length} articles indexed
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by article number, title, or content..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
              />
            </div>
            <div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as RiskTier | 'all')}
                className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
              >
                <option value="all">All tiers</option>
                {RISK_TIERS.map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="mt-4 text-sm text-slate-500">
            {filteredArticles.length === allArticles.length
              ? `Showing all ${allArticles.length} articles`
              : `${filteredArticles.length} of ${allArticles.length} articles`}
          </p>

          {/* Article list */}
          <div className="mt-6 space-y-3">
            {filteredArticles.length === 0 && (
              <div className="text-center py-10 text-slate-500">No articles match your search.</div>
            )}
            {filteredArticles.map((article: ArticleReference) => (
              <div
                key={article.number}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition-colors hover:border-slate-300"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-eu-blue/5 text-sm font-bold text-eu-blue">
                    {article.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-navy">
                      Article {article.number}: {article.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {article.applicableTiers.map((tier) => (
                        <span
                          key={tier}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                        >
                          {tier}
                        </span>
                      ))}
                    </div>
                  </div>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-sm text-eu-blue hover:underline"
                      title="View on EUR-Lex"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
