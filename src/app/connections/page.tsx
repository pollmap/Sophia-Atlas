"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Network,
  ZoomIn,
  ZoomOut,
  Info,
  ArrowRight,
  Sparkles,
  GitBranch,
  Swords,
  Shuffle,
  Globe,
  Layers,
  BookOpen,
  Scroll,
  Atom,
  Crown,
  Palette,
  Search,
  X,
} from "lucide-react";
import philosophersData from "@/data/persons/philosophers.json";
import religiousFiguresData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalFiguresData from "@/data/persons/historical-figures.json";
import ppRelData from "@/data/relationships/person-person.json";
import peRelData from "@/data/relationships/person-entity.json";
import { cn, getCategoryHexColor, getCategoryLabel } from "@/lib/utils";

const allPersons = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
] as any[];

const allRelationships = [...ppRelData, ...peRelData] as any[];

const CATEGORY_FILTERS = [
  { key: "all", label: "전체", color: "#ffffff", icon: Network },
  { key: "philosopher", label: "철학자", color: "#6366F1", icon: BookOpen },
  { key: "religious_figure", label: "종교", color: "#F59E0B", icon: Scroll },
  { key: "scientist", label: "과학자", color: "#10B981", icon: Atom },
  { key: "historical_figure", label: "역사", color: "#EF4444", icon: Crown },
  { key: "cultural_figure", label: "문화", color: "#EC4899", icon: Palette },
];

const RELATIONSHIP_TYPES = [
  { key: "all", label: "전체", color: "text-white", bg: "bg-white/20" },
  { key: "influenced", label: "영향", color: "text-blue-400", bg: "bg-blue-500/20", icon: ArrowRight },
  { key: "opposed", label: "대립", color: "text-red-400", bg: "bg-red-500/20", icon: Swords },
  { key: "developed", label: "발전", color: "text-green-400", bg: "bg-green-500/20", icon: GitBranch },
  { key: "parallel", label: "유사", color: "text-purple-400", bg: "bg-purple-500/20", icon: Shuffle },
  { key: "contextual", label: "맥락", color: "text-yellow-400", bg: "bg-yellow-500/20", icon: Globe },
  { key: "teacher_student", label: "사제", color: "text-cyan-400", bg: "bg-cyan-500/20", icon: BookOpen },
  { key: "collaborated", label: "협력", color: "text-orange-400", bg: "bg-orange-500/20", icon: Layers },
  { key: "contemporary", label: "동시대", color: "text-gray-400", bg: "bg-gray-500/20", icon: Globe },
  { key: "founded", label: "창설", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: Sparkles },
  { key: "authored", label: "저술", color: "text-indigo-400", bg: "bg-indigo-500/20", icon: BookOpen },
  { key: "advocated", label: "주창", color: "text-teal-400", bg: "bg-teal-500/20", icon: ArrowRight },
];

const ERA_COLORS: Record<string, string> = {
  ancient: "#D4AF37",
  medieval: "#7C3AED",
  modern: "#14B8A6",
  contemporary: "#64748B",
};

const ERA_LABELS: Record<string, string> = {
  ancient: "고대",
  medieval: "중세",
  modern: "근대",
  contemporary: "현대",
};

function getPerson(id: string) {
  return allPersons.find((p: any) => p.id === id);
}

function getRelStrokeColor(type: string): string {
  switch (type) {
    case "influenced": case "teacher_student": return "rgba(96,165,250,0.4)";
    case "opposed": case "criticized": return "rgba(248,113,113,0.4)";
    case "developed": return "rgba(74,222,128,0.4)";
    case "parallel": return "rgba(192,132,252,0.4)";
    case "contextual": case "contemporary": return "rgba(250,204,21,0.3)";
    case "collaborated": return "rgba(251,146,60,0.4)";
    case "founded": case "advocated": return "rgba(52,211,153,0.4)";
    case "authored": return "rgba(129,140,248,0.4)";
    default: return "rgba(148,163,184,0.3)";
  }
}

