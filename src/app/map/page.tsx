"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Globe,
  Filter,
  ChevronRight,
  MapPin,
  Loader2,
  Users,
  Diamond,
  Network,
} from "lucide-react";
import { cn, formatYear, getCategoryHexColor, getCategoryLabel, getEraLabel } from "@/lib/utils";

import philosophersData from "@/data/persons/philosophers.json";
import religiousData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalData from "@/data/persons/historical-figures.json";
import religionsData from "@/data/religions.json";
import eventsData from "@/data/entities/events.json";
import ideologiesData from "@/data/entities/ideologies.json";
import movementsData from "@/data/entities/movements.json";
import institutionsData from "@/data/entities/institutions.json";
import textsData from "@/data/entities/texts.json";
import conceptsData from "@/data/entities/concepts.json";

const WorldMap = dynamic(
  () => import("@/components/visualization/WorldMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-fresco-parchment rounded-xl">
        <div className="flex flex-col items-center gap-3 text-foreground-muted">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">지도를 불러오는 중...</span>
        </div>
      </div>
    ),
  }
);

// ── Types ──

interface PersonData {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: string;
  period: { start: number; end: number; approximate?: boolean };
  location: { lat: number; lng: number; region: string };
  category: string;
  summary: string;
  mvp?: boolean;
}

interface EntityData {
  id: string;
  type: string;
  name: { ko: string; en: string };
  period?: { start: number; end: number };
  location?: { lat: number; lng: number; region: string };
  era?: string;
  summary: string;
  tags: string[];
}

// ── Data ──

const allPersons: PersonData[] = [
  ...(philosophersData as PersonData[]),
  ...(religiousData as PersonData[]),
  ...(scientistsData as PersonData[]),
  ...(historicalData as PersonData[]),
];

const allEntities: EntityData[] = [
  ...(eventsData as EntityData[]),
  ...(ideologiesData as EntityData[]),
  ...(movementsData as EntityData[]),
  ...(institutionsData as EntityData[]),
  ...(textsData as EntityData[]),
  ...(conceptsData as EntityData[]),
];

const entitiesWithLocation = allEntities.filter((e) => e.location?.lat && e.location?.lng);

const ENTITY_TYPE_LABELS: Record<string, string> = {
  event: "역사적 사건",
  ideology: "사상/이념",
  movement: "운동/학파",
  institution: "기관/조직",
  text: "경전/문헌",
  concept: "핵심 개념",
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  event: "#8B4040",
  ideology: "#6B4E8A",
  movement: "#4A5D8A",
  institution: "#B8860B",
  text: "#5B7355",
  concept: "#4A7A6B",
};

const CATEGORY_OPTIONS = [
  { key: "all", label: "전체", color: "#B8860B" },
  { key: "philosopher", label: "철학자", color: "#4A5D8A" },
  { key: "religious_figure", label: "종교 인물", color: "#B8860B" },
  { key: "scientist", label: "과학자", color: "#5B7355" },
  { key: "historical_figure", label: "역사 인물", color: "#8B4040" },
  { key: "cultural_figure", label: "문화/예술", color: "#7A5478" },
];

const ERA_OPTIONS = [
  { key: "all", label: "전체 시대" },
  { key: "ancient", label: "고대" },
  { key: "medieval", label: "중세" },
  { key: "modern", label: "근대" },
  { key: "contemporary", label: "현대" },
];

function getPersonLink(person: PersonData): string {
  if (person.category === "philosopher") return `/philosophy/${person.id}/`;
  return `/persons/${person.id}`;
}

// ── Component ──

