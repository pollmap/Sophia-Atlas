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

// Fresco era colors
const frescoEraColors: Record<Era, string> = {
  ancient: '#B8860B',
  medieval: '#6B4E8A',
  modern: '#4A7A6B',
  contemporary: '#6B6358',
};

// Domain grouping based on subcategory
const domainGroups: Record<string, { label: string; color: string }> = {
  political_leader: { label: '정치', color: '#8B4040' },
  military_leader: { label: '군사', color: '#A0522D' },
  social_reformer: { label: '시민/인권', color: '#6B4E8A' },
  explorer: { label: '탐험', color: '#4A7A6B' },
  literary_figure: { label: '문학', color: '#7A5478' },
  artist: { label: '미술', color: '#B8860B' },
  musician: { label: '음악', color: '#5B7355' },
};

function getDomainInfo(subcategory: string) {
  return domainGroups[subcategory] || { label: '기타', color: '#6B6358' };
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fresco-ivory)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-sm transition-colors mb-6"
          style={{ color: 'var(--ink-light)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          역사 허브로
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139, 64, 64, 0.15)' }}
          >
            <Calendar className="w-5 h-5" style={{ color: '#8B4040' }} />
          </div>
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              역사 사건과 인물의 타임라인
            </h1>
            <p style={{ color: 'var(--ink-light)' }} className="mt-1">BC 3000 ~ 현재</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm" style={{ color: 'var(--ink-light)' }}>
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4" style={{ color: '#8B4040' }} />
            인물 {filteredPersons.length}명
          </span>
          <span className="flex items-center gap-1">
            <Flag className="w-4 h-4" style={{ color: '#B8860B' }} />
            사건 {filteredEvents.length}개
          </span>
        </div>
      </div>

      {/* Era Filters + Zoom */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 mr-1" style={{ color: 'var(--ink-light)' }} />
            <button
              onClick={() => setSelectedEra('all')}
              className="px-4 py-2 rounded text-sm font-medium transition-all"
              style={{
                fontFamily: "'Pretendard', sans-serif",
                backgroundColor: selectedEra === 'all' ? '#8B4040' : 'rgba(240, 230, 211, 0.5)',
                color: selectedEra === 'all' ? '#FAF6E9' : 'var(--ink-light)',
              }}
            >
              전체
            </button>
            {eras.map((era) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className="px-4 py-2 rounded text-sm font-medium transition-all"
                style={{
                  fontFamily: "'Pretendard', sans-serif",
                  backgroundColor: selectedEra === era ? frescoEraColors[era] : 'rgba(240, 230, 211, 0.5)',
                  color: selectedEra === era ? '#FAF6E9' : 'var(--ink-light)',
                }}
              >
                {getEraLabel(era)}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>줌</span>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors"
              style={{
                backgroundColor: 'var(--fresco-parchment)',
                border: '1px solid var(--fresco-shadow)',
                color: 'var(--ink-light)',
              }}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs w-10 text-center" style={{ color: 'var(--ink-light)' }}>{zoom}x</span>
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors"
              style={{
                backgroundColor: 'var(--fresco-parchment)',
                border: '1px solid var(--fresco-shadow)',
                color: 'var(--ink-light)',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Domain legend */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span style={{ color: 'var(--ink-light)', fontFamily: "'Pretendard', sans-serif" }}>분야:</span>
          {Object.entries(domainGroups).map(([key, { label, color }]) => (
            <span key={key} className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span style={{ color: 'var(--ink-medium)' }}>{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Dual-Track Timeline */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div
          className="relative rounded overflow-hidden"
          style={{
            border: '1px solid var(--fresco-shadow)',
            backgroundColor: 'rgba(240, 230, 211, 0.5)',
          }}
        >
          {/* Scroll buttons */}
          <button
            onClick={() => scrollTimeline('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'rgba(240, 230, 211, 0.9)',
              border: '1px solid var(--fresco-shadow)',
              color: 'var(--ink-light)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTimeline('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'rgba(240, 230, 211, 0.9)',
              border: '1px solid var(--fresco-shadow)',
              color: 'var(--ink-light)',
            }}
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div
            ref={timelineRef}
            className="overflow-x-auto"
            style={{ scrollbarColor: 'var(--fresco-shadow) var(--fresco-parchment)' }}
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
                    className="absolute top-0 bottom-0 opacity-[0.08]"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: frescoEraColors[era],
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
                      className="w-px h-full"
                      style={{
                        backgroundColor: isMajor
                          ? 'rgba(212, 196, 171, 0.6)'
                          : 'rgba(212, 196, 171, 0.3)',
                      }}
                    />
                  </div>
                );
              })}

              {/* -- UPPER SECTION: Historical Figures as lifespan bars -- */}
              <div
                className="absolute left-0 right-0"
                style={{ top: 0, height: `${upperTrackHeight}px` }}
              >
                {/* Section label */}
                <div
                  className="absolute top-2 left-3 z-10 text-[10px] font-medium flex items-center gap-1 px-2 py-0.5 rounded"
                  style={{
                    color: '#8B4040',
                    backgroundColor: 'rgba(250, 246, 233, 0.8)',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
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
                        className="absolute left-3 z-10 text-[9px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          top: `${y + 4}px`,
                          color: group.info.color,
                          backgroundColor: 'rgba(250, 246, 233, 0.8)',
                          fontFamily: "'Pretendard', sans-serif",
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
                            href={`/persons/${p.id}`}
                            className="absolute group"
                            style={{
                              left: `${left}%`,
                              top: `${y + 2}px`,
                              width: `${Math.max(width, 0.3)}%`,
                              height: `${DOMAIN_ROW_HEIGHT - 6}px`,
                            }}
                          >
                            <div
                              className="h-full rounded-sm flex items-center px-1 overflow-hidden transition-all group-hover:brightness-110"
                              style={{
                                backgroundColor: group.info.color,
                                opacity: 0.8,
                                boxShadow: '0 1px 2px rgba(44, 36, 22, 0.1)',
                              }}
                            >
                              <span
                                className="text-[9px] font-medium whitespace-nowrap truncate"
                                style={{ color: '#FAF6E9', fontFamily: "'Pretendard', sans-serif" }}
                              >
                                {p.name.ko}
                              </span>
                            </div>
                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30">
                              <div
                                className="rounded px-3 py-2 whitespace-nowrap"
                                style={{
                                  backgroundColor: 'var(--fresco-parchment)',
                                  border: '1px solid var(--fresco-shadow)',
                                  boxShadow: '0 4px 12px rgba(44, 36, 22, 0.15)',
                                }}
                              >
                                <p className="text-[11px] font-semibold" style={{ color: 'var(--ink-dark)' }}>{p.name.ko}</p>
                                <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>{p.name.en}</p>
                                <p className="text-[9px] mt-0.5" style={{ color: 'var(--ink-faded)' }}>
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

              {/* -- TIME AXIS -- */}
              <div
                className="absolute left-0 right-0"
                style={{ top: `${upperTrackHeight}px`, height: `${AXIS_HEIGHT}px` }}
              >
                <div
                  className="absolute top-1/2 left-0 right-0 h-px"
                  style={{ backgroundColor: 'var(--fresco-shadow)' }}
                />
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
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          color: 'var(--ink-medium)',
                          backgroundColor: 'rgba(250, 246, 233, 0.9)',
                          fontFamily: "'Pretendard', sans-serif",
                        }}
                      >
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
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          color: frescoEraColors[era],
                          backgroundColor: `${frescoEraColors[era]}15`,
                          fontFamily: "'Pretendard', sans-serif",
                        }}
                      >
                        {getEraLabel(era)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* -- LOWER SECTION: Events as diamond markers -- */}
              <div
                className="absolute left-0 right-0"
                style={{
                  top: `${upperTrackHeight + AXIS_HEIGHT}px`,
                  height: `${EVENTS_TRACK_HEIGHT}px`,
                }}
              >
                {/* Section label */}
                <div
                  className="absolute top-2 left-3 z-10 text-[10px] font-medium flex items-center gap-1 px-2 py-0.5 rounded"
                  style={{
                    color: '#B8860B',
                    backgroundColor: 'rgba(250, 246, 233, 0.8)',
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  <Flag className="w-3 h-3" />
                  역사 사건
                </div>

                {filteredEvents.map((event, idx) => {
                  const left = getTimelinePosition(event.period.start);
                  const verticalOffset = (idx % 3) * 28 + 24;
                  return (
                    <Link
                      key={event.id}
                      href={`/entities/${event.id}`}
                      className="absolute group"
                      style={{
                        left: `${left}%`,
                        top: `${verticalOffset}px`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rotate-45 transition-transform group-hover:scale-150"
                          style={{
                            backgroundColor: frescoEraColors[event.era as Era] || '#6B6358',
                            border: '1px solid var(--fresco-shadow)',
                          }}
                        />
                        <div
                          className="mt-0.5 px-2 py-0.5 rounded opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          style={{
                            backgroundColor: 'rgba(240, 230, 211, 0.8)',
                            border: '1px solid rgba(184, 134, 11, 0.3)',
                          }}
                        >
                          <p className="text-[9px] font-medium" style={{ color: '#6B4E00' }}>
                            {event.name.ko}
                          </p>
                          <p className="text-[8px]" style={{ color: 'var(--ink-faded)' }}>
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
              className="px-4 py-2 rounded text-sm font-medium transition-all"
              style={{
                fontFamily: "'Pretendard', sans-serif",
                backgroundColor: activeTab === tab.key ? '#8B4040' : 'rgba(240, 230, 211, 0.5)',
                color: activeTab === tab.key ? '#FAF6E9' : 'var(--ink-light)',
              }}
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
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Crown className="w-5 h-5" style={{ color: '#8B4040' }} />
              역사 인물
              <span className="text-sm font-normal" style={{ color: 'var(--ink-faded)' }}>
                ({filteredPersons.length}명)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPersons.map((p) => {
                const domainInfo = getDomainInfo(p.subcategory);
                return (
                  <Link
                    key={p.id}
                    href={`/persons/${p.id}`}
                    className="group p-5 transition-all duration-200"
                    style={{
                      borderRadius: '4px',
                      border: '1px solid var(--fresco-shadow)',
                      borderLeft: `4px solid ${frescoEraColors[p.era as Era] || '#6B6358'}`,
                      backgroundColor: 'rgba(240, 230, 211, 0.2)',
                      boxShadow: '0 1px 3px rgba(44, 36, 22, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(240, 230, 211, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(240, 230, 211, 0.2)';
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3
                          className="font-semibold transition-colors"
                          style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {p.name.ko}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--ink-faded)' }}>{p.name.en}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: domainInfo.color + '20',
                            color: domainInfo.color,
                            fontFamily: "'Pretendard', sans-serif",
                          }}
                        >
                          {domainInfo.label}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{
                            backgroundColor: `${frescoEraColors[p.era as Era]}15`,
                            color: frescoEraColors[p.era as Era],
                            fontFamily: "'Pretendard', sans-serif",
                          }}
                        >
                          {getEraLabel(p.era as Era)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--ink-faded)' }}>
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
                          className="text-[11px] px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'rgba(212, 196, 171, 0.5)',
                            color: 'var(--ink-light)',
                            fontFamily: "'Pretendard', sans-serif",
                          }}
                        >
                          <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-medium)' }}>
                      {p.summary}
                    </p>

                    <div className="mt-3 flex items-center text-xs transition-colors" style={{ color: 'var(--ink-faded)' }}>
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
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Flag className="w-5 h-5" style={{ color: '#B8860B' }} />
              역사 사건
              <span className="text-sm font-normal" style={{ color: 'var(--ink-faded)' }}>
                ({filteredEvents.length}개)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/entities/${event.id}`}
                  className="group p-5 transition-all duration-200"
                  style={{
                    borderRadius: '4px',
                    border: '1px solid var(--fresco-shadow)',
                    borderLeft: `4px solid rgba(184, 134, 11, 0.5)`,
                    backgroundColor: 'rgba(240, 230, 211, 0.2)',
                    boxShadow: '0 1px 3px rgba(44, 36, 22, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(240, 230, 211, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(240, 230, 211, 0.2)';
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3
                        className="font-semibold transition-colors"
                        style={{ color: '#6B4E00', fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {event.name.ko}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--ink-faded)' }}>{event.name.en}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded font-medium shrink-0"
                      style={{
                        backgroundColor: `${frescoEraColors[event.era as Era]}15`,
                        color: frescoEraColors[event.era as Era],
                        fontFamily: "'Pretendard', sans-serif",
                      }}
                    >
                      {getEraLabel(event.era)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--ink-faded)' }}>
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

                  <p className="text-sm line-clamp-2 leading-relaxed mb-2" style={{ color: 'var(--ink-medium)' }}>
                    {event.summary}
                  </p>

                  {event.significance && (
                    <p className="text-xs line-clamp-2 italic" style={{ color: 'var(--ink-faded)' }}>
                      {event.significance}
                    </p>
                  )}

                  <div className="mt-3 flex items-center text-xs transition-colors" style={{ color: 'var(--ink-faded)' }}>
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
