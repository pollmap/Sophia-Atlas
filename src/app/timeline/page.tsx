'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Filter,
  Flag,
  Minus,
  Plus,
  Scroll,
  Atom,
  Crown,
  Palette,
  Users,
} from 'lucide-react';

import philosophersData from '@/data/persons/philosophers.json';
import religiousFiguresData from '@/data/persons/religious-figures.json';
import scientistsData from '@/data/persons/scientists.json';
import historicalFiguresData from '@/data/persons/historical-figures.json';
import eventsData from '@/data/entities/events.json';
import { cn, getEraLabel, formatYear, getCategoryLabel, getCategoryHexColor } from '@/lib/utils';

// ── Types ──

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';
type Category = 'philosopher' | 'religious_figure' | 'scientist' | 'historical_figure' | 'cultural_figure';

interface PersonData {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: string;
  period: { start: number; end: number; approximate?: boolean };
  location: { lat: number; lng: number; region: string };
  category: string;
  categories?: string[];
  subcategory: string;
  tags: string[];
  summary: string;
  [key: string]: unknown;
}

interface EventData {
  id: string;
  name: { ko: string; en: string };
  period?: { start: number; end?: number };
  era?: string;
  summary: string;
  tags: string[];
  [key: string]: unknown;
}

// ── Constants ──

const eras: Era[] = ['ancient', 'medieval', 'modern', 'contemporary'];

const eraRanges: Record<Era, { start: number; end: number }> = {
  ancient: { start: -600, end: 300 },
  medieval: { start: 300, end: 1500 },
  modern: { start: 1500, end: 1900 },
  contemporary: { start: 1900, end: 2025 },
};

const frescoEraColors: Record<Era, string> = {
  ancient: '#B8860B',
  medieval: '#6B4E8A',
  modern: '#4A7A6B',
  contemporary: '#6B6358',
};

const categoryOrder: Category[] = ['philosopher', 'religious_figure', 'scientist', 'historical_figure', 'cultural_figure'];

const categoryIcons: Record<string, React.ReactNode> = {
  philosopher: <BookOpen className="w-3 h-3" />,
  religious_figure: <Scroll className="w-3 h-3" />,
  scientist: <Atom className="w-3 h-3" />,
  historical_figure: <Crown className="w-3 h-3" />,
  cultural_figure: <Palette className="w-3 h-3" />,
};

// ── Data ──

const allPersons: PersonData[] = [
  ...(philosophersData as PersonData[]),
  ...(religiousFiguresData as PersonData[]),
  ...(scientistsData as PersonData[]),
  ...(historicalFiguresData as PersonData[]),
].sort((a, b) => a.period.start - b.period.start);

const allEvents = (eventsData as EventData[]).filter(
  (e) => e.period?.start != null && e.period.start >= -700 && e.period.start <= 2025
);

// ── Timeline constants ──

const TOTAL_START = -700;
const TOTAL_END = 2025;
const TOTAL_RANGE = TOTAL_END - TOTAL_START;
const BASE_WIDTH = 2400;
const ROW_HEIGHT = 22;
const ROW_GAP = 2;
const LANE_PADDING = 28;
const AXIS_HEIGHT = 30;
const EVENTS_TRACK_HEIGHT = 80;

// ── Overlap resolution ──

function assignRows(persons: PersonData[]): { person: PersonData; row: number }[] {
  const sorted = [...persons].sort((a, b) => a.period.start - b.period.start);
  const rows: number[][] = []; // rows[i] = end year of last person in row i

  return sorted.map((p) => {
    const start = p.period.start;
    const end = p.period.end;
    // find first row where this person fits
    let assignedRow = -1;
    for (let r = 0; r < rows.length; r++) {
      if (rows[r].every((endY) => start > endY + 5)) {
        assignedRow = r;
        break;
      }
    }
    if (assignedRow === -1) {
      assignedRow = rows.length;
      rows.push([]);
    }
    rows[assignedRow].push(end);
    return { person: p, row: assignedRow };
  });
}

// ── Component ──

