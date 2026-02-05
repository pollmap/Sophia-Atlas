"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Landmark,
  Scroll,
  BookMarked,
  ChevronRight,
  ChevronDown,
  X,
  Clock,
  Sparkles,
  Users,
  Layers,
  Atom,
  Crown,
  Palette,
  Flame,
  Building2,
  FileText,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import type FuseType from "fuse.js";
import philosophersData from "@/data/persons/philosophers.json";
import religiousFiguresData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalFiguresData from "@/data/persons/historical-figures.json";
import religionsData from "@/data/religions.json";
import glossaryData from "@/data/glossary.json";
import eventsData from "@/data/entities/events.json";
import ideologiesData from "@/data/entities/ideologies.json";
import movementsData from "@/data/entities/movements.json";
import institutionsData from "@/data/entities/institutions.json";
import textsData from "@/data/entities/texts.json";
import conceptsData from "@/data/entities/concepts.json";
import {
  cn,
  getEraLabel,
  getCategoryLabel,
  getCategoryHexColor,
  getEraHexColor,
  formatYear,
} from "@/lib/utils";

// ────────────────────────────────────────────────────────────
// Data aggregation
// ────────────────────────────────────────────────────────────

const allPersonsData = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
] as any[];

const allEntitiesData = [
  ...(eventsData as any[]),
  ...(ideologiesData as any[]),
  ...(movementsData as any[]),
  ...(institutionsData as any[]),
  ...(textsData as any[]),
  ...(conceptsData as any[]),
];

// ────────────────────────────────────────────────────────────
// Result types
// ────────────────────────────────────────────────────────────

interface PersonResult {
  type: "person";
  id: string;
  name: string;
  nameEn: string;
  era: string;
  category: string;
  preview: string;
  period?: { start: number; end: number };
}

interface EntityResult {
  type: "entity";
  id: string;
  name: string;
  nameEn: string;
  entityType: string;
  era?: string;
  preview: string;
  period?: { start: number; end: number };
}

interface ReligionResult {
  type: "religion" | "mythology";
  id: string;
  name: string;
  nameEn: string;
  category: string;
  preview: string;
}

interface GlossaryResult {
  type: "glossary";
  id: string;
  term: string;
  termEn: string;
  category: string;
  definition: string;
}

type SearchResult = PersonResult | EntityResult | ReligionResult | GlossaryResult;

type FilterTab = "all" | "person" | "entity" | "religion" | "glossary";

// ────────────────────────────────────────────────────────────
// Entity type labels & icons
// ────────────────────────────────────────────────────────────

const entityTypeLabels: Record<string, string> = {
  event: "역사적 사건",
  ideology: "사상/이념",
  movement: "운동/학파",
  institution: "기관/조직",
  text: "경전/문헌",
  concept: "핵심 개념",
};

