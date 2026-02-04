'use client';

import { useState, useMemo } from 'react';
import { Users, LayoutGrid, List } from 'lucide-react';
import PersonCard from '@/components/persons/PersonCard';
import PersonFilter from '@/components/persons/PersonFilter';
import { cn, getCategoryLabel, getEraLabel } from '@/lib/utils';

import philosophersData from '@/data/persons/philosophers.json';
import religiousFiguresData from '@/data/persons/religious-figures.json';
import scientistsData from '@/data/persons/scientists.json';
import historicalFiguresData from '@/data/persons/historical-figures.json';

type PersonData = {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: string;
  period: { start: number; end: number; approximate?: boolean };
  location: { lat: number; lng: number; region: string };
  category: string;
  categories?: string[];
  subcategory: string;
  tags: string[];
  mvp: boolean;
  summary: string;
  [key: string]: unknown;
};

const allPersons: PersonData[] = [
  ...(philosophersData as PersonData[]),
  ...(religiousFiguresData as PersonData[]),
  ...(scientistsData as PersonData[]),
  ...(historicalFiguresData as PersonData[]),
].sort((a, b) => a.period.start - b.period.start);

const categoryColorMap: Record<string, string> = {
  philosopher: '#4A5D8A',
  religious_figure: '#B8860B',
  scientist: '#5B7355',
  historical_figure: '#8B4040',
  cultural_figure: '#7A5478',
};

function getCategoryDotColor(category: string): string {
  return categoryColorMap[category] || '#7A6B55';
}

export default function PersonsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEra, setSelectedEra] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allPersons.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const eraCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allPersons.forEach((p) => {
      counts[p.era] = (counts[p.era] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredPersons = useMemo(() => {
    return allPersons.filter((p) => {
      if (selectedCategory !== 'all') {
        const cats = p.categories || [p.category];
        if (!cats.includes(selectedCategory)) return false;
      }
      if (selectedEra !== 'all' && p.era !== selectedEra) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchFields = [
          p.name.ko,
          p.name.en,
          p.name.original || '',
          p.summary,
          ...p.tags,
          ...(Array.isArray((p as Record<string, unknown>).school) ? (p as Record<string, unknown>).school as string[] : []),
          ...(Array.isArray((p as Record<string, unknown>).concepts) ? (p as Record<string, unknown>).concepts as string[] : []),
        ].join(' ').toLowerCase();
        if (!searchFields.includes(q)) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedEra, searchQuery]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold flex items-center gap-3"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Users className="w-8 h-8" style={{ color: '#4A5D8A' }} />
              인물 탐색기
            </h1>
            <p style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }} className="mt-1">
              인류 사상사의 핵심 인물 {allPersons.length}명을 탐색하세요
            </p>
          </div>
          <div
            className="flex items-center gap-1 p-1"
            style={{
              background: 'var(--fresco-parchment)',
              borderRadius: '4px',
              border: '1px solid var(--fresco-shadow)',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 transition-colors"
              style={{
                borderRadius: '4px',
                background: viewMode === 'grid' ? 'var(--fresco-aged)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--ink-dark)' : 'var(--ink-light)',
              }}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 transition-colors"
              style={{
                borderRadius: '4px',
                background: viewMode === 'list' ? 'var(--fresco-aged)' : 'transparent',
                color: viewMode === 'list' ? 'var(--ink-dark)' : 'var(--ink-light)',
              }}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <PersonFilter
          selectedCategory={selectedCategory}
          selectedEra={selectedEra}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onEraChange={setSelectedEra}
          onSearchChange={setSearchQuery}
          categoryCounts={categoryCounts}
          eraCounts={eraCounts}
        />
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <p className="text-sm mb-4" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
          {filteredPersons.length}명의 인물
        </p>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPersons.map((person) => (
              <PersonCard
                key={person.id}
                id={person.id}
                name={person.name}
                era={person.era}
                period={person.period}
                location={person.location}
                category={person.category}
                categories={person.categories}
                subcategory={person.subcategory}
                tags={person.tags}
                summary={person.summary}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPersons.map((person) => (
              <a
                key={person.id}
                href={`/persons/${person.id}`}
                className="flex items-center gap-4 p-3 transition-colors"
                style={{
                  borderRadius: '4px',
                  border: '1px solid var(--fresco-shadow)',
                  background: 'var(--fresco-parchment)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--fresco-aged)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--fresco-parchment)';
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryDotColor(person.category) }}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium" style={{ color: 'var(--ink-dark)' }}>{person.name.ko}</span>
                  <span className="ml-2 text-sm" style={{ color: 'var(--ink-light)' }}>{person.name.en}</span>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                  {getEraLabel(person.era)}
                </span>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>
                  {person.location.region}
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
