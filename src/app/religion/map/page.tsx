"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Globe,
  Filter,
  ChevronRight,
  Users,
  MapPin,
  Loader2,
} from "lucide-react";
import { cn, formatYear, getCategoryHexColor, getCategoryLabel, getCategoryBadgeClass, getEraLabel } from "@/lib/utils";

import philosophersData from "@/data/persons/philosophers.json";
import religiousData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalData from "@/data/persons/historical-figures.json";
import religionsData from "@/data/religions.json";

// Dynamic import for Leaflet (no SSR)
const WorldMap = dynamic(
  () => import("@/components/visualization/WorldMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] rounded-xl">
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

// ── Merge all persons ──

const allPersons: PersonData[] = [
  ...(philosophersData as PersonData[]),
  ...(religiousData as PersonData[]),
  ...(scientistsData as PersonData[]),
  ...(historicalData as PersonData[]),
];

// ── Category / Era options ──

const CATEGORY_OPTIONS = [
  { key: "all", label: "전체", color: "#8B5CF6" },
  { key: "philosopher", label: "철학자", color: "#6366F1" },
  { key: "religious_figure", label: "종교 인물", color: "#F59E0B" },
  { key: "scientist", label: "과학자", color: "#10B981" },
  { key: "historical_figure", label: "역사 인물", color: "#EF4444" },
  { key: "cultural_figure", label: "문화/예술", color: "#EC4899" },
];

const ERA_OPTIONS = [
  { key: "all", label: "전체 시대" },
  { key: "ancient", label: "고대" },
  { key: "medieval", label: "중세" },
  { key: "modern", label: "근대" },
  { key: "contemporary", label: "현대" },
];

// ── Person link helper ──

function getPersonLink(person: PersonData): string {
  if (person.category === "philosopher") return `/philosophy/${person.id}/`;
  return `/persons/${person.id}/`;
}

// ── Page Component ──

export default function ReligionMapPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [viewportPersons, setViewportPersons] = useState<PersonData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredCount = useMemo(() => {
    return allPersons.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (eraFilter !== "all" && p.era !== eraFilter) return false;
      return true;
    }).length;
  }, [categoryFilter, eraFilter]);

  // Sort viewport persons by period start
  const sortedViewportPersons = useMemo(() => {
    return [...viewportPersons].sort((a, b) => a.period.start - b.period.start);
  }, [viewportPersons]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                세계 사상 지도
              </h1>
              <p className="text-xs text-foreground-muted hidden md:block">
                {allPersons.length}명의 인물과 {religionsData.length}개의 종교/신화를 세계지도 위에서 탐색합니다
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-foreground-muted" />

            {/* Category filter */}
            <div className="flex items-center gap-1">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setCategoryFilter(opt.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                    categoryFilter === opt.key
                      ? "border-purple-500/40 text-white"
                      : "border-transparent bg-background-secondary text-foreground-secondary hover:text-foreground hover:bg-background-secondary/80"
                  )}
                  style={
                    categoryFilter === opt.key
                      ? { backgroundColor: opt.color + "33" }
                      : undefined
                  }
                >
                  {opt.key !== "all" && (
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>

            <span className="text-foreground-muted text-xs">|</span>

            {/* Era filter */}
            <select
              value={eraFilter}
              onChange={(e) => setEraFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-background-secondary text-foreground-secondary border border-border hover:border-purple-500/30 focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              {ERA_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>

            <span className="text-xs text-foreground-muted">
              ({filteredCount}명)
            </span>
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <WorldMap
            persons={allPersons}
            religions={religionsData}
            categoryFilter={categoryFilter}
            eraFilter={eraFilter}
            onViewportPersons={setViewportPersons}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-xl border border-border p-3">
            <p className="text-[10px] text-foreground-muted mb-2 font-medium uppercase tracking-wider">
              범례
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {CATEGORY_OPTIONS.filter((o) => o.key !== "all").map((opt) => (
                <div key={opt.key} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span className="text-[10px] text-foreground-secondary">
                    {opt.label}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-dashed"
                  style={{ borderColor: "#F59E0B" }}
                />
                <span className="text-[10px] text-foreground-secondary">
                  종교
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-dashed"
                  style={{ borderColor: "#10B981" }}
                />
                <span className="text-[10px] text-foreground-secondary">
                  신화
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 right-4 z-[1000] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm border border-border text-foreground-secondary hover:text-foreground transition-colors md:hidden"
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">{viewportPersons.length}</span>
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={cn(
            "flex-shrink-0 border-l border-border bg-background overflow-hidden transition-all duration-300",
            sidebarOpen ? "w-80" : "w-0",
            "hidden md:block"
          )}
        >
          <div className="w-80 h-full flex flex-col">
            {/* Sidebar header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-foreground">
                    현재 화면의 인물
                  </span>
                </div>
                <span className="text-xs text-foreground-muted bg-background-secondary px-2 py-0.5 rounded-full">
                  {viewportPersons.length}명
                </span>
              </div>
            </div>

            {/* Sidebar list */}
            <div className="flex-1 overflow-y-auto">
              {sortedViewportPersons.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground-muted px-4">
                  <Globe className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm text-center">
                    지도를 이동하거나 줌하여 인물을 탐색하세요
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {sortedViewportPersons.map((p) => (
                    <Link
                      key={p.id}
                      href={getPersonLink(p)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-background-secondary/50 transition-colors group"
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{
                          backgroundColor: getCategoryHexColor(p.category),
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-purple-300 transition-colors truncate">
                            {p.name.ko}
                          </h3>
                          {p.mvp && (
                            <span className="text-[10px] text-amber-400">
                              MVP
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-foreground-muted truncate">
                          {p.name.en} | {formatYear(p.period.start)}~
                          {formatYear(p.period.end)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border",
                              getCategoryBadgeClass(p.category)
                            )}
                          >
                            {getCategoryLabel(p.category)}
                          </span>
                          <span className="text-[10px] text-foreground-muted">
                            {getEraLabel(p.era)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0 mt-1 group-hover:text-purple-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
