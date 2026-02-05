'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import type { Simulation, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { zoom, zoomIdentity } from 'd3-zoom';
import type { ZoomTransform } from 'd3-zoom';
import { select } from 'd3-selection';
import {
  ArrowLeft,
  GitBranch,
  Filter,
  X,
  ExternalLink,
  RotateCcw,
  Search,
  BookOpen,
  Scroll,
  Atom,
  Crown,
  Palette,
} from 'lucide-react';
import philosophersData from '@/data/persons/philosophers.json';
import religiousFiguresData from '@/data/persons/religious-figures.json';
import scientistsData from '@/data/persons/scientists.json';
import historicalFiguresData from '@/data/persons/historical-figures.json';
import ppRelData from '@/data/relationships/person-person.json';
import {
  cn,
  getEraHexColor,
  getEraLabel,
  getCategoryHexColor,
  getCategoryLabel,
  formatYear,
} from '@/lib/utils';

// ── Data ──

const allPersons: any[] = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
];

const personMap = new Map<string, any>();
allPersons.forEach((p) => personMap.set(p.id, p));

const relationships = (ppRelData as any[]).filter(
  (r) => personMap.has(r.source) && personMap.has(r.target)
);

// ── Constants ──

type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';
const ERAS: Era[] = ['ancient', 'medieval', 'modern', 'contemporary'];

const CATEGORY_FILTERS = [
  { key: 'all', label: '전체', color: '#2C2416', icon: GitBranch },
  { key: 'philosopher', label: '철학자', color: '#4A5D8A', icon: BookOpen },
  { key: 'religious_figure', label: '종교', color: '#B8860B', icon: Scroll },
  { key: 'scientist', label: '과학자', color: '#5B7355', icon: Atom },
  { key: 'historical_figure', label: '역사', color: '#8B4040', icon: Crown },
  { key: 'cultural_figure', label: '문화', color: '#7A5478', icon: Palette },
];

const ERA_COLORS: Record<string, string> = {
  ancient: '#D4AF37', medieval: '#7C3AED', modern: '#14B8A6', contemporary: '#64748B',
};

const REL_TYPE_COLORS: Record<string, string> = {
  influenced: 'rgba(96,165,250,{a})',
  teacher_student: 'rgba(96,165,250,{a})',
  opposed: 'rgba(248,113,113,{a})',
  developed: 'rgba(74,222,128,{a})',
  parallel: 'rgba(192,132,252,{a})',
  contextual: 'rgba(250,204,21,{a})',
  contemporary: 'rgba(148,163,184,{a})',
  collaborated: 'rgba(251,146,60,{a})',
};

const REL_TYPE_LABELS: Record<string, string> = {
  influenced: '영향', teacher_student: '사제', opposed: '대립',
  developed: '발전', parallel: '유사', contextual: '맥락',
  contemporary: '동시대', collaborated: '협력',
};

function getRelColor(type: string, alpha: number): string {
  const template = REL_TYPE_COLORS[type] || 'rgba(184,134,11,{a})';
  return template.replace('{a}', String(alpha));
}

// ── Types ──

interface SimNode extends SimulationNodeDatum {
  id: string;
  name: { ko: string; en: string };
  era: string;
  category: string;
  connections: number;
  radius: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  type: string;
  strength: number;
  description: string;
}

