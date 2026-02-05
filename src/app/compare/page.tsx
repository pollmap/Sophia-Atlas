"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Network,
  Search,
  X,
  Sparkles,
  Route,
  Tag,
  Calendar,
  Users,
  BookOpen,
  Scroll,
  Atom,
  Crown,
  Palette,
} from "lucide-react";

import { KnowledgeGraphEngine, type KnowledgeNode, type ComparisonResult } from "@/lib/knowledge-graph";
import { cn, getCategoryLabel, getCategoryHexColor, formatYear } from "@/lib/utils";

import philosophersData from "@/data/persons/philosophers.json";
import religiousFiguresData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalFiguresData from "@/data/persons/historical-figures.json";
import eventsData from "@/data/entities/events.json";
import ideologiesData from "@/data/entities/ideologies.json";
import movementsData from "@/data/entities/movements.json";
import institutionsData from "@/data/entities/institutions.json";
import textsData from "@/data/entities/texts.json";
import conceptsData from "@/data/entities/concepts.json";
import archetypesData from "@/data/entities/archetypes.json";
import artMovementsData from "@/data/entities/art-movements.json";
import technologiesData from "@/data/entities/technologies.json";
import ppRelData from "@/data/relationships/person-person.json";
import peRelData from "@/data/relationships/person-entity.json";
import eeRelData from "@/data/relationships/entity-entity.json";

// ── Data ──

const allPersons = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
] as any[];

const allEntities = [
  ...eventsData,
  ...ideologiesData,
  ...movementsData,
  ...institutionsData,
  ...textsData,
  ...conceptsData,
  ...archetypesData,
  ...artMovementsData,
  ...technologiesData,
] as any[];

const nodeDataMap = new Map<string, any>();
allPersons.forEach((p) => nodeDataMap.set(p.id, { ...p, nodeType: "person" }));
allEntities.forEach((e) => nodeDataMap.set(e.id, { ...e, nodeType: "entity" }));

const allRelationships = [
  ...ppRelData,
  ...peRelData,
  ...eeRelData,
].filter((r: any) => nodeDataMap.has(r.source) && nodeDataMap.has(r.target)) as any[];

// ── Constants ──

const CATEGORY_COLORS: Record<string, string> = {
  philosopher: "#4A5D8A",
  religious_figure: "#B8860B",
  scientist: "#5B7355",
  historical_figure: "#8B4040",
  cultural_figure: "#7A5478",
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  event: "#F97316",
  ideology: "#A855F7",
  movement: "#3B82F6",
  institution: "#06B6D4",
  text: "#84CC16",
  concept: "#E879F9",
  nation: "#F43F5E",
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  event: "사건",
  ideology: "사상",
  movement: "운동/학파",
  institution: "기관",
  text: "경전/문헌",
  concept: "개념",
  nation: "국가",
};

const ERA_LABELS: Record<string, string> = {
  ancient: "고대",
  medieval: "중세",
  modern: "근대",
  contemporary: "현대",
};

const ERA_COLORS: Record<string, string> = {
  ancient: "#D4AF37",
  medieval: "#7C3AED",
  modern: "#14B8A6",
  contemporary: "#64748B",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  influenced: "영향",
  teacher_student: "사제",
  opposed: "대립",
  criticized: "비판",
  developed: "발전",
  parallel: "유사",
  contextual: "맥락",
  contemporary: "동시대",
  collaborated: "협력",
  founded: "창설",
  advocated: "주창",
  authored: "저술",
  member_of: "소속",
  participated: "참여",
  caused: "원인",
  affected_by: "영향받음",
  belongs_to: "소속",
  preceded: "선행",
  part_of: "일부",
  opposed_to: "대립",
  evolved_into: "발전",
};

const CATEGORY_ICONS: Record<string, any> = {
  philosopher: BookOpen,
  religious_figure: Scroll,
  scientist: Atom,
  historical_figure: Crown,
  cultural_figure: Palette,
};

