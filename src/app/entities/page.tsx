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
];

const typeLabels: Record<string, string> = {
  event: '역사적 사건',
  ideology: '사상/이념',
  movement: '운동/학파',
  institution: '기관/조직',
  text: '경전/문헌',
  concept: '핵심 개념',
};

const typeColors: Record<string, string> = {
  event: 'bg-red-500/20 text-red-300 border-red-500/30',
  ideology: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  movement: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  institution: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  text: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  concept: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

const typeHexColors: Record<string, string> = {
  event: '#EF4444',
  ideology: '#A855F7',
  movement: '#3B82F6',
  institution: '#F59E0B',
  text: '#10B981',
  concept: '#06B6D4',
};

const types = ['all', 'event', 'ideology', 'movement', 'institution', 'text', 'concept'];

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
    <div className="min-h-screen bg-[#0F172A]">
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Layers className="w-8 h-8 text-purple-400" />
          엔터티 탐색기
        </h1>
        <p className="text-slate-400 mb-6">
          역사적 사건, 사상, 운동, 기관, 경전, 개념 — 총 {allEntities.length}개
        </p>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="엔터티 검색..."
          className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 mb-4"
        />

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all',
                selectedType === type
                  ? type === 'all'
                    ? 'bg-white/10 text-white border-white/30'
                    : typeColors[type]
                  : 'border-slate-700/50 text-slate-500 hover:text-slate-300'
              )}
            >
              {type === 'all' ? '전체' : typeLabels[type]}
              <span className="ml-1 opacity-60">
                {type === 'all'
                  ? allEntities.length
                  : typeCounts[type] || 0}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <p className="text-sm text-slate-500 mb-4">{filteredEntities.length}개의 엔터티</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => (
            <Link
              key={entity.id}
              href={`/entities/${entity.id}/`}
              className="group block rounded-xl border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all overflow-hidden"
            >
              <div className="h-1 w-full" style={{ backgroundColor: typeHexColors[entity.type] || '#64748B' }} />
              <div className="p-4">
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', typeColors[entity.type])}>
                  {typeLabels[entity.type]}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 group-hover:text-purple-300 transition-colors">
                  {entity.name.ko}
                </h3>
                <p className="text-sm text-slate-400">{entity.name.en}</p>
                {entity.period && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatYear(entity.period.start)}
                    {entity.period.end !== entity.period.start && ` ~ ${formatYear(entity.period.end)}`}
                  </div>
                )}
                <p className="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-2">{entity.summary}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {entity.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
