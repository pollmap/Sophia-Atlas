'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Filter,
  Flag,
  MapPin,
  Tag,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import philosophersData from '@/data/persons/philosophers.json';
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

const eraRanges: Record<Era, { start: number; end: number }> = {
  ancient: { start: -700, end: 300 },
  medieval: { start: 300, end: 1500 },
  modern: { start: 1500, end: 1900 },
  contemporary: { start: 1900, end: 2030 },
};

// Fresco era colors
const frescoEraColors: Record<string, string> = {
  ancient: '#B8860B',
  medieval: '#6B4E8A',
  modern: '#4A7A6B',
  contemporary: '#6B6358',
};

// Subcategory display order and Korean labels
const subcategoryConfig: { key: string; label: string }[] = [
  { key: 'presocratic', label: '소크라테스 이전 / 자연철학' },
  { key: 'sophist', label: '소피스트' },
  { key: 'classical_greek', label: '소크라테스 / 아테네' },
  { key: 'hellenistic', label: '헬레니즘' },
  { key: 'roman', label: '로마 / 후기 고대' },
  { key: 'patristic', label: '교부철학' },
  { key: 'islamic_jewish', label: '이슬람 / 유대 철학' },
  { key: 'scholastic', label: '스콜라철학' },
  { key: 'renaissance', label: '르네상스 / 초기 근대' },
  { key: 'rationalist', label: '합리론' },
  { key: 'empiricist', label: '경험론' },
  { key: 'enlightenment', label: '계몽주의' },
  { key: 'german_idealism', label: '독일 관념론' },
  { key: 'utilitarian', label: '공리주의 / 실용주의' },
  { key: 'existentialist', label: '실존주의 / 생철학' },
  { key: 'analytic', label: '분석철학' },
  { key: 'critical_theory', label: '비판이론 / 마르크스주의' },
  { key: 'poststructuralist', label: '구조주의 / 후기구조주의' },
  { key: 'chinese', label: '중국 철학' },
  { key: 'indian', label: '인도 철학' },
];

const GLOBAL_START = -700;
const GLOBAL_END = 2030;
const GLOBAL_RANGE = GLOBAL_END - GLOBAL_START;

// Swimlane bar height and spacing
const BAR_HEIGHT = 26;
const BAR_GAP = 3;
const LANE_LABEL_WIDTH = 200;
const LANE_PADDING_Y = 6;
const AXIS_HEIGHT = 40;

// Zoom limits
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.5;

// Events track height
const EVENTS_TRACK_HEIGHT = 90;

// Helper to get fresco era color
function getFrescoEraColor(era: string): string {
  return frescoEraColors[era] || '#6B6358';
}

interface Philosopher {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: string;
  period: { start: number; end: number; approximate?: boolean };
  location: { lat: number; lng: number; region: string };
  subcategory: string;
  summary: string;
  school: string[];
  tags: string[];
  [key: string]: unknown;
}