function getEntityTypeIcon(entityType: string) {
  switch (entityType) {
    case "event": return <Flame className="w-4 h-4" />;
    case "ideology": return <TrendingUp className="w-4 h-4" />;
    case "movement": return <Users className="w-4 h-4" />;
    case "institution": return <Building2 className="w-4 h-4" />;
    case "text": return <FileText className="w-4 h-4" />;
    case "concept": return <Lightbulb className="w-4 h-4" />;
    default: return <Layers className="w-4 h-4" />;
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "philosopher": return <BookOpen className="w-4 h-4" />;
    case "religious_figure": return <Scroll className="w-4 h-4" />;
    case "scientist": return <Atom className="w-4 h-4" />;
    case "historical_figure": return <Crown className="w-4 h-4" />;
    case "cultural_figure": return <Palette className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
}

// ────────────────────────────────────────────────────────────
// Suggested search keywords
// ────────────────────────────────────────────────────────────

const suggestedSearches = [
  "소크라테스", "칸트", "석가모니", "아인슈타인", "니체",
  "실존주의", "양자역학", "종교개혁", "프랑스 혁명", "이데아",
  "다윈", "공자", "불교", "아카데메이아", "자본론",
];

// ────────────────────────────────────────────────────────────
// Fuse.js indices (lazy-loaded)
// ────────────────────────────────────────────────────────────

let _Fuse: typeof FuseType | null = null;
let _personIndex: FuseType<any> | null = null;
let _entityIndex: FuseType<any> | null = null;
let _religionIndex: FuseType<any> | null = null;
let _glossaryIndex: FuseType<any> | null = null;

async function getFuseIndices() {
  if (!_Fuse) {
    const mod = await import("fuse.js");
    _Fuse = mod.default;
  }
  const Fuse = _Fuse;
  if (!_personIndex) {
    _personIndex = new Fuse(allPersonsData, {
      keys: ["name.ko", "name.en", "name.original", "summary", "tags", "concepts", "field", "school"],
      threshold: 0.35, includeScore: true,
    });
  }
  if (!_entityIndex) {
    _entityIndex = new Fuse(allEntitiesData, {
      keys: ["name.ko", "name.en", "name.original", "summary", "tags"],
      threshold: 0.35, includeScore: true,
    });
  }
  if (!_religionIndex) {
    _religionIndex = new Fuse(religionsData, {
      keys: ["name.ko", "name.en", "summary"],
      threshold: 0.4, includeScore: true,
    });
  }
  if (!_glossaryIndex) {
    _glossaryIndex = new Fuse(glossaryData, {
      keys: ["term.ko", "term.en", "definition"],
      threshold: 0.4, includeScore: true,
    });
  }
  return { personIndex: _personIndex, entityIndex: _entityIndex, religionIndex: _religionIndex, glossaryIndex: _glossaryIndex };
}

// ────────────────────────────────────────────────────────────
// Recent searches (localStorage)
// ────────────────────────────────────────────────────────────

const RECENT_SEARCHES_KEY = "sophia-atlas-recent-searches";
const MAX_RECENT = 8;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s !== query);
    const updated = [query, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

function clearRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [expandedGlossary, setExpandedGlossary] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [fuseReady, setFuseReady] = useState(false);
  const [results, setResults] = useState<{ persons: PersonResult[]; entities: EntityResult[]; religions: ReligionResult[]; glossary: GlossaryResult[] }>({ persons: [], entities: [], religions: [], glossary: [] });

  // Load Fuse.js indices + recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    getFuseIndices().then(() => setFuseReady(true));
  }, []);

  // Save search on debounced query change
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) return;
    const timeout = setTimeout(() => {
      saveRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }, 1500);
    return () => clearTimeout(timeout);
  }, [query]);

  // ── Search logic ──
  useEffect(() => {
    if (!fuseReady || !query.trim()) {
      setResults({ persons: [], entities: [], religions: [], glossary: [] });
      return;
    }

    const personResults: PersonResult[] = (_personIndex?.search(query) ?? []).map((r: any) => ({
      type: "person" as const,
      id: r.item.id,
      name: r.item.name.ko,
      nameEn: r.item.name.en,
      era: r.item.era,
      category: r.item.category || "philosopher",
      preview: r.item.summary,
      period: r.item.period,
    }));

    const entityResults: EntityResult[] = (_entityIndex?.search(query) ?? []).map((r: any) => ({
      type: "entity" as const,
      id: r.item.id,
      name: r.item.name.ko,
      nameEn: r.item.name.en,
      entityType: r.item.type,
      era: r.item.era,
      preview: r.item.summary,
      period: r.item.period,
    }));

    const relResults: ReligionResult[] = (_religionIndex?.search(query) ?? []).map((r: any) => ({
      type: r.item.type as "religion" | "mythology",
      id: r.item.id,
      name: r.item.name.ko,
      nameEn: r.item.name.en,
      category: r.item.type === "religion" ? "종교" : "신화",
      preview: r.item.summary,
    }));

    const glosResults: GlossaryResult[] = (_glossaryIndex?.search(query) ?? []).map((r: any) => ({
      type: "glossary" as const,
      id: r.item.id,
      term: r.item.term.ko,
      termEn: r.item.term.en,
      category: r.item.category,
      definition: r.item.definition,
    }));

    setResults({
      persons: personResults,
      entities: entityResults,
      religions: relResults,
      glossary: glosResults,
    });
  }, [query, fuseReady]);

  const counts = {
    all: results.persons.length + results.entities.length + results.religions.length + results.glossary.length,
    person: results.persons.length,
    entity: results.entities.length,
    religion: results.religions.length,
    glossary: results.glossary.length,
  };

  const toggleGlossaryExpand = useCallback((id: string) => {
    setExpandedGlossary((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSuggestionClick = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const filterTabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "전체", icon: <Search className="w-3.5 h-3.5" /> },
    { key: "person", label: "인물", icon: <Users className="w-3.5 h-3.5" /> },
    { key: "entity", label: "주제", icon: <Layers className="w-3.5 h-3.5" /> },
    { key: "religion", label: "종교/신화", icon: <Landmark className="w-3.5 h-3.5" /> },
    { key: "glossary", label: "용어", icon: <BookMarked className="w-3.5 h-3.5" /> },
  ];

  const hasResults = counts.all > 0;
  const showPersons = (activeFilter === "all" || activeFilter === "person") && results.persons.length > 0;
  const showEntities = (activeFilter === "all" || activeFilter === "entity") && results.entities.length > 0;
  const showReligions = (activeFilter === "all" || activeFilter === "religion") && results.religions.length > 0;
  const showGlossary = (activeFilter === "all" || activeFilter === "glossary") && results.glossary.length > 0;

  return (
    <div className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "var(--gold-muted)", color: "var(--gold)" }}
          >
            <Search className="w-5 h-5" />
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold font-display"
            style={{ color: "var(--ink-dark)" }}
          >
            통합 검색
          </h1>
        </div>
        <p style={{ color: "var(--ink-medium)" }}>
          {allPersonsData.length}명의 인물, {allEntitiesData.length}개의 주제,{" "}
          {religionsData.length}개의 종교/신화, {glossaryData.length}개의 용어를 검색하세요.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: "var(--ink-faded)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="인물, 사건, 사상, 종교, 개념을 검색하세요..."
          className="w-full pl-12 pr-10 py-4 rounded-xl text-base transition-all duration-200"
          style={{
            background: "var(--fresco-parchment)",
            border: "1px solid var(--fresco-shadow)",
            color: "var(--ink-dark)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--gold)";
            e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-muted)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--fresco-shadow)";
            e.currentTarget.style.boxShadow = "none";
          }}
          autoFocus
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setActiveFilter("all"); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--ink-faded)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink-dark)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink-faded)"; }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs (only shown when searching) */}
      {query.trim() && hasResults && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filterTabs.map((tab) => {
            const count = counts[tab.key];
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: isActive ? "var(--gold-muted)" : "transparent",
                  color: isActive ? "var(--gold)" : "var(--ink-light)",
                  border: `1px solid ${isActive ? "var(--gold-light)" : "var(--fresco-shadow)"}`,
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {query.trim() && (
                  <span
                    className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? "rgba(184, 134, 11, 0.15)" : "var(--fresco-aged)",
                      color: isActive ? "var(--gold)" : "var(--ink-faded)",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Search Results */}
      {query.trim() ? (
        hasResults ? (
          <div className="space-y-8">
            {/* Result count */}
            <p className="text-sm" style={{ color: "var(--ink-faded)" }}>
              총{" "}
              <span className="font-medium" style={{ color: "var(--ink-dark)" }}>
                {activeFilter === "all" ? counts.all : counts[activeFilter]}
              </span>
              개의 결과
            </p>

            {/* ── Persons ── */}
            {showPersons && (
              <div>
                <h2
                  className="flex items-center gap-2 text-base font-semibold mb-3 font-display"
                  style={{ color: "var(--ink-dark)" }}
                >
                  <Users className="w-4 h-4" style={{ color: "var(--cat-philosopher)" }} />
                  인물
                  <span className="text-xs font-normal font-ui" style={{ color: "var(--ink-faded)" }}>
                    ({results.persons.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.persons.map((item) => {
                    const catColor = getCategoryHexColor(item.category);
                    const eraColor = getEraHexColor(item.era);
                    return (
                      <Link
                        key={item.id}
                        href={`/persons/${item.id}`}
                        className="flex items-start gap-3 p-4 rounded-xl fresco-card group"
                      >
                        <span className="flex-shrink-0 mt-0.5" style={{ color: catColor }}>
                          {getCategoryIcon(item.category)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className="font-medium text-sm transition-colors"
                              style={{ color: "var(--ink-dark)" }}
                            >
                              {item.name}
                            </span>
                            <span className="text-xs" style={{ color: "var(--ink-faded)" }}>
                              {item.nameEn}
                            </span>
                            {item.period && (
                              <span className="text-[10px]" style={{ color: "var(--ink-faded)" }}>
                                {formatYear(item.period.start)}~{formatYear(item.period.end)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui"
                              style={{
                                backgroundColor: `${catColor}18`,
                                color: catColor,
                                border: `1px solid ${catColor}30`,
                              }}
                            >
                              {getCategoryLabel(item.category)}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui"
                              style={{
                                backgroundColor: `${eraColor}18`,
                                color: eraColor,
                                border: `1px solid ${eraColor}30`,
                              }}
                            >
                              {getEraLabel(item.era)}
                            </span>
                          </div>
                          <p
                            className="text-xs line-clamp-2 leading-relaxed"
                            style={{ color: "var(--ink-medium)" }}
                          >
                            {item.preview}
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
                          style={{ color: "var(--ink-faded)" }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Entities ── */}
            {showEntities && (
              <div>
                <h2
                  className="flex items-center gap-2 text-base font-semibold mb-3 font-display"
                  style={{ color: "var(--ink-dark)" }}
                >
                  <Layers className="w-4 h-4" style={{ color: "var(--gold)" }} />
                  주제
                  <span className="text-xs font-normal font-ui" style={{ color: "var(--ink-faded)" }}>
                    ({results.entities.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.entities.map((item) => {
                    const eraColor = item.era ? getEraHexColor(item.era) : undefined;
                    return (
                      <Link
                        key={item.id}
                        href={`/entities/${item.id}`}
                        className="flex items-start gap-3 p-4 rounded-xl fresco-card group"
                      >
                        <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--gold)" }}>
                          {getEntityTypeIcon(item.entityType)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className="font-medium text-sm transition-colors"
                              style={{ color: "var(--ink-dark)" }}
                            >
                              {item.name}
                            </span>
                            <span className="text-xs" style={{ color: "var(--ink-faded)" }}>
                              {item.nameEn}
                            </span>
                            {item.period && (
                              <span className="text-[10px]" style={{ color: "var(--ink-faded)" }}>
                                {formatYear(item.period.start)}
                                {item.period.end !== item.period.start && `~${formatYear(item.period.end)}`}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui"
                              style={{
                                backgroundColor: "var(--gold-muted)",
                                color: "var(--gold)",
                                border: "1px solid rgba(184, 134, 11, 0.25)",
                              }}
                            >
                              {entityTypeLabels[item.entityType] || item.entityType}
                            </span>
                            {eraColor && (
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui"
                                style={{
                                  backgroundColor: `${eraColor}18`,
                                  color: eraColor,
                                  border: `1px solid ${eraColor}30`,
                                }}
                              >
                                {getEraLabel(item.era!)}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-xs line-clamp-2 leading-relaxed"
                            style={{ color: "var(--ink-medium)" }}
                          >
                            {item.preview}
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
                          style={{ color: "var(--ink-faded)" }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Religions ── */}
            {showReligions && (
              <div>
                <h2
                  className="flex items-center gap-2 text-base font-semibold mb-3 font-display"
                  style={{ color: "var(--ink-dark)" }}
                >
                  <Landmark className="w-4 h-4" style={{ color: "var(--gold)" }} />
                  종교/신화
                  <span className="text-xs font-normal font-ui" style={{ color: "var(--ink-faded)" }}>
                    ({results.religions.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.religions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/religion/${item.id}`}
                      className="flex items-start gap-3 p-4 rounded-xl fresco-card group"
                    >
                      {item.type === "religion" ? (
                        <Landmark className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
                      ) : (
                        <Scroll className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--cat-scientist)" }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="font-medium text-sm transition-colors"
                            style={{ color: "var(--ink-dark)" }}
                          >
                            {item.name}
                          </span>
                          <span className="text-xs" style={{ color: "var(--ink-faded)" }}>
                            {item.nameEn}
                          </span>
                        </div>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-ui mb-1.5"
                          style={{
                            backgroundColor: item.type === "religion" ? "var(--gold-muted)" : "rgba(91, 115, 85, 0.12)",
                            color: item.type === "religion" ? "var(--gold)" : "var(--cat-scientist)",
                            border: `1px solid ${item.type === "religion" ? "rgba(184, 134, 11, 0.25)" : "rgba(91, 115, 85, 0.25)"}`,
                          }}
                        >
                          {item.category}
                        </span>
                        <p
                          className="text-xs line-clamp-2 leading-relaxed"
                          style={{ color: "var(--ink-medium)" }}
                        >
                          {item.preview}
                        </p>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: "var(--ink-faded)" }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Glossary ── */}
            {showGlossary && (
              <div>
                <h2
                  className="flex items-center gap-2 text-base font-semibold mb-3 font-display"
                  style={{ color: "var(--ink-dark)" }}
                >
                  <BookMarked className="w-4 h-4" style={{ color: "var(--cat-scientist)" }} />
                  용어사전
                  <span className="text-xs font-normal font-ui" style={{ color: "var(--ink-faded)" }}>
                    ({results.glossary.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.glossary.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl fresco-card"
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm" style={{ color: "var(--ink-dark)" }}>
                          {item.term}
                        </span>
                        <span className="text-xs" style={{ color: "var(--ink-faded)" }}>
                          {item.termEn}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui"
                          style={{
                            backgroundColor: "rgba(91, 115, 85, 0.1)",
                            color: "var(--cat-scientist)",
                            border: "1px solid rgba(91, 115, 85, 0.25)",
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--ink-medium)" }}
                      >
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results for filtered tab */}
            {!showPersons && !showEntities && !showReligions && !showGlossary && (
              <div className="text-center py-12">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: "var(--ink-faded)" }} />
                <p style={{ color: "var(--ink-light)" }}>
                  이 카테고리에서 검색 결과가 없습니다
                </p>
                <button
                  onClick={() => setActiveFilter("all")}
                  className="mt-2 text-sm underline"
                  style={{ color: "var(--gold)" }}
                >
                  전체 결과 보기
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: "var(--ink-faded)" }} />
            <p className="text-lg" style={{ color: "var(--ink-light)" }}>
              검색 결과가 없습니다
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--ink-faded)" }}>
              다른 검색어를 시도해보세요.
            </p>
          </div>
        )
      ) : (
        <div>
          {/* ── Suggestions ── */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: "var(--gold)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--ink-dark)" }}>
                추천 검색어
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSuggestionClick(term)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: "var(--fresco-parchment)",
                    color: "var(--ink-medium)",
                    border: "1px solid var(--fresco-shadow)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-light)";
                    (e.currentTarget as HTMLElement).style.color = "var(--gold)";
                    (e.currentTarget as HTMLElement).style.background = "var(--gold-muted)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--fresco-shadow)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink-medium)";
                    (e.currentTarget as HTMLElement).style.background = "var(--fresco-parchment)";
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* ── Recent Searches ── */}
          {recentSearches.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "var(--ink-faded)" }} />
                  <h2 className="text-sm font-semibold" style={{ color: "var(--ink-dark)" }}>
                    최근 검색어
                  </h2>
                </div>
                <button
                  onClick={handleClearRecent}
                  className="text-xs transition-colors"
                  style={{ color: "var(--ink-faded)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink-dark)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink-faded)"; }}
                >
                  전체 삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
                    style={{
                      background: "var(--fresco-aged)",
                      color: "var(--ink-light)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--ink-dark)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--ink-light)";
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Data Stats ── */}
          <div className="mb-10">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--ink-dark)" }}>
              검색 가능한 데이터
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "인물", count: allPersonsData.length, icon: <Users className="w-5 h-5" />, color: "var(--cat-philosopher)" },
                { label: "주제", count: allEntitiesData.length, icon: <Layers className="w-5 h-5" />, color: "var(--gold)" },
                { label: "종교/신화", count: religionsData.length, icon: <Landmark className="w-5 h-5" />, color: "var(--cat-religious)" },
                { label: "용어", count: glossaryData.length, icon: <BookMarked className="w-5 h-5" />, color: "var(--cat-scientist)" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl text-center fresco-card"
                >
                  <div className="flex justify-center mb-2" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold font-display" style={{ color: "var(--ink-dark)" }}>
                    {stat.count}
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-light)" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Glossary Section ── */}
          <div>
            <h2
              className="flex items-center gap-2 text-lg font-semibold mb-4 font-display"
              style={{ color: "var(--ink-dark)" }}
            >
              <BookMarked className="w-5 h-5" style={{ color: "var(--cat-scientist)" }} />
              용어사전
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {glossaryData.map((term: any) => {
                const isExpanded = expandedGlossary.has(term.id);
                return (
                  <div
                    key={term.id}
                    className="rounded-xl overflow-hidden fresco-card"
                  >
                    <button
                      onClick={() => toggleGlossaryExpand(term.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--fresco-aged)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm" style={{ color: "var(--ink-dark)" }}>
                          {term.term.ko}
                        </span>
                        <span className="text-xs" style={{ color: "var(--ink-faded)" }}>
                          {term.term.en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui"
                          style={{
                            backgroundColor: "rgba(91, 115, 85, 0.1)",
                            color: "var(--cat-scientist)",
                          }}
                        >
                          {term.category}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                          style={{ color: "var(--ink-faded)" }}
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <div
                        className="px-4 pb-3"
                        style={{ borderTop: "1px solid var(--fresco-shadow)" }}
                      >
                        <p
                          className="text-xs leading-relaxed pt-3"
                          style={{ color: "var(--ink-medium)" }}
                        >
                          {term.definition}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