// ── Component ──

export default function ComparePage() {
  const [nodeA, setNodeA] = useState<string | null>(null);
  const [nodeB, setNodeB] = useState<string | null>(null);
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  // Read URL params on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const a = params.get("a");
    const b = params.get("b");
    if (a && nodeDataMap.has(a)) setNodeA(a);
    if (b && nodeDataMap.has(b)) setNodeB(b);
  }, []);

  // Sync state → URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (nodeA) params.set("a", nodeA);
    if (nodeB) params.set("b", nodeB);
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [nodeA, nodeB]);

  // Build engine
  const engine = useMemo(() => {
    const connectionCounts: Record<string, number> = {};
    allRelationships.forEach((r: any) => {
      connectionCounts[r.source] = (connectionCounts[r.source] || 0) + 1;
      connectionCounts[r.target] = (connectionCounts[r.target] || 0) + 1;
    });

    const knowledgeNodes: KnowledgeNode[] = [];
    allPersons.forEach((p: any) => {
      knowledgeNodes.push({
        id: p.id, name: p.name, nodeType: "person",
        category: p.category, era: p.era || "contemporary",
        period: p.period, tags: p.tags,
        connections: connectionCounts[p.id] || 0,
      });
    });
    allEntities.forEach((e: any) => {
      knowledgeNodes.push({
        id: e.id, name: e.name, nodeType: "entity",
        category: e.type, entityType: e.type,
        era: e.era || "contemporary", period: e.period,
        tags: e.tags, connections: connectionCounts[e.id] || 0,
      });
    });
    return new KnowledgeGraphEngine(knowledgeNodes, allRelationships as any);
  }, []);

  // Compute comparison
  useEffect(() => {
    if (nodeA && nodeB && nodeA !== nodeB) {
      const result = engine.compare(nodeA, nodeB);
      setComparison(result);
    } else {
      setComparison(null);
    }
  }, [nodeA, nodeB, engine]);

  // Search helpers
  const allItems = useMemo(() => [
    ...allPersons.map((p: any) => ({ ...p, nodeType: "person" })),
    ...allEntities.map((e: any) => ({ ...e, nodeType: "entity" })),
  ], []);

  const searchResultsA = useMemo(() => {
    if (!searchA.trim()) return [];
    const q = searchA.toLowerCase();
    return allItems.filter((item: any) =>
      item.name.ko.toLowerCase().includes(q) || item.name.en.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchA, allItems]);

  const searchResultsB = useMemo(() => {
    if (!searchB.trim()) return [];
    const q = searchB.toLowerCase();
    return allItems.filter((item: any) =>
      item.name.ko.toLowerCase().includes(q) || item.name.en.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchB, allItems]);

  const dataA = nodeA ? nodeDataMap.get(nodeA) : null;
  const dataB = nodeB ? nodeDataMap.get(nodeB) : null;

  function getNodeColor(data: any): string {
    if (data.nodeType === "entity") return ENTITY_TYPE_COLORS[data.type] || "#9C8B73";
    return CATEGORY_COLORS[data.category] || "#7A6B55";
  }

  function getNodeTypeLabel(data: any): string {
    if (data.nodeType === "entity") return ENTITY_TYPE_LABELS[data.type] || "주제";
    return getCategoryLabel(data.category);
  }

  function NodeSelector({ value, searchValue, searchResults, onSelect, onSearchChange, onClear, label }: {
    value: string | null;
    searchValue: string;
    searchResults: any[];
    onSelect: (id: string) => void;
    onSearchChange: (v: string) => void;
    onClear: () => void;
    label: string;
  }) {
    const data = value ? nodeDataMap.get(value) : null;

    return (
      <div className="flex-1">
        <label className="text-xs font-medium text-[var(--ink-light)] mb-2 block" style={{ fontFamily: "'Pretendard', sans-serif" }}>
          {label}
        </label>
        {data ? (
          <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 flex items-center justify-center text-sm font-bold",
                    data.nodeType === "entity" ? "rotate-45 rounded-md" : "rounded-full"
                  )}
                  style={{
                    backgroundColor: getNodeColor(data) + "25",
                    color: getNodeColor(data),
                  }}
                >
                  <span className={data.nodeType === "entity" ? "-rotate-45" : ""}>{data.name.ko[0]}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink-dark)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {data.name.ko}
                  </h3>
                  <p className="text-xs text-[var(--ink-light)]">{data.name.en}</p>
                </div>
              </div>
              <button onClick={onClear} className="p-1 rounded hover:bg-[var(--fresco-aged)] transition-colors">
                <X className="w-4 h-4 text-[var(--ink-faded)]" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: getNodeColor(data) + "20", color: getNodeColor(data) }}>
                {getNodeTypeLabel(data)}
              </span>
              {data.era && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: (ERA_COLORS[data.era] || "#64748B") + "20", color: ERA_COLORS[data.era] || "#64748B" }}>
                  {ERA_LABELS[data.era] || data.era}
                </span>
              )}
              {data.period && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--fresco-aged)]/50 text-[var(--ink-light)]">
                  {formatYear(data.period.start)} ~ {formatYear(data.period.end)}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--ink-medium)] mt-2 line-clamp-5" style={{ fontFamily: "'Pretendard', sans-serif" }}>
              {data.summary}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-[var(--fresco-parchment)] rounded border border-dashed border-[var(--fresco-shadow)] p-4">
              <Search className="absolute right-6 top-6 w-4 h-4 text-[var(--ink-faded)]" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="인물 또는 주제 검색..."
                className="w-full bg-transparent text-sm text-[var(--ink-dark)] placeholder-[var(--ink-faded)] focus:outline-none"
                style={{ fontFamily: "'Pretendard', sans-serif" }}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-[var(--fresco-parchment)] border border-[var(--fresco-shadow)] rounded overflow-hidden z-50 max-h-56 overflow-y-auto">
                {searchResults.map((item: any) => {
                  const color = item.nodeType === "entity" ? ENTITY_TYPE_COLORS[item.type] || "#9C8B73" : getCategoryHexColor(item.category);
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item.id); onSearchChange(""); }}
                      className="w-full px-4 py-2.5 text-left hover:bg-[var(--fresco-aged)]/50 flex items-center gap-3 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-6 h-6 flex items-center justify-center text-[9px] font-bold",
                          item.nodeType === "entity" ? "rotate-45 rounded-sm" : "rounded-full"
                        )}
                        style={{ backgroundColor: color + "30", color }}
                      >
                        <span className={item.nodeType === "entity" ? "-rotate-45" : ""}>{item.name.ko[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-[var(--ink-dark)] block truncate">{item.name.ko}</span>
                        <span className="text-[10px] text-[var(--ink-faded)]">{item.name.en}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--fresco-ivory)]">
      {/* Header */}
      <div className="border-b border-[var(--fresco-shadow)] bg-[var(--fresco-ivory)]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-[#B8860B]/20 to-[#D4A84B]/20 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-[#B8860B]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--ink-dark)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                사상 비교 엔진
              </h1>
              <p className="text-sm text-[var(--ink-light)]" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                두 인물/주제의 관계와 유사성을 분석합니다
              </p>
            </div>
          </div>

          {/* Node Selectors */}
          <div className="flex gap-4 items-start">
            <NodeSelector
              value={nodeA}
              searchValue={searchA}
              searchResults={searchResultsA}
              onSelect={setNodeA}
              onSearchChange={setSearchA}
              onClear={() => { setNodeA(null); setComparison(null); }}
              label="비교 대상 A"
            />

            {/* Swap Button */}
            <div className="pt-8 flex-shrink-0">
              <button
                onClick={() => { const tmp = nodeA; setNodeA(nodeB); setNodeB(tmp); }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--fresco-aged)] hover:bg-[var(--fresco-shadow)] border border-[var(--fresco-shadow)] transition-colors"
                title="교환"
              >
                <ArrowLeftRight className="w-4 h-4 text-[#B8860B]" />
              </button>
            </div>

            <NodeSelector
              value={nodeB}
              searchValue={searchB}
              searchResults={searchResultsB}
              onSelect={setNodeB}
              onSearchChange={setSearchB}
              onClear={() => { setNodeB(null); setComparison(null); }}
              label="비교 대상 B"
            />
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {comparison ? (
          <div className="space-y-6">
            {/* Similarity Score */}
            <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-6">
              <h2 className="text-base font-bold text-[var(--ink-dark)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                유사도 분석
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Jaccard Similarity */}
                <div className="text-center p-4 rounded bg-[var(--fresco-aged)]/50">
                  <div className="text-3xl font-bold text-[#B8860B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {(comparison.jaccardSimilarity * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--ink-light)] mt-1">Jaccard 유사도</div>
                  <div className="w-full h-1.5 bg-[var(--fresco-shadow)] rounded-full mt-2">
                    <div className="h-full bg-[#B8860B] rounded-full" style={{ width: `${comparison.jaccardSimilarity * 100}%` }} />
                  </div>
                </div>

                {/* Shared Connections */}
                <div className="text-center p-4 rounded bg-[var(--fresco-aged)]/50">
                  <div className="text-3xl font-bold text-[#4A5D8A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {comparison.sharedConnections.length}
                  </div>
                  <div className="text-xs text-[var(--ink-light)] mt-1">공유 연결</div>
                </div>

                {/* Shortest Path */}
                <div className="text-center p-4 rounded bg-[var(--fresco-aged)]/50">
                  <div className="text-3xl font-bold text-[#D4AF37]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {comparison.shortestPath ? comparison.shortestPath.length : "∞"}
                  </div>
                  <div className="text-xs text-[var(--ink-light)] mt-1">최단 경로</div>
                </div>

                {/* Community */}
                <div className="text-center p-4 rounded bg-[var(--fresco-aged)]/50">
                  <div className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: comparison.commonCommunity ? "#5B7355" : "#8B4040" }}>
                    {comparison.commonCommunity ? "동일" : "상이"}
                  </div>
                  <div className="text-xs text-[var(--ink-light)] mt-1">커뮤니티</div>
                </div>
              </div>
            </div>

            {/* Direct Relationships */}
            {comparison.relationshipsBetween.length > 0 && (
              <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-6">
                <h2 className="text-base font-bold text-[var(--ink-dark)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <Network className="w-5 h-5 text-[#4A5D8A]" />
                  직접 관계
                </h2>
                <div className="space-y-3">
                  {comparison.relationshipsBetween.map((rel: any, i: number) => (
                    <div key={i} className="p-3 rounded bg-[var(--fresco-aged)]/50 border-l-2" style={{ borderLeftColor: "#B8860B" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#B8860B]/20 text-[#B8860B] font-medium">
                          {RELATIONSHIP_LABELS[rel.type] || rel.type}
                        </span>
                        <span className="text-xs text-[var(--ink-faded)]">
                          {dataA?.name.ko} → {dataB?.name.ko}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--ink-medium)]" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                        {rel.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shortest Path */}
            {comparison.shortestPath && (
              <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-6">
                <h2 className="text-base font-bold text-[var(--ink-dark)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <Route className="w-5 h-5 text-[#D4AF37]" />
                  최단 경로 ({comparison.shortestPath.length}단계)
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {comparison.shortestPath.path.map((nodeId: string, idx: number) => {
                    const node = nodeDataMap.get(nodeId);
                    if (!node) return null;
                    const color = node.nodeType === "entity" ? ENTITY_TYPE_COLORS[node.type] || "#9C8B73" : getCategoryHexColor(node.category);
                    const rel = idx < comparison.shortestPath!.relationships.length ? comparison.shortestPath!.relationships[idx] : null;

                    return (
                      <div key={nodeId} className="flex items-center gap-2">
                        <Link
                          href={node.nodeType === "entity" ? `/entities/${nodeId}` : `/persons/${nodeId}`}
                          className="flex items-center gap-2 px-3 py-2 rounded bg-[var(--fresco-aged)]/50 hover:bg-[var(--fresco-aged)] transition-colors border border-[var(--fresco-shadow)]"
                        >
                          <div
                            className={cn("w-5 h-5 flex items-center justify-center text-[8px] font-bold", node.nodeType === "entity" ? "rotate-45 rounded-sm" : "rounded-full")}
                            style={{ backgroundColor: color + "30", color }}
                          >
                            <span className={node.nodeType === "entity" ? "-rotate-45" : ""}>{node.name.ko[0]}</span>
                          </div>
                          <span className="text-sm text-[var(--ink-dark)]">{node.name.ko}</span>
                        </Link>
                        {rel && (
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#B8860B]/15 text-[#B8860B]">
                              {RELATIONSHIP_LABELS[rel.type] || rel.type}
                            </span>
                            <span className="text-[var(--ink-faded)]">→</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Link
                  href={`/connections?from=${nodeA}&to=${nodeB}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#B8860B] hover:text-[#D4A84B] transition-colors"
                >
                  <Network className="w-3 h-3" />
                  인드라망에서 경로 보기
                </Link>
              </div>
            )}

            {/* Shared Connections */}
            {comparison.sharedConnections.length > 0 && (
              <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-6">
                <h2 className="text-base font-bold text-[var(--ink-dark)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <Users className="w-5 h-5 text-[#4A5D8A]" />
                  공유 연결 ({comparison.sharedConnections.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {comparison.sharedConnections.map((connId: string) => {
                    const conn = nodeDataMap.get(connId);
                    if (!conn) return null;
                    const color = conn.nodeType === "entity" ? ENTITY_TYPE_COLORS[conn.type] || "#9C8B73" : getCategoryHexColor(conn.category);
                    return (
                      <Link
                        key={connId}
                        href={conn.nodeType === "entity" ? `/entities/${connId}` : `/persons/${connId}`}
                        className="flex items-center gap-2 p-2.5 rounded bg-[var(--fresco-aged)]/50 hover:bg-[var(--fresco-aged)] transition-colors"
                      >
                        <div
                          className={cn("w-5 h-5 flex items-center justify-center text-[8px] font-bold flex-shrink-0", conn.nodeType === "entity" ? "rotate-45 rounded-sm" : "rounded-full")}
                          style={{ backgroundColor: color + "30", color }}
                        >
                          <span className={conn.nodeType === "entity" ? "-rotate-45" : ""}>{conn.name.ko[0]}</span>
                        </div>
                        <span className="text-sm text-[var(--ink-medium)] truncate">{conn.name.ko}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shared Tags + Era */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shared Tags */}
              <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-6">
                <h2 className="text-base font-bold text-[var(--ink-dark)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <Tag className="w-5 h-5 text-[#5B7355]" />
                  공유 태그
                </h2>
                {comparison.sharedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {comparison.sharedTags.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 rounded text-xs font-medium bg-[#5B7355]/15 text-[#5B7355]">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--ink-faded)]" style={{ fontFamily: "'Pretendard', sans-serif" }}>공유 태그 없음</p>
                )}
              </div>

              {/* Era Comparison */}
              <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-6">
                <h2 className="text-base font-bold text-[var(--ink-dark)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <Calendar className="w-5 h-5 text-[#7C3AED]" />
                  시대 비교
                </h2>
                <div className="flex items-center gap-4">
                  {dataA && (
                    <div className="flex-1 text-center">
                      <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: (ERA_COLORS[dataA.era] || "#64748B") + "20", color: ERA_COLORS[dataA.era] || "#64748B" }}>
                        {ERA_LABELS[dataA.era] || dataA.era}
                      </span>
                      {dataA.period && (
                        <p className="text-[10px] text-[var(--ink-faded)] mt-1">
                          {formatYear(dataA.period.start)} ~ {formatYear(dataA.period.end)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className={cn("text-sm font-bold px-3 py-1 rounded", comparison.eraOverlap ? "text-[#5B7355] bg-[#5B7355]/10" : "text-[#8B4040] bg-[#8B4040]/10")}>
                    {comparison.eraOverlap ? "동시대" : "이시대"}
                  </div>
                  {dataB && (
                    <div className="flex-1 text-center">
                      <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: (ERA_COLORS[dataB.era] || "#64748B") + "20", color: ERA_COLORS[dataB.era] || "#64748B" }}>
                        {ERA_LABELS[dataB.era] || dataB.era}
                      </span>
                      {dataB.period && (
                        <p className="text-[10px] text-[var(--ink-faded)] mt-1">
                          {formatYear(dataB.period.start)} ~ {formatYear(dataB.period.end)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Side-by-side detail comparison */}
            <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-6">
              <h2 className="text-base font-bold text-[var(--ink-dark)] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                상세 비교
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {[dataA, dataB].map((data, idx) => {
                  if (!data) return null;
                  return (
                    <div key={idx} className="space-y-3">
                      <h3 className="text-sm font-bold text-[var(--ink-dark)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {data.name.ko}
                      </h3>
                      <p className="text-xs text-[var(--ink-medium)] leading-relaxed" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                        {data.summary}
                      </p>
                      {data.tags && (
                        <div className="flex flex-wrap gap-1">
                          {data.tags.slice(0, 6).map((tag: string) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--fresco-aged)] text-[var(--ink-light)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={data.nodeType === "entity" ? `/entities/${data.id}` : `/persons/${data.id}`}
                        className="text-xs text-[#B8860B] hover:text-[#D4A84B] transition-colors"
                      >
                        상세 페이지 →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <ArrowLeftRight className="w-16 h-16 text-[var(--fresco-shadow)] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[var(--ink-dark)] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              비교할 두 대상을 선택하세요
            </h2>
            <p className="text-sm text-[var(--ink-light)] max-w-md mx-auto" style={{ fontFamily: "'Pretendard', sans-serif" }}>
              인물, 사건, 사상, 경전 등 어떤 조합이든 비교할 수 있습니다.
              두 대상 사이의 공유 연결, 유사도, 최단 경로, 커뮤니티 등을 분석합니다.
            </p>
            {/* Suggested comparisons */}
            <div className="mt-8 max-w-lg mx-auto">
              <h3 className="text-xs font-medium text-[var(--ink-faded)] mb-3 uppercase tracking-wider">추천 비교</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { a: "plato", b: "aristotle", label: "플라톤 vs 아리스토텔레스" },
                  { a: "kant", b: "hegel", label: "칸트 vs 헤겔" },
                  { a: "confucius", b: "laozi", label: "공자 vs 노자" },
                  { a: "buddha", b: "jesus", label: "석가모니 vs 예수" },
                  { a: "einstein", b: "newton", label: "아인슈타인 vs 뉴턴" },
                  { a: "marx", b: "adam-smith", label: "마르크스 vs 애덤 스미스" },
                ].filter(({ a, b }) => nodeDataMap.has(a) && nodeDataMap.has(b))
                  .map(({ a, b, label }) => (
                    <button
                      key={`${a}-${b}`}
                      onClick={() => { setNodeA(a); setNodeB(b); }}
                      className="px-4 py-2.5 rounded bg-[var(--fresco-parchment)] border border-[var(--fresco-shadow)] text-sm text-[var(--ink-medium)] hover:bg-[var(--fresco-aged)] transition-colors text-left"
                      style={{ fontFamily: "'Pretendard', sans-serif" }}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
