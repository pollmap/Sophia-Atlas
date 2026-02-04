'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronRight,
  Crown,
  Diamond,
  Filter,
  Flag,
  MapPin,
  Minus,
  Plus,
  Shield,
  Tag,
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
  getCategoryColor,
  getCategoryHexColor,
} from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

const eras: Era[] = ['ancient', 'medieval', 'modern', 'contemporary'];

const eraRanges: Record<Era, { start: number; end: number; label: string }> = {
  ancient: { start: -3000, end: 500, label: 'BC 3000 ~ AD 500' },
  medieval: { start: 500, end: 1500, label: 'AD 500 ~ AD 1500' },
  modern: { start: 1500, end: 1900, label: 'AD 1500 ~ AD 1900' },
  contemporary: { start: 1900, end: 2025, label: 'AD 1900 ~ 현재' },
};

// Domain grouping based on subcategory
const domainGroups: Record<string, { label: string; color: string }> = {
  political_leader: { label: '정치', color: '#EF4444' },
  military_leader: { label: '군사', color: '#F97316' },
  social_reformer: { label: '시민/인권', color: '#8B5CF6' },
  explorer: { label: '탐험', color: '#06B6D4' },
  literary_figure: { label: '문학', color: '#EC4899' },
  artist: { label: '미술', color: '#F59E0B' },
  musician: { label: '음악', color: '#10B981' },
};

function getDomainInfo(subcategory: string) {
  return domainGroups[subcategory] || { label: '기타', color: '#64748B' };
}