export default function ConnectionsPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Connection count for each person (cached)
  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allRelationships.forEach((r: any) => {
      counts[r.source] = (counts[r.source] || 0) + 1;
      counts[r.target] = (counts[r.target] || 0) + 1;
    });
    return counts;
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allPersons
      .filter((p: any) =>
        p.name.ko.toLowerCase().includes(q) ||
        p.name.en.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [searchQuery]);

  // Get ego network (1st + 2nd degree connections)
  const egoNetwork = useMemo(() => {
    if (!selectedNode) return null;

    const first = new Set<string>();
    const firstRels: any[] = [];

    allRelationships.forEach((r: any) => {
      const matchType = selectedType === "all" || r.type === selectedType;
      if (!matchType) return;
      if (r.source === selectedNode) { first.add(r.target); firstRels.push(r); }
      if (r.target === selectedNode) { first.add(r.source); firstRels.push(r); }
    });

    const second = new Set<string>();
    const secondRels: any[] = [];

    allRelationships.forEach((r: any) => {
      const matchType = selectedType === "all" || r.type === selectedType;
      if (!matchType) return;
      if (first.has(r.source) && r.target !== selectedNode && !first.has(r.target)) {
        second.add(r.target);
        secondRels.push(r);
      }
      if (first.has(r.target) && r.source !== selectedNode && !first.has(r.source)) {
        second.add(r.source);
        secondRels.push(r);
      }
    });

    return {
      center: selectedNode,
      first: Array.from(first).filter((id) => getPerson(id)),
      second: Array.from(second).filter((id) => getPerson(id)).slice(0, 30),
      firstRels,
      secondRels: secondRels.slice(0, 60),
    };
  }, [selectedNode, selectedType]);

  // Top persons for default view
  const topPersons = useMemo(() => {
    let filtered = allPersons;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p: any) => p.category === selectedCategory);
    }
    if (selectedEra !== "all") {
      filtered = filtered.filter((p: any) => p.era === selectedEra);
    }
    return filtered
      .map((p: any) => ({ ...p, connections: connectionCounts[p.id] || 0 }))
      .sort((a: any, b: any) => b.connections - a.connections)
      .slice(0, 50);
  }, [selectedCategory, selectedEra, connectionCounts]);

  // Default view relationships
  const topRelationships = useMemo(() => {
    const topIds = new Set(topPersons.map((p: any) => p.id));
    return allRelationships.filter((r: any) => {
      const matchType = selectedType === "all" || r.type === selectedType;
      return matchType && topIds.has(r.source) && topIds.has(r.target);
    });
  }, [topPersons, selectedType]);

  const nodeRelationships = useMemo(() => {
    if (!selectedNode) return [];
    return allRelationships
      .filter((r: any) => r.source === selectedNode || r.target === selectedNode)
      .map((r: any) => ({
        ...r,
        other: r.source === selectedNode ? r.target : r.source,
        direction: r.source === selectedNode ? "outgoing" : "incoming",
      }));
  }, [selectedNode]);

  // Position calculation for ego-centric layout
  const getEgoPosition = useCallback((nodeId: string, ego: NonNullable<typeof egoNetwork>) => {
    const cx = 400, cy = 400;
    if (nodeId === ego.center) return { x: cx, y: cy };

    const firstIdx = ego.first.indexOf(nodeId);
    if (firstIdx !== -1) {
      const angle = (firstIdx / ego.first.length) * Math.PI * 2 - Math.PI / 2;
      const r = 150 * zoom;
      return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    }

    const secondIdx = ego.second.indexOf(nodeId);
    if (secondIdx !== -1) {
      const angle = (secondIdx / ego.second.length) * Math.PI * 2 - Math.PI / 2;
      const r = 280 * zoom;
      return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    }

    return { x: cx, y: cy };
  }, [zoom]);

  // Position calculation for default radial layout by category
  const getDefaultPosition = useCallback((person: any, index: number, total: number) => {
    const catOrder = ["philosopher", "religious_figure", "scientist", "historical_figure", "cultural_figure"];
    const catIndex = catOrder.indexOf(person.category);
    const catPersons = topPersons.filter((p: any) => p.category === person.category);
    const indexInCat = catPersons.indexOf(person);
    const totalInCat = catPersons.length;

    const baseAngle = (catIndex / 5) * Math.PI * 2 - Math.PI / 2;
    const spreadAngle = Math.PI * 2 / 5 * 0.8;
    const angle = baseAngle + (totalInCat > 1
      ? (indexInCat / (totalInCat - 1)) * spreadAngle - spreadAngle / 2
      : 0);

    const connections = connectionCounts[person.id] || 0;
    const radius = (160 + (connections > 8 ? 30 : connections > 4 ? 70 : 120)) * zoom;

    return {
      x: 400 + Math.cos(angle) * radius,
      y: 400 + Math.sin(angle) * radius,
    };
  }, [topPersons, connectionCounts, zoom]);

  const getRelBorderColor = (type: string) => {
    switch (type) {
      case "influenced": case "teacher_student": return "border-blue-500/50";
      case "opposed": case "criticized": return "border-red-500/50";
      case "developed": return "border-green-500/50";
      case "parallel": return "border-purple-500/50";
      case "contextual": case "contemporary": return "border-yellow-500/50";
      case "collaborated": return "border-orange-500/50";
      default: return "border-white/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  인드라망 — 인류 사상의 연결 지도
                </h1>
                <p className="text-sm text-gray-400">
                  {allPersons.length}명의 인물, {allRelationships.length}개의 관계
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="인물 검색..."
                  className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 w-48 focus:w-64 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-[#1E293B] border border-white/10 rounded-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
                    {searchResults.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedNode(p.id); setSearchQuery(""); }}
                        className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                          style={{ backgroundColor: getCategoryHexColor(p.category) + "30", color: getCategoryHexColor(p.category) }}
                        >
                          {p.name.ko[0]}
                        </div>
                        <span className="text-sm text-white">{p.name.ko}</span>
                        <span className="text-xs text-gray-500 ml-auto">{getCategoryLabel(p.category)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Info className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {showInfo && (
            <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                인드라망(Indra&apos;s Net)이란?
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                불교 화엄경의 개념으로, 모든 존재가 서로를 비추는 무한한 그물입니다.
                인류의 모든 사상은 서로 연결되어 있으며, 하나를 이해하면 전체의 빛이 보입니다.
              </p>
              <p className="text-xs text-gray-400">
                노드를 클릭하면 해당 인물 중심의 관계망을 봅니다. 노드 크기는 연결 수에 비례합니다.
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 mr-1">카테고리:</span>
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c.key}
                onClick={() => { setSelectedCategory(c.key); setSelectedNode(null); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedCategory === c.key
                    ? "ring-1 ring-current"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
                style={selectedCategory === c.key ? { color: c.color, backgroundColor: c.color + "20" } : {}}
              >
                {c.label}
              </button>
            ))}
            <span className="text-gray-600 mx-1">|</span>
            <span className="text-xs text-gray-500 mr-1">시대:</span>
            <button
              onClick={() => setSelectedEra("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedEra === "all" ? "bg-white/20 text-white ring-1 ring-white/30" : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              전체
            </button>
            {Object.entries(ERA_LABELS).map(([era, label]) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedEra === era ? "ring-1 ring-current" : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
                style={selectedEra === era ? { color: ERA_COLORS[era], backgroundColor: ERA_COLORS[era] + "20" } : {}}
              >
                {label}
              </button>
            ))}
            <span className="text-gray-600 mx-1">|</span>
            <span className="text-xs text-gray-500 mr-1">관계:</span>
            {RELATIONSHIP_TYPES.slice(0, 6).map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedType === t.key ? cn(t.bg, t.color, "ring-1 ring-current") : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                {t.label}
              </button>
            ))}
            {selectedNode && (
              <button
                onClick={() => setSelectedNode(null)}
                className="px-3 py-1.5 rounded-full text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> 선택 해제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Area */}
          <div className="lg:col-span-2">
            <div className="relative bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden">
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2))} className="p-2 rounded-lg bg-[#0F172A] border border-white/10 hover:bg-white/10">
                  <ZoomIn className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))} className="p-2 rounded-lg bg-[#0F172A] border border-white/10 hover:bg-white/10">
                  <ZoomOut className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Category Legend */}
              <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                {CATEGORY_FILTERS.slice(1).map((c) => (
                  <div key={c.key} className="flex items-center gap-1 text-[9px] text-gray-400">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </div>
                ))}
              </div>

              {/* SVG Graph */}
              <svg viewBox="0 0 800 800" className="w-full" style={{ minHeight: "550px" }}>
                {/* Background circles */}
                <circle cx="400" cy="400" r={300 * zoom} fill="none" stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
                <circle cx="400" cy="400" r={200 * zoom} fill="none" stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
                <circle cx="400" cy="400" r={100 * zoom} fill="none" stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />

                {selectedNode && egoNetwork ? (
                  <>
                    {/* Ego-centric: Ring labels */}
                    <text x="400" y={400 - 150 * zoom - 8} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="10">1차 연결</text>
                    <text x="400" y={400 - 280 * zoom - 8} textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="10">2차 연결</text>

                    {/* Ego-centric: Second degree edges */}
                    {egoNetwork.secondRels.map((rel: any, i: number) => {
                      const sPos = getEgoPosition(rel.source, egoNetwork);
                      const tPos = getEgoPosition(rel.target, egoNetwork);
                      return (
                        <line key={`s2-${i}`} x1={sPos.x} y1={sPos.y} x2={tPos.x} y2={tPos.y}
                          stroke={getRelStrokeColor(rel.type)} strokeWidth={0.5} opacity={0.2}
                          strokeDasharray={rel.type === "parallel" ? "4 4" : undefined}
                        />
                      );
                    })}

                    {/* Ego-centric: First degree edges */}
                    {egoNetwork.firstRels.map((rel: any, i: number) => {
                      const sPos = getEgoPosition(rel.source, egoNetwork);
                      const tPos = getEgoPosition(rel.target, egoNetwork);
                      return (
                        <g key={`s1-${i}`}>
                          <line x1={sPos.x} y1={sPos.y} x2={tPos.x} y2={tPos.y}
                            stroke={getRelStrokeColor(rel.type)}
                            strokeWidth={(rel.strength || 1) * 1.5} opacity={0.6}
                            strokeDasharray={rel.type === "parallel" || rel.type === "contextual" ? "6 3" : undefined}
                          />
                          {/* Edge label */}
                          <text
                            x={(sPos.x + tPos.x) / 2}
                            y={(sPos.y + tPos.y) / 2 - 4}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.3)"
                            fontSize="7"
                          >
                            {RELATIONSHIP_TYPES.find((t) => t.key === rel.type)?.label || rel.type}
                          </text>
                        </g>
                      );
                    })}

                    {/* Ego-centric: Second degree nodes */}
                    {egoNetwork.second.map((id) => {
                      const p = getPerson(id);
                      if (!p) return null;
                      const pos = getEgoPosition(id, egoNetwork);
                      const nodeR = 6;
                      return (
                        <g key={id} onClick={() => setSelectedNode(id)} className="cursor-pointer" opacity={0.5}>
                          <circle cx={pos.x} cy={pos.y} r={nodeR} fill={getCategoryHexColor(p.category)} opacity={0.5} />
                          <text x={pos.x} y={pos.y + nodeR + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">
                            {p.name.ko}
                          </text>
                        </g>
                      );
                    })}

                    {/* Ego-centric: First degree nodes */}
                    {egoNetwork.first.map((id) => {
                      const p = getPerson(id);
                      if (!p) return null;
                      const pos = getEgoPosition(id, egoNetwork);
                      const connections = connectionCounts[id] || 0;
                      const nodeR = Math.max(8, Math.min(16, 6 + connections * 0.8));
                      return (
                        <g key={id} onClick={() => setSelectedNode(id)} className="cursor-pointer">
                          <circle cx={pos.x} cy={pos.y} r={nodeR} fill={getCategoryHexColor(p.category)} opacity={0.85}
                            stroke="rgba(255,255,255,0.2)" strokeWidth={1}
                          />
                          <text x={pos.x} y={pos.y + nodeR + 12} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9" fontWeight="500">
                            {p.name.ko}
                          </text>
                        </g>
                      );
                    })}

                    {/* Ego-centric: Center node */}
                    {(() => {
                      const p = getPerson(egoNetwork.center);
                      if (!p) return null;
                      const pos = getEgoPosition(egoNetwork.center, egoNetwork);
                      return (
                        <g>
                          <circle cx={pos.x} cy={pos.y} r={28} fill="none" stroke={getCategoryHexColor(p.category)} strokeWidth="2" opacity="0.3">
                            <animate attributeName="r" values="26;32;26" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx={pos.x} cy={pos.y} r={22} fill={getCategoryHexColor(p.category)} stroke="white" strokeWidth={2} />
                          <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                            {p.name.ko.length > 4 ? p.name.ko.slice(0, 3) + '..' : p.name.ko}
                          </text>
                          <text x={pos.x} y={pos.y + 38} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                            {p.name.ko}
                          </text>
                        </g>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {/* Default view: Radial layout */}
                    {/* Category quadrant labels */}
                    {CATEGORY_FILTERS.slice(1).map((c, i) => {
                      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                      const lx = 400 + Math.cos(angle) * 340 * zoom;
                      const ly = 400 + Math.sin(angle) * 340 * zoom;
                      return (
                        <text key={c.key} x={lx} y={ly} textAnchor="middle" fill={c.color} fontSize="10" opacity={0.3} fontWeight="bold">
                          {c.label}
                        </text>
                      );
                    })}

                    {/* Edges */}
                    {topRelationships.map((rel: any, i: number) => {
                      const sP = topPersons.find((p: any) => p.id === rel.source);
                      const tP = topPersons.find((p: any) => p.id === rel.target);
                      if (!sP || !tP) return null;
                      const sPos = getDefaultPosition(sP, topPersons.indexOf(sP), topPersons.length);
                      const tPos = getDefaultPosition(tP, topPersons.indexOf(tP), topPersons.length);
                      return (
                        <line key={i} x1={sPos.x} y1={sPos.y} x2={tPos.x} y2={tPos.y}
                          stroke={getRelStrokeColor(rel.type)}
                          strokeWidth={rel.strength || 1} opacity={0.3}
                          strokeDasharray={rel.type === "parallel" || rel.type === "contextual" ? "4 4" : undefined}
                        />
                      );
                    })}

                    {/* Nodes */}
                    {topPersons.map((p: any, i: number) => {
                      const pos = getDefaultPosition(p, i, topPersons.length);
                      const nodeR = Math.max(7, Math.min(18, 5 + (p.connections || 0) * 1));
                      return (
                        <g key={p.id} onClick={() => setSelectedNode(p.id)} className="cursor-pointer">
                          <circle cx={pos.x} cy={pos.y} r={nodeR}
                            fill={getCategoryHexColor(p.category)} opacity={0.8}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={0.5}
                          />
                          <text x={pos.x} y={pos.y + nodeR + 10} textAnchor="middle"
                            fill="rgba(255,255,255,0.7)" fontSize="8"
                          >
                            {p.name.ko}
                          </text>
                        </g>
                      );
                    })}

                    {/* Click prompt */}
                    <text x="400" y="400" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="12">
                      노드를 클릭하여 관계망을 탐색하세요
                    </text>
                  </>
                )}
              </svg>

              {/* Stats */}
              <div className="absolute bottom-4 left-4 flex gap-3 text-[10px] text-gray-500">
                <span>인물: {selectedNode && egoNetwork ? 1 + egoNetwork.first.length + egoNetwork.second.length : topPersons.length}</span>
                <span>연결: {selectedNode && egoNetwork ? egoNetwork.firstRels.length + egoNetwork.secondRels.length : topRelationships.length}</span>
                <span>배율: {(zoom * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1 space-y-4">
            {selectedNode ? (
              <>
                {/* Selected Person Info */}
                {(() => {
                  const p = getPerson(selectedNode);
                  if (!p) return null;
                  return (
                    <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                          style={{ backgroundColor: getCategoryHexColor(p.category) + "30", color: getCategoryHexColor(p.category) }}
                        >
                          {p.name.ko[0]}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">{p.name.ko}</h2>
                          <p className="text-sm text-gray-400">{p.name.en}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: getCategoryHexColor(p.category) + "20", color: getCategoryHexColor(p.category) }}>
                          {getCategoryLabel(p.category)}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: ERA_COLORS[p.era] + "20", color: ERA_COLORS[p.era] }}>
                          {ERA_LABELS[p.era]}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">
                          {connectionCounts[p.id] || 0} 연결
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed mb-3">{p.summary}</p>
                      <Link href={`/persons/${p.id}/`} className="text-sm text-cyan-400 hover:text-cyan-300">
                        상세 페이지 →
                      </Link>
                    </div>
                  );
                })()}

                {/* Connections List */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    연결 관계 ({nodeRelationships.length})
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {nodeRelationships.map((rel: any, i: number) => {
                      const other = getPerson(rel.other);
                      if (!other) return null;
                      const typeInfo = RELATIONSHIP_TYPES.find((t) => t.key === rel.type);
                      return (
                        <div key={i}
                          className={cn("p-3 rounded-lg bg-white/5 border-l-2 cursor-pointer hover:bg-white/10 transition-colors", getRelBorderColor(rel.type))}
                          onClick={() => setSelectedNode(rel.other)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getCategoryHexColor(other.category) }} />
                              <span className="text-sm font-medium text-white">
                                {rel.direction === "outgoing" ? "→ " : "← "}{other.name.ko}
                              </span>
                            </div>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", typeInfo?.bg, typeInfo?.color)}>
                              {typeInfo?.label || rel.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{rel.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    인드라망 통계
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-2xl font-bold text-white">{allPersons.length}</div>
                      <div className="text-xs text-gray-400">인물</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-2xl font-bold text-white">{allRelationships.length}</div>
                      <div className="text-xs text-gray-400">연결</div>
                    </div>
                    {CATEGORY_FILTERS.slice(1).map((c) => {
                      const count = allPersons.filter((p: any) => p.category === c.key).length;
                      return (
                        <div key={c.key} className="p-2 rounded-lg text-center" style={{ backgroundColor: c.color + "15" }}>
                          <div className="text-lg font-bold" style={{ color: c.color }}>{count}</div>
                          <div className="text-[10px] text-gray-400">{c.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Most Connected */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3">가장 많이 연결된 인물</h3>
                  <div className="space-y-2">
                    {allPersons
                      .map((p: any) => ({ ...p, connections: connectionCounts[p.id] || 0 }))
                      .sort((a: any, b: any) => b.connections - a.connections)
                      .slice(0, 12)
                      .map((p: any) => (
                        <div key={p.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setSelectedNode(p.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{ backgroundColor: getCategoryHexColor(p.category) + "30", color: getCategoryHexColor(p.category) }}>
                              {p.name.ko[0]}
                            </div>
                            <span className="text-sm text-gray-300">{p.name.ko}</span>
                            <span className="text-[10px] text-gray-600">{getCategoryLabel(p.category)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">{p.connections}</span>
                            <Network className="w-3 h-3 text-gray-600" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Guide */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-2">사용 가이드</h3>
                  <ul className="text-xs text-gray-400 space-y-1.5">
                    <li>• 노드를 클릭하면 해당 인물의 1·2차 관계망을 봅니다</li>
                    <li>• 카테고리 필터로 특정 분야의 인물만 볼 수 있습니다</li>
                    <li>• 검색으로 특정 인물을 바로 찾을 수 있습니다</li>
                    <li>• 노드 색상은 카테고리를, 크기는 연결 수를 나타냅니다</li>
                    <li>• 선택된 인물에서 다른 노드를 클릭하면 이동합니다</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