export default function MapPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [showEntities, setShowEntities] = useState(true);
  const [viewportPersons, setViewportPersons] = useState<PersonData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"persons" | "entities">("persons");

  const filteredPersons = useMemo(() => {
    return allPersons.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (eraFilter !== "all" && p.era !== eraFilter) return false;
      return true;
    });
  }, [categoryFilter, eraFilter]);

  const filteredEntities = useMemo(() => {
    return entitiesWithLocation.filter((e) => {
      if (eraFilter !== "all" && e.era !== eraFilter) return false;
      return true;
    });
  }, [eraFilter]);

  const sortedViewportPersons = useMemo(() => {
    return [...viewportPersons].sort((a, b) => a.period.start - b.period.start);
  }, [viewportPersons]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-border bg-fresco-ivory/90 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold/10 text-gold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                세계 지성 지도
              </h1>
              <p className="text-xs text-foreground-muted hidden md:block">
                {allPersons.length}명의 인물 · {entitiesWithLocation.length}개의 사건/기관을 세계지도 위에서 탐색합니다
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-foreground-muted" />

            {/* Category chips */}
            <div className="flex items-center gap-1">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setCategoryFilter(opt.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 border",
                    categoryFilter === opt.key
                      ? "border-gold/40 text-ink-dark"
                      : "border-transparent bg-fresco-parchment text-foreground-secondary hover:text-foreground hover:bg-fresco-aged/60"
                  )}
                  style={
                    categoryFilter === opt.key
                      ? { backgroundColor: opt.color + "20" }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Era select */}
            <select
              value={eraFilter}
              onChange={(e) => setEraFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-fresco-parchment border border-fresco-shadow text-foreground-secondary"
            >
              {ERA_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>

            {/* Entity toggle */}
            <button
              onClick={() => setShowEntities(!showEntities)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border",
                showEntities
                  ? "bg-[#6B4E8A]/15 text-[#6B4E8A] border-[#6B4E8A]/30"
                  : "bg-fresco-parchment text-foreground-secondary border-transparent hover:bg-fresco-aged/60"
              )}
            >
              <Diamond className="w-3 h-3" />
              사건/기관
            </button>
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map area */}
        <div className="flex-1 relative">
          <WorldMap
            persons={filteredPersons}
            religions={religionsData as any}
            categoryFilter={categoryFilter}
            eraFilter={eraFilter}
            onViewportPersons={setViewportPersons}
          />

          {/* Entity markers overlay info */}
          {showEntities && filteredEntities.length > 0 && (
            <div className="absolute bottom-4 left-4 z-[1000] bg-fresco-parchment/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-fresco-shadow text-xs">
              <div className="flex items-center gap-1.5 text-ink-medium">
                <Diamond className="w-3 h-3" style={{ color: "#6B4E8A" }} />
                사건/기관 {filteredEntities.length}개 표시 중
              </div>
            </div>
          )}

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 z-[1000] bg-fresco-parchment/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-fresco-shadow text-xs text-foreground-secondary hover:text-foreground transition-colors"
          >
            {sidebarOpen ? "패널 닫기" : "패널 열기"}
          </button>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0 border-l border-border bg-fresco-ivory overflow-y-auto">
            {/* Sidebar tabs */}
            <div className="sticky top-0 z-10 bg-fresco-ivory border-b border-fresco-shadow">
              <div className="flex">
                <button
                  onClick={() => setSidebarTab("persons")}
                  className={cn(
                    "flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                    sidebarTab === "persons"
                      ? "text-ink-dark border-b-2 border-gold"
                      : "text-ink-faded hover:text-ink-medium"
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  인물 ({sortedViewportPersons.length})
                </button>
                <button
                  onClick={() => setSidebarTab("entities")}
                  className={cn(
                    "flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                    sidebarTab === "entities"
                      ? "text-ink-dark border-b-2 border-[#6B4E8A]"
                      : "text-ink-faded hover:text-ink-medium"
                  )}
                >
                  <Diamond className="w-3.5 h-3.5" />
                  사건/기관 ({filteredEntities.length})
                </button>
              </div>
            </div>

            {/* Persons tab */}
            {sidebarTab === "persons" && (
              <div className="divide-y divide-fresco-shadow/50">
                {sortedViewportPersons.length === 0 ? (
                  <div className="p-6 text-center text-foreground-muted text-sm">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>지도를 이동하면 해당 지역의 인물이 표시됩니다</p>
                  </div>
                ) : (
                  sortedViewportPersons.map((person) => (
                    <Link
                      key={person.id}
                      href={getPersonLink(person)}
                      className="block px-4 py-3 hover:bg-fresco-aged/30 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: getCategoryHexColor(person.category) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground group-hover:text-gold transition-colors truncate">
                              {person.name.ko}
                            </span>
                            <ChevronRight className="w-3 h-3 text-foreground-muted group-hover:text-gold flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-foreground-muted">
                              {formatYear(person.period.start)}~{formatYear(person.period.end)}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                              backgroundColor: getCategoryHexColor(person.category) + "15",
                              color: getCategoryHexColor(person.category),
                            }}>
                              {getCategoryLabel(person.category)}
                            </span>
                          </div>
                          <p className="text-xs text-foreground-muted mt-1 line-clamp-2">{person.summary}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Entities tab */}
            {sidebarTab === "entities" && (
              <div className="divide-y divide-fresco-shadow/50">
                {filteredEntities.length === 0 ? (
                  <div className="p-6 text-center text-foreground-muted text-sm">
                    <Diamond className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>표시할 사건/기관이 없습니다</p>
                  </div>
                ) : (
                  filteredEntities.map((entity) => (
                    <Link
                      key={entity.id}
                      href={`/entities/${entity.id}`}
                      className="block px-4 py-3 hover:bg-fresco-aged/30 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <Diamond
                          className="w-3 h-3 mt-1 flex-shrink-0"
                          style={{ color: ENTITY_TYPE_COLORS[entity.type] || "#6B4E8A" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground group-hover:text-gold transition-colors truncate">
                              {entity.name.ko}
                            </span>
                            <ChevronRight className="w-3 h-3 text-foreground-muted group-hover:text-gold flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {entity.period && (
                              <span className="text-[10px] text-foreground-muted">
                                {formatYear(entity.period.start)}
                                {entity.period.end !== entity.period.start && `~${formatYear(entity.period.end)}`}
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                              backgroundColor: (ENTITY_TYPE_COLORS[entity.type] || "#6B4E8A") + "15",
                              color: ENTITY_TYPE_COLORS[entity.type] || "#6B4E8A",
                            }}>
                              {ENTITY_TYPE_LABELS[entity.type] || entity.type}
                            </span>
                          </div>
                          {entity.location && (
                            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-foreground-muted">
                              <MapPin className="w-2.5 h-2.5" />
                              {entity.location.region}
                            </div>
                          )}
                          <p className="text-xs text-foreground-muted mt-1 line-clamp-2">{entity.summary}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* IndraNet link */}
            <div className="p-4 border-t border-fresco-shadow">
              <Link
                href="/connections"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
              >
                <Network className="w-4 h-4" />
                인드라망에서 관계 탐색하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