export default function HistoryTimelinePage() {
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'persons' | 'events'>('all');
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  const historicalPersons = useMemo(
    () =>
      [...historicalFiguresData]
        .sort((a, b) => a.period.start - b.period.start),
    []
  );

  const events = useMemo(
    () => [...eventsData].sort((a, b) => a.period.start - b.period.start),
    []
  );

  const filteredPersons = useMemo(() => {
    if (selectedEra === 'all') return historicalPersons;
    return historicalPersons.filter((p) => p.era === selectedEra);
  }, [selectedEra, historicalPersons]);

  const filteredEvents = useMemo(() => {
    if (selectedEra === 'all') return events;
    return events.filter((e) => e.era === selectedEra);
  }, [selectedEra, events]);

  // Group persons by domain for the upper track
  const personsByDomain = useMemo(() => {
    const groups: Record<string, typeof filteredPersons> = {};
    const domainOrder = Object.keys(domainGroups);

    filteredPersons.forEach((p) => {
      const key = p.subcategory || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    // Sort by domain order
    const sorted: { domain: string; info: { label: string; color: string }; persons: typeof filteredPersons }[] = [];
    domainOrder.forEach((d) => {
      if (groups[d] && groups[d].length > 0) {
        sorted.push({ domain: d, info: getDomainInfo(d), persons: groups[d] });
      }
    });
    // Add any remaining
    Object.keys(groups).forEach((d) => {
      if (!domainOrder.includes(d)) {
        sorted.push({ domain: d, info: getDomainInfo(d), persons: groups[d] });
      }
    });
    return sorted;
  }, [filteredPersons]);

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const amount = 400;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const totalStart = -3000;
  const totalEnd = 2025;
  const totalRange = totalEnd - totalStart;

  const getTimelinePosition = useCallback(
    (year: number): number => {
      return ((year - totalStart) / totalRange) * 100;
    },
    []
  );

  const getBarWidth = useCallback(
    (start: number, end: number): number => {
      const s = Math.max(start, totalStart);
      const e = Math.min(end, totalEnd);
      return ((e - s) / totalRange) * 100;
    },
    []
  );

  const baseWidth = 2500;
  const timelineWidth = baseWidth * zoom;

  // Century markers
  const centuryMarkers = useMemo(() => {
    const markers: number[] = [];
    for (let y = -3000; y <= 2000; y += 500) {
      markers.push(y);
    }
    // Add more granular markers at higher zoom
    if (zoom >= 1.5) {
      for (let y = -3000; y <= 2000; y += 100) {
        if (y % 500 !== 0) markers.push(y);
      }
    }
    return markers.sort((a, b) => a - b);
  }, [zoom]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 0.5));

  // Compute row height per domain
  const DOMAIN_ROW_HEIGHT = 32;
  const upperTrackHeight = Math.max(personsByDomain.length * DOMAIN_ROW_HEIGHT + 40, 120);
  const EVENTS_TRACK_HEIGHT = 100;
  const AXIS_HEIGHT = 30;
  const totalTimelineHeight = upperTrackHeight + AXIS_HEIGHT + EVENTS_TRACK_HEIGHT;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/history/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          역사 허브로
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              역사 사건과 인물의 타임라인
            </h1>
            <p className="text-slate-400 mt-1">BC 3000 ~ 현재</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-red-400" />
            인물 {filteredPersons.length}명
          </span>
          <span className="flex items-center gap-1">
            <Flag className="w-4 h-4 text-amber-400" />
            사건 {filteredEvents.length}개
          </span>
        </div>
      </div>

      {/* Era Filters + Zoom */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500 mr-1" />
            <button
              onClick={() => setSelectedEra('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedEra === 'all'
                  ? 'bg-red-600 text-white'
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

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">줌</span>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-400 w-10 text-center">{zoom}x</span>
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Domain legend */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span className="text-slate-500">분야:</span>
          {Object.entries(domainGroups).map(([key, { label, color }]) => (
            <span key={key} className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-slate-400">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Dual-Track Timeline */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="relative rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
          {/* Scroll buttons */}
          <button
            onClick={() => scrollTimeline('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTimeline('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div
            ref={timelineRef}
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
          >
            <div
              className="relative"
              style={{
                width: `${timelineWidth}px`,
                height: `${totalTimelineHeight}px`,
              }}
            >
              {/* Era background bands (vertical) */}
              {eras.map((era) => {
                const range = eraRanges[era];
                const left = getTimelinePosition(range.start);
                const width = getTimelinePosition(range.end) - left;
                return (
                  <div
                    key={era}
                    className="absolute top-0 bottom-0 opacity-[0.06]"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: getEraHexColor(era),
                    }}
                  />
                );
              })}

              {/* Century marker lines */}
              {centuryMarkers.map((year) => {
                const left = getTimelinePosition(year);
                const isMajor = year % 500 === 0;
                return (
                  <div
                    key={`marker-${year}`}
                    className="absolute top-0 bottom-0"
                    style={{ left: `${left}%` }}
                  >
                    <div
                      className={cn(
                        'w-px h-full',
                        isMajor ? 'bg-slate-700/60' : 'bg-slate-800/40'
                      )}
                    />
                  </div>
                );
              })}

              {/* ── UPPER SECTION: Historical Figures as lifespan bars ── */}
              <div
                className="absolute left-0 right-0"
                style={{ top: 0, height: `${upperTrackHeight}px` }}
              >
                {/* Section label */}
                <div className="absolute top-2 left-3 z-10 text-[10px] text-red-400 font-medium flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded">
                  <Crown className="w-3 h-3" />
                  역사 인물
                </div>

                {/* Domain swim lanes */}
                {personsByDomain.map((group, rowIdx) => {
                  const y = rowIdx * DOMAIN_ROW_HEIGHT + 28;
                  return (
                    <div key={group.domain}>
                      {/* Domain label */}
                      <div
                        className="absolute left-3 z-10 text-[9px] font-medium bg-slate-900/80 px-1.5 py-0.5 rounded"
                        style={{
                          top: `${y + 4}px`,
                          color: group.info.color,
                        }}
                      >
                        {group.info.label}
                      </div>

                      {/* Lifespan bars */}
                      {group.persons.map((p) => {
                        const left = getTimelinePosition(p.period.start);
                        const width = getBarWidth(p.period.start, p.period.end);
                        return (
                          <Link
                            key={p.id}
                            href={`/persons/${p.id}/`}
                            className="absolute group"
                            style={{
                              left: `${left}%`,
                              top: `${y + 2}px`,
                              width: `${Math.max(width, 0.3)}%`,
                              height: `${DOMAIN_ROW_HEIGHT - 6}px`,
                            }}
                          >
                            <div
                              className="h-full rounded-sm flex items-center px-1 overflow-hidden transition-all group-hover:brightness-125 group-hover:ring-1 group-hover:ring-white/30"
                              style={{
                                backgroundColor: group.info.color,
                                opacity: 0.75,
                              }}
                            >
                              <span className="text-[9px] font-medium text-white whitespace-nowrap truncate">
                                {p.name.ko}
                              </span>
                            </div>
                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30">
                              <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                                <p className="text-[11px] font-semibold text-white">{p.name.ko}</p>
                                <p className="text-[10px] text-slate-400">{p.name.en}</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">
                                  {formatYear(p.period.start)} ~ {formatYear(p.period.end)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* ── TIME AXIS ── */}
              <div
                className="absolute left-0 right-0"
                style={{ top: `${upperTrackHeight}px`, height: `${AXIS_HEIGHT}px` }}
              >
                <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-600" />
                {centuryMarkers.filter((y) => y % 500 === 0).map((year) => {
                  const left = getTimelinePosition(year);
                  return (
                    <div
                      key={`axis-${year}`}
                      className="absolute"
                      style={{
                        left: `${left}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded">
                        {formatYear(year)}
                      </span>
                    </div>
                  );
                })}

                {/* Era labels on axis */}
                {eras.map((era) => {
                  const range = eraRanges[era];
                  const center = getTimelinePosition((range.start + range.end) / 2);
                  return (
                    <div
                      key={`eralabel-${era}`}
                      className="absolute"
                      style={{
                        left: `${center}%`,
                        bottom: '2px',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <span
                        className={cn(
                          'text-[9px] font-medium px-1.5 py-0.5 rounded',
                          getEraColor(era)
                        )}
                      >
                        {getEraLabel(era)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ── LOWER SECTION: Events as diamond markers ── */}
              <div
                className="absolute left-0 right-0"
                style={{
                  top: `${upperTrackHeight + AXIS_HEIGHT}px`,
                  height: `${EVENTS_TRACK_HEIGHT}px`,
                }}
              >
                {/* Section label */}
                <div className="absolute top-2 left-3 z-10 text-[10px] text-amber-400 font-medium flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded">
                  <Flag className="w-3 h-3" />
                  역사 사건
                </div>

                {filteredEvents.map((event, idx) => {
                  const left = getTimelinePosition(event.period.start);
                  const verticalOffset = (idx % 3) * 28 + 24;
                  return (
                    <Link
                      key={event.id}
                      href={`/entities/${event.id}/`}
                      className="absolute group"
                      style={{
                        left: `${left}%`,
                        top: `${verticalOffset}px`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rotate-45 border border-slate-700 transition-transform group-hover:scale-150"
                          style={{ backgroundColor: getEraHexColor(event.era) }}
                        />
                        <div className="mt-0.5 px-2 py-0.5 rounded bg-slate-800/80 border border-amber-700/30 opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <p className="text-[9px] font-medium text-amber-200">
                            {event.name.ko}
                          </p>
                          <p className="text-[8px] text-slate-500">
                            {formatYear(event.period.start)}
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
      </div>

      {/* Tab Toggle */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex gap-2">
          {([
            { key: 'all', label: '전체' },
            { key: 'persons', label: '인물' },
            { key: 'events', label: '사건' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Person Cards */}
        {(activeTab === 'all' || activeTab === 'persons') && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-red-400" />
              역사 인물
              <span className="text-sm font-normal text-slate-500">
                ({filteredPersons.length}명)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPersons.map((p) => {
                const domainInfo = getDomainInfo(p.subcategory);
                return (
                  <Link
                    key={p.id}
                    href={`/persons/${p.id}/`}
                    className={cn(
                      'group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200 border-l-4',
                      getEraBorderClass(p.era)
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold group-hover:text-red-400 transition-colors">
                          {p.name.ko}
                        </h3>
                        <p className="text-sm text-slate-500">{p.name.en}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: domainInfo.color + '20',
                            color: domainInfo.color,
                          }}
                        >
                          {domainInfo.label}
                        </span>
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded-full font-medium',
                            getEraColorClass(p.era)
                          )}
                        >
                          {getEraLabel(p.era as Era)}
                        </span>
                      </div>
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
                      {p.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400"
                        >
                          <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {p.summary}
                    </p>

                    <div className="mt-3 flex items-center text-xs text-slate-500 group-hover:text-red-400 transition-colors">
                      자세히 보기
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Event Cards */}
        {(activeTab === 'all' || activeTab === 'events') && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-400" />
              역사 사건
              <span className="text-sm font-normal text-slate-500">
                ({filteredEvents.length}개)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/entities/${event.id}/`}
                  className={cn(
                    'group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200 border-l-4 border-l-amber-600/50',
                    getEraBorderClass(event.era)
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-amber-200 font-semibold group-hover:text-amber-300 transition-colors">
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

                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {event.summary}
                  </p>

                  {event.significance && (
                    <p className="text-xs text-slate-500 line-clamp-2 italic">
                      {event.significance}
                    </p>
                  )}

                  <div className="mt-3 flex items-center text-xs text-slate-500 group-hover:text-amber-400 transition-colors">
                    자세히 보기
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
