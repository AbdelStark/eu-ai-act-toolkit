'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { RiskBadge, type RiskTier } from '@/components/shared/RiskBadge';
import {
  getPenalties,
  calculatePenaltyExposure,
  formatFineAmount,
  RISK_TIERS,
  type PenaltySummary,
  type OrganizationType,
  type RiskTier as SdkRiskTier,
} from '@eu-ai-act/sdk';

const orgTypes: { value: OrganizationType; label: string }[] = [
  { value: 'large', label: 'Large enterprise' },
  { value: 'sme', label: 'SME (< 250 employees)' },
  { value: 'startup', label: 'Startup (< 3 years)' },
  { value: 'eu-institution', label: 'EU institution / agency' },
];

export default function PenaltiesPage() {
  const t = useTranslations('penalties');
  const [selectedTier, setSelectedTier] = useState<SdkRiskTier>('high-risk');
  const [orgType, setOrgType] = useState<OrganizationType>('large');
  const [revenue, setRevenue] = useState<string>('100000000');

  const allPenalties = useMemo(() => getPenalties(), []);

  const exposure = useMemo(() => {
    const rev = parseInt(revenue, 10);
    if (isNaN(rev) || rev <= 0) return null;
    try {
      return calculatePenaltyExposure({
        tier: selectedTier,
        annualTurnoverEur: rev,
        organizationType: orgType,
      });
    } catch {
      return null;
    }
  }, [selectedTier, orgType, revenue]);

  return (
    <Layout>
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="page-header pb-8 pt-0">
            <h1>{t('title')}</h1>
            <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-eu-gold-400 to-eu-gold-200" />
          </div>
          <p className="mt-2 text-lg text-slate-500">{t('subtitle')}</p>

          {/* Penalty calculator */}
          <div className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-navy">{t('calculator.title')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('calculator.description')}</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-navy">Risk Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as SdkRiskTier)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                >
                  {RISK_TIERS.map((tier) => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy">Organization Type</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                >
                  {orgTypes.map((org) => (
                    <option key={org.value} value={org.value}>{org.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy">Annual Turnover (EUR)</label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="100000000"
                  min="0"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eu-blue focus:outline-none focus:ring-1 focus:ring-eu-blue"
                />
              </div>
            </div>

            {exposure && (
              <div className="mt-6 rounded-lg border border-eu-blue/20 bg-eu-blue/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Maximum Penalty Exposure</p>
                    <p className="mt-1 text-3xl font-bold text-navy">
                      {formatFineAmount(exposure.maxExposureEur)}
                    </p>
                  </div>
                  <RiskBadge tier={selectedTier as RiskTier} size="lg" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs font-medium text-slate-500">Organization Type</p>
                    <p className="mt-0.5 text-sm font-semibold text-navy">{exposure.organizationType}</p>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs font-medium text-slate-500">Applicable Penalties</p>
                    <p className="mt-0.5 text-sm font-semibold text-navy">{exposure.penalties.length} categories</p>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs font-medium text-slate-500">Reductions Applied</p>
                    <p className="mt-0.5 text-sm font-semibold text-navy">
                      {exposure.smeReductionApplied ? 'SME reduction' : exposure.euInstitutionCapApplied ? 'EU institution cap' : 'None'}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 italic">{exposure.summary}</p>
              </div>
            )}
          </div>

          {/* All penalty tiers reference */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-navy">{t('overview.title')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('overview.description')}</p>

            <div className="mt-6 space-y-4">
              {allPenalties.map((penalty: PenaltySummary) => (
                <div
                  key={penalty.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">{penalty.description}</p>
                    </div>
                    <span className="whitespace-nowrap rounded-lg bg-red-50 px-3 py-1.5 text-sm font-bold text-red-700">
                      {formatFineAmount(penalty.maxFineEur)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Article {penalty.article}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Up to {penalty.maxFineTurnoverPercent}% of annual turnover
                    </span>
                    {penalty.applicableTiers.map((tier: string) => (
                      <span key={tier} className="rounded-md bg-eu-blue/10 px-2 py-0.5 text-xs font-medium text-eu-blue">
                        {tier}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
