'use client';

import { TierType } from '@/lib/types';

interface TierBadgeProps {
  tier: TierType | null;
}

export function TierBadge({ tier }: TierBadgeProps) {
  if (!tier) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
        Not Yet Assessed
      </span>
    );
  }

  const getTierColor = () => {
    switch (tier) {
      case 'High Growth Market':
        return 'bg-green-100 text-green-700';
      case 'Niche/Saturated':
        return 'bg-yellow-100 text-yellow-700';
      case 'Strategic Pivot Required':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTierColor()}`}>
      {tier}
    </span>
  );
}
