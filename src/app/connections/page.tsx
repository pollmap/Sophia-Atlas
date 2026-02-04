"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import * as d3 from "d3";
import {
  Network,
  Info,
  Sparkles,
  Layers,
  BookOpen,
  Scroll,
  Atom,
  Crown,
  Palette,
  Search,
  X,
  RotateCcw,
} from "lucide-react";
import philosophersData from "@/data/persons/philosophers.json";
import religiousFiguresData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalFiguresData from "@/data/persons/historical-figures.json";
import ppRelData from "@/data/relationships/person-person.json";
import peRelData from "@/data/relationships/person-entity.json";
import { cn, getCategoryHexColor, getCategoryLabel } from "@/lib/utils";

// ── Data ──

const allPersons = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
] as any[];

const personMap = new Map<string, any>();
allPersons.forEach((p) => personMap.set(p.id, p));

// Only keep relationships where both source and target are known persons
const allRelationships = [...ppRelData, ...peRelData].filter(
  (r: any) => personMap.has(r.source) && personMap.has(r.target)
) as any[];

// ── Constants ──

const CATEGORY_FILTERS = [
  { key: "all", label: "전체", color: "#ffffff", icon: Network },
  { key: "philosopher", label: "철학자", color: "#6366F1", icon: BookOpen },
  { key: "religious_figure", label: "종교", color: "#F59E0B", icon: Scroll },
  { key: "scientist", label: "과학자", color: "#10B981", icon: Atom },
  { key: "historical_figure", label: "역사", color: "#EF4444", icon: Crown },
  { key: "cultural_figure", label: "문화", color: "#EC4899", icon: Palette },
];

const CATEGORY_COLORS: Record<string, string> = {
  philosopher: "#6366F1",
  religious_figure: "#F59E0B",
  scientist: "#10B981",
  historical_figure: "#EF4444",
  cultural_figure: "#EC4899",
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

const RELATIONSHIP_TYPE_COLORS: Record<string, string> = {
  influenced: "rgba(96,165,250,{a})",
  teacher_student: "rgba(96,165,250,{a})",
  opposed: "rgba(248,113,113,{a})",
  criticized: "rgba(248,113,113,{a})",
  developed: "rgba(74,222,128,{a})",
  parallel: "rgba(192,132,252,{a})",
  contextual: "rgba(250,204,21,{a})",
  contemporary: "rgba(148,163,184,{a})",
  collaborated: "rgba(251,146,60,{a})",
  founded: "rgba(52,211,153,{a})",
  advocated: "rgba(52,211,153,{a})",
  authored: "rgba(129,140,248,{a})",
  member_of: "rgba(168,85,247,{a})",
  participated: "rgba(251,191,36,{a})",
  caused: "rgba(239,68,68,{a})",
  affected_by: "rgba(148,163,184,{a})",
  belongs_to: "rgba(168,85,247,{a})",
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
};

const REL_TYPE_FILTERS = [
  { key: "all", label: "전체" },
  { key: "influenced", label: "영향" },
  { key: "teacher_student", label: "사제" },
  { key: "opposed", label: "대립" },
  { key: "developed", label: "발전" },
  { key: "parallel", label: "유사" },
  { key: "collaborated", label: "협력" },
  { key: "contemporary", label: "동시대" },
];

// ── Helpers ──

function getRelColor(type: string, alpha: number): string {
  const template = RELATIONSHIP_TYPE_COLORS[type] || "rgba(148,163,184,{a})";
  return template.replace("{a}", String(alpha));
}

// Category cluster positions (normalized -1 to 1)
const CATEGORY_ANCHORS: Record<string, { x: number; y: number }> = {
  philosopher: { x: -0.6, y: -0.4 },
  religious_figure: { x: 0.6, y: -0.4 },
  scientist: { x: -0.6, y: 0.5 },
  historical_figure: { x: 0.6, y: 0.5 },
  cultural_figure: { x: 0.0, y: 0.7 },
};

// ── Types for simulation ──

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  person: any;
  category: string;
  era: string;
  connections: number;
  radius: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: string;
  strength: number;
  description: string;
}

