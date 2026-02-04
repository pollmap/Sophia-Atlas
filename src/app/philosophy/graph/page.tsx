'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  GitBranch,
  X,
} from 'lucide-react';
import philosophersData from '@/data/persons/philosophers.json';
import rawRelationships from '@/data/relationships/person-person.json';

const relationshipsData = rawRelationships as unknown as { source: string; target: string; type: string; description: string }[];
import {
  cn,
  getEraColor,
  getEraBgColor,
  getEraLabel,
  formatYear,
} from '@/lib/utils';
import { getEraColorClass, getEraHexColor, getEraBorderClass } from '@/lib/utils';

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

const eras: Era[] = ['ancient', 'medieval', 'modern', 'contemporary'];

interface NodePosition {
  x: number;
  y: number;
  philosopher: (typeof philosophersData)[number];
}

export default function GraphPage() {
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const filteredPhilosophers = useMemo(() => {
    if (selectedEra === 'all') return philosophersData;
    return philosophersData.filter((p) => p.era === selectedEra);
  }, [selectedEra]);

  const filteredIds = useMemo(
    () => new Set(filteredPhilosophers.map((p) => p.id)),
    [filteredPhilosophers]
  );

  // Position nodes by era columns
  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const eraColumns: Record<Era, number> = {
      ancient: 100,
      medieval: 300,
      modern: 500,
      contemporary: 700,
    };

    const eraCounters: Record<Era, number> = {
      ancient: 0,
      medieval: 0,
      modern: 0,
      contemporary: 0,
    };

    // Count per era to center vertically
    const eraTotals: Record<Era, number> = { ancient: 0, medieval: 0, modern: 0, contemporary: 0 };
    philosophersData.forEach((p) => {
      eraTotals[p.era as Era]++;
    });

    philosophersData.forEach((p) => {
      const era = p.era as Era;
      const x = eraColumns[era];
      const total = eraTotals[era];
      const spacing = Math.min(80, 400 / (total + 1));
      const startY = (500 - total * spacing) / 2 + spacing / 2;
      const y = startY + eraCounters[era] * spacing;
      eraCounters[era]++;
      positions[p.id] = { x, y, philosopher: p };
    });

    return positions;
  }, []);

  // Filter relationships
  const filteredRelationships = useMemo(() => {
    return relationshipsData.filter(
      (r) => filteredIds.has(r.source) && filteredIds.has(r.target)
    );
  }, [filteredIds]);

  const selectedPhilosopher = useMemo(() => {
    if (!selectedNode) return null;
    return philosophersData.find((p) => p.id === selectedNode) || null;
  }, [selectedNode]);

  const getPhilosopherName = useCallback((id: string) => {
    const p = philosophersData.find((ph) => ph.id === id);
    return p ? p.name.ko : id;
  }, []);

  // Relationships for selected node
  const selectedRelationships = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    const incoming = relationshipsData.filter((r) => r.target === selectedNode);
    const outgoing = relationshipsData.filter((r) => r.source === selectedNode);
    return { incoming, outgoing };
  }, [selectedNode]);

  const svgWidth = 800;
  const svgHeight = 500;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <GitBranch className="w-8 h-8 text-medieval" />
          영향 관계 그래프
        </h1>
        <p className="text-slate-400">
          사상가들 사이의 영향 관계를 시각적으로 탐색하세요
        </p>
      </div>

      {/* Era Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500 mr-1" />
          <button
            onClick={() => { setSelectedEra('all'); setSelectedNode(null); }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              selectedEra === 'all'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            )}
          >
            전체
          </button>
          {eras.map((era) => (
            <button
              key={era}
              onClick={() => { setSelectedEra(era); setSelectedNode(null); }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedEra === era
                  ? getEraColorClass(era)
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              )}
            >
              {getEraLabel(era)}
            </button>
          ))}
        </div>
      </div>

      {/* Graph + Detail Panel */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* SVG Graph */}
          <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-800/20 overflow-hidden">
            <div className="overflow-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full min-w-[600px]"
                style={{ minHeight: 400 }}
              >
                {/* Era column labels */}
                {eras.map((era) => {
                  const cols: Record<Era, number> = {
                    ancient: 100,
                    medieval: 300,
                    modern: 500,
                    contemporary: 700,
                  };
                  return (
                    <text
                      key={`col-${era}`}
                      x={cols[era]}
                      y={25}
                      textAnchor="middle"
                      className="text-xs"
                      fill={getEraHexColor(era)}
                      fontSize={12}
                      fontWeight={600}
                    >
                      {getEraLabel(era)}
                    </text>
                  );
                })}

                {/* Relationship edges */}
                {filteredRelationships.map((rel, idx) => {
                  const from = nodePositions[rel.source];
                  const to = nodePositions[rel.target];
                  if (!from || !to) return null;

                  const isHighlighted =
                    selectedNode === rel.source || selectedNode === rel.target;

                  const midX = (from.x + to.x) / 2;
                  const midY = (from.y + to.y) / 2 - 20;

                  return (
                    <g key={`edge-${idx}`}>
                      <path
                        d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                        fill="none"
                        stroke={isHighlighted ? '#D4AF37' : '#334155'}
                        strokeWidth={isHighlighted ? 2 : 1}
                        strokeOpacity={isHighlighted ? 0.8 : 0.4}
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}

                {/* Arrow marker */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      fill="#64748B"
                      fillOpacity={0.5}
                    />
                  </marker>
                </defs>

                {/* Philosopher nodes */}
                {filteredPhilosophers.map((p) => {
                  const pos = nodePositions[p.id];
                  if (!pos) return null;

                  const isSelected = selectedNode === p.id;
                  const isConnected =
                    selectedNode
                      ? relationshipsData.some(
                          (r) =>
                            (r.source === selectedNode && r.target === p.id) ||
                            (r.target === selectedNode && r.source === p.id)
                        )
                      : false;
                  const dimmed = selectedNode && !isSelected && !isConnected;

                  return (
                    <g
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedNode(isSelected ? null : p.id)
                      }
                      opacity={dimmed ? 0.3 : 1}
                    >
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 18 : 14}
                        fill={getEraHexColor(p.era)}
                        fillOpacity={isSelected ? 0.9 : 0.7}
                        stroke={isSelected ? '#fff' : 'transparent'}
                        strokeWidth={2}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 28}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#94a3b8'}
                        fontSize={11}
                        fontWeight={isSelected ? 600 : 400}
                      >
                        {p.name.ko}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {selectedPhilosopher ? (
              <div className={cn(
                'rounded-xl border bg-slate-800/30 p-6',
                getEraBorderClass(selectedPhilosopher.era)
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedPhilosopher.name.ko}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {selectedPhilosopher.name.en}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <span
                  className={cn(
                    'inline-block text-xs px-2.5 py-1 rounded-full font-medium mb-4',
                    getEraColorClass(selectedPhilosopher.era)
                  )}
                >
                  {getEraLabel(selectedPhilosopher.era as Era)}
                </span>

                <p className="text-xs text-slate-500 mb-1">
                  {formatYear(selectedPhilosopher.period.start)} ~{' '}
                  {formatYear(selectedPhilosopher.period.end)}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedPhilosopher.school.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Influenced by */}
                {selectedRelationships.incoming.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      영향 받은 사상가
                    </h4>
                    <div className="space-y-1">
                      {selectedRelationships.incoming.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedNode(r.source)}
                          className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-700/30 transition-colors"
                        >
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              getEraBgColor(
                                (philosophersData.find((p) => p.id === r.source)
                                  ?.era || 'contemporary') as Era
                              )
                            )}
                          />
                          <span className="text-sm text-slate-300">
                            {getPhilosopherName(r.source)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Influenced */}
                {selectedRelationships.outgoing.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      영향을 준 사상가
                    </h4>
                    <div className="space-y-1">
                      {selectedRelationships.outgoing.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedNode(r.target)}
                          className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-700/30 transition-colors"
                        >
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              getEraBgColor(
                                (philosophersData.find((p) => p.id === r.target)
                                  ?.era || 'contemporary') as Era
                              )
                            )}
                          />
                          <span className="text-sm text-slate-300">
                            {getPhilosopherName(r.target)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/philosophy/${selectedPhilosopher.id}/`}
                  className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2.5 rounded-lg bg-slate-700/50 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  상세 페이지
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-6 text-center">
                <GitBranch className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  그래프에서 사상가 노드를 클릭하면
                  <br />
                  상세 정보가 여기에 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