// ── Component ──

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const transformRef = useRef<ZoomTransform>(zoomIdentity);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const animFrameRef = useRef<number>(0);
  const hoveredNodeRef = useRef<string | null>(null);
  const selectedNodeRef = useRef<string | null>(null);

  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => { selectedNodeRef.current = selectedNode; }, [selectedNode]);
  useEffect(() => { hoveredNodeRef.current = hoveredNode; }, [hoveredNode]);

  // ── Connection counts ──
  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    relationships.forEach((r: any) => {
      counts[r.source] = (counts[r.source] || 0) + 1;
      counts[r.target] = (counts[r.target] || 0) + 1;
    });
    return counts;
  }, []);

  // ── Filtered data ──
  const { filteredNodes, filteredLinks } = useMemo(() => {
    let persons = allPersons;
    if (selectedCategory !== 'all') {
      persons = persons.filter((p) => p.category === selectedCategory);
    }
    if (selectedEra !== 'all') {
      persons = persons.filter((p) => p.era === selectedEra);
    }

    const idSet = new Set(persons.map((p) => p.id));

    const nodes: SimNode[] = persons.map((p) => {
      const conn = connectionCounts[p.id] || 0;
      return {
        id: p.id,
        name: p.name,
        era: p.era || 'contemporary',
        category: p.category,
        connections: conn,
        radius: Math.max(4, Math.min(16, 3 + Math.sqrt(conn) * 2.5)),
      };
    });

    const links: SimLink[] = relationships
      .filter((r: any) => idSet.has(r.source) && idSet.has(r.target))
      .map((r: any) => ({
        source: r.source,
        target: r.target,
        type: r.type,
        strength: r.strength || 1,
        description: r.description || '',
      }));

    return { filteredNodes: nodes, filteredLinks: links };
  }, [selectedCategory, selectedEra, connectionCounts]);

  // ── Ego network ──
  const egoData = useMemo(() => {
    if (!selectedNode) return null;
    const first = new Set<string>();
    const firstLinks: any[] = [];

    relationships.forEach((r: any) => {
      if (r.source === selectedNode) { first.add(r.target); firstLinks.push(r); }
      if (r.target === selectedNode) { first.add(r.source); firstLinks.push(r); }
    });

    return { center: selectedNode, first: Array.from(first), firstLinks };
  }, [selectedNode]);

  // ── Node relationships for detail panel ──
  const nodeRelationships = useMemo(() => {
    if (!selectedNode) return [];
    return relationships
      .filter((r: any) => r.source === selectedNode || r.target === selectedNode)
      .map((r: any) => ({
        ...r,
        other: r.source === selectedNode ? r.target : r.source,
        direction: r.source === selectedNode ? 'outgoing' : 'incoming',
      }));
  }, [selectedNode]);

  // ── Search ──
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allPersons
      .filter((p: any) => p.name.ko.includes(q) || p.name.en.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  // ── Canvas resize ──
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: Math.max(500, window.innerHeight - 300) });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── D3 Force Simulation ──
  useEffect(() => {
    if (!canvasRef.current) return;
    const { width, height } = canvasSize;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const nodes: SimNode[] = filteredNodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * width * 0.6,
      y: height / 2 + (Math.random() - 0.5) * height * 0.6,
    }));

    const nodeMap = new Map<string, SimNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const links: SimLink[] = filteredLinks
      .filter((l) => nodeMap.has(l.source as string) && nodeMap.has(l.target as string))
      .map((l) => ({ ...l }));

    nodesRef.current = nodes;
    linksRef.current = links;

    if (simulationRef.current) simulationRef.current.stop();

    const simulation = forceSimulation<SimNode>(nodes)
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id)
        .distance((d) => 60 + (3 - ((d as SimLink).strength || 1)) * 30)
        .strength(0.3))
      .force('charge', forceManyBody().strength(-50).distanceMax(350))
      .force('center', forceCenter(width / 2, height / 2).strength(0.05))
      .force('collide', forceCollide<SimNode>().radius((d) => d.radius + 2).strength(0.7))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    simulationRef.current = simulation;

    if (selectedNode) {
      const centerNode = nodeMap.get(selectedNode);
      if (centerNode) { centerNode.fx = width / 2; centerNode.fy = height / 2; }
    }

    const egoFirstSet = egoData ? new Set(egoData.first) : null;

    function draw() {
      if (!ctx) return;
      const transform = transformRef.current;

      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#FAF6E9';
      ctx.fillRect(0, 0, width, height);
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      const currentHover = hoveredNodeRef.current;
      const currentSelected = selectedNodeRef.current;

      // Highlight set for hover
      const highlightIds = new Set<string>();
      const highlightLinkSet = new Set<number>();
      if (currentHover && !currentSelected) {
        highlightIds.add(currentHover);
        links.forEach((l, i) => {
          const sid = typeof l.source === 'object' ? (l.source as SimNode).id : String(l.source);
          const tid = typeof l.target === 'object' ? (l.target as SimNode).id : String(l.target);
          if (sid === currentHover || tid === currentHover) {
            highlightIds.add(sid); highlightIds.add(tid); highlightLinkSet.add(i);
          }
        });
      }

      // Draw links
      links.forEach((l, i) => {
        const source = l.source as SimNode;
        const target = l.target as SimNode;
        if (source.x == null || target.x == null) return;

        let alpha = 0.12;
        let lineWidth = 0.5;

        if (currentSelected && egoFirstSet) {
          const sid = source.id; const tid = target.id;
          const isFirst = (sid === currentSelected && egoFirstSet.has(tid)) ||
            (tid === currentSelected && egoFirstSet.has(sid));
          const isInter = egoFirstSet.has(sid) && egoFirstSet.has(tid);
          if (isFirst) { alpha = 0.6; lineWidth = (l.strength || 1) * 1.2; }
          else if (isInter) { alpha = 0.25; lineWidth = 0.7; }
          else { alpha = 0.03; lineWidth = 0.3; }
        } else if (currentHover) {
          if (highlightLinkSet.has(i)) { alpha = 0.6; lineWidth = 1.5; }
          else { alpha = 0.05; lineWidth = 0.3; }
        }

        ctx.beginPath();
        ctx.moveTo(source.x!, source.y!);
        ctx.lineTo(target.x!, target.y!);
        ctx.strokeStyle = getRelColor(l.type, alpha);
        ctx.lineWidth = lineWidth;
        if (l.type === 'parallel' || l.type === 'contextual') ctx.setLineDash([4, 3]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw nodes
      nodes.forEach((node) => {
        if (node.x == null || node.y == null) return;

        let nodeAlpha = 0.85;
        let strokeWidth = 0.5;
        let drawLabel = node.radius >= 8;
        let labelAlpha = 0.7;

        if (currentSelected && egoFirstSet) {
          if (node.id === currentSelected) {
            nodeAlpha = 1; strokeWidth = 2; drawLabel = true; labelAlpha = 1;
          } else if (egoFirstSet.has(node.id)) {
            nodeAlpha = 0.9; strokeWidth = 1; drawLabel = true; labelAlpha = 0.85;
          } else { nodeAlpha = 0.08; strokeWidth = 0; drawLabel = false; }
        } else if (currentHover) {
          if (highlightIds.has(node.id)) {
            nodeAlpha = 1; strokeWidth = 1.5; drawLabel = true; labelAlpha = 1;
          } else { nodeAlpha = 0.15; drawLabel = false; }
        }

        const color = getCategoryHexColor(node.category);

        ctx.globalAlpha = nodeAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        if (strokeWidth > 0) {
          ctx.strokeStyle = ERA_COLORS[node.era] || '#64748B';
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Selected glow
        if (currentSelected && node.id === currentSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(184,134,11,0.5)';
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Label
        if (drawLabel) {
          const label = node.name.ko;
          const fontSize = node.id === currentSelected ? 12 : node.radius >= 10 ? 10 : 9;
          ctx.font = `${node.id === currentSelected ? 'bold ' : ''}${fontSize}px "Pretendard", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.globalAlpha = labelAlpha;

          // Text outline
          ctx.fillStyle = 'rgba(240,230,211,0.9)';
          ctx.fillText(label, node.x + 0.5, node.y + node.radius + 3.5);
          ctx.fillText(label, node.x - 0.5, node.y + node.radius + 3.5);
          ctx.fillText(label, node.x, node.y + node.radius + 4.5);
          ctx.fillText(label, node.x, node.y + node.radius + 2.5);

          ctx.fillStyle = `rgba(44,36,22,${labelAlpha})`;
          ctx.fillText(label, node.x, node.y + node.radius + 3);
          ctx.globalAlpha = 1;
        }
      });

      // Hover tooltip
      if (currentHover && !currentSelected) {
        const hNode = nodeMap.get(currentHover);
        if (hNode && hNode.x != null) {
          const label = `${hNode.name.ko} (${hNode.name.en})`;
          const typeLabel = getCategoryLabel(hNode.category);
          const connText = `${hNode.connections} 연결`;
          ctx.font = 'bold 12px "Pretendard", sans-serif';
          const textW = Math.max(ctx.measureText(label).width, ctx.measureText(connText).width + 60);
          const boxW = textW + 20; const boxH = 44;
          const bx = hNode.x - boxW / 2;
          const by = hNode.y! - hNode.radius - boxH - 8;

          ctx.fillStyle = 'rgba(240,230,211,0.95)';
          ctx.beginPath(); ctx.roundRect(bx, by, boxW, boxH, 4); ctx.fill();
          ctx.strokeStyle = 'rgba(212,196,171,0.6)'; ctx.lineWidth = 1; ctx.stroke();

          ctx.fillStyle = '#2C2416';
          ctx.font = 'bold 11px "Pretendard", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(label, hNode.x, by + 16);

          ctx.fillStyle = getCategoryHexColor(hNode.category);
          ctx.font = '10px "Pretendard", sans-serif';
          ctx.fillText(`${typeLabel} | ${getEraLabel(hNode.era)} | ${connText}`, hNode.x, by + 32);
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);
    simulation.on('tick', () => {});

    // Zoom
    const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => { transformRef.current = event.transform; });

    const canvasSelection = select(canvas);
    canvasSelection.call(zoomBehavior);

    // Hit detection
    function getNodeAt(mx: number, my: number): SimNode | null {
      const t = transformRef.current;
      const x = (mx - t.x) / t.k; const y = (my - t.y) / t.k;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]; if (n.x == null) continue;
        const dx = x - n.x!; const dy = y - n.y!;
        if (dx * dx + dy * dy < (Math.max(n.radius, 6) + 2) ** 2) return n;
      }
      return null;
    }

    // Mouse events
    let isDragging = false;
    let dragNode: SimNode | null = null;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
      if (isDragging && dragNode) {
        const t = transformRef.current;
        dragNode.fx = (mx - t.x) / t.k; dragNode.fy = (my - t.y) / t.k;
        simulation.alpha(0.1).restart();
        return;
      }
      const hit = getNodeAt(mx, my);
      hoveredNodeRef.current = hit?.id || null;
      canvas.style.cursor = hit ? 'pointer' : 'grab';
      if (hit?.id !== hoveredNode) setHoveredNode(hit?.id || null);
    });

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const hit = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) {
        isDragging = true; dragNode = hit;
        dragNode.fx = dragNode.x; dragNode.fy = dragNode.y;
        simulation.alphaTarget(0.1).restart();
        canvasSelection.on('.zoom', null);
      }
    });

    canvas.addEventListener('mouseup', () => {
      if (isDragging && dragNode) {
        if (dragNode.id !== selectedNodeRef.current) { dragNode.fx = null; dragNode.fy = null; }
        isDragging = false; dragNode = null;
        simulation.alphaTarget(0);
        canvasSelection.call(zoomBehavior);
      }
    });

    canvas.addEventListener('click', (e) => {
      if (isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const hit = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) setSelectedNode((prev) => (prev === hit.id ? null : hit.id));
    });

    canvas.addEventListener('mouseleave', () => {
      hoveredNodeRef.current = null; setHoveredNode(null);
    });

    // Touch
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const hit = getNodeAt(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
        if (hit) {
          e.preventDefault(); isDragging = true; dragNode = hit;
          dragNode.fx = dragNode.x; dragNode.fy = dragNode.y;
          simulation.alphaTarget(0.1).restart();
        }
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (isDragging && dragNode && e.touches.length === 1) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const t = transformRef.current;
        dragNode.fx = (e.touches[0].clientX - rect.left - t.x) / t.k;
        dragNode.fy = (e.touches[0].clientY - rect.top - t.y) / t.k;
        simulation.alpha(0.1).restart();
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      if (isDragging && dragNode) {
        const rect = canvas.getBoundingClientRect();
        const hit = getNodeAt(e.changedTouches[0].clientX - rect.left, e.changedTouches[0].clientY - rect.top);
        if (hit?.id === dragNode.id) setSelectedNode((prev) => (prev === hit.id ? null : hit.id));
        if (dragNode.id !== selectedNodeRef.current) { dragNode.fx = null; dragNode.fy = null; }
        isDragging = false; dragNode = null; simulation.alphaTarget(0);
      }
    });

    return () => { simulation.stop(); cancelAnimationFrame(animFrameRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNodes, filteredLinks, canvasSize, egoData]);

  // ── Focus on search result ──
  const focusOnNode = useCallback((id: string) => {
    setSelectedNode(id); setSearchQuery('');
    const canvas = canvasRef.current; if (!canvas) return;
    const node = nodesRef.current.find((n) => n.id === id);
    if (!node || node.x == null) return;
    const { width, height } = canvasSize;
    const transform = zoomIdentity.translate(width / 2, height / 2).scale(1.5).translate(-node.x!, -node.y!);
    select(canvas).transition().duration(750)
      .call(zoom<HTMLCanvasElement, unknown>().transform as any, transform);
    transformRef.current = transform;
  }, [canvasSize]);

  // ── Reset ──
  const resetView = useCallback(() => {
    setSelectedNode(null); setSelectedEra('all'); setSelectedCategory('all'); setSearchQuery('');
    const canvas = canvasRef.current; if (!canvas) return;
    const transform = zoomIdentity;
    select(canvas).transition().duration(500)
      .call(zoom<HTMLCanvasElement, unknown>().transform as any, transform);
    transformRef.current = transform;
    nodesRef.current.forEach((n) => { n.fx = null; n.fy = null; });
    simulationRef.current?.alpha(0.3).restart();
  }, []);

  const selectedData = selectedNode ? personMap.get(selectedNode) : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--fresco-ivory)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-colors mb-6" style={{ color: 'var(--ink-light)' }}>
          <ArrowLeft className="w-4 h-4" /> 홈으로
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 flex items-center gap-3" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
              <GitBranch className="w-8 h-8" style={{ color: '#B8860B' }} />
              영향 관계 그래프
            </h1>
            <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
              {filteredNodes.length}명의 사상가, {filteredLinks.length}개의 관계
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C8B73]" />
              <input
                type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="인물 검색..."
                className="pl-9 pr-4 py-2 rounded bg-[#E8DCCA]/50 border border-[#D4C4AB] text-sm text-[#2C2416] placeholder-[#9C8B73] w-48 focus:w-64 transition-all focus:outline-none focus:ring-1 focus:ring-[#B8860B]/50"
              />
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-[#F0E6D3] border border-[#D4C4AB] rounded overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((p: any) => (
                    <button key={p.id} onClick={() => focusOnNode(p.id)}
                      className="w-full px-4 py-2 text-left hover:bg-[#E8DCCA]/50 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                        style={{ backgroundColor: getCategoryHexColor(p.category) + '30', color: getCategoryHexColor(p.category) }}>
                        {p.name.ko[0]}
                      </div>
                      <span className="text-sm text-[#2C2416]">{p.name.ko}</span>
                      <span className="text-xs text-[#9C8B73] ml-auto">{getCategoryLabel(p.category)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={resetView} className="p-2 rounded bg-[#E8DCCA]/50 hover:bg-[#E8DCCA] transition-colors" title="초기화">
              <RotateCcw className="w-5 h-5 text-[#7A6B55]" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-[#9C8B73]" />
          {CATEGORY_FILTERS.map((c) => (
            <button key={c.key}
              onClick={() => { setSelectedCategory(c.key); setSelectedNode(null); }}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedCategory === c.key ? 'ring-1 ring-current' : 'bg-[#E8DCCA]/50 text-[#7A6B55] hover:bg-[#E8DCCA]')}
              style={selectedCategory === c.key ? { color: c.color, backgroundColor: c.color + '20' } : {}}>
              {c.label}
            </button>
          ))}
          <span className="text-[#D4C4AB] mx-1">|</span>
          <button onClick={() => setSelectedEra('all')}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              selectedEra === 'all' ? 'bg-[#D4C4AB] text-[#2C2416]' : 'bg-[#E8DCCA]/50 text-[#7A6B55] hover:bg-[#E8DCCA]')}>
            전체
          </button>
          {ERAS.map((era) => (
            <button key={era} onClick={() => setSelectedEra(era)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedEra === era ? 'ring-1 ring-current' : 'bg-[#E8DCCA]/50 text-[#7A6B55] hover:bg-[#E8DCCA]')}
              style={selectedEra === era ? { color: ERA_COLORS[era], backgroundColor: ERA_COLORS[era] + '20' } : {}}>
              {getEraLabel(era)}
            </button>
          ))}
          {selectedNode && (
            <button onClick={() => setSelectedNode(null)}
              className="px-3 py-1.5 rounded-full text-xs bg-[#8B4040]/15 text-[#8B4040] hover:bg-[#8B4040]/25 flex items-center gap-1">
              <X className="w-3 h-3" /> 선택 해제
            </button>
          )}
        </div>
      </div>

      {/* Main: Canvas + Detail Panel */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Canvas */}
          <div className="flex-1" ref={containerRef}>
            <div className="relative bg-[#F0E6D3] rounded border border-[#D4C4AB] overflow-hidden">
              {/* Legend */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 pointer-events-none">
                {CATEGORY_FILTERS.slice(1).map((c) => (
                  <div key={c.key} className="flex items-center gap-1 text-[9px] text-[#7A6B55]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.label}
                  </div>
                ))}
              </div>
              <canvas ref={canvasRef} style={{ width: '100%', height: 'calc(100vh - 300px)', minHeight: '500px', display: 'block' }} />
              <div className="absolute bottom-3 left-3 text-[10px] text-[#9C8B73] pointer-events-none">
                노드: {filteredNodes.length} | 연결: {filteredLinks.length}
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] text-[#9C8B73] pointer-events-none">
                스크롤: 확대/축소 | 드래그: 이동 | 클릭: 선택
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {selectedData ? (
              <div className="rounded border p-6" style={{ background: 'var(--fresco-parchment)', borderColor: 'var(--fresco-shadow)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--ink-dark)', fontFamily: "'Cormorant Garamond', serif" }}>
                      {selectedData.name.ko}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--ink-light)' }}>{selectedData.name.en}</p>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="hover:opacity-80" style={{ color: 'var(--ink-light)' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: getCategoryHexColor(selectedData.category) + '20', color: getCategoryHexColor(selectedData.category) }}>
                    {getCategoryLabel(selectedData.category)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: ERA_COLORS[selectedData.era] + '20', color: ERA_COLORS[selectedData.era] }}>
                    {getEraLabel(selectedData.era)}
                  </span>
                </div>

                <p className="text-xs mb-1" style={{ color: 'var(--ink-light)' }}>
                  {formatYear(selectedData.period.start)} ~ {selectedData.period.end === 0 ? '현재' : formatYear(selectedData.period.end)}
                </p>

                <p className="text-sm leading-relaxed mb-4 line-clamp-4" style={{ color: 'var(--ink-medium)' }}>
                  {selectedData.summary}
                </p>

                {/* Relationships */}
                {nodeRelationships.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-light)' }}>
                      관계 ({nodeRelationships.length})
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {nodeRelationships.map((r: any, i: number) => {
                        const other = personMap.get(r.other);
                        if (!other) return null;
                        return (
                          <button key={i} onClick={() => focusOnNode(r.other)}
                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-[#E8DCCA] transition-colors">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryHexColor(other.category) }} />
                            <span className="text-sm" style={{ color: 'var(--ink-medium)' }}>
                              {r.direction === 'outgoing' ? '→ ' : '← '}{other.name.ko}
                            </span>
                            <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: getRelColor(r.type, 0.15), color: getRelColor(r.type, 1) }}>
                              {REL_TYPE_LABELS[r.type] || r.type}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Link href={`/persons/${selectedData.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                  style={{ background: '#B8860B', color: 'var(--fresco-ivory)' }}>
                  상세 페이지 <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="rounded border p-6 text-center" style={{ borderColor: 'var(--fresco-shadow)', background: 'var(--fresco-parchment)' }}>
                <GitBranch className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--fresco-shadow)' }} />
                <p className="text-sm mb-2" style={{ color: 'var(--ink-light)' }}>
                  그래프에서 인물 노드를 클릭하면<br />상세 정보가 표시됩니다.
                </p>
                <p className="text-xs" style={{ color: 'var(--ink-faded)' }}>
                  노드 크기 = 연결 수<br />
                  노드 색상 = 카테고리<br />
                  테두리 색상 = 시대
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
