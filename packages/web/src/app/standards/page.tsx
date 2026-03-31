'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import {
  getStandards,
  getStandardsByTier,
  getStandardsMapping,
  getPublishedStandards,
  getInDevelopmentStandards,
  RISK_TIERS,
  type Standard,
  type StandardsMapping,
  type RiskTier,
} from '@eu-ai-act/sdk';

type ViewMode = 'list' | 'mapping';
type FilterStatus = 'all' | 'published' | 'in-development';

const statusBadge: Record<string, string> = {
  published: 'bg-green-100 text-green-800 border-green-300',
  'in-development': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  draft: 'bg-blue-100 text-blue-800 border-blue-300',
  withdrawn: 'bg-gray-100 text-gray-500 border-gray-300',
};

export default function StandardsPage() {
  const t = useTranslations('standards');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [tierFilter, setTierFilter] = useState<RiskTier | 'all'>('all');
  const [search, setSearch] = useState('');

  const allStandards = useMemo(() => getStandards(), []);
  const mapping = useMemo(() => getStandardsMapping(), []);

  const filteredStandards = useMemo(() => {
    let result = allStandards;

    if (statusFilter === 'published') result = result.filter(s => s.status === 'published');
    else if (statusFilter === 'in-development') result = result.filter(s => s.status === 'in-development' || s.status === 'draft');

    if (tierFilter !== 'all') result = result.filter(s => s.applicableTiers.includes(tierFilter));

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.organization.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allStandards, statusFilter, tierFilter, search]);

  const publishedCount = useMemo(() => getPublishedStandards().length, []);
  const inDevCount = useMemo(() => getInDevelopmentStandards().length, []);

  return (
    <Layout>
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="page-header pb-8 pt-0">
            <h1>{t('title')}</h1>
            <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-eu-gold-400 to-eu-gold-200" />
          </div>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-soft">
              <p className="text-3xl font-bold text-navy">{allStandards.length}</p>
              <p className="mt-1 text-sm text-slate-500">Total Standards</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-soft">
              <p className="text-3xl font-bold text-green-600">{publishedCount}</p>
              <p className="mt-1 text-sm text-slate-500">Published</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-soft">
              <p className="text-3xl font-bold text-yellow-600">{inDevCount}</p>
              <p className="mt-1 text-sm text-slate-500">In Development</p>
            </div>
          </div>

          {/* View toggle and filters */}
          <div className="mt-8 flex flex-wrap items-end gap-4">
            <div className="flex rounded-lg border border-slate-300 bg-white">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-eu-blue text-white rounded-l-lg' : 'text-slate-600 hover:bg-slate-50 rounded-l-lg'}`}
              >
                Standards List
              </button>
              <button
                onClick={() => setViewMode('mapping')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'mapping' ? 'bg-eu-blue text-white rounded-r-lg' : 'text-slate-600 hover:bg-slate-50 rounded-r-lg'}`}
              >
                Obligation Mapping
              </button>
            </div>

            {viewMode === 'list' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                    className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                  >
                    <option value="all">All statuses</option>
                    <option value="published">Published</option>
                    <option value="in-development">In development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500">Risk Tier</label>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value as RiskTier | 'all')}
                    className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                  >
                    <option value="all">All tiers</option>
                    {RISK_TIERS.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-slate-500">Search</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search standards..."
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                  />
                </div>
              </>
            )}
          </div>

          {/* Standards List View */}
          {viewMode === 'list' && (
            <div className="mt-6 space-y-4">
              {filteredStandards.length === 0 && (
                <div className="text-center py-10 text-slate-500">No standards match your filters.</div>
              )}
              {filteredStandards.map((standard: Standard) => (
                <div key={standard.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-navy">{standard.name}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge[standard.status] ?? statusBadge.draft}`}>
                          {standard.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-slate-600">{standard.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{standard.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {standard.organization}
                    </span>
                    {standard.publicationDate && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {standard.publicationDate}
                      </span>
                    )}
                    {standard.applicableArticles.slice(0, 5).map((art) => (
                      <span key={art} className="rounded-md bg-eu-blue/10 px-2 py-0.5 text-xs font-medium text-eu-blue">
                        Art. {art}
                      </span>
                    ))}
                    {standard.applicableTiers.slice(0, 3).map((tier) => (
                      <span key={tier} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {tier}
                      </span>
                    ))}
                  </div>
                  {standard.url && (
                    <a
                      href={standard.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-eu-blue hover:underline"
                    >
                      View standard &rarr;
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Obligation Mapping View */}
          {viewMode === 'mapping' && (
            <div className="mt-6 space-y-6">
              {mapping.map((m: StandardsMapping) => (
                <div key={m.category} className="rounded-2xl border border-slate-200/80 bg-white shadow-soft overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-navy">{m.category}</h3>
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-600 font-medium">{m.publishedCount} published</span>
                        <span className="text-yellow-600 font-medium">{m.inDevelopmentCount} in dev</span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {m.standards.map((s: Standard) => (
                      <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-sm font-medium text-navy">{s.name}</span>
                          <span className="ml-2 text-sm text-slate-500">{s.title}</span>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge[s.status] ?? statusBadge.draft}`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                    {m.standards.length === 0 && (
                      <div className="px-5 py-3 text-sm text-slate-400 italic">No standards mapped yet</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
