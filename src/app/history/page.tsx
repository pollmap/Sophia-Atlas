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
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(139,64,64,0.06), transparent)' }} />
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm transition-colors mb-6"
            style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(139,64,64,0.15)' }}>
              <Crown className="w-6 h-6" style={{ color: '#8B4040' }} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                세계사의 흐름
              </h1>
              <p className="mt-1" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                문명의 흥망과 인류의 대전환
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: '#8B4040' }} />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>{historicalPersons.length}</p>
                <p className="text-xs" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>역사 인물</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5" style={{ color: '#8B4040' }} />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>{events.length}</p>
                <p className="text-xs" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>주요 사건</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Era Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          <Calendar className="w-5 h-5" style={{ color: '#8B4040' }} />
          시대별 개관
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eras.map((era) => (
            <div
              key={era}
              className={cn(
                'rounded p-5 transition-all border-t-4',
                getEraBorderClass(era)
              )}
              style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'var(--fresco-parchment)' }}
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
              <p className="text-xs mb-4" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>{eraRanges[era].label}</p>
              <div className="flex gap-4 mb-4">
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>{getEraPersonCount(era)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>인물</p>
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>{getEraEventCount(era)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>사건</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {eraRepresentatives[era].map((name) => (
                  <span
                    key={name}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--fresco-aged)', color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}
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
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          <Flag className="w-5 h-5" style={{ color: '#8B4040' }} />
          주요 역사 사건
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topEvents.map((event) => (
            <Link
              key={event.id}
              href={`/entities/${event.id}`}
              className={cn(
                'group rounded p-5 transition-all duration-200 border-l-4',
                getEraBorderClass(event.era)
              )}
              style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'var(--fresco-parchment)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                    {event.name.ko}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>{event.name.en}</p>
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

              <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
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

              <p className="text-sm line-clamp-2 leading-relaxed mb-3" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                {event.summary}
              </p>

              {event.significance && (
                <p className="text-xs line-clamp-2 italic mb-3" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                  {event.significance}
                </p>
              )}

              <div className="mt-auto flex items-center text-xs transition-colors" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                자세히 보기
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Political & Military Leaders */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          <Sword className="w-5 h-5" style={{ color: '#8B4040' }} />
          정치 지도자 & 군사 지도자
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {politicalLeaders.map((person) => (
            <Link
              key={person.id}
              href={`/persons/${person.id}`}
              className={cn(
                'group rounded p-5 transition-all duration-200 border-l-4',
                getEraBorderClass(person.era)
              )}
              style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'var(--fresco-parchment)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
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
              <p className="text-xs mb-2" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>{person.name.en}</p>
              <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                <Calendar className="w-3 h-3" />
                {formatYear(person.period.start)} ~ {formatYear(person.period.end)}
              </div>
              <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                {person.summary}
              </p>
              <div className="mt-3 flex items-center text-xs transition-colors" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                자세히 보기
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
          <Globe className="w-5 h-5" style={{ color: '#8B4040' }} />
          더 탐색하기
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/history/timeline"
            className="group rounded p-6 transition-all flex items-center gap-4"
            style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'var(--fresco-parchment)' }}
          >
            <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(139,64,64,0.15)' }}>
              <Calendar className="w-6 h-6" style={{ color: '#8B4040' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                역사 타임라인
              </h3>
              <p className="text-sm" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                사건과 인물을 시간순으로 탐색
              </p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--ink-faded)' }} />
          </Link>
          <Link
            href="/history/civilizations"
            className="group rounded p-6 transition-all flex items-center gap-4"
            style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'var(--fresco-parchment)' }}
          >
            <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(139,64,64,0.15)' }}>
              <Landmark className="w-6 h-6" style={{ color: '#8B4040' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold transition-colors" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                문명과 제국
              </h3>
              <p className="text-sm" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>
                지역별 역사 인물과 사건 탐색
              </p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--ink-faded)' }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
