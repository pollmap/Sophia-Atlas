'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Layers, Calendar, MapPin, Sparkles } from 'lucide-react';
import { cn, getEraLabel, getEraColor, formatYear } from '@/lib/utils';

import eventsData from '@/data/entities/events.json';
import ideologiesData from '@/data/entities/ideologies.json';
import movementsData from '@/data/entities/movements.json';
import institutionsData from '@/data/entities/institutions.json';
import textsData from '@/data/entities/texts.json';
import conceptsData from '@/data/entities/concepts.json';
import archetypesData from '@/data/entities/archetypes.json';
import artMovementsData from '@/data/entities/art-movements.json';
import technologiesData from '@/data/entities/technologies.json';

type EntityData = {
  id: string;
  type: string;
  name: { ko: string; en: string; original?: string };
  period?: { start: number; end: number; approximate?: boolean };
  location?: { lat: number; lng: number; region: string };
  era?: string;
  summary: string;
  tags: string[];
  [key: string]: unknown;
};

const allEntities: EntityData[] = [
  ...(eventsData as EntityData[]),
  ...(ideologiesData as EntityData[]),
  ...(movementsData as EntityData[]),
  ...(institutionsData as EntityData[]),
  ...(textsData as EntityData[]),
  ...(conceptsData as EntityData[]),
  ...(archetypesData as EntityData[]),
  ...(artMovementsData as EntityData[]),
  ...(technologiesData as EntityData[]),
];

const typeLabels: Record<string, string> = {
  event: '역사적 사건',
  ideology: '사상/이념',
  movement: '운동/학파',
  institution: '기관/조직',
  text: '경전/문헌',
  concept: '핵심 개념',
  tradition: '전통',
  archetype: '신화/원형',
  art_movement: '예술운동',
  technology: '기술 패러다임',
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  event: { bg: 'rgba(139, 64, 64, 0.1)', text: '#8B4040', border: 'rgba(139, 64, 64, 0.3)' },
  ideology: { bg: 'rgba(107, 78, 138, 0.1)', text: '#6B4E8A', border: 'rgba(107, 78, 138, 0.3)' },
  movement: { bg: 'rgba(74, 93, 138, 0.1)', text: '#4A5D8A', border: 'rgba(74, 93, 138, 0.3)' },
  institution: { bg: 'rgba(184, 134, 11, 0.1)', text: '#B8860B', border: 'rgba(184, 134, 11, 0.3)' },
  text: { bg: 'rgba(91, 115, 85, 0.1)', text: '#5B7355', border: 'rgba(91, 115, 85, 0.3)' },
  concept: { bg: 'rgba(74, 122, 107, 0.1)', text: '#4A7A6B', border: 'rgba(74, 122, 107, 0.3)' },
  tradition: { bg: 'rgba(156, 102, 68, 0.1)', text: '#9C6644', border: 'rgba(156, 102, 68, 0.3)' },
  archetype: { bg: 'rgba(128, 90, 147, 0.1)', text: '#805A93', border: 'rgba(128, 90, 147, 0.3)' },
  art_movement: { bg: 'rgba(193, 84, 138, 0.1)', text: '#C1548A', border: 'rgba(193, 84, 138, 0.3)' },
  technology: { bg: 'rgba(59, 130, 146, 0.1)', text: '#3B8292', border: 'rgba(59, 130, 146, 0.3)' },
};

const typeHexColors: Record<string, string> = {
  event: '#8B4040',
  ideology: '#6B4E8A',
  movement: '#4A5D8A',
  institution: '#B8860B',
  text: '#5B7355',
  concept: '#4A7A6B',
  tradition: '#9C6644',
  archetype: '#805A93',
  art_movement: '#C1548A',
  technology: '#3B8292',
};

const types = ['all', 'event', 'ideology', 'movement', 'institution', 'text', 'concept', 'tradition', 'archetype', 'art_movement', 'technology'];

export default function EntitiesPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allEntities.forEach((e) => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredEntities = useMemo(() => {
    return allEntities.filter((e) => {
      if (selectedType !== 'all' && e.type !== selectedType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fields = [e.name.ko, e.name.en, e.summary, ...e.tags].join(' ').toLowerCase();
        if (!fields.includes(q)) return false;
      }
      return true;
    });
  }, [selectedType, searchQuery]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          <Layers className="w-8 h-8" style={{ color: '#6B4E8A' }} />
          전통·주제 탐색기
        </h1>
        <p className="mb-6" style={{ color: 'var(--ink-light)' }}>
          신화/원형, 종교/영성, 철학/사유, 과학, 예술, 정치, 경제, 기술, 비의 전통 — 총 {allEntities.length}개
        </p>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="주제 검색..."
          className="w-full px-4 py-2.5 rounded border mb-4 transition-colors"
          style={{
            background: 'var(--fresco-parchment)',
            borderColor: 'var(--fresco-shadow)',
            color: 'var(--ink-dark)',
            fontFamily: "'Pretendard', sans-serif",
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--fresco-shadow)'; }}
        />

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const isSelected = selectedType === type;
            const tc = type !== 'all' ? typeColors[type] : null;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{
                  background: isSelected
                    ? type === 'all' ? 'var(--fresco-aged)' : tc?.bg
                    : 'transparent',
                  color: isSelected
                    ? type === 'all' ? 'var(--ink-dark)' : tc?.text
                    : 'var(--ink-light)',
                  borderColor: isSelected
                    ? type === 'all' ? 'var(--fresco-shadow)' : tc?.border
                    : 'var(--fresco-shadow)',
                  fontFamily: "'Pretendard', sans-serif",
                }}
              >
                {type === 'all' ? '전체' : typeLabels[type]}
                <span className="ml-1 opacity-60">
                  {type === 'all'
                    ? allEntities.length
                    : typeCounts[type] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <p className="text-sm mb-4" style={{ color: 'var(--ink-light)' }}>{filteredEntities.length}개의 주제</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => {
            const tc = typeColors[entity.type];
            return (
              <Link
                key={entity.id}
                href={`/entities/${entity.id}`}
                className="group block fresco-card overflow-hidden"
              >
                <div className="h-1 w-full" style={{ backgroundColor: typeHexColors[entity.type] || '#6B6358' }} />
                <div className="p-4">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                    style={{ background: tc?.bg, color: tc?.text, borderColor: tc?.border, fontFamily: "'Pretendard', sans-serif" }}
                  >
                    {typeLabels[entity.type]}
                  </span>
                  <h3 className="text-lg font-bold mt-2 group-hover:opacity-80 transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                    {entity.name.ko}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--ink-light)' }}>{entity.name.en}</p>
                  {entity.period && (
                    <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--ink-light)' }}>
                      <Calendar className="w-3 h-3" />
                      {formatYear(entity.period.start)}
                      {entity.period.end !== entity.period.start && ` ~ ${formatYear(entity.period.end)}`}
                    </div>
                  )}
                  <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--ink-medium)' }}>{entity.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entity.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--fresco-aged)', color: 'var(--ink-light)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
