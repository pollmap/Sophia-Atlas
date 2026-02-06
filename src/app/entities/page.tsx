'use client';

import { useState, useEffect, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { getEntityTypeLabel, getEntityTypeColors, ENTITY_TYPES } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';
import SearchBar from '@/components/common/SearchBar';
import EntityCard from '@/components/entities/EntityCard';

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

const types = ['all', ...ENTITY_TYPES];

export default function EntitiesPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 200);

  // Read initial type from URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type && (ENTITY_TYPES as readonly string[]).includes(type)) setSelectedType(type);
  }, []);

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
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const fields = [e.name.ko, e.name.en, e.summary, ...e.tags].join(' ').toLowerCase();
        if (!fields.includes(q)) return false;
      }
      return true;
    });
  }, [selectedType, debouncedSearch]);

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

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="주제 검색..."
          className="mb-4"
        />

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const isSelected = selectedType === type;
            const tc = type !== 'all' ? getEntityTypeColors(type) : null;
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
                {type === 'all' ? '전체' : getEntityTypeLabel(type)}
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
          {filteredEntities.map((entity) => (
            <EntityCard
              key={entity.id}
              id={entity.id}
              type={entity.type}
              name={entity.name}
              period={entity.period}
              era={entity.era}
              summary={entity.summary}
              tags={entity.tags}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
