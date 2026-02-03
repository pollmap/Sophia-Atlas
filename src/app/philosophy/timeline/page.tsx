'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, Filter, MapPin, Tag } from 'lucide-react';
import philosophersData from '@/data/philosophers.json';
import {
  cn,
  getEraColor,
  getEraBgColor,
  getEraLabel,
  formatYear,
} from '@/lib/utils';
import { getEraColorClass, getEraBorderClass, getEraHexColor } from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

const eras: Era[] = ['ancient', 'medieval', 'modern', 'contemporary'];

const eraRanges: Record<Era, { start: number; end: number; label: string }> = {
  ancient: { start: -600, end: 300, label: 'BC 600 ~ AD 300' },
  medieval: { start: 300, end: 1500, label: 'AD 300 ~ AD 1500' },
  modern: { start: 1500, end: 1900, label: 'AD 1500 ~ AD 1900' },
  contemporary: { start: 1900, end: 2025, label: 'AD 1900 ~ 현재' },
};

export default function TimelinePage() {
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const timelineRef = useRef<HTMLDivElement>(null);

  const filteredPhilosophers = useMemo(() => {
    const list = selectedEra === 'all'
      ? [...philosophersData]
      : philosophersData.filter((p) => p.era === selectedEra);
    return list.sort((a, b) => a.period.start - b.period.start);
  }, [selectedEra]);

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const amount = 400;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  // Map a year to horizontal position in the timeline (0-100%)
  const getTimelinePosition = (year: number): number => {
    const totalStart = -600;
    const totalEnd = 2025;
    const range = totalEnd - totalStart;
    return ((year - totalStart) / range) * 100;
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/Sophia-Atlas/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          철학의 타임라인
        </h1>
        <p className="text-slate-400">BC 600 ~ 현재</p>
      </div>

      {/* Era Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500 mr-1" />
          <button
            onClick={() => setSelectedEra('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              selectedEra === 'all'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
            )}
          >
            전체
          </button>
          {eras.map((era) => (
            <button
              key={era}
              onClick={() => setSelectedEra(era)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedEra === era
                  ? cn(getEraColorClass(era))
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
              )}
            >
              {getEraLabel(era)}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="relative">
          {/* Scroll buttons */}
          <button
            onClick={() => scrollTimeline('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTimeline('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div
            ref={timelineRef}
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 mx-10"
          >
            <div className="relative min-w-[1400px] h-52">
              {/* Era background bands */}
              {eras.map((era) => {
                const range = eraRanges[era];
                const left = getTimelinePosition(range.start);
                const right = getTimelinePosition(range.end);
                const width = right - left;
                return (
                  <div
                    key={era}
                    className="absolute top-0 bottom-0 opacity-10"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: getEraHexColor(era),
                    }}
                  />
                );
              })}

              {/* Timeline axis */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-600" />

              {/* Era labels */}
              {eras.map((era) => {
                const range = eraRanges[era];
                const center = getTimelinePosition((range.start + range.end) / 2);
                return (
                  <div
                    key={`label-${era}`}
                    className="absolute bottom-2 text-center"
                    style={{ left: `${center}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className={cn('text-xs font-medium', getEraColor(era))}>
                      {getEraLabel(era)}
                    </span>
                    <p className="text-[10px] text-slate-600">{range.label}</p>
                  </div>
                );
              })}

              {/* Philosopher dots */}
              {filteredPhilosophers.map((p, idx) => {
                const left = getTimelinePosition(p.period.start);
                const isEven = idx % 2 === 0;
                return (
                  <Link
                    key={p.id}
                    href={`/Sophia-Atlas/philosophy/${p.id}/`}
                    className="absolute group"
                    style={{
                      left: `${left}%`,
                      top: isEven ? '15%' : '55%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full border-2 border-slate-900 transition-transform group-hover:scale-150',
                          getEraBgColor(p.era as Era)
                        )}
                      />
                      <div className="mt-1 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/50 opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <p className="text-[11px] font-medium text-white">
                          {p.name.ko}
                        </p>
                        <p className="text-[9px] text-slate-500">
                          {formatYear(p.period.start)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Philosopher Cards List */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          사상가 목록
          <span className="text-sm font-normal text-slate-500">
            ({filteredPhilosophers.length}명)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhilosophers.map((p) => (
            <Link
              key={p.id}
              href={`/Sophia-Atlas/philosophy/${p.id}/`}
              className={cn(
                'group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200 border-l-4',
                getEraBorderClass(p.era)
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold group-hover:text-ancient transition-colors">
                    {p.name.ko}
                  </h3>
                  <p className="text-sm text-slate-500">{p.name.en}</p>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    getEraColorClass(p.era)
                  )}
                >
                  {getEraLabel(p.era as Era)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatYear(p.period.start)} ~ {formatYear(p.period.end)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {p.location.region}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.school.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400"
                  >
                    <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                    {s}
                  </span>
                ))}
              </div>

              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {p.summary}
              </p>

              <div className="mt-3 flex items-center text-xs text-slate-500 group-hover:text-ancient transition-colors">
                자세히 보기
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