export default function TimelinePage() {
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [showEvents, setShowEvents] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Read initial filters from URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category') as Category | null;
    const era = params.get('era') as Era | null;
    if (cat && categoryOrder.includes(cat)) setSelectedCategory(cat);
    if (era && eras.includes(era)) setSelectedEra(era);
  }, []);

  // Filtered persons
  const filteredPersons = useMemo(() => {
    let list = allPersons;
    if (selectedEra !== 'all') {
      list = list.filter((p) => p.era === selectedEra);
    }
    if (selectedCategory !== 'all') {
      list = list.filter((p) => {
        const cats = p.categories || [p.category];
        return cats.includes(selectedCategory);
      });
    }
    return list;
  }, [selectedEra, selectedCategory]);

  // Group by category with rows
  const categoryLanes = useMemo(() => {
    const lanes: { category: Category; label: string; color: string; items: { person: PersonData; row: number }[]; maxRow: number }[] = [];

    const order = selectedCategory === 'all' ? categoryOrder : [selectedCategory];

    for (const cat of order) {
      const persons = filteredPersons.filter((p) => {
        const cats = p.categories || [p.category];
        return cats.includes(cat);
      });
      if (persons.length === 0) continue;

      const withRows = assignRows(persons);
      const maxRow = withRows.reduce((max, item) => Math.max(max, item.row), 0);

      lanes.push({
        category: cat,
        label: getCategoryLabel(cat),
        color: getCategoryHexColor(cat),
        items: withRows,
        maxRow,
      });
    }

    return lanes;
  }, [filteredPersons, selectedCategory]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (selectedEra === 'all') return allEvents;
    return allEvents.filter((e) => e.era === selectedEra);
  }, [selectedEra]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const base = selectedEra === 'all' ? allPersons : allPersons.filter((p) => p.era === selectedEra);
    base.forEach((p) => {
      const cats = p.categories || [p.category];
      cats.forEach((c: string) => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return counts;
  }, [selectedEra]);

  // Positioning
  const getTimelinePosition = useCallback((year: number): number => {
    return ((year - TOTAL_START) / TOTAL_RANGE) * 100;
  }, []);

  const getBarWidth = useCallback((start: number, end: number): number => {
    const s = Math.max(start, TOTAL_START);
    const e = Math.min(end, TOTAL_END);
    return ((e - s) / TOTAL_RANGE) * 100;
  }, []);

  const timelineWidth = BASE_WIDTH * zoom;

  // Lane heights
  const laneHeights = useMemo(() => {
    return categoryLanes.map((lane) => LANE_PADDING + (lane.maxRow + 1) * (ROW_HEIGHT + ROW_GAP));
  }, [categoryLanes]);

  const totalLanesHeight = laneHeights.reduce((sum, h) => sum + h, 0) || 100;
  const totalTimelineHeight = totalLanesHeight + AXIS_HEIGHT + (showEvents ? EVENTS_TRACK_HEIGHT : 0);

  // Century markers
  const centuryMarkers = useMemo(() => {
    const markers: number[] = [];
    const step = zoom >= 2 ? 50 : 100;
    for (let y = -700; y <= 2025; y += step) {
      markers.push(y);
    }
    return markers;
  }, [zoom]);

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -400 : 400,
        behavior: 'smooth',
      });
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 0.5));

  // Cumulative y offsets for lanes
  const laneOffsets = useMemo(() => {
    const offsets: number[] = [];
    let y = 0;
    laneHeights.forEach((h) => {
      offsets.push(y);
      y += h;
    });
    return offsets;
  }, [laneHeights]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fresco-ivory)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded flex items-center justify-center"
            style={{ backgroundColor: 'rgba(74, 93, 138, 0.15)' }}
          >
            <Clock className="w-5 h-5" style={{ color: '#4A5D8A' }} />
          </div>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}
            >
              통합 타임라인
            </h1>
            <p style={{ color: 'var(--ink-light)' }} className="mt-0.5 text-sm">
              BC 700 ~ 현재 | 인류 지성사의 흐름을 한눈에
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-sm" style={{ color: 'var(--ink-light)' }}>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            인물 {filteredPersons.length}명
          </span>
          <span className="flex items-center gap-1">
            <Flag className="w-3.5 h-3.5" />
            사건 {filteredEvents.length}건
          </span>
        </div>
      </div>

      {/* Era Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 mr-0.5" style={{ color: 'var(--ink-light)' }} />
            <button
              onClick={() => setSelectedEra('all')}
              className="px-3 py-1.5 rounded text-sm font-medium transition-all"
              style={
                selectedEra === 'all'
                  ? { backgroundColor: '#4A5D8A', color: 'var(--fresco-ivory)' }
                  : { backgroundColor: 'var(--fresco-parchment)', color: 'var(--ink-light)' }
              }
            >
              전체 시대
            </button>
            {eras.map((era) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-all"
                style={
                  selectedEra === era
                    ? { backgroundColor: frescoEraColors[era], color: 'var(--fresco-ivory)' }
                    : { backgroundColor: 'var(--fresco-parchment)', color: 'var(--ink-light)' }
                }
              >
                {getEraLabel(era)}
              </button>
            ))}
          </div>

          {/* Events toggle + Zoom */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all"
              style={
                showEvents
                  ? { backgroundColor: 'var(--gold-muted)', color: 'var(--gold)', border: '1px solid var(--gold-light)' }
                  : { backgroundColor: 'var(--fresco-parchment)', color: 'var(--ink-light)' }
              }
            >
              <Flag className="w-3.5 h-3.5" />
              사건
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomOut}
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)', color: 'var(--ink-medium)' }}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs w-8 text-center" style={{ color: 'var(--ink-medium)' }}>{zoom}x</span>
              <button
                onClick={handleZoomIn}
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)', color: 'var(--ink-medium)' }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--ink-light)' }}>카테고리:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-3 py-1 rounded text-xs font-medium transition-all"
            style={
              selectedCategory === 'all'
                ? { backgroundColor: '#4A5D8A', color: 'var(--fresco-ivory)' }
                : { backgroundColor: 'var(--fresco-parchment)', color: 'var(--ink-light)' }
            }
          >
            전체 ({allPersons.length})
          </button>
          {categoryOrder.map((cat) => {
            const count = categoryCounts[cat] || 0;
            if (count === 0) return null;
            const color = getCategoryHexColor(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1"
                style={
                  selectedCategory === cat
                    ? { backgroundColor: color, color: 'var(--fresco-ivory)' }
                    : { backgroundColor: 'var(--fresco-parchment)', color: 'var(--ink-light)' }
                }
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {getCategoryLabel(cat)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <span style={{ color: 'var(--ink-light)' }}>시대:</span>
          {eras.map((era) => (
            <span key={era} className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded-sm" style={{ backgroundColor: frescoEraColors[era] }} />
              <span style={{ color: 'var(--ink-medium)' }}>{getEraLabel(era)}</span>
            </span>
          ))}
          <span className="mx-1" style={{ color: 'var(--fresco-shadow)' }}>|</span>
          <span style={{ color: 'var(--ink-light)' }}>카테고리:</span>
          {categoryOrder.map((cat) => (
            <span key={cat} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getCategoryHexColor(cat) }} />
              <span style={{ color: 'var(--ink-medium)' }}>{getCategoryLabel(cat)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div
          className="relative rounded overflow-hidden"
          style={{ border: '1px solid var(--fresco-shadow)', backgroundColor: 'var(--fresco-parchment)' }}
        >
          {/* Scroll buttons */}
          <button
            onClick={() => scrollTimeline('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)', color: 'var(--ink-medium)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTimeline('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)', color: 'var(--ink-medium)' }}
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div
            ref={timelineRef}
            className="overflow-x-auto overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--fresco-shadow) var(--fresco-parchment)', maxHeight: 'calc(100vh - 260px)' }}
          >
            <div
              className="relative"
              style={{ width: `${timelineWidth}px`, height: `${totalTimelineHeight}px` }}
            >
              {/* Era background bands */}
              {eras.map((era) => {
                const range = eraRanges[era];
                const left = getTimelinePosition(range.start);
                const width = getTimelinePosition(range.end) - left;
                return (
                  <div
                    key={era}
                    className="absolute top-0 bottom-0 opacity-[0.06]"
                    style={{ left: `${left}%`, width: `${width}%`, backgroundColor: frescoEraColors[era] }}
                  />
                );
              })}

              {/* Century marker lines */}
              {centuryMarkers.map((year) => {
                const left = getTimelinePosition(year);
                const isMajor = year % 500 === 0;
                return (
                  <div
                    key={`m-${year}`}
                    className="absolute top-0 bottom-0"
                    style={{ left: `${left}%` }}
                  >
                    <div
                      className="w-px h-full"
                      style={{ backgroundColor: 'var(--fresco-shadow)', opacity: isMajor ? 0.5 : 0.2 }}
                    />
                  </div>
                );
              })}

              {/* Category Swim Lanes */}
              {categoryLanes.map((lane, laneIdx) => {
                const yOffset = laneOffsets[laneIdx];
                return (
                  <div key={lane.category}>
                    {/* Lane separator */}
                    {laneIdx > 0 && (
                      <div
                        className="absolute left-0 right-0 h-px"
                        style={{ top: `${yOffset}px`, backgroundColor: 'var(--fresco-shadow)', opacity: 0.5 }}
                      />
                    )}

                    {/* Lane label */}
                    <div
                      className="absolute left-3 z-10 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        top: `${yOffset + 4}px`,
                        color: lane.color,
                        backgroundColor: 'var(--fresco-parchment)',
                      }}
                    >
                      {categoryIcons[lane.category]}
                      {lane.label} ({lane.items.length})
                    </div>

                    {/* Person bars */}
                    {lane.items.map(({ person, row }) => {
                      const left = getTimelinePosition(person.period.start);
                      const width = getBarWidth(person.period.start, person.period.end);
                      const barY = yOffset + LANE_PADDING + row * (ROW_HEIGHT + ROW_GAP);
                      const isHovered = hoveredPerson === person.id;
                      const eraColor = frescoEraColors[person.era as Era] || '#6B6358';

                      return (
                        <Link
                          key={person.id}
                          href={`/persons/${person.id}`}
                          className="absolute group"
                          style={{
                            left: `${left}%`,
                            top: `${barY}px`,
                            width: `${Math.max(width, 0.3)}%`,
                            height: `${ROW_HEIGHT}px`,
                            zIndex: isHovered ? 20 : 1,
                          }}
                          onMouseEnter={() => setHoveredPerson(person.id)}
                          onMouseLeave={() => setHoveredPerson(null)}
                        >
                          {/* Bar */}
                          <div
                            className="h-full rounded-sm flex items-center px-1 overflow-hidden transition-all"
                            style={{
                              backgroundColor: lane.color,
                              opacity: isHovered ? 1 : 0.75,
                              borderLeft: `2px solid ${eraColor}`,
                              boxShadow: isHovered ? `0 2px 8px ${lane.color}40` : '0 1px 2px rgba(44,36,22,0.1)',
                            }}
                          >
                            <span
                              className="text-[9px] font-medium whitespace-nowrap truncate"
                              style={{ color: 'var(--fresco-ivory)' }}
                            >
                              {person.name.ko}
                            </span>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block z-30 pointer-events-none">
                            <div
                              className="rounded px-3 py-2 whitespace-nowrap max-w-xs"
                              style={{
                                backgroundColor: 'var(--fresco-parchment)',
                                border: '1px solid var(--fresco-shadow)',
                                boxShadow: '0 4px 12px rgba(44,36,22,0.15)',
                              }}
                            >
                              <p className="text-[11px] font-semibold" style={{ color: 'var(--ink-dark)' }}>
                                {person.name.ko}
                              </p>
                              <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>{person.name.en}</p>
                              <p className="text-[9px] mt-0.5" style={{ color: 'var(--ink-faded)' }}>
                                {formatYear(person.period.start)} ~ {formatYear(person.period.end)} | {person.location.region}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <span
                                  className="text-[8px] px-1 rounded"
                                  style={{ backgroundColor: lane.color + '20', color: lane.color }}
                                >
                                  {getCategoryLabel(person.category)}
                                </span>
                                <span
                                  className="text-[8px] px-1 rounded"
                                  style={{ backgroundColor: eraColor + '20', color: eraColor }}
                                >
                                  {getEraLabel(person.era)}
                                </span>
                              </div>
                              {person.tags.length > 0 && (
                                <div className="flex flex-wrap gap-0.5 mt-1">
                                  {person.tags.slice(0, 3).map((t) => (
                                    <span
                                      key={t}
                                      className="text-[8px] px-1 rounded"
                                      style={{ backgroundColor: 'var(--fresco-aged)', color: 'var(--ink-medium)' }}
                                    >
                                      {t}
                                    </span>
                                  ))}
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

              {/* Time Axis */}
              <div
                className="absolute left-0 right-0"
                style={{ top: `${totalLanesHeight}px`, height: `${AXIS_HEIGHT}px`, borderTop: '1px solid var(--fresco-shadow)' }}
              >
                {centuryMarkers
                  .filter((y) => y % (zoom >= 2 ? 100 : 500) === 0)
                  .map((year) => {
                    const left = getTimelinePosition(year);
                    return (
                      <div
                        key={`ax-${year}`}
                        className="absolute"
                        style={{ left: `${left}%`, top: '4px', transform: 'translateX(-50%)' }}
                      >
                        <span className="text-[9px] font-medium" style={{ color: 'var(--ink-medium)' }}>
                          {formatYear(year)}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Events Track */}
              {showEvents && (
                <div
                  className="absolute left-0 right-0"
                  style={{
                    top: `${totalLanesHeight + AXIS_HEIGHT}px`,
                    height: `${EVENTS_TRACK_HEIGHT}px`,
                    borderTop: '1px solid var(--fresco-shadow)',
                  }}
                >
                  {/* Events label */}
                  <div
                    className="absolute left-3 z-10 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ top: '4px', color: 'var(--gold)', backgroundColor: 'var(--fresco-parchment)' }}
                  >
                    <Flag className="w-3 h-3" />
                    역사 사건 ({filteredEvents.length})
                  </div>

                  {filteredEvents.map((event, idx) => {
                    const start = event.period?.start ?? 0;
                    const left = getTimelinePosition(start);
                    const row = idx % 3;
                    const topY = 22 + row * 18;

                    return (
                      <Link
                        key={event.id}
                        href={`/entities/${event.id}`}
                        className="absolute group cursor-pointer"
                        style={{ left: `${left}%`, top: `${topY}px` }}
                      >
                        {/* Diamond marker */}
                        <div
                          className="w-2.5 h-2.5 rotate-45 transition-transform group-hover:scale-150"
                          style={{
                            backgroundColor: 'var(--gold)',
                            opacity: 0.7,
                            boxShadow: '0 1px 3px rgba(184, 134, 11, 0.3)',
                          }}
                        />
                        {/* Event tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-30 pointer-events-none">
                          <div
                            className="rounded px-3 py-2 whitespace-nowrap max-w-xs"
                            style={{
                              backgroundColor: 'var(--fresco-parchment)',
                              border: '1px solid var(--fresco-shadow)',
                              boxShadow: '0 4px 12px rgba(44,36,22,0.15)',
                            }}
                          >
                            <p className="text-[11px] font-semibold" style={{ color: 'var(--ink-dark)' }}>
                              {event.name.ko}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>{event.name.en}</p>
                            <p className="text-[9px] mt-0.5" style={{ color: 'var(--ink-faded)' }}>
                              {formatYear(start)}
                            </p>
                            <p className="text-[9px] mt-0.5 max-w-[200px] whitespace-normal" style={{ color: 'var(--ink-medium)' }}>
                              {event.summary.slice(0, 60)}...
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

      {/* Bottom: Person Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <p className="text-sm mb-3" style={{ color: 'var(--ink-light)' }}>
          {filteredPersons.length}명의 인물 — 타임라인 위의 바를 클릭하거나 아래 목록에서 탐색하세요
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1.5">
          {filteredPersons.slice(0, 120).map((person) => {
            const catColor = getCategoryHexColor(person.category);
            const eraColor = frescoEraColors[person.era as Era] || '#6B6358';
            return (
              <Link
                key={person.id}
                href={`/persons/${person.id}`}
                className="rounded p-2 transition-all hover:shadow-sm"
                style={{ backgroundColor: 'var(--fresco-parchment)', border: '1px solid var(--fresco-shadow)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
                  <span className="text-xs font-medium truncate" style={{ color: 'var(--ink-dark)' }}>
                    {person.name.ko}
                  </span>
                </div>
                <p className="text-[10px] truncate" style={{ color: 'var(--ink-light)' }}>
                  {person.name.en}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className="text-[8px] px-1 rounded"
                    style={{ backgroundColor: eraColor + '15', color: eraColor }}
                  >
                    {getEraLabel(person.era)}
                  </span>
                  <span className="text-[8px]" style={{ color: 'var(--ink-faded)' }}>
                    {formatYear(person.period.start)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {filteredPersons.length > 120 && (
          <div className="mt-4 text-center">
            <Link
              href="/persons"
              className="text-sm px-4 py-2 rounded transition-colors inline-flex items-center gap-1"
              style={{ color: 'var(--gold)', backgroundColor: 'var(--gold-muted)' }}
            >
              전체 {filteredPersons.length}명 보기 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
