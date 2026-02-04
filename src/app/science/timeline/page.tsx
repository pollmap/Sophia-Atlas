'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Calendar,
  ChevronRight,
  Filter,
  Flag,
  FlaskConical,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react';
import scientistsData from '@/data/persons/scientists.json';
import eventsData from '@/data/entities/events.json';
import {
  cn,
  getEraColor,
  getEraBgColor,
  getEraLabel,
  formatYear,
  getEraColorClass,
  getEraBorderClass,
  getEraHexColor,
} from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

const eras: Era[] = ['ancient', 'medieval', 'modern', 'contemporary'];

const eraRanges: Record<Era, { start: number; end: number; label: string }> = {
  ancient: { start: -500, end: 300, label: 'BC 500 ~ AD 300' },
  medieval: { start: 300, end: 1500, label: 'AD 300 ~ AD 1500' },
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

// Field swimlane grouping based on subcategory
const fieldGroups: Record<string, { label: string; color: string }> = {
  physics: { label: '물리학', color: '#4A5D8A' },
  classical_physics: { label: '고전 물리학', color: '#5B6E9A' },
  astronomy: { label: '천문학', color: '#6B4E8A' },
  mathematics: { label: '수학', color: '#B8860B' },
  chemistry: { label: '화학', color: '#8B4040' },
  biology: { label: '생물학', color: '#5B7355' },
  medicine: { label: '의학', color: '#7A5478' },
  computer_science: { label: '컴퓨터 과학', color: '#4A7A6B' },
  scientific_revolution: { label: '과학혁명', color: '#8B6914' },
  ancient_medieval: { label: '고대/중세', color: '#B8860B' },
};

function getFieldInfo(subcategory: string) {
  return fieldGroups[subcategory] || { label: '기타', color: '#6B6358' };
}

const EVENTS_TRACK_HEIGHT = 90;

export default function ScienceTimelinePage() {
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [selectedField, setSelectedField] = useState<string | 'all'>('all');
  const [showEvents, setShowEvents] = useState(true);
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  const allScientists = useMemo(
    () => [...scientistsData].sort((a, b) => a.period.start - b.period.start),
    []
  );

  const filteredScientists = useMemo(() => {
    let list = allScientists;
    if (selectedEra !== 'all') {
      list = list.filter((s) => s.era === selectedEra);
    }
    if (selectedField !== 'all') {
      list = list.filter((s) => s.subcategory === selectedField);
    }
    return list;
  }, [selectedEra, selectedField, allScientists]);

  // Filter events for display
  const filteredEvents = useMemo(() => {
    const all = (eventsData as any[]).filter((e) => {
      const start = e.period?.start ?? 0;
      return start >= -500 && start <= 2025;
    });
    if (selectedEra === 'all') return all;
    return all.filter((e) => e.era === selectedEra);
  }, [selectedEra]);

  // Group scientists by field for swim lanes
  const scientistsByField = useMemo(() => {
    const groups: Record<string, typeof filteredScientists> = {};
    const fieldOrder = Object.keys(fieldGroups);

    filteredScientists.forEach((s) => {
      const key = s.subcategory || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    const sorted: { field: string; info: { label: string; color: string }; scientists: typeof filteredScientists }[] = [];
    fieldOrder.forEach((f) => {
      if (groups[f] && groups[f].length > 0) {
        sorted.push({ field: f, info: getFieldInfo(f), scientists: groups[f] });
      }
    });
    // Add any remaining
    Object.keys(groups).forEach((f) => {
      if (!fieldOrder.includes(f)) {
        sorted.push({ field: f, info: getFieldInfo(f), scientists: groups[f] });
      }
    });
    return sorted;
  }, [filteredScientists]);

  // Available fields for filter
  const availableFields = useMemo(() => {
    const fields = new Set<string>();
    allScientists.forEach((s) => {
      if (s.subcategory) fields.add(s.subcategory);
    });
    return Array.from(fields).sort((a, b) => {
      const order = Object.keys(fieldGroups);
      return (order.indexOf(a) === -1 ? 999 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 999 : order.indexOf(b));
    });
  }, [allScientists]);

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const amount = 400;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const totalStart = -500;
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

  const baseWidth = 2000;
  const timelineWidth = baseWidth * zoom;

  // Century markers
  const centuryMarkers = useMemo(() => {
    const markers: number[] = [];
    for (let y = -500; y <= 2000; y += 100) {
      markers.push(y);
    }
    return markers;
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 0.5));

  // Compute dimensions
  const LANE_HEIGHT = 34;
  const AXIS_HEIGHT = 30;
  const totalLanesHeight = Math.max(scientistsByField.length * LANE_HEIGHT + 30, 100);
  const totalTimelineHeight = totalLanesHeight + AXIS_HEIGHT + (showEvents ? EVENTS_TRACK_HEIGHT : 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6E9' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/science"
          className="inline-flex items-center gap-1.5 text-sm transition-colors mb-6"
          style={{ color: '#7A6B55' }}
        >
          <ArrowLeft className="w-4 h-4" />
          과학의 역사
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded flex items-center justify-center"
            style={{ backgroundColor: 'rgba(91, 115, 85, 0.15)' }}
          >
            <Atom className="w-5 h-5" style={{ color: '#5B7355' }} />
          </div>
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ color: '#2C2416', fontFamily: "'Cormorant Garamond', serif" }}
            >
              과학 발견의 타임라인
            </h1>
            <p style={{ color: '#7A6B55' }} className="mt-1">BC 500 ~ 현재 | 분야별 과학자와 발견</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm" style={{ color: '#7A6B55' }}>
          <span className="flex items-center gap-1">
            <Atom className="w-4 h-4" style={{ color: '#5B7355' }} />
            과학자 {filteredScientists.length}명
          </span>
          <span className="flex items-center gap-1">
            <FlaskConical className="w-4 h-4" style={{ color: '#5B7355' }} />
            {scientistsByField.length}개 분야
          </span>
        </div>
      </div>

      {/* Era Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 mr-1" style={{ color: '#7A6B55' }} />
            <button
              onClick={() => setSelectedEra('all')}
              className="px-4 py-2 rounded text-sm font-medium transition-all"
              style={
                selectedEra === 'all'
                  ? { backgroundColor: '#5B7355', color: '#FAF6E9', fontFamily: "'Pretendard', sans-serif" }
                  : { backgroundColor: 'rgba(240, 230, 211, 0.5)', color: '#7A6B55', fontFamily: "'Pretendard', sans-serif" }
              }
            >
              전체 시대
            </button>
            {eras.map((era) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className="px-4 py-2 rounded text-sm font-medium transition-all"
                style={
                  selectedEra === era
                    ? { backgroundColor: frescoEraColors[era], color: '#FAF6E9', fontFamily: "'Pretendard', sans-serif" }
                    : { backgroundColor: 'rgba(240, 230, 211, 0.5)', color: '#7A6B55', fontFamily: "'Pretendard', sans-serif" }
                }
              >
                {getEraLabel(era)}
              </button>
            ))}
          </div>

          {/* Events Toggle + Zoom controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all"
              style={
                showEvents
                  ? { backgroundColor: 'rgba(184, 134, 11, 0.15)', color: '#B8860B', border: '1px solid rgba(184, 134, 11, 0.3)' }
                  : { backgroundColor: 'rgba(240, 230, 211, 0.5)', color: '#7A6B55' }
              }
            >
              <Flag className="w-3.5 h-3.5" />
              역사 사건
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#7A6B55' }}>줌</span>
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#F0E6D3', border: '1px solid #D4C4AB', color: '#4A3C2A' }}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs w-10 text-center" style={{ color: '#4A3C2A' }}>{zoom}x</span>
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#F0E6D3', border: '1px solid #D4C4AB', color: '#4A3C2A' }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Field Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs mr-1" style={{ color: '#7A6B55' }}>분야:</span>
          <button
            onClick={() => setSelectedField('all')}
            className="px-3 py-1.5 rounded text-xs font-medium transition-all"
            style={
              selectedField === 'all'
                ? { backgroundColor: '#5B7355', color: '#FAF6E9' }
                : { backgroundColor: 'rgba(240, 230, 211, 0.5)', color: '#7A6B55' }
            }
          >
            전체
          </button>
          {availableFields.map((field) => {
            const info = getFieldInfo(field);
            return (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1"
                style={
                  selectedField === field
                    ? { backgroundColor: info.color, color: '#FAF6E9' }
                    : { backgroundColor: 'rgba(240, 230, 211, 0.5)', color: '#7A6B55' }
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Field legend */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span style={{ color: '#7A6B55' }}>범례:</span>
          {Object.entries(fieldGroups).map(([key, { label, color }]) => (
            <span key={key} className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span style={{ color: '#4A3C2A' }}>{label}</span>
            </span>
          ))}
          <span className="flex items-center gap-1 ml-2 pl-3" style={{ borderLeft: '1px solid #D4C4AB', color: '#7A6B55' }}>
            <Sparkles className="w-3 h-3" style={{ color: '#B8860B' }} />
            <span style={{ color: '#4A3C2A' }}>= 주요 발견</span>
          </span>
        </div>
      </div>

      {/* Swimlane Timeline */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div
          className="relative rounded overflow-hidden"
          style={{ border: '1px solid rgba(212, 196, 171, 0.5)', backgroundColor: 'rgba(240, 230, 211, 0.5)' }}
        >
          {/* Scroll buttons */}
          <button
            onClick={() => scrollTimeline('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(240, 230, 211, 0.9)', border: '1px solid #D4C4AB', color: '#4A3C2A' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTimeline('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(240, 230, 211, 0.9)', border: '1px solid #D4C4AB', color: '#4A3C2A' }}
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div
            ref={timelineRef}
            className="overflow-x-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#D4C4AB #F0E6D3' }}
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
                        backgroundColor: isMajor ? 'rgba(212, 196, 171, 0.6)' : 'rgba(212, 196, 171, 0.3)',
                      }}
                    />
                  </div>
                );
              })}

              {/* ── SWIM LANES: Scientists grouped by field ── */}
              {scientistsByField.map((group, laneIdx) => {
                const y = laneIdx * LANE_HEIGHT + 8;
                return (
                  <div key={group.field}>
                    {/* Lane separator */}
                    {laneIdx > 0 && (
                      <div
                        className="absolute left-0 right-0 h-px"
                        style={{ top: `${y - 2}px`, backgroundColor: 'rgba(212, 196, 171, 0.4)' }}
                      />
                    )}

                    {/* Field label */}
                    <div
                      className="absolute left-3 z-10 text-[9px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        top: `${y + 5}px`,
                        color: group.info.color,
                        backgroundColor: 'rgba(250, 246, 233, 0.9)',
                        fontFamily: "'Pretendard', sans-serif",
                      }}
                    >
                      {group.info.label} ({group.scientists.length})
                    </div>

                    {/* Lifespan bars */}
                    {group.scientists.map((s) => {
                      const left = getTimelinePosition(s.period.start);
                      const width = getBarWidth(s.period.start, s.period.end);
                      const discoveries = s.discoveries || [];

                      return (
                        <Link
                          key={s.id}
                          href={`/persons/${s.id}`}
                          className="absolute group"
                          style={{
                            left: `${left}%`,
                            top: `${y + 2}px`,
                            width: `${Math.max(width, 0.4)}%`,
                            height: `${LANE_HEIGHT - 8}px`,
                          }}
                        >
                          {/* Lifespan bar */}
                          <div
                            className="h-full rounded-sm flex items-center px-1 overflow-hidden transition-all group-hover:brightness-110 relative"
                            style={{
                              backgroundColor: group.info.color,
                              opacity: 0.8,
                              boxShadow: '0 1px 2px rgba(44, 36, 22, 0.1)',
                            }}
                          >
                            <span
                              className="text-[9px] font-medium whitespace-nowrap truncate relative z-10"
                              style={{ color: '#FAF6E9' }}
                            >
                              {s.name.ko}
                            </span>

                            {/* Discovery markers on the bar */}
                            {discoveries.length > 0 && (
                              <span className="absolute right-0.5 top-0.5">
                                <Sparkles className="w-2.5 h-2.5" style={{ color: '#B8860B' }} />
                              </span>
                            )}
                          </div>

                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30">
                            <div
                              className="rounded px-3 py-2 whitespace-nowrap max-w-xs"
                              style={{
                                backgroundColor: '#F0E6D3',
                                border: '1px solid #D4C4AB',
                                boxShadow: '0 4px 12px rgba(44, 36, 22, 0.15)',
                              }}
                            >
                              <p className="text-[11px] font-semibold" style={{ color: '#2C2416' }}>{s.name.ko}</p>
                              <p className="text-[10px]" style={{ color: '#7A6B55' }}>{s.name.en}</p>
                              <p className="text-[9px] mt-0.5" style={{ color: '#9C8B73' }}>
                                {formatYear(s.period.start)} ~ {formatYear(s.period.end)}
                              </p>
                              {s.field && s.field.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {s.field.slice(0, 3).map((f) => (
                                    <span
                                      key={f}
                                      className="text-[8px] px-1 py-0 rounded"
                                      style={{
                                        backgroundColor: group.info.color + '20',
                                        color: group.info.color,
                                      }}
                                    >
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {discoveries.length > 0 && (
                                <div className="mt-1 pt-1" style={{ borderTop: '1px solid #D4C4AB' }}>
                                  <p className="text-[8px] flex items-center gap-0.5" style={{ color: '#B8860B' }}>
                                    <Sparkles className="w-2 h-2" />
                                    주요 발견
                                  </p>
                                  {discoveries.slice(0, 3).map((d) => (
                                    <p key={d} className="text-[8px]" style={{ color: '#4A3C2A' }}>
                                      - {d}
                                    </p>
                                  ))}
                                  {discoveries.length > 3 && (
                                    <p className="text-[8px]" style={{ color: '#9C8B73' }}>
                                      +{discoveries.length - 3}개 더
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}

              {/* ── TIME AXIS ── */}
              <div
                className="absolute left-0 right-0"
                style={{ top: `${totalLanesHeight}px`, height: `${AXIS_HEIGHT}px` }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: '#D4C4AB' }} />
                {centuryMarkers
                  .filter((y) => y % (zoom >= 2 ? 100 : 500) === 0)
                  .map((year) => {
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
                          style={{ color: '#4A3C2A', backgroundColor: 'rgba(250, 246, 233, 0.9)' }}
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
                          backgroundColor: frescoEraColors[era] + '20',
                          color: frescoEraColors[era],
                        }}
                      >
                        {getEraLabel(era)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ── EVENTS TRACK ── */}
              {showEvents && filteredEvents.length > 0 && (
                <div
                  className="absolute left-0 right-0"
                  style={{
                    top: `${totalLanesHeight + AXIS_HEIGHT}px`,
                    height: `${EVENTS_TRACK_HEIGHT}px`,
                  }}
                >
                  {/* Section label */}
                  <div
                    className="absolute top-2 left-3 z-10 text-[10px] font-medium flex items-center gap-1 px-2 py-0.5 rounded"
                    style={{ color: '#B8860B', backgroundColor: 'rgba(250, 246, 233, 0.8)', fontFamily: "'Pretendard', sans-serif" }}
                  >
                    <Flag className="w-3 h-3" />
                    역사 사건 ({filteredEvents.length})
                  </div>
                  {/* Separator line */}
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: 'rgba(184, 134, 11, 0.3)' }} />

                  {filteredEvents.map((event: any, idx: number) => {
                    const left = getTimelinePosition(event.period.start);
                    const verticalOffset = (idx % 3) * 24 + 22;
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
                            className="w-2.5 h-2.5 rotate-45 transition-transform group-hover:scale-150"
                            style={{
                              backgroundColor: frescoEraColors[event.era as Era] || '#6B6358',
                              border: '1px solid rgba(184, 134, 11, 0.5)',
                            }}
                          />
                          <div
                            className="mt-0.5 px-1.5 py-0.5 rounded opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                            style={{
                              backgroundColor: 'rgba(240, 230, 211, 0.8)',
                              border: '1px solid rgba(184, 134, 11, 0.2)',
                            }}
                          >
                            <p className="text-[8px] font-medium" style={{ color: '#8B6914' }}>
                              {event.name.ko}
                            </p>
                            <p className="text-[7px]" style={{ color: '#9C8B73' }}>
                              {formatYear(event.period.start)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scientist Cards List */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <h2
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: '#2C2416', fontFamily: "'Cormorant Garamond', serif" }}
        >
          <Atom className="w-5 h-5" style={{ color: '#5B7355' }} />
          과학자 목록
          <span className="text-sm font-normal" style={{ color: '#7A6B55' }}>
            ({filteredScientists.length}명)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScientists.map((s) => {
            const fieldInfo = getFieldInfo(s.subcategory);
            return (
              <Link
                key={s.id}
                href={`/persons/${s.id}`}
                className="group p-5 transition-all duration-200"
                style={{
                  borderRadius: '4px',
                  border: '1px solid rgba(212, 196, 171, 0.5)',
                  borderLeft: `4px solid ${frescoEraColors[s.era as Era] || '#6B6358'}`,
                  backgroundColor: 'rgba(240, 230, 211, 0.2)',
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
                      style={{ color: '#2C2416', fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {s.name.ko}
                    </h3>
                    <p className="text-sm" style={{ color: '#7A6B55' }}>{s.name.en}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: fieldInfo.color + '20',
                        color: fieldInfo.color,
                      }}
                    >
                      {fieldInfo.label}
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: frescoEraColors[s.era as Era] + '20',
                        color: frescoEraColors[s.era as Era],
                      }}
                    >
                      {getEraLabel(s.era as Era)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs mb-3" style={{ color: '#7A6B55' }}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatYear(s.period.start)} ~ {formatYear(s.period.end)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {s.location.region}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {s.field &&
                    s.field.map((f) => (
                      <span
                        key={f}
                        className="text-[11px] px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: fieldInfo.color + '10',
                          color: fieldInfo.color,
                          borderColor: fieldInfo.color + '30',
                        }}
                      >
                        <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                        {f}
                      </span>
                    ))}
                </div>

                {s.discoveries && s.discoveries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.discoveries.slice(0, 3).map((d) => (
                      <span
                        key={d}
                        className="text-[11px] px-2 py-0.5 rounded-full flex items-center gap-0.5"
                        style={{
                          backgroundColor: 'rgba(184, 134, 11, 0.1)',
                          color: '#B8860B',
                          border: '1px solid rgba(184, 134, 11, 0.2)',
                        }}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {d}
                      </span>
                    ))}
                    {s.discoveries.length > 3 && (
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(212, 196, 171, 0.3)', color: '#7A6B55' }}
                      >
                        +{s.discoveries.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: '#4A3C2A' }}>
                  {s.summary}
                </p>

                <div className="mt-3 flex items-center text-xs transition-colors" style={{ color: '#7A6B55' }}>
                  자세히 보기
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
