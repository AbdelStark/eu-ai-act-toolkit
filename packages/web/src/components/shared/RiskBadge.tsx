'use client';

import { useTranslations } from 'next-intl';

/**
 * Risk tiers as defined by the EU AI Act.
 * These match the keys used in tailwind.config.ts tier colors.
 */
export type RiskTier =
  | 'prohibited'
  | 'high-risk'
  | 'gpai'
  | 'gpai-systemic'
  | 'limited'
  | 'minimal';

interface RiskBadgeProps {
  /** The risk tier to display */
  tier: RiskTier;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Maps each tier to Tailwind color classes.
 * Uses the tier color palette from tailwind.config.ts:
 *   prohibited = #dc2626 (red-600)
 *   high-risk  = #ea580c (orange-600)
 *   gpai       = #ca8a04 (yellow-600)
 *   gpai-systemic = #c2410c (orange-700)
 *   limited    = #2563eb (blue-600)
 *   minimal    = #16a34a (green-600)
 */
const tierStyles: Record<RiskTier, string> = {
  prohibited:
    'bg-red-100 text-red-800 border-red-300 ring-red-600/20',
  'high-risk':
    'bg-orange-100 text-orange-800 border-orange-300 ring-orange-600/20',
  gpai: 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-yellow-600/20',
  'gpai-systemic':
    'bg-orange-100 text-orange-900 border-orange-400 ring-orange-700/20',
  limited:
    'bg-blue-100 text-blue-800 border-blue-300 ring-blue-600/20',
  minimal:
    'bg-green-100 text-green-800 border-green-300 ring-green-600/20',
};

const sizeStyles: Record<NonNullable<RiskBadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

/**
 * Map tier keys to the next-intl translation keys.
 * The common.tiers keys use camelCase in the messages file.
 */
const tierTranslationKeys: Record<RiskTier, string> = {
  prohibited: 'prohibited',
  'high-risk': 'highRisk',
  gpai: 'gpai',
  'gpai-systemic': 'gpaiSystemic',
  limited: 'limited',
  minimal: 'minimal',
};

export function RiskBadge({
  tier,
  size = 'md',
  className,
}: RiskBadgeProps) {
  const t = useTranslations('common.tiers');
  const translationKey = tierTranslationKeys[tier];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ring-1 ring-inset ${tierStyles[tier]} ${sizeStyles[size]} ${className ?? ''}`}
    >
      <span
        className={`mr-1.5 inline-block h-2 w-2 rounded-full ${tierDotColor[tier]}`}
        aria-hidden="true"
      />
      {t(translationKey)}
    </span>
  );
}

/** Solid dot colors for each tier. */
const tierDotColor: Record<RiskTier, string> = {
  prohibited: 'bg-red-600',
  'high-risk': 'bg-orange-600',
  gpai: 'bg-yellow-600',
  'gpai-systemic': 'bg-orange-700',
  limited: 'bg-blue-600',
  minimal: 'bg-green-600',
};
