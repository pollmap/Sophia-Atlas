'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Crown,
  Globe,
  Calendar,
  MapPin,
  ArrowLeft,
  ChevronRight,
  Flag,
  Shield,
  Landmark,
  Sword,
} from 'lucide-react';
import historicalFiguresData from '@/data/persons/historical-figures.json';
import eventsData from '@/data/entities/events.json';
import {
  cn,
  getEraColor,
  getEraBgColor,
  getEraLabel,
  getEraColorClass,
  getEraBorderClass,
  getEraHexColor,
  formatYear,
  getCategoryBadgeClass,
} from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

const eras: Era[] = ['ancient', 'medieval', 'modern', 'contemporary'];

const eraRanges: Record<Era, { start: number; end: number; label: string }> = {
  ancient: { start: -3000, end: 500, label: 'BC 3000 ~ AD 500' },
  medieval: { start: 500, end: 1500, label: 'AD 500 ~ AD 1500' },
  modern: { start: 1500, end: 1900, label: 'AD 1500 ~ AD 1900' },
  contemporary: { start: 1900, end: 2025, label: 'AD 1900 ~ 현재' },
};

const eraRepresentatives: Record<Era, string[]> = {
  ancient: ['알렉산드로스', '손자', '카이사르'],
  medieval: ['칭기즈 칸', '잔 다르크'],
  modern: ['나폴레옹', '링컨', '콜럼버스'],
  contemporary: ['간디', '만델라', '처칠'],
};

export default function HistoryPage() {
  const historicalPersons = useMemo(
    () => historicalFiguresData.filter((p) => p.category === 'historical_figure'),
    []
  );

  const events = useMemo(() => [...eventsData], []);

  const getEraPersonCount = (era: Era) =>
    historicalPersons.filter((p) => p.era === era).length;

  const getEraEventCount = (era: Era) =>
    events.filter((e) => e.era === era).length;

  const politicalLeaders = useMemo(
    () =>
      historicalPersons
        .filter(
          (p) =>
            p.subcategory === 'political_leader' ||
            p.subcategory === 'military_leader'
        )
        .slice(0, 8),
    [historicalPersons]
  );

  const topEvents = useMemo(() => events.slice(0, 12), [events]);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                세계사의 흐름
              </h1>
              <p className="text-slate-400 mt-1">
                문명의 흥망과 인류의 대전환
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{historicalPersons.length}</p>
                <p className="text-xs text-slate-500">역사 인물</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{events.length}</p>
                <p className="text-xs text-slate-500">주요 사건</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Era Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-red-400" />
          시대별 개관
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eras.map((era) => (
            <div
              key={era}
              className={cn(
                'rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 hover:bg-slate-800/50 transition-all border-t-4',
                getEraBorderClass(era)
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={cn(
                    'text-sm px-3 py-1 rounded-full font-medium',
                    getEraColorClass(era)
                  )}
                >
                  {getEraLabel(era)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{eraRanges[era].label}</p>
              <div className="flex gap-4 mb-4">
                <div>
                  <p className="text-lg font-bold text-white">{getEraPersonCount(era)}</p>
                  <p className="text-[10px] text-slate-500">인물</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{getEraEventCount(era)}</p>
                  <p className="text-[10px] text-slate-500">사건</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {eraRepresentatives[era].map((name) => (
                  <span
                    key={name}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Events Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-400" />
          주요 역사 사건
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topEvents.map((event) => (
            <Link
              key={event.id}
              href={`/entities/${event.id}`}
              className={cn(
                'group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200 border-l-4',
                getEraBorderClass(event.era)
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold group-hover:text-red-400 transition-colors">
                    {event.name.ko}
                  </h3>
                  <p className="text-sm text-slate-500">{event.name.en}</p>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium shrink-0',
                    getEraColorClass(event.era)
                  )}
                >
                  {getEraLabel(event.era)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatYear(event.period.start)}
                  {event.period.end !== event.period.start &&
                    ` ~ ${formatYear(event.period.end)}`}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location.region}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {event.summary}
              </p>

              {event.significance && (
                <p className="text-xs text-slate-500 line-clamp-2 italic mb-3">
                  {event.significance}
                </p>
              )}

              <div className="mt-auto flex items-center text-xs text-slate-500 group-hover:text-red-400 transition-colors">
                자세히 보기
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Political & Military Leaders */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Sword className="w-5 h-5 text-red-400" />
          정치 지도자 & 군사 지도자
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {politicalLeaders.map((person) => (
            <Link
              key={person.id}
              href={`/persons/${person.id}`}
              className={cn(
                'group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200 border-l-4',
                getEraBorderClass(person.era)
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold group-hover:text-red-400 transition-colors">
                  {person.name.ko}
                </h3>
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0',
                    getEraColorClass(person.era)
                  )}
                >
                  {getEraLabel(person.era)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{person.name.en}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Calendar className="w-3 h-3" />
                {formatYear(person.period.start)} ~ {formatYear(person.period.end)}
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {person.summary}
              </p>
              <div className="mt-3 flex items-center text-xs text-slate-500 group-hover:text-red-400 transition-colors">
                자세히 보기
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-red-400" />
          더 탐색하기
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/history/timeline"
            className="group rounded-xl border border-slate-700/50 bg-slate-800/20 p-6 hover:bg-slate-800/40 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold group-hover:text-red-400 transition-colors">
                역사 타임라인
              </h3>
              <p className="text-sm text-slate-400">
                사건과 인물을 시간순으로 탐색
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-400 transition-colors" />
          </Link>
          <Link
            href="/history/civilizations"
            className="group rounded-xl border border-slate-700/50 bg-slate-800/20 p-6 hover:bg-slate-800/40 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold group-hover:text-red-400 transition-colors">
                문명과 제국
              </h3>
              <p className="text-sm text-slate-400">
                지역별 역사 인물과 사건 탐색
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
