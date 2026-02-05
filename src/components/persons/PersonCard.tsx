'use client';

import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import {
  cn,
  getEraLabel,
  getEraHexColor,
  getCategoryLabel,
  getCategoryHexColor,
  formatYear,
} from '@/lib/utils';

interface PersonCardProps {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: string;
  period: { start: number; end: number };
  location: { region: string };
  category: string;
  categories?: string[];
  subcategory: string;
  tags: string[];
  summary: string;
}

export default function PersonCard({
  id,
  name,
  era,
  period,
  location,
  category,
  categories,
  tags,
  summary,
}: PersonCardProps) {
  const eraColor = getEraHexColor(era);
  const catColor = getCategoryHexColor(category);

  return (
    <Link
      href={`/persons/${id}`}
      className="group block fresco-card overflow-hidden"
    >
      {/* Era accent bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: eraColor }}
      />

      <div className="p-4">
        {/* Category badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
            style={{
              backgroundColor: `${catColor}12`,
              color: catColor,
              borderColor: `${catColor}30`,
            }}
          >
            {getCategoryLabel(category)}
          </span>
          {categories &&
            categories
              .filter((c) => c !== category)
              .map((c) => {
                const cColor = getCategoryHexColor(c);
                return (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                    style={{
                      backgroundColor: `${cColor}12`,
                      color: cColor,
                      borderColor: `${cColor}30`,
                    }}
                  >
                    {getCategoryLabel(c)}
                  </span>
                );
              })}
        </div>

        {/* Name */}
        <h3
          className="text-lg font-bold group-hover:opacity-80 transition-colors"
          style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
        >
          {name.ko}
        </h3>
        <p className="text-sm" style={{ color: 'var(--ink-light)' }}>{name.en}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color: 'var(--ink-faded)' }}>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatYear(period.start)} ~ {formatYear(period.end)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location.region}
          </span>
          <span className="font-medium" style={{ color: eraColor }}>
            {getEraLabel(era)}
          </span>
        </div>

        {/* Summary */}
        <p className="mt-3 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--ink-medium)' }}>
          {summary}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--fresco-aged)', color: 'var(--ink-light)' }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5" style={{ color: 'var(--ink-faded)' }}>
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
