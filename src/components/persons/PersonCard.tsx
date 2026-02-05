'use client';

import Link from 'next/link';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
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
  compact?: boolean;
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
  compact = false,
}: PersonCardProps) {
  const eraColor = getEraHexColor(era);
  const catColor = getCategoryHexColor(category);

  if (compact) {
    // Compact row style — much smaller footprint
    return (
      <Link
        href={`/persons/${id}`}
        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--fresco-aged)]/40 transition-colors"
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: catColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate group-hover:text-[#B8860B] transition-colors" style={{ color: 'var(--ink-dark)' }}>
              {name.ko}
            </span>
            <span className="text-xs truncate" style={{ color: 'var(--ink-faded)' }}>
              {name.en}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--ink-faded)' }}>
            <span>{formatYear(period.start)}~{formatYear(period.end)}</span>
            <span>{location.region}</span>
            <span style={{ color: eraColor }}>{getEraLabel(era)}</span>
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-[var(--ink-faded)] group-hover:text-[#B8860B] transition-colors" />
      </Link>
    );
  }

  // Grid card — compact version
  return (
    <Link
      href={`/persons/${id}`}
      className="group block rounded-lg border overflow-hidden hover:shadow-sm transition-all"
      style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}
    >
      {/* Thin era accent */}
      <div className="h-0.5 w-full" style={{ backgroundColor: eraColor }} />

      <div className="p-3">
        {/* Name + category inline */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="text-sm font-bold group-hover:opacity-80 transition-colors truncate"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              {name.ko}
            </h3>
            <p className="text-xs truncate" style={{ color: 'var(--ink-light)' }}>{name.en}</p>
          </div>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: `${catColor}12`,
              color: catColor,
              borderColor: `${catColor}30`,
            }}
          >
            {getCategoryLabel(category)}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1.5 text-[10px]" style={{ color: 'var(--ink-faded)' }}>
          <span className="flex items-center gap-0.5">
            <Calendar className="w-2.5 h-2.5" />
            {formatYear(period.start)}~{formatYear(period.end)}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />
            {location.region}
          </span>
          <span style={{ color: eraColor }}>{getEraLabel(era)}</span>
        </div>

        {/* Tags inline */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--fresco-aged)', color: 'var(--ink-light)' }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[9px] px-1 py-0.5" style={{ color: 'var(--ink-faded)' }}>
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
