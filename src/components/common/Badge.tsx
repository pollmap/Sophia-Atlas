'use client';

import {
  getEraLabel,
  getEraHexColor,
  getCategoryLabel,
  getCategoryHexColor,
  getEntityTypeLabel,
  getEntityTypeHexColor,
} from '@/lib/utils';

type BadgeVariant = 'era' | 'category' | 'entityType' | 'custom';

interface BadgeProps {
  variant: BadgeVariant;
  value: string;
  className?: string;
}

function getBadgeConfig(variant: BadgeVariant, value: string) {
  switch (variant) {
    case 'era':
      return { label: getEraLabel(value), color: getEraHexColor(value) };
    case 'category':
      return { label: getCategoryLabel(value), color: getCategoryHexColor(value) };
    case 'entityType':
      return { label: getEntityTypeLabel(value), color: getEntityTypeHexColor(value) };
    case 'custom':
      return { label: value, color: 'var(--ink-light)' };
  }
}

export default function Badge({ variant, value, className = '' }: BadgeProps) {
  const { label, color } = getBadgeConfig(variant, value);

  return (
    <span
      className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium inline-flex items-center ${className}`}
      style={{
        backgroundColor: `${color}12`,
        color: color,
        borderColor: `${color}30`,
        fontFamily: "'Pretendard', sans-serif",
      }}
    >
      {label}
    </span>
  );
}
