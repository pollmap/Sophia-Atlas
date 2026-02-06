'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { formatYear, getEntityTypeLabel, getEntityTypeHexColor, getEntityTypeColors } from '@/lib/utils';

interface EntityCardProps {
  id: string;
  type: string;
  name: { ko: string; en: string; original?: string };
  period?: { start: number; end: number; approximate?: boolean };
  era?: string;
  summary: string;
  tags: string[];
  compact?: boolean;
}

export default function EntityCard({
  id,
  type,
  name,
  period,
  summary,
  tags,
  compact = false,
}: EntityCardProps) {
  const tc = getEntityTypeColors(type);
  const hexColor = getEntityTypeHexColor(type);

  if (compact) {
    return (
      <Link
        href={`/entities/${id}`}
        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--fresco-aged)]/40 transition-colors"
      >
        <div
          className="w-2 h-2 rounded flex-shrink-0"
          style={{ backgroundColor: hexColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate group-hover:text-[#B8860B] transition-colors" style={{ color: 'var(--ink-dark)' }}>
              {name.ko}
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0"
              style={{ background: tc.bg, color: tc.text, borderColor: tc.border }}
            >
              {getEntityTypeLabel(type)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/entities/${id}`}
      className="group block fresco-card overflow-hidden"
    >
      <div className="h-1 w-full" style={{ backgroundColor: hexColor }} />
      <div className="p-4">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
          style={{ background: tc.bg, color: tc.text, borderColor: tc.border, fontFamily: "'Pretendard', sans-serif" }}
        >
          {getEntityTypeLabel(type)}
        </span>
        <h3 className="text-lg font-bold mt-2 group-hover:opacity-80 transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          {name.ko}
        </h3>
        <p className="text-sm" style={{ color: 'var(--ink-light)' }}>{name.en}</p>
        {period && (
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--ink-light)' }}>
            <Calendar className="w-3 h-3" />
            {formatYear(period.start)}
            {period.end !== period.start && ` ~ ${formatYear(period.end)}`}
          </div>
        )}
        <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--ink-medium)' }}>{summary}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--fresco-aged)', color: 'var(--ink-light)' }}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
