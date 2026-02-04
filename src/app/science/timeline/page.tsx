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
  FlaskConical,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react';
import scientistsData from '@/data/persons/scientists.json';
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

// Field swimlane grouping based on subcategory
const fieldGroups: Record<string, { label: string; color: string }> = {
  physics: { label: '물리학', color: '#3B82F6' },
  classical_physics: { label: '고전 물리학', color: '#60A5FA' },
  astronomy: { label: '천문학', color: '#8B5CF6' },
  mathematics: { label: '수학', color: '#F59E0B' },
  chemistry: { label: '화학', color: '#EF4444' },
  biology: { label: '생물학', color: '#10B981' },
  medicine: { label: '의학', color: '#EC4899' },
  computer_science: { label: '컴퓨터 과학', color: '#06B6D4' },
  scientific_revolution: { label: '과학혁명', color: '#F97316' },
  ancient_medieval: { label: '고대/중세', color: '#D4AF37' },
};

function getFieldInfo(subcategory: string) {
  return fieldGroups[subcategory] || { label: '기타', color: '#64748B' };
}

export default function ScienceTimelinePage() {
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [selectedField, setSelectedField] = useState<string | 'all'>('all');
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
  const totalTimelineHeight = totalLanesHeight + AXIS_HEIGHT;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/science/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          과학의 역사
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Atom className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              과학 발견의 타임라인
            </h1>
            <p className="text-slate-400 mt-1">BC 500 ~ 현재 | 분야별 과학자와 발견</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Atom className="w-4 h-4 text-emerald-400" />
            과학자 {filteredScientists.length}명
          </span>
          <span className="flex items-center gap-1">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            {scientistsByField.length}개 분야
          </span>
        </div>
      </div>

      {/* Era Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500 mr-1" />
            <button
              onClick={() => setSelectedEra('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedEra === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
              )}
            >
              전체 시대
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

      {/* Field Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">분야:</span>
          <button
            onClick={() => setSelectedField('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              selectedField === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            )}
          >
            전체
          </button>
          {availableFields.map((field) => {
            const info = getFieldInfo(field);
            return (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1',
                  selectedField === field
                    ? 'text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                )}
                style={
                  selectedField === field
                    ? { backgroundColor: info.color }
                    : undefined
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
          <span className="text-slate-500">범례:</span>
          {Object.entries(fieldGroups).map(([key, { label, color }]) => (
            <span key={key} className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-slate-400">{label}</span>
            </span>
          ))}
          <span className="flex items-center gap-1 ml-2 text-slate-500 border-l border-slate-700 pl-3">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span className="text-slate-400">= 주요 발견</span>
          </span>
        </div>
      </div>

      {/* Swimlane Timeline */}
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

              {/* ── SWIM LANES: Scientists grouped by field ── */}
              {scientistsByField.map((group, laneIdx) => {
                const y = laneIdx * LANE_HEIGHT + 8;
                return (
                  <div key={group.field}>
                    {/* Lane separator */}
                    {laneIdx > 0 && (
                      <div
                        className="absolute left-0 right-0 h-px bg-slate-800/50"
                        style={{ top: `${y - 2}px` }}
                      />
                    )}

                    {/* Field label */}
                    <div
                      className="absolute left-3 z-10 text-[9px] font-medium bg-slate-900/90 px-1.5 py-0.5 rounded"
                      style={{
                        top: `${y + 5}px`,
                        color: group.info.color,
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
                          href={`/persons/${s.id}/`}
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
                            className="h-full rounded-sm flex items-center px-1 overflow-hidden transition-all group-hover:brightness-125 group-hover:ring-1 group-hover:ring-white/30 relative"
                            style={{
                              backgroundColor: group.info.color,
                              opacity: 0.7,
                            }}
                          >
                            <span className="text-[9px] font-medium text-white whitespace-nowrap truncate relative z-10">
                              {s.name.ko}
                            </span>

                            {/* Discovery markers on the bar */}
                            {discoveries.length > 0 && (
                              <span className="absolute right-0.5 top-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                              </span>
                            )}
                          </div>

                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30">
                            <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap max-w-xs">
                              <p className="text-[11px] font-semibold text-white">{s.name.ko}</p>
                              <p className="text-[10px] text-slate-400">{s.name.en}</p>
                              <p className="text-[9px] text-slate-500 mt-0.5">
                                {formatYear(s.period.start)} ~ {formatYear(s.period.end)}
                              </p>
                              {s.field && s.field.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {s.field.slice(0, 3).map((f) => (
                                    <span
                                      key={f}
                                      className="text-[8px] px-1 py-0 rounded"
                                      style={{
                                        backgroundColor: group.info.color + '30',
                                        color: group.info.color,
                                      }}
                                    >
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {discoveries.length > 0 && (
                                <div className="mt-1 border-t border-slate-700 pt-1">
                                  <p className="text-[8px] text-yellow-400 flex items-center gap-0.5">
                                    <Sparkles className="w-2 h-2" />
                                    주요 발견
                                  </p>
                                  {discoveries.slice(0, 3).map((d) => (
                                    <p key={d} className="text-[8px] text-slate-400">
                                      - {d}
                                    </p>
                                  ))}
                                  {discoveries.length > 3 && (
                                    <p className="text-[8px] text-slate-500">
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
                <div className="absolute top-0 left-0 right-0 h-px bg-slate-600" />
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
            </div>
          </div>
        </div>
      </div>

      {/* Scientist Cards List */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Atom className="w-5 h-5 text-emerald-400" />
          과학자 목록
          <span className="text-sm font-normal text-slate-500">
            ({filteredScientists.length}명)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScientists.map((s) => {
            const fieldInfo = getFieldInfo(s.subcategory);
            return (
              <Link
                key={s.id}
                href={`/persons/${s.id}/`}
                className={cn(
                  'group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 hover:bg-slate-800/40 transition-all duration-200 border-l-4',
                  getEraBorderClass(s.era)
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                      {s.name.ko}
                    </h3>
                    <p className="text-sm text-slate-500">{s.name.en}</p>
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
                      className={cn(
                        'text-xs px-2 py-1 rounded-full font-medium',
                        getEraColorClass(s.era)
                      )}
                    >
                      {getEraLabel(s.era as Era)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
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
                        className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-0.5"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {d}
                      </span>
                    ))}
                    {s.discoveries.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/30 text-slate-500">
                        +{s.discoveries.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {s.summary}
                </p>

                <div className="mt-3 flex items-center text-xs text-slate-500 group-hover:text-emerald-400 transition-colors">
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
