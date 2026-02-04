'use client';

import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import {
  cn,
  getEraColor,
  getEraLabel,
  getEraHexColor,
  getCategoryLabel,
  getCategoryBadgeClass,
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
  return (
    <Link
      href={`/persons/${id}`}
      className="group block rounded-xl border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 hover:border-slate-600/50 transition-all duration-200 overflow-hidden"
    >
      {/* Era accent bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: getEraHexColor(era) }}
      />

      <div className="p-4">
        {/* Category badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border font-medium',
              getCategoryBadgeClass(category)
            )}
          >
            {getCategoryLabel(category)}
          </span>
          {categories &&
            categories
              .filter((c) => c !== category)
              .map((c) => (
                <span
                  key={c}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                    getCategoryBadgeClass(c)
                  )}
                >
                  {getCategoryLabel(c)}
                </span>
              ))}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
          {name.ko}
        </h3>
        <p className="text-sm text-slate-400">{name.en}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatYear(period.start)} ~ {formatYear(period.end)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location.region}
          </span>
          <span className={cn('font-medium', getEraColor(era))}>
            {getEraLabel(era)}
          </span>
        </div>

        {/* Summary */}
        <p className="mt-3 text-sm text-slate-400 leading-relaxed line-clamp-2">
          {summary}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