// ── Component ──

export default function ConnectionsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const animFrameRef = useRef<number>(0);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedRelType, setSelectedRelType] = useState("all");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isSimReady, setIsSimReady] = useState(false);

  // ── Connection counts ──
  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allRelationships.forEach((r: any) => {
      counts[r.source] = (counts[r.source] || 0) + 1;
      counts[r.target] = (counts[r.target] || 0) + 1;
    });
    return counts;
  }, []);

  // ── Filtered data ──
  const { filteredPersonIds, filteredNodes, filteredLinks } = useMemo(() => {
    let persons = allPersons;
    if (selectedCategory !== "all") {
      persons = persons.filter((p: any) => p.category === selectedCategory);
    }
    if (selectedEra !== "all") {
      persons = persons.filter((p: any) => p.era === selectedEra);
    }

    const idSet = new Set(persons.map((p: any) => p.id));

    let rels = allRelationships.filter(
      (r: any) => idSet.has(r.source) && idSet.has(r.target)
    );
    if (selectedRelType !== "all") {
      rels = rels.filter((r: any) => r.type === selectedRelType);
    }

    const nodes: SimNode[] = persons.map((p: any) => {
      const conn = connectionCounts[p.id] || 0;
      return {
        id: p.id,
        person: p,
        category: p.category,
        era: p.era,
        connections: conn,
        radius: Math.max(4, Math.min(16, 3 + Math.sqrt(conn) * 2.5)),
      };
    });

    const nodeIdSet = new Set(nodes.map((n) => n.id));
    const links: SimLink[] = rels
      .filter((r: any) => nodeIdSet.has(r.source) && nodeIdSet.has(r.target))
      .map((r: any) => ({
        source: r.source,
        target: r.target,
        type: r.type,
        strength: r.strength || 1,
        description: r.description || "",
      }));

    return {
      filteredPersonIds: idSet,
      filteredNodes: nodes,
      filteredLinks: links,
    };
  }, [selectedCategory, selectedEra, selectedRelType, connectionCounts]);

  // ── Ego network (1st + 2nd degree) ──
  const egoData = useMemo(() => {
    if (!selectedNode) return null;

    const first = new Set<string>();
    const firstLinks: any[] = [];

    allRelationships.forEach((r: any) => {
      if (selectedRelType !== "all" && r.type !== selectedRelType) return;
      if (r.source === selectedNode) {
        first.add(r.target);
        firstLinks.push(r);
      }
      if (r.target === selectedNode) {
        first.add(r.source);
        firstLinks.push(r);
      }
    });

    const second = new Set<string>();
    const secondLinks: any[] = [];

    allRelationships.forEach((r: any) => {
      if (selectedRelType !== "all" && r.type !== selectedRelType) return;
      if (first.has(r.source) && r.target !== selectedNode && !first.has(r.target)) {
        second.add(r.target);
        secondLinks.push(r);
      }
      if (first.has(r.target) && r.source !== selectedNode && !first.has(r.source)) {
        second.add(r.source);
        secondLinks.push(r);
      }
    });

    // Also include links between 1st degree nodes
    const interFirstLinks: any[] = [];
    allRelationships.forEach((r: any) => {
      if (selectedRelType !== "all" && r.type !== selectedRelType) return;
      if (first.has(r.source) && first.has(r.target)) {
        interFirstLinks.push(r);
      }
    });

    return {
      center: selectedNode,
      first: Array.from(first).filter((id) => personMap.has(id)),
      second: Array.from(second).filter((id) => personMap.has(id)),
      firstLinks,
      secondLinks,
      interFirstLinks,
    };
  }, [selectedNode, selectedRelType]);

  // ── Node relationships for detail panel ──
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

  // ── Search ──
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allPersons
      .filter(
        (p: any) =>
          p.name.ko.toLowerCase().includes(q) ||
          p.name.en.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [searchQuery]);

  // ── Canvas resize ──
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: Math.max(550, rect.height) });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── D3 Force Simulation ──
  useEffect(() => {
    if (!canvasRef.current) return;

    const { width, height } = canvasSize;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Build nodes - deep copy to avoid mutation issues
    const nodes: SimNode[] = filteredNodes.map((n) => ({
      ...n,
      x: (CATEGORY_ANCHORS[n.category]?.x || 0) * width * 0.3 + width / 2 + (Math.random() - 0.5) * 100,
      y: (CATEGORY_ANCHORS[n.category]?.y || 0) * height * 0.3 + height / 2 + (Math.random() - 0.5) * 100,
    }));

    const nodeMap = new Map<string, SimNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const links: SimLink[] = filteredLinks
      .filter((l) => nodeMap.has(l.source as string) && nodeMap.has(l.target as string))
      .map((l) => ({ ...l }));

    nodesRef.current = nodes;
    linksRef.current = links;

    // Stop previous
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Build simulation
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((d) => {
            const str = (d as SimLink).strength || 1;
            return 80 + (3 - str) * 40;
          })
          .strength(0.3)
      )
      .force("charge", d3.forceManyBody().strength(-60).distanceMax(400))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => d.radius + 2).strength(0.7)
      )
      .force(
        "x",
        d3.forceX<SimNode>().x((d) => {
          const anchor = CATEGORY_ANCHORS[d.category];
          return anchor ? width / 2 + anchor.x * width * 0.3 : width / 2;
        }).strength(0.07)
      )
      .force(
        "y",
        d3.forceY<SimNode>().y((d) => {
          const anchor = CATEGORY_ANCHORS[d.category];
          return anchor ? height / 2 + anchor.y * height * 0.3 : height / 2;
        }).strength(0.07)
      )
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    simulationRef.current = simulation;
    setIsSimReady(true);

    // ── Ego-centric: pin selected node to center, boost connections ──
    if (selectedNode && egoData) {
      const centerNode = nodeMap.get(selectedNode);
      if (centerNode) {
        centerNode.fx = width / 2;
        centerNode.fy = height / 2;
      }
    }

    // ── Rendering ──
    const egoFirstSet = egoData ? new Set(egoData.first) : null;
    const egoSecondSet = egoData ? new Set(egoData.second) : null;

    function draw() {
      if (!ctx) return;
      const transform = transformRef.current;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, 0, width, height);

      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      const currentHover = hoveredNodeRef.current;
      const currentSelected = selectedNodeRef.current;

      // Determine which nodes/links to highlight
      const highlightIds = new Set<string>();
      const highlightLinkSet = new Set<number>();

      if (currentHover) {
        highlightIds.add(currentHover);
        links.forEach((l, i) => {
          const sid = typeof l.source === "object" ? (l.source as SimNode).id : String(l.source);
          const tid = typeof l.target === "object" ? (l.target as SimNode).id : String(l.target);
          if (sid === currentHover || tid === currentHover) {
            highlightIds.add(sid);
            highlightIds.add(tid);
            highlightLinkSet.add(i);
          }
        });
      }

      // ── Draw links ──
      links.forEach((l, i) => {
        const source = l.source as SimNode;
        const target = l.target as SimNode;
        if (source.x == null || target.x == null) return;

        let alpha = 0.15;
        let lineWidth = 0.5;

        if (currentSelected && egoFirstSet) {
          const sid = source.id;
          const tid = target.id;
          const isFirstLink =
            (sid === currentSelected || tid === currentSelected) &&
            (egoFirstSet.has(sid) || egoFirstSet.has(tid) || sid === currentSelected || tid === currentSelected);
          const isInterFirst = egoFirstSet.has(sid) && egoFirstSet.has(tid);
          const isSecondLink =
            (egoFirstSet.has(sid) && egoSecondSet?.has(tid)) ||
            (egoFirstSet.has(tid) && egoSecondSet?.has(sid));

          if (isFirstLink) {
            alpha = 0.6;
            lineWidth = (l.strength || 1) * 1.2;
          } else if (isInterFirst) {
            alpha = 0.3;
            lineWidth = 0.8;
          } else if (isSecondLink) {
            alpha = 0.12;
            lineWidth = 0.4;
          } else {
            alpha = 0.03;
            lineWidth = 0.3;
          }
        } else if (currentHover) {
          if (highlightLinkSet.has(i)) {
            alpha = 0.6;
            lineWidth = 1.5;
          } else {
            alpha = 0.06;
            lineWidth = 0.3;
          }
        }

        ctx.beginPath();
        ctx.moveTo(source.x!, source.y!);
        ctx.lineTo(target.x!, target.y!);
        ctx.strokeStyle = getRelColor(l.type, alpha);
        ctx.lineWidth = lineWidth;

        if (l.type === "parallel" || l.type === "contextual") {
          ctx.setLineDash([4, 3]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]);
      });

      // ── Draw nodes ──
      nodes.forEach((node) => {
        if (node.x == null || node.y == null) return;

        let nodeAlpha = 0.85;
        let strokeColor = "rgba(255,255,255,0.08)";
        let strokeWidth = 0.5;
        let drawLabel = node.radius >= 8;
        let labelAlpha = 0.7;

        if (currentSelected && egoFirstSet) {
          if (node.id === currentSelected) {
            nodeAlpha = 1;
            strokeColor = "rgba(255,255,255,0.8)";
            strokeWidth = 2;
            drawLabel = true;
            labelAlpha = 1;
          } else if (egoFirstSet.has(node.id)) {
            nodeAlpha = 0.9;
            strokeColor = "rgba(255,255,255,0.3)";
            strokeWidth = 1;
            drawLabel = true;
            labelAlpha = 0.85;
          } else if (egoSecondSet?.has(node.id)) {
            nodeAlpha = 0.4;
            strokeColor = "rgba(255,255,255,0.1)";
            strokeWidth = 0.5;
            drawLabel = node.radius >= 7;
            labelAlpha = 0.4;
          } else {
            nodeAlpha = 0.08;
            strokeWidth = 0;
            drawLabel = false;
          }
        } else if (currentHover) {
          if (highlightIds.has(node.id)) {
            nodeAlpha = 1;
            strokeColor = "rgba(255,255,255,0.5)";
            strokeWidth = 1.5;
            drawLabel = true;
            labelAlpha = 1;
          } else {
            nodeAlpha = 0.15;
            drawLabel = false;
          }
        }

        const color = CATEGORY_COLORS[node.category] || "#64748B";

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.globalAlpha = nodeAlpha;
        ctx.fillStyle = color;
        ctx.fill();

        if (strokeWidth > 0) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;

        // Glow for selected center node
        if (currentSelected && node.id === currentSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Label
        if (drawLabel) {
          const label = node.person.name.ko;
          const fontSize = node.id === currentSelected ? 12 : node.radius >= 10 ? 10 : 9;
          ctx.font = `${node.id === currentSelected ? "bold " : ""}${fontSize}px -apple-system, "Pretendard", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.globalAlpha = labelAlpha;

          // Text shadow for readability
          ctx.fillStyle = "rgba(15,23,42,0.8)";
          ctx.fillText(label, node.x + 0.5, node.y + node.radius + 3.5);
          ctx.fillText(label, node.x - 0.5, node.y + node.radius + 3.5);
          ctx.fillText(label, node.x, node.y + node.radius + 4.5);
          ctx.fillText(label, node.x, node.y + node.radius + 2.5);

          ctx.fillStyle = `rgba(255,255,255,${labelAlpha})`;
          ctx.fillText(label, node.x, node.y + node.radius + 3);

          ctx.globalAlpha = 1;
        }
      });

      // ── Hover tooltip ──
      if (currentHover && !currentSelected) {
        const hNode = nodeMap.get(currentHover);
        if (hNode && hNode.x != null && hNode.y != null) {
          const name = hNode.person.name.ko;
          const en = hNode.person.name.en;
          const label = `${name} (${en})`;
          const connText = `${hNode.connections} 연결`;

          ctx.font = 'bold 12px -apple-system, "Pretendard", sans-serif';
          const textW = Math.max(ctx.measureText(label).width, ctx.measureText(connText).width);
          const boxW = textW + 20;
          const boxH = 44;
          const bx = hNode.x - boxW / 2;
          const by = hNode.y - hNode.radius - boxH - 8;

          // Tooltip background
          ctx.fillStyle = "rgba(15,23,42,0.95)";
          ctx.beginPath();
          ctx.roundRect(bx, by, boxW, boxH, 6);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Tooltip text
          ctx.fillStyle = "#ffffff";
          ctx.font = 'bold 11px -apple-system, "Pretendard", sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, hNode.x, by + 16);

          ctx.fillStyle = CATEGORY_COLORS[hNode.category] || "#94a3b8";
          ctx.font = '10px -apple-system, "Pretendard", sans-serif';
          ctx.fillText(
            `${getCategoryLabel(hNode.category)} | ${ERA_LABELS[hNode.era] || hNode.era} | ${connText}`,
            hNode.x,
            by + 32
          );
        }
      }

      // Category anchor labels (faint)
      if (!currentSelected && !currentHover) {
        Object.entries(CATEGORY_ANCHORS).forEach(([cat, anchor]) => {
          const ax = width / 2 + anchor.x * width * 0.35;
          const ay = height / 2 + anchor.y * height * 0.35;
          const info = CATEGORY_FILTERS.find((c) => c.key === cat);
          if (!info) return;

          ctx.font = 'bold 11px -apple-system, "Pretendard", sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = info.color;
          ctx.fillText(info.label, ax, ay);
          ctx.globalAlpha = 1;
        });
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(draw);
    }

    // Start rendering loop
    animFrameRef.current = requestAnimationFrame(draw);

    // Tick handler to request redraw
    simulation.on("tick", () => {
      // draw is called via rAF loop
    });

    // ── Zoom behavior ──
    const zoomBehavior = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
      });

    const canvasSelection = d3.select(canvas);
    canvasSelection.call(zoomBehavior);

    // ── Hit detection ──
    function getNodeAtPosition(mx: number, my: number): SimNode | null {
      const transform = transformRef.current;
      const x = (mx - transform.x) / transform.k;
      const y = (my - transform.y) / transform.k;

      // Reverse iterate so topmost drawn nodes are found first
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (n.x == null || n.y == null) continue;
        const dx = x - n.x;
        const dy = y - n.y;
        const hitRadius = Math.max(n.radius, 6) + 2;
        if (dx * dx + dy * dy < hitRadius * hitRadius) {
          return n;
        }
      }
      return null;
    }

    // ── Mouse events ──
    let isDragging = false;
    let dragNode: SimNode | null = null;

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (isDragging && dragNode) {
        const transform = transformRef.current;
        dragNode.fx = (mx - transform.x) / transform.k;
        dragNode.fy = (my - transform.y) / transform.k;
        simulation.alpha(0.1).restart();
        return;
      }

      const hit = getNodeAtPosition(mx, my);
      hoveredNodeRef.current = hit ? hit.id : null;
      canvas.style.cursor = hit ? "pointer" : "grab";

      // Update React state sparingly for tooltip
      if (hit?.id !== hoveredNode) {
        setHoveredNode(hit ? hit.id : null);
      }
    });

    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hit = getNodeAtPosition(mx, my);
      if (hit) {
        isDragging = true;
        dragNode = hit;
        dragNode.fx = dragNode.x;
        dragNode.fy = dragNode.y;
        simulation.alphaTarget(0.1).restart();
        // Prevent zoom while dragging nodes
        canvasSelection.on(".zoom", null);
      }
    });

    canvas.addEventListener("mouseup", () => {
      if (isDragging && dragNode) {
        // If selected, keep pinned. Otherwise release.
        if (dragNode.id !== selectedNodeRef.current) {
          dragNode.fx = null;
          dragNode.fy = null;
        }
        isDragging = false;
        dragNode = null;
        simulation.alphaTarget(0);
        // Re-enable zoom
        canvasSelection.call(zoomBehavior);
      }
    });

    canvas.addEventListener("click", (e) => {
      if (isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hit = getNodeAtPosition(mx, my);
      if (hit) {
        setSelectedNode((prev) => (prev === hit.id ? null : hit.id));
      }
    });

    canvas.addEventListener("mouseleave", () => {
      hoveredNodeRef.current = null;
      setHoveredNode(null);
    });

    // ── Touch events for mobile ──
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.touches[0].clientX - rect.left;
        const my = e.touches[0].clientY - rect.top;
        const hit = getNodeAtPosition(mx, my);
        if (hit) {
          e.preventDefault();
          isDragging = true;
          dragNode = hit;
          dragNode.fx = dragNode.x;
          dragNode.fy = dragNode.y;
          simulation.alphaTarget(0.1).restart();
        }
      }
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
      if (isDragging && dragNode && e.touches.length === 1) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mx = e.touches[0].clientX - rect.left;
        const my = e.touches[0].clientY - rect.top;
        const transform = transformRef.current;
        dragNode.fx = (mx - transform.x) / transform.k;
        dragNode.fy = (my - transform.y) / transform.k;
        simulation.alpha(0.1).restart();
      }
    }, { passive: false });

    canvas.addEventListener("touchend", (e) => {
      if (isDragging && dragNode) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.changedTouches[0].clientX - rect.left;
        const my = e.changedTouches[0].clientY - rect.top;
        const hit = getNodeAtPosition(mx, my);
        if (hit && hit.id === dragNode.id) {
          setSelectedNode((prev) => (prev === hit.id ? null : hit.id));
        }
        if (dragNode.id !== selectedNodeRef.current) {
          dragNode.fx = null;
          dragNode.fy = null;
        }
        isDragging = false;
        dragNode = null;
        simulation.alphaTarget(0);
      }
    });

    return () => {
      simulation.stop();
      cancelAnimationFrame(animFrameRef.current);
      // Clean up event listeners via canvas replacement not needed since component unmounts
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNodes, filteredLinks, canvasSize, egoData]);

  // Refs to avoid stale closures in canvas event handlers
  const hoveredNodeRef = useRef<string | null>(null);
  const selectedNodeRef = useRef<string | null>(selectedNode);

  useEffect(() => {
    selectedNodeRef.current = selectedNode;
  }, [selectedNode]);

  useEffect(() => {
    hoveredNodeRef.current = hoveredNode;
  }, [hoveredNode]);

  // ── Focus search result ──
  const focusOnNode = useCallback(
    (id: string) => {
      setSelectedNode(id);
      setSearchQuery("");

      // Animate zoom to the node
      const canvas = canvasRef.current;
      if (!canvas) return;
      const node = nodesRef.current.find((n) => n.id === id);
      if (!node || node.x == null || node.y == null) return;

      const { width, height } = canvasSize;
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(1.5)
        .translate(-node.x, -node.y);

      d3.select(canvas)
        .transition()
        .duration(750)
        .call(
          d3.zoom<HTMLCanvasElement, unknown>().transform as any,
          transform
        );
      transformRef.current = transform;
    },
    [canvasSize]
  );

  // ── Reset view ──
  const resetView = useCallback(() => {
    setSelectedNode(null);
    setSelectedCategory("all");
    setSelectedEra("all");
    setSelectedRelType("all");
    setSearchQuery("");

    const canvas = canvasRef.current;
    if (!canvas) return;

    const transform = d3.zoomIdentity;
    d3.select(canvas)
      .transition()
      .duration(500)
      .call(
        d3.zoom<HTMLCanvasElement, unknown>().transform as any,
        transform
      );
    transformRef.current = transform;

    // Release all pinned nodes
    nodesRef.current.forEach((n) => {
      n.fx = null;
      n.fy = null;
    });
    simulationRef.current?.alpha(0.3).restart();
  }, []);

  // ── Detail panel content ──
  const selectedPerson = selectedNode ? personMap.get(selectedNode) : null;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  인드라망 -- 인류 사상의 연결 지도
                </h1>
                <p className="text-sm text-gray-400">
                  {allPersons.length}명의 인물, {allRelationships.length}개의 관계
                  {selectedNode && selectedPerson && (
                    <span className="text-cyan-400 ml-2">
                      | {selectedPerson.name.ko} 중심 보기
                    </span>
                  )}
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
                        onClick={() => focusOnNode(p.id)}
                        className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                          style={{
                            backgroundColor: getCategoryHexColor(p.category) + "30",
                            color: getCategoryHexColor(p.category),
                          }}
                        >
                          {p.name.ko[0]}
                        </div>
                        <span className="text-sm text-white">{p.name.ko}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {getCategoryLabel(p.category)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={resetView}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="초기화"
              >
                <RotateCcw className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Info className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {showInfo && (
            <div className="mb-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                인드라망(Indra&apos;s Net)이란?
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                불교 화엄경의 개념으로, 모든 존재가 서로를 비추는 무한한 그물입니다.
                인류의 모든 사상은 서로 연결되어 있으며, 하나를 이해하면 전체의 빛이 보입니다.
              </p>
              <p className="text-xs text-gray-400">
                노드를 클릭하면 해당 인물 중심의 1-2차 관계망을 볼 수 있습니다.
                마우스 드래그로 노드를 이동하고, 휠로 확대/축소할 수 있습니다.
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 mr-1">카테고리:</span>
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setSelectedCategory(c.key);
                  setSelectedNode(null);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedCategory === c.key
                    ? "ring-1 ring-current"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
                style={
                  selectedCategory === c.key
                    ? { color: c.color, backgroundColor: c.color + "20" }
                    : {}
                }
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
                    ? { color: ERA_COLORS[era], backgroundColor: ERA_COLORS[era] + "20" }
                    : {}
                }
              >
                {label}
              </button>
            ))}

            <span className="text-gray-600 mx-1">|</span>
            <span className="text-xs text-gray-500 mr-1">관계:</span>
            {REL_TYPE_FILTERS.map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedRelType(t.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedRelType === t.key
                    ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
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
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas Area */}
          <div className="lg:col-span-3" ref={containerRef}>
            <div className="relative bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden">
              {/* Category Legend */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 pointer-events-none">
                {CATEGORY_FILTERS.slice(1).map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center gap-1 text-[9px] text-gray-400"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.label}
                  </div>
                ))}
              </div>

              {/* Canvas */}
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: "calc(100vh - 280px)",
                  minHeight: "550px",
                  display: "block",
                }}
              />

              {/* Stats overlay */}
              <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] text-gray-500 pointer-events-none">
                <span>
                  인물: {filteredNodes.length}
                </span>
                <span>
                  연결: {filteredLinks.length}
                </span>
                {selectedNode && egoData && (
                  <>
                    <span>1차: {egoData.first.length}</span>
                    <span>2차: {egoData.second.length}</span>
                  </>
                )}
              </div>

              {/* Keyboard shortcut hint */}
              <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 pointer-events-none">
                스크롤: 확대/축소 | 드래그: 이동 | 클릭: 선택
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1 space-y-4">
            {selectedNode && selectedPerson ? (
              <>
                {/* Selected Person Info */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{
                        backgroundColor: getCategoryHexColor(selectedPerson.category) + "30",
                        color: getCategoryHexColor(selectedPerson.category),
                      }}
                    >
                      {selectedPerson.name.ko[0]}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {selectedPerson.name.ko}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {selectedPerson.name.en}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: getCategoryHexColor(selectedPerson.category) + "20",
                        color: getCategoryHexColor(selectedPerson.category),
                      }}
                    >
                      {getCategoryLabel(selectedPerson.category)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: ERA_COLORS[selectedPerson.era] + "20",
                        color: ERA_COLORS[selectedPerson.era],
                      }}
                    >
                      {ERA_LABELS[selectedPerson.era]}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">
                      {connectionCounts[selectedPerson.id] || 0} 연결
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    {selectedPerson.summary}
                  </p>
                  <Link
                    href={`/persons/${selectedPerson.id}`}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    상세 페이지 &rarr;
                  </Link>
                </div>

                {/* Connections List */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    연결 관계 ({nodeRelationships.length})
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {nodeRelationships.map((rel: any, i: number) => {
                      const other = personMap.get(rel.other);
                      if (!other) return null;
                      const typeLabel =
                        RELATIONSHIP_LABELS[rel.type] || rel.type;
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-white/5 border-l-2 cursor-pointer hover:bg-white/10 transition-colors"
                          style={{
                            borderLeftColor: getRelColor(rel.type, 0.6),
                          }}
                          onClick={() => focusOnNode(rel.other)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor: getCategoryHexColor(other.category),
                                }}
                              />
                              <span className="text-sm font-medium text-white">
                                {rel.direction === "outgoing" ? "\u2192 " : "\u2190 "}
                                {other.name.ko}
                              </span>
                            </div>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: getRelColor(rel.type, 0.2),
                                color: getRelColor(rel.type, 1),
                              }}
                            >
                              {typeLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {rel.description}
                          </p>
                        </div>
                      );
                    })}
                    {nodeRelationships.length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-4">
                        연결된 관계가 없습니다
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Stats */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    인드라망 통계
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-2xl font-bold text-white">
                        {allPersons.length}
                      </div>
                      <div className="text-xs text-gray-400">인물</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-2xl font-bold text-white">
                        {allRelationships.length}
                      </div>
                      <div className="text-xs text-gray-400">연결</div>
                    </div>
                    {CATEGORY_FILTERS.slice(1).map((c) => {
                      const count = allPersons.filter(
                        (p: any) => p.category === c.key
                      ).length;
                      return (
                        <div
                          key={c.key}
                          className="p-2 rounded-lg text-center"
                          style={{ backgroundColor: c.color + "15" }}
                        >
                          <div
                            className="text-lg font-bold"
                            style={{ color: c.color }}
                          >
                            {count}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {c.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Most Connected */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3">
                    가장 많이 연결된 인물
                  </h3>
                  <div className="space-y-2">
                    {allPersons
                      .map((p: any) => ({
                        ...p,
                        connections: connectionCounts[p.id] || 0,
                      }))
                      .sort((a: any, b: any) => b.connections - a.connections)
                      .slice(0, 15)
                      .map((p: any) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => focusOnNode(p.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{
                                backgroundColor:
                                  getCategoryHexColor(p.category) + "30",
                                color: getCategoryHexColor(p.category),
                              }}
                            >
                              {p.name.ko[0]}
                            </div>
                            <span className="text-sm text-gray-300">
                              {p.name.ko}
                            </span>
                            <span className="text-[10px] text-gray-600">
                              {getCategoryLabel(p.category)}
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
                    <li>
                      - 노드를 클릭하면 해당 인물의 1, 2차 관계망이 강조됩니다
                    </li>
                    <li>
                      - 마우스 휠로 확대/축소, 드래그로 화면을 이동합니다
                    </li>
                    <li>
                      - 노드를 드래그하여 위치를 직접 조정할 수 있습니다
                    </li>
                    <li>
                      - 카테고리/시대/관계 필터로 특정 영역만 볼 수 있습니다
                    </li>
                    <li>
                      - 검색으로 특정 인물을 바로 찾아 포커스할 수 있습니다
                    </li>
                    <li>
                      - 노드 색상은 카테고리를, 크기는 연결 수를 나타냅니다
                    </li>
                    <li>
                      - 선의 색상은 관계 유형(영향, 대립, 사제 등)을 나타냅니다
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
