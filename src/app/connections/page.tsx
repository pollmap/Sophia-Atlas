"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Network,
  Filter,
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
} from "lucide-react";
import philosophersData from "@/data/persons/philosophers.json";
import relationshipsData from "@/data/relationships/person-person.json";
import { cn } from "@/lib/utils";

const philosophers = philosophersData as any[];
const relationships = relationshipsData as any[];

const RELATIONSHIP_TYPES = [
  { key: "all", label: "전체", color: "text-white", bg: "bg-white/20" },
  {
    key: "influenced",
    label: "영향",
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    icon: ArrowRight,
    desc: "직접 영향 (스승-제자, 저작)",
  },
  {
    key: "opposed",
    label: "대립",
    color: "text-red-400",
    bg: "bg-red-500/20",
    icon: Swords,
    desc: "비판/반박 관계",
  },
  {
    key: "developed",
    label: "발전",
    color: "text-green-400",
    bg: "bg-green-500/20",
    icon: GitBranch,
    desc: "사상을 변형/종합하여 발전",
  },
  {
    key: "parallel",
    label: "유사",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    icon: Shuffle,
    desc: "독립적 구조적 유사성",
  },
  {
    key: "contextual",
    label: "맥락",
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    icon: Globe,
    desc: "역사적 맥락 공유",
  },
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

function getPhilosopher(id: string) {
  return philosophers.find((p: any) => p.id === id);
}

export default function ConnectionsPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  const filteredRelationships = useMemo(() => {
    let rels = relationships;
    if (selectedType !== "all") {
      rels = rels.filter((r: any) => r.type === selectedType);
    }
    if (selectedEra !== "all") {
      rels = rels.filter((r: any) => {
        const source = getPhilosopher(r.source);
        const target = getPhilosopher(r.target);
        return (
          (source && source.era === selectedEra) ||
          (target && target.era === selectedEra)
        );
      });
    }
    if (selectedNode) {
      rels = rels.filter(
        (r: any) => r.source === selectedNode || r.target === selectedNode
      );
    }
    return rels;
  }, [selectedType, selectedEra, selectedNode]);

  const visiblePhilosophers = useMemo(() => {
    if (selectedNode) {
      const connectedIds = new Set<string>();
      connectedIds.add(selectedNode);
      filteredRelationships.forEach((r: any) => {
        connectedIds.add(r.source);
        connectedIds.add(r.target);
      });
      return philosophers.filter((p: any) => connectedIds.has(p.id));
    }
    if (selectedEra !== "all") {
      return philosophers.filter((p: any) => p.era === selectedEra);
    }
    return philosophers;
  }, [selectedEra, selectedNode, filteredRelationships]);

  const connectionCount = useCallback(
    (id: string) => {
      return relationships.filter(
        (r: any) => r.source === id || r.target === id
      ).length;
    },
    []
  );

  const nodeRelationships = useMemo(() => {
    if (!selectedNode) return [];
    return relationships
      .filter((r: any) => r.source === selectedNode || r.target === selectedNode)
      .map((r: any) => ({
        ...r,
        other: r.source === selectedNode ? r.target : r.source,
        direction: r.source === selectedNode ? "outgoing" : "incoming",
      }));
  }, [selectedNode]);

  const getRelColor = (type: string) => {
    const t = RELATIONSHIP_TYPES.find((rt) => rt.key === type);
    return t?.color || "text-white";
  };

  const getRelBorderColor = (type: string) => {
    switch (type) {
      case "influenced":
        return "border-blue-500/50";
      case "opposed":
        return "border-red-500/50";
      case "developed":
        return "border-green-500/50";
      case "parallel":
        return "border-purple-500/50";
      case "contextual":
        return "border-yellow-500/50";
      default:
        return "border-white/20";
    }
  };

  // Position philosophers in a circular/radial layout by era
  const getNodePosition = (philosopher: any, index: number, total: number) => {
    const eraOrder = ["ancient", "medieval", "modern", "contemporary"];
    const eraIndex = eraOrder.indexOf(philosopher.era);
    const eraPhilosophers = visiblePhilosophers.filter(
      (p: any) => p.era === philosopher.era
    );
    const indexInEra = eraPhilosophers.indexOf(philosopher);
    const totalInEra = eraPhilosophers.length;

    // Radial layout: each era gets a quadrant
    const baseAngle = (eraIndex * Math.PI) / 2 - Math.PI / 4;
    const spreadAngle = Math.PI / 2.5;
    const angle =
      baseAngle +
      (totalInEra > 1
        ? (indexInEra / (totalInEra - 1)) * spreadAngle - spreadAngle / 2
        : 0);

    const connections = connectionCount(philosopher.id);
    const radius = 180 + (connections > 5 ? 40 : connections > 3 ? 80 : 130);

    return {
      x: 300 + Math.cos(angle) * radius * zoom,
      y: 300 + Math.sin(angle) * radius * zoom,
    };
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  인드라망 — 사상의 연결 지도
                </h1>
                <p className="text-sm text-gray-400">
                  인류 사상이 어떻게 서로 얽혀있는지 탐색하세요
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Info className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                인드라망(Indra&apos;s Net)이란?
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                불교 화엄경에 등장하는 개념으로, 인드라 신의 궁전에 걸린 무한한
                그물망입니다. 그물의 매듭마다 보석이 달려있고, 각 보석은 다른 모든
                보석을 비추며 반영합니다. 이처럼 인류의 모든 사상은 서로 연결되어
                있으며, 하나를 이해하면 전체의 빛이 보입니다.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {RELATIONSHIP_TYPES.filter((t) => t.key !== "all").map((t) => (
                  <div
                    key={t.key}
                    className={cn(
                      "p-2 rounded border border-white/10 text-center",
                      t.bg
                    )}
                  >
                    <div className={cn("text-xs font-bold mb-1", t.color)}>
                      {t.label}
                    </div>
                    <div className="text-[10px] text-gray-400">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 mr-1">관계:</span>
            {RELATIONSHIP_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedType === t.key
                    ? cn(t.bg, t.color, "ring-1 ring-current")
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                {t.label}
              </button>
            ))}
            <span className="text-gray-600 mx-2">|</span>
            <span className="text-xs text-gray-500 mr-1">시대:</span>
            <button
              onClick={() => setSelectedEra("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedEra === "all"
                  ? "bg-white/20 text-white ring-1 ring-white/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
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
                  selectedEra === era
                    ? "ring-1 ring-current"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
                style={
                  selectedEra === era
                    ? {
                        color: ERA_COLORS[era],
                        backgroundColor: ERA_COLORS[era] + "20",
                      }
                    : {}
                }
              >
                {label}
              </button>
            ))}
            {selectedNode && (
              <button
                onClick={() => setSelectedNode(null)}
                className="px-3 py-1.5 rounded-full text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                선택 해제 ✕
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
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
                  className="p-2 rounded-lg bg-[#0F172A] border border-white/10 hover:bg-white/10"
                >
                  <ZoomIn className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
                  className="p-2 rounded-lg bg-[#0F172A] border border-white/10 hover:bg-white/10"
                >
                  <ZoomOut className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Era Quadrant Labels */}
              <div className="absolute top-2 right-16 text-[10px] text-amber-400/40 font-bold">
                고대
              </div>
              <div className="absolute bottom-2 right-16 text-[10px] text-purple-400/40 font-bold">
                중세
              </div>
              <div className="absolute bottom-2 left-4 text-[10px] text-teal-400/40 font-bold">
                근대
              </div>
              <div className="absolute top-2 left-4 text-[10px] text-gray-400/40 font-bold">
                현대
              </div>

              {/* SVG Graph */}
              <svg
                viewBox="0 0 600 600"
                className="w-full"
                style={{ minHeight: "500px" }}
              >
                {/* Background circles */}
                <circle
                  cx="300"
                  cy="300"
                  r={280 * zoom}
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="300"
                  cy="300"
                  r={200 * zoom}
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="300"
                  cy="300"
                  r={120 * zoom}
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeDasharray="4 4"
                />

                {/* Relationship Lines */}
                {filteredRelationships.map((rel: any, i: number) => {
                  const sourceP = getPhilosopher(rel.source);
                  const targetP = getPhilosopher(rel.target);
                  if (!sourceP || !targetP) return null;

                  const si = visiblePhilosophers.indexOf(sourceP);
                  const ti = visiblePhilosophers.indexOf(targetP);
                  if (si === -1 || ti === -1) return null;

                  const sPos = getNodePosition(
                    sourceP,
                    si,
                    visiblePhilosophers.length
                  );
                  const tPos = getNodePosition(
                    targetP,
                    ti,
                    visiblePhilosophers.length
                  );

                  const strokeColor =
                    rel.type === "influenced"
                      ? "rgba(96,165,250,0.3)"
                      : rel.type === "opposed"
                      ? "rgba(248,113,113,0.3)"
                      : rel.type === "developed"
                      ? "rgba(74,222,128,0.3)"
                      : rel.type === "parallel"
                      ? "rgba(192,132,252,0.3)"
                      : "rgba(250,204,21,0.3)";

                  const isHighlighted =
                    selectedNode &&
                    (rel.source === selectedNode ||
                      rel.target === selectedNode);

                  return (
                    <line
                      key={i}
                      x1={sPos.x}
                      y1={sPos.y}
                      x2={tPos.x}
                      y2={tPos.y}
                      stroke={strokeColor}
                      strokeWidth={
                        isHighlighted
                          ? (rel.strength || 1) * 2
                          : rel.strength || 1
                      }
                      opacity={
                        selectedNode
                          ? isHighlighted
                            ? 0.8
                            : 0.05
                          : 0.4
                      }
                      strokeDasharray={
                        rel.type === "parallel"
                          ? "4 4"
                          : rel.type === "contextual"
                          ? "8 4"
                          : undefined
                      }
                    />
                  );
                })}

                {/* Philosopher Nodes */}
                {visiblePhilosophers.map((p: any, i: number) => {
                  const pos = getNodePosition(
                    p,
                    i,
                    visiblePhilosophers.length
                  );
                  const connections = connectionCount(p.id);
                  const nodeRadius = Math.max(
                    8,
                    Math.min(20, 6 + connections * 1.5)
                  );
                  const isSelected = selectedNode === p.id;
                  const isConnected =
                    selectedNode &&
                    relationships.some(
                      (r: any) =>
                        (r.source === selectedNode && r.target === p.id) ||
                        (r.target === selectedNode && r.source === p.id)
                    );
                  const dimmed =
                    selectedNode && !isSelected && !isConnected;

                  return (
                    <g
                      key={p.id}
                      onClick={() =>
                        setSelectedNode(isSelected ? null : p.id)
                      }
                      className="cursor-pointer"
                      opacity={dimmed ? 0.15 : 1}
                    >
                      {/* Glow effect for selected */}
                      {isSelected && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={nodeRadius + 8}
                          fill="none"
                          stroke={ERA_COLORS[p.era]}
                          strokeWidth="2"
                          opacity="0.4"
                        >
                          <animate
                            attributeName="r"
                            values={`${nodeRadius + 6};${nodeRadius + 12};${nodeRadius + 6}`}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.4;0.1;0.4"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={nodeRadius}
                        fill={ERA_COLORS[p.era]}
                        opacity={isSelected ? 1 : 0.8}
                        stroke={isSelected ? "white" : "none"}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + nodeRadius + 12}
                        textAnchor="middle"
                        fill={dimmed ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.8)"}
                        fontSize={isSelected ? "11" : "9"}
                        fontWeight={isSelected ? "bold" : "normal"}
                      >
                        {p.name.ko}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Stats */}
              <div className="absolute bottom-4 left-4 flex gap-3 text-[10px] text-gray-500">
                <span>사상가: {visiblePhilosophers.length}</span>
                <span>연결: {filteredRelationships.length}</span>
                <span>배율: {(zoom * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1 space-y-4">
            {selectedNode ? (
              <>
                {/* Selected Philosopher Info */}
                {(() => {
                  const p = getPhilosopher(selectedNode);
                  if (!p) return null;
                  return (
                    <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                          style={{
                            backgroundColor: ERA_COLORS[p.era] + "30",
                            color: ERA_COLORS[p.era],
                          }}
                        >
                          {p.name.ko[0]}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">
                            {p.name.ko}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {p.name.en}
                            {p.name.original &&
                              p.name.original !== p.name.en &&
                              ` · ${p.name.original}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: ERA_COLORS[p.era] + "20",
                            color: ERA_COLORS[p.era],
                          }}
                        >
                          {ERA_LABELS[p.era]}
                        </span>
                        {p.school?.slice(0, 3).map((s: string) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed mb-3">
                        {p.summary}
                      </p>
                      <Link
                        href={`/philosophy/${p.id}/`}
                        className="text-sm text-amber-400 hover:text-amber-300"
                      >
                        상세 페이지 →
                      </Link>
                    </div>
                  );
                })()}

                {/* Connections List */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    연결 관계 ({nodeRelationships.length})
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {nodeRelationships.map((rel: any, i: number) => {
                      const other = getPhilosopher(rel.other);
                      if (!other) return null;
                      const typeInfo = RELATIONSHIP_TYPES.find(
                        (t) => t.key === rel.type
                      );
                      return (
                        <div
                          key={i}
                          className={cn(
                            "p-3 rounded-lg bg-white/5 border-l-2 cursor-pointer hover:bg-white/10 transition-colors",
                            getRelBorderColor(rel.type)
                          )}
                          onClick={() => setSelectedNode(rel.other)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {rel.direction === "outgoing" ? "→ " : "← "}
                              {other.name.ko}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded",
                                typeInfo?.bg,
                                typeInfo?.color
                              )}
                            >
                              {typeInfo?.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {rel.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Default: Overview Stats */
              <div className="space-y-4">
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    인드라망 통계
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-2xl font-bold text-white">
                        {philosophers.length}
                      </div>
                      <div className="text-xs text-gray-400">사상가</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-2xl font-bold text-white">
                        {relationships.length}
                      </div>
                      <div className="text-xs text-gray-400">연결</div>
                    </div>
                    {RELATIONSHIP_TYPES.filter((t) => t.key !== "all").map(
                      (t) => (
                        <div
                          key={t.key}
                          className={cn(
                            "p-2 rounded-lg text-center",
                            t.bg
                          )}
                        >
                          <div className={cn("text-lg font-bold", t.color)}>
                            {
                              relationships.filter(
                                (r: any) => r.type === t.key
                              ).length
                            }
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {t.label}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Most Connected */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3">
                    가장 많이 연결된 사상가
                  </h3>
                  <div className="space-y-2">
                    {philosophers
                      .map((p: any) => ({
                        ...p,
                        connections: connectionCount(p.id),
                      }))
                      .sort(
                        (a: any, b: any) => b.connections - a.connections
                      )
                      .slice(0, 10)
                      .map((p: any) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setSelectedNode(p.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{
                                backgroundColor: ERA_COLORS[p.era] + "30",
                                color: ERA_COLORS[p.era],
                              }}
                            >
                              {p.name.ko[0]}
                            </div>
                            <span className="text-sm text-gray-300">
                              {p.name.ko}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {p.connections}
                            </span>
                            <Network className="w-3 h-3 text-gray-600" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Guide */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-2">
                    사용 가이드
                  </h3>
                  <ul className="text-xs text-gray-400 space-y-1.5">
                    <li>• 노드를 클릭하면 해당 사상가의 모든 연결을 봅니다</li>
                    <li>• 관계 유형 필터로 특정 종류의 연결만 볼 수 있습니다</li>
                    <li>• 시대 필터로 특정 시대의 연결에 집중합니다</li>
                    <li>• 노드 크기는 연결 수에 비례합니다</li>
                    <li>
                      • 점선은 유사(parallel) 또는 맥락(contextual) 관계입니다
                    </li>
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