export default function TimelinePage() {
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [zoom, setZoom] = useState(1);
  const [showEvents, setShowEvents] = useState(true);
  const [tooltip, setTooltip] = useState<{
    philosopher: Philosopher;
    x: number;
    y: number;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Filter events relevant to philosophy
  const filteredEvents = useMemo(() => {
    const philosophyRelatedTags = ['철학', '사상', '계몽주의', '혁명', '인쇄', '대학', '학문', '종교개혁', '르네상스', '과학혁명'];
    const all = (eventsData as any[]).filter((e) => {
      const start = e.period?.start ?? 0;
      return start >= GLOBAL_START && start <= GLOBAL_END;
    });
    if (selectedEra === 'all') return all;
    return all.filter((e) => e.era === selectedEra);
  }, [selectedEra]);

  const filteredPhilosophers = useMemo(() => {
    const list =
      selectedEra === 'all'
        ? [...(philosophersData as Philosopher[])]
        : (philosophersData as Philosopher[]).filter(
            (p) => p.era === selectedEra
          );
    return list.sort((a, b) => a.period.start - b.period.start);
  }, [selectedEra]);

  // Group by subcategory, preserving order
  const swimlanes = useMemo(() => {
    const grouped = new Map<string, Philosopher[]>();
    for (const config of subcategoryConfig) {
      const members = filteredPhilosophers.filter(
        (p) => p.subcategory === config.key
      );
      if (members.length > 0) {
        grouped.set(config.key, members);
      }
    }
    // Catch any subcategories not in config
    const knownKeys = new Set(subcategoryConfig.map((c) => c.key));
    const others = filteredPhilosophers.filter(
      (p) => !knownKeys.has(p.subcategory)
    );
    if (others.length > 0) {
      grouped.set('_other', others);
    }
    return grouped;
  }, [filteredPhilosophers]);

  // Resolve overlapping bars within a lane: assign row indices
  const laneLayouts = useMemo(() => {
    const layouts = new Map<
      string,
      { philosopher: Philosopher; row: number }[]
    >();

    swimlanes.forEach((members, key) => {
      const sorted = [...members].sort(
        (a, b) => a.period.start - b.period.start
      );
      const rows: number[] = []; // end year of the last bar in each row
      const result: { philosopher: Philosopher; row: number }[] = [];

      for (const p of sorted) {
        let placed = false;
        for (let r = 0; r < rows.length; r++) {
          // Check if bar fits: need some gap in year-space
          const gapYears = GLOBAL_RANGE * 0.008; // minimum gap
          if (p.period.start >= rows[r] + gapYears) {
            rows[r] = p.period.end;
            result.push({ philosopher: p, row: r });
            placed = true;
            break;
          }
        }
        if (!placed) {
          rows.push(p.period.end);
          result.push({ philosopher: p, row: rows.length - 1 });
        }
      }

      layouts.set(key, result);
    });

    return layouts;
  }, [swimlanes]);

  // Calculate lane heights
  const laneHeights = useMemo(() => {
    const heights = new Map<string, { rowCount: number; height: number }>();
    laneLayouts.forEach((items, key) => {
      const maxRow = items.reduce((m, i) => Math.max(m, i.row), 0);
      const rowCount = maxRow + 1;
      const height = rowCount * (BAR_HEIGHT + BAR_GAP) + LANE_PADDING_Y * 2;
      heights.set(key, { rowCount, height });
    });
    return heights;
  }, [laneLayouts]);

  const totalHeight = useMemo(() => {
    let h = AXIS_HEIGHT;
    laneHeights.forEach((v) => {
      h += v.height;
    });
    if (showEvents) h += EVENTS_TRACK_HEIGHT;
    return h;
  }, [laneHeights, showEvents]);

  // Total content width based on zoom
  const baseWidth = 2400;
  const contentWidth = baseWidth * zoom;

  // Year to pixel position
  const yearToX = useCallback(
    (year: number) => {
      return ((year - GLOBAL_START) / GLOBAL_RANGE) * contentWidth;
    },
    [contentWidth]
  );

  // Generate time axis ticks
  const axisTicks = useMemo(() => {
    const ticks: { year: number; label: string }[] = [];
    // Determine step based on zoom
    let step: number;
    if (zoom < 2) step = 200;
    else if (zoom < 4) step = 100;
    else if (zoom < 6) step = 50;
    else step = 25;

    const start = Math.ceil(GLOBAL_START / step) * step;
    for (let y = start; y <= GLOBAL_END; y += step) {
      ticks.push({ year: y, label: formatYear(y) });
    }
    return ticks;
  }, [zoom]);

  const handleZoomIn = () =>
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () =>
    setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  const handleZoomReset = () => setZoom(1);

  const handleBarMouseEnter = (
    e: React.MouseEvent,
    philosopher: Philosopher
  ) => {
    const rect = (
      scrollContainerRef.current?.parentElement || document.body
    ).getBoundingClientRect();
    setTooltip({
      philosopher,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleBarMouseLeave = () => {
    setTooltip(null);
  };

  // Close tooltip on scroll
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handler = () => setTooltip(null);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const getSubcategoryLabel = (key: string) => {
    const config = subcategoryConfig.find((c) => c.key === key);
    return config?.label ?? '기타';
  };

  // Build lane Y offsets
  const laneOffsets = useMemo(() => {
    const offsets = new Map<string, number>();
    let y = AXIS_HEIGHT;
    const orderedKeys: string[] = [];
    subcategoryConfig.forEach((c) => {
      if (swimlanes.has(c.key)) orderedKeys.push(c.key);
    });
    if (swimlanes.has('_other')) orderedKeys.push('_other');

    for (const key of orderedKeys) {
      offsets.set(key, y);
      y += laneHeights.get(key)!.height;
    }
    return offsets;
  }, [swimlanes, laneHeights]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fresco-ivory)' }}>
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm transition-colors mb-6"
          style={{ color: 'var(--ink-light)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink-medium)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-light)')}
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
        >
          철학의 타임라인
        </h1>
        <p className="mb-1" style={{ color: 'var(--ink-light)' }}>
          BC 624 ~ 현재 | {filteredPhilosophers.length}명의 사상가
        </p>
        <p className="text-sm" style={{ color: 'var(--ink-faded)' }}>
          학파별 수영 레인으로 정리한 철학사 연대표. 줌 인하여 세부를 탐색하세요.
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-[1400px] mx-auto px-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Era Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 mr-1" style={{ color: 'var(--ink-faded)' }} />
            <button
              onClick={() => setSelectedEra('all')}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-all',
                selectedEra === 'all'
                  ? ''
                  : ''
              )}
              style={
                selectedEra === 'all'
                  ? { backgroundColor: 'var(--fresco-aged)', color: 'var(--ink-dark)' }
                  : { backgroundColor: 'rgba(240,230,211,0.5)', color: 'var(--ink-light)' }
              }
              onMouseEnter={(e) => {
                if (selectedEra !== 'all') {
                  e.currentTarget.style.backgroundColor = 'rgba(232,220,202,0.7)';
                  e.currentTarget.style.color = 'var(--ink-medium)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedEra !== 'all') {
                  e.currentTarget.style.backgroundColor = 'rgba(240,230,211,0.5)';
                  e.currentTarget.style.color = 'var(--ink-light)';
                }
              }}
            >
              전체
            </button>
            {eras.map((era) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-all"
                style={
                  selectedEra === era
                    ? { backgroundColor: frescoEraColors[era] + '20', color: frescoEraColors[era], border: `1px solid ${frescoEraColors[era]}40` }
                    : { backgroundColor: 'rgba(240,230,211,0.5)', color: 'var(--ink-light)' }
                }
                onMouseEnter={(e) => {
                  if (selectedEra !== era) {
                    e.currentTarget.style.backgroundColor = 'rgba(232,220,202,0.7)';
                    e.currentTarget.style.color = 'var(--ink-medium)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedEra !== era) {
                    e.currentTarget.style.backgroundColor = 'rgba(240,230,211,0.5)';
                    e.currentTarget.style.color = 'var(--ink-light)';
                  }
                }}
              >
                {getEraLabel(era)}
              </button>
            ))}
          </div>

          {/* Events Toggle + Zoom Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all"
              style={
                showEvents
                  ? { backgroundColor: 'rgba(184,134,11,0.12)', color: '#B8860B', border: '1px solid rgba(184,134,11,0.25)' }
                  : { backgroundColor: 'rgba(240,230,211,0.5)', color: 'var(--ink-faded)' }
              }
            >
              <Flag className="w-3.5 h-3.5" />
              역사 사건
            </button>

            <div className="flex items-center gap-2">
            <span className="text-xs mr-1" style={{ color: 'var(--ink-faded)', fontFamily: "'Pretendard', sans-serif" }}>줌</span>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)', color: 'var(--ink-light)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--fresco-aged)'; e.currentTarget.style.color = 'var(--ink-dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--fresco-parchment)'; e.currentTarget.style.color = 'var(--ink-light)'; }}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="w-16 text-center text-xs font-mono" style={{ color: 'var(--ink-light)' }}>
              {zoom.toFixed(1)}x
            </div>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)', color: 'var(--ink-light)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--fresco-aged)'; e.currentTarget.style.color = 'var(--ink-dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--fresco-parchment)'; e.currentTarget.style.color = 'var(--ink-light)'; }}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)', color: 'var(--ink-light)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--fresco-aged)'; e.currentTarget.style.color = 'var(--ink-dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--fresco-parchment)'; e.currentTarget.style.color = 'var(--ink-light)'; }}
              title="줌 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Swimlane Timeline */}
      <div className="max-w-[1400px] mx-auto px-4 pb-8">
        <div
          className="relative rounded overflow-hidden"
          style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'rgba(240,230,211,0.4)' }}
        >
          {/* Fixed lane labels on the left + scrollable content */}
          <div className="flex">
            {/* Fixed Left Column: Lane Labels */}
            <div
              className="flex-shrink-0 z-10"
              style={{ width: LANE_LABEL_WIDTH, backgroundColor: 'rgba(240,230,211,0.9)', borderRight: '1px solid rgba(212,196,171,0.5)' }}
            >
              {/* Axis header */}
              <div
                className="flex items-end px-3 pb-1"
                style={{ height: AXIS_HEIGHT, borderBottom: '1px solid rgba(212,196,171,0.3)' }}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--ink-faded)' }}>
                  학파 / 전통
                </span>
              </div>
              {/* Lane labels */}
              {Array.from(swimlanes.keys())
                .sort((a, b) => {
                  const ai = subcategoryConfig.findIndex((c) => c.key === a);
                  const bi = subcategoryConfig.findIndex((c) => c.key === b);
                  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                })
                .map((key) => {
                  const h = laneHeights.get(key)!.height;
                  return (
                    <div
                      key={key}
                      className="flex items-center px-3"
                      style={{ height: h, borderBottom: '1px solid rgba(212,196,171,0.2)' }}
                    >
                      <span className="text-xs font-medium leading-tight" style={{ color: 'var(--ink-medium)' }}>
                        {getSubcategoryLabel(key)}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Scrollable Timeline Area */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-x-auto overflow-y-hidden"
              style={{ position: 'relative' }}
            >
              <div
                style={{
                  width: contentWidth,
                  height: totalHeight,
                  position: 'relative',
                }}
              >
                {/* Era background bands */}
                {eras.map((era) => {
                  const range = eraRanges[era];
                  const x1 = yearToX(range.start);
                  const x2 = yearToX(range.end);
                  return (
                    <div
                      key={`era-bg-${era}`}
                      className="absolute top-0"
                      style={{
                        left: x1,
                        width: x2 - x1,
                        height: totalHeight,
                        backgroundColor: frescoEraColors[era],
                        opacity: 0.06,
                      }}
                    />
                  );
                })}

                {/* Era boundary lines */}
                {[300, 1500, 1900].map((year) => (
                  <div
                    key={`era-line-${year}`}
                    className="absolute top-0"
                    style={{
                      left: yearToX(year),
                      width: 1,
                      height: totalHeight,
                      backgroundColor: 'rgba(212,196,171,0.35)',
                    }}
                  />
                ))}

                {/* Time Axis (top) */}
                <div
                  className="sticky top-0 z-[5]"
                  style={{
                    height: AXIS_HEIGHT,
                    borderBottom: '1px solid rgba(212,196,171,0.3)',
                    background:
                      'linear-gradient(to bottom, rgba(250,246,233,0.95), rgba(250,246,233,0.8))',
                  }}
                >
                  {axisTicks.map((tick) => {
                    const x = yearToX(tick.year);
                    return (
                      <div
                        key={tick.year}
                        className="absolute"
                        style={{ left: x, top: 0, height: AXIS_HEIGHT }}
                      >
                        <div
                          className="absolute bottom-0 w-px"
                          style={{ height: totalHeight, backgroundColor: 'rgba(212,196,171,0.3)' }}
                        />
                        <div
                          className="absolute bottom-2 text-[10px] font-mono whitespace-nowrap"
                          style={{ transform: 'translateX(-50%)', color: 'var(--ink-faded)' }}
                        >
                          {tick.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Swimlanes */}
                {Array.from(swimlanes.keys())
                  .sort((a, b) => {
                    const ai = subcategoryConfig.findIndex(
                      (c) => c.key === a
                    );
                    const bi = subcategoryConfig.findIndex(
                      (c) => c.key === b
                    );
                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                  })
                  .map((key) => {
                    const laneY = laneOffsets.get(key)!;
                    const laneH = laneHeights.get(key)!.height;
                    const items = laneLayouts.get(key)!;

                    return (
                      <div key={key}>
                        {/* Lane separator */}
                        <div
                          className="absolute w-full"
                          style={{ top: laneY + laneH, left: 0, borderBottom: '1px solid rgba(212,196,171,0.2)' }}
                        />

                        {/* Bars */}
                        {items.map(({ philosopher: p, row }) => {
                          const x1 = yearToX(p.period.start);
                          const x2 = yearToX(p.period.end);
                          const barWidth = Math.max(x2 - x1, 20);
                          const barY =
                            laneY +
                            LANE_PADDING_Y +
                            row * (BAR_HEIGHT + BAR_GAP);
                          const eraHex = getFrescoEraColor(p.era);

                          return (
                            <Link
                              key={p.id}
                              href={`/philosophy/${p.id}`}
                              className="absolute group cursor-pointer"
                              style={{
                                left: x1,
                                top: barY,
                                width: barWidth,
                                height: BAR_HEIGHT,
                              }}
                              onMouseEnter={(e) =>
                                handleBarMouseEnter(e, p)
                              }
                              onMouseLeave={handleBarMouseLeave}
                            >
                              {/* Bar background */}
                              <div
                                className="absolute inset-0 rounded-sm transition-all duration-150 group-hover:brightness-110 group-hover:shadow-lg"
                                style={{
                                  backgroundColor: eraHex,
                                  opacity: 0.75,
                                  boxShadow: `0 0 0 0px ${eraHex}`,
                                }}
                              />
                              <div
                                className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                style={{
                                  boxShadow: `0 0 8px ${eraHex}60`,
                                }}
                              />
                              {/* Bar left accent */}
                              <div
                                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm"
                                style={{
                                  backgroundColor: eraHex,
                                  filter: 'brightness(1.2)',
                                }}
                              />
                              {/* Name label */}
                              <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                                <span
                                  className="text-[11px] font-medium truncate leading-none"
                                  style={{
                                    color: '#FAF6E9',
                                    textShadow: '0 1px 2px rgba(44,36,22,0.4)',
                                  }}
                                >
                                  {p.name.ko}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}

                {/* Events Track Overlay */}
                {showEvents && filteredEvents.length > 0 && (() => {
                  const eventsTrackTop = totalHeight - EVENTS_TRACK_HEIGHT;
                  return (
                    <div>
                      {/* Events track separator */}
                      <div
                        className="absolute w-full"
                        style={{ top: eventsTrackTop, left: 0, borderTop: '1px solid rgba(184,134,11,0.25)' }}
                      />
                      {/* Events track label */}
                      <div
                        className="absolute z-10 text-[10px] font-medium flex items-center gap-1 px-2 py-0.5 rounded"
                        style={{ top: eventsTrackTop + 4, left: 8, color: '#B8860B', backgroundColor: 'rgba(250,246,233,0.85)' }}
                      >
                        <Flag className="w-3 h-3" />
                        역사 사건 ({filteredEvents.length})
                      </div>
                      {/* Event diamond markers */}
                      {filteredEvents.map((event: any, idx: number) => {
                        const x = yearToX(event.period.start);
                        const verticalOffset = (idx % 3) * 24 + 20;
                        return (
                          <Link
                            key={event.id}
                            href={`/entities/${event.id}`}
                            className="absolute group"
                            style={{
                              left: x,
                              top: eventsTrackTop + verticalOffset,
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className="w-2.5 h-2.5 rotate-45 transition-transform group-hover:scale-150"
                                style={{ backgroundColor: getFrescoEraColor(event.era), border: '1px solid rgba(184,134,11,0.4)' }}
                              />
                              <div
                                className="mt-0.5 px-1.5 py-0.5 rounded opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                style={{ backgroundColor: 'rgba(240,230,211,0.85)', border: '1px solid rgba(184,134,11,0.15)' }}
                              >
                                <p className="text-[8px] font-medium" style={{ color: '#8B6914' }}>
                                  {event.name.ko}
                                </p>
                                <p className="text-[7px]" style={{ color: 'var(--ink-faded)' }}>
                                  {formatYear(event.period.start)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              ref={tooltipRef}
              className="absolute z-50 pointer-events-none"
              style={{
                left: Math.min(
                  tooltip.x + 12,
                  (scrollContainerRef.current?.parentElement?.clientWidth ||
                    800) - 280
                ),
                top: Math.max(tooltip.y - 10, 8),
              }}
            >
              <div
                className="rounded p-3 w-64"
                style={{
                  backgroundColor: 'var(--fresco-parchment)',
                  border: '1px solid var(--fresco-shadow)',
                  boxShadow: '0 4px 16px rgba(44,36,22,0.12)',
                }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {tooltip.philosopher.name.ko}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                      {tooltip.philosopher.name.en}
                    </p>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ml-2"
                    style={{
                      backgroundColor: getFrescoEraColor(tooltip.philosopher.era) + '18',
                      color: getFrescoEraColor(tooltip.philosopher.era),
                    }}
                  >
                    {getEraLabel(tooltip.philosopher.era)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] mb-2" style={{ color: 'var(--ink-faded)' }}>
                  <span>
                    {formatYear(tooltip.philosopher.period.start)} ~{' '}
                    {formatYear(tooltip.philosopher.period.end)}
                  </span>
                  <span style={{ color: 'var(--fresco-shadow)' }}>|</span>
                  <span>{tooltip.philosopher.location.region}</span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--ink-light)' }}>
                  {tooltip.philosopher.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {tooltip.philosopher.school
                    ?.slice(0, 3)
                    .map((s: string) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(212,196,171,0.5)', color: 'var(--ink-light)' }}
                      >
                        {s}
                      </span>
                    ))}
                </div>
                <p className="text-[10px] mt-2" style={{ color: 'var(--ink-faded)' }}>
                  클릭하여 상세 페이지로 이동
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
          <span className="text-[11px]" style={{ color: 'var(--ink-faded)' }}>시대 색상:</span>
          {eras.map((era) => (
            <div key={era} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: frescoEraColors[era], opacity: 0.8 }}
              />
              <span className="text-[11px]" style={{ color: 'var(--ink-light)' }}>
                {getEraLabel(era)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Philosopher Cards List */}
      <div className="max-w-[1400px] mx-auto px-4 pb-20">
        <h2
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
        >
          <Calendar className="w-5 h-5" style={{ color: 'var(--ink-light)' }} />
          사상가 목록
          <span className="text-sm font-normal" style={{ color: 'var(--ink-faded)' }}>
            ({filteredPhilosophers.length}명)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhilosophers.map((p) => {
            const cardEraColor = getFrescoEraColor(p.era);
            return (
              <Link
                key={p.id}
                href={`/philosophy/${p.id}`}
                className="group rounded p-5 transition-all duration-200"
                style={{
                  border: '1px solid rgba(212,196,171,0.5)',
                  borderLeft: `4px solid ${cardEraColor}`,
                  backgroundColor: 'rgba(240,230,211,0.2)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(240,230,211,0.45)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(240,230,211,0.2)'; }}
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
                  <span
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{
                      backgroundColor: cardEraColor + '18',
                      color: cardEraColor,
                    }}
                  >
                    {getEraLabel(p.era as Era)}
                  </span>
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
                  {p.school.map((s: string) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded"
                      style={{ backgroundColor: 'rgba(212,196,171,0.4)', color: 'var(--ink-light)' }}
                    >
                      <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                      {s}
                    </span>
                  ))}
                </div>

                <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-light)' }}>
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
    </div>
  );
}
