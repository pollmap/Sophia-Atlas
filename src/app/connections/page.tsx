"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import * as d3 from "d3";
import dynamic from "next/dynamic";
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
  Zap,
  Diamond,
  ToggleLeft,
  ToggleRight,
  Box,
  Globe,
  Loader2,
  Route,
  Compass,
  ArrowRight,
  ArrowLeftRight,
  Clock,
} from "lucide-react";

import { KnowledgeGraphEngine, type KnowledgeNode, type PathResult as KGPathResult } from "@/lib/knowledge-graph";

// Dynamic import for 3D graph (no SSR - requires WebGL)
const IndraNet3D = dynamic(
  () => import("@/components/visualization/IndraNet3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[var(--fresco-parchment)]">
        <div className="flex flex-col items-center gap-3 text-[var(--ink-light)]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">3D 인드라망 불러오는 중...</span>
        </div>
      </div>
    ),
  }
);
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
import ppRelData from "@/data/relationships/person-person.json";
import peRelData from "@/data/relationships/person-entity.json";
import eeRelData from "@/data/relationships/entity-entity.json";
import { cn, getCategoryHexColor, getCategoryLabel } from "@/lib/utils";

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
] as any[];

const personMap = new Map<string, any>();
allPersons.forEach((p) => personMap.set(p.id, p));

const entityMap = new Map<string, any>();
allEntities.forEach((e) => entityMap.set(e.id, e));

// Combined lookup: both persons and entities
const nodeDataMap = new Map<string, any>();
allPersons.forEach((p) => nodeDataMap.set(p.id, { ...p, nodeType: "person" }));
allEntities.forEach((e) => nodeDataMap.set(e.id, { ...e, nodeType: "entity" }));

// All relationships - only keep where both ends exist
const allRelationships = [
  ...ppRelData,
  ...peRelData,
  ...eeRelData,
].filter((r: any) => nodeDataMap.has(r.source) && nodeDataMap.has(r.target)) as any[];

// ── Constants ──

const CATEGORY_FILTERS = [
  { key: "all", label: "\uC804\uCCB4", color: "#2C2416", icon: Network },
  { key: "philosopher", label: "\uCCA0\uD559\uC790", color: "#4A5D8A", icon: BookOpen },
  { key: "religious_figure", label: "\uC885\uAD50", color: "#B8860B", icon: Scroll },
  { key: "scientist", label: "\uACFC\uD559\uC790", color: "#5B7355", icon: Atom },
  { key: "historical_figure", label: "\uC5ED\uC0AC", color: "#8B4040", icon: Crown },
  { key: "cultural_figure", label: "\uBB38\uD654", color: "#7A5478", icon: Palette },
];

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
  event: "\uC0AC\uAC74",
  ideology: "\uC0AC\uC0C1",
  movement: "\uC6B4\uB3D9/\uD559\uD30C",
  institution: "\uAE30\uAD00",
  text: "\uACBD\uC804/\uBB38\uD5CC",
  concept: "\uAC1C\uB150",
  nation: "\uAD6D\uAC00",
};

const ERA_LABELS: Record<string, string> = {
  ancient: "\uACE0\uB300",
  medieval: "\uC911\uC138",
  modern: "\uADFC\uB300",
  contemporary: "\uD604\uB300",
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
  preceded: "rgba(251,191,36,{a})",
  part_of: "rgba(168,85,247,{a})",
  opposed_to: "rgba(248,113,113,{a})",
  evolved_into: "rgba(74,222,128,{a})",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  influenced: "\uC601\uD5A5",
  teacher_student: "\uC0AC\uC81C",
  opposed: "\uB300\uB9BD",
  criticized: "\uBE44\uD310",
  developed: "\uBC1C\uC804",
  parallel: "\uC720\uC0AC",
  contextual: "\uB9E5\uB77D",
  contemporary: "\uB3D9\uC2DC\uB300",
  collaborated: "\uD611\uB825",
  founded: "\uCC3D\uC124",
  advocated: "\uC8FC\uCC3D",
  authored: "\uC800\uC220",
  member_of: "\uC18C\uC18D",
  participated: "\uCC38\uC5EC",
  caused: "\uC6D0\uC778",
  affected_by: "\uC601\uD5A5\uBC1B\uC74C",
  belongs_to: "\uC18C\uC18D",
  preceded: "\uC120\uD589",
  part_of: "\uC77C\uBD80",
  opposed_to: "\uB300\uB9BD",
  evolved_into: "\uBC1C\uC804",
};

const REL_TYPE_FILTERS = [
  { key: "all", label: "\uC804\uCCB4" },
  { key: "influenced", label: "\uC601\uD5A5" },
  { key: "teacher_student", label: "\uC0AC\uC81C" },
  { key: "opposed", label: "\uB300\uB9BD" },
  { key: "developed", label: "\uBC1C\uC804" },
  { key: "parallel", label: "\uC720\uC0AC" },
  { key: "collaborated", label: "\uD611\uB825" },
  { key: "founded", label: "\uCC3D\uC124" },
  { key: "authored", label: "\uC800\uC220" },
  { key: "caused", label: "\uC6D0\uC778" },
];

// ── Helpers ──

function getRelColor(type: string, alpha: number): string {
  const template = RELATIONSHIP_TYPE_COLORS[type] || "rgba(184,134,11,{a})";
  return template.replace("{a}", String(alpha));
}

function getNodeColor(node: SimNode): string {
  if (node.nodeType === "entity") {
    return ENTITY_TYPE_COLORS[node.entityType || "concept"] || "#9C8B73";
  }
  return CATEGORY_COLORS[node.category] || "#7A6B55";
}

function getNodeLabel(node: SimNode): string {
  if (node.nodeType === "entity") {
    return ENTITY_TYPE_LABELS[node.entityType || "concept"] || "\uC5D4\uD130\uD2F0";
  }
  return getCategoryLabel(node.category);
}

// Category cluster positions (normalized -1 to 1)
const CATEGORY_ANCHORS: Record<string, { x: number; y: number }> = {
  philosopher: { x: -0.6, y: -0.4 },
  religious_figure: { x: 0.6, y: -0.4 },
  scientist: { x: -0.6, y: 0.5 },
  historical_figure: { x: 0.6, y: 0.5 },
  cultural_figure: { x: 0.0, y: 0.7 },
  // Entity types cluster in the center area
  event: { x: 0.0, y: 0.0 },
  ideology: { x: -0.2, y: -0.1 },
  movement: { x: 0.2, y: -0.1 },
  institution: { x: -0.2, y: 0.15 },
  text: { x: 0.2, y: 0.15 },
  concept: { x: 0.0, y: -0.2 },
};

// ── Types for simulation ──

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  data: any;
  nodeType: "person" | "entity";
  category: string;
  entityType?: string;
  era: string;
  connections: number;
  radius: number;
  name: { ko: string; en: string };
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
  const [showFilters, setShowFilters] = useState(false);
  const [showEntities, setShowEntities] = useState(true);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isSimReady, setIsSimReady] = useState(false);

  // Path finder state
  const [pathMode, setPathMode] = useState(false);
  const [pathStart, setPathStart] = useState<string | null>(null);
  const [pathEnd, setPathEnd] = useState<string | null>(null);
  const [pathResult, setPathResult] = useState<KGPathResult | null>(null);
  const [pathSearch, setPathSearch] = useState("");

  // Time slider state
  const [timeRange, setTimeRange] = useState<[number, number]>([-3000, 2100]);
  const [timeFilterActive, setTimeFilterActive] = useState(false);

  // URL initialization guard
  const [urlInitialized, setUrlInitialized] = useState(false);

  // ── Connection counts ──
  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allRelationships.forEach((r: any) => {
      counts[r.source] = (counts[r.source] || 0) + 1;
      counts[r.target] = (counts[r.target] || 0) + 1;
    });
    return counts;
  }, []);

  // ── Knowledge Graph Engine (for path finding, centrality, etc.) ──
  const engine = useMemo(() => {
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
  }, [connectionCounts]);

  // ── URL param → state (on mount) ──
  useEffect(() => {
    if (urlInitialized || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    const nodeParam = params.get("node");
    const viewParam = params.get("view") as "2d" | "3d" | null;
    const eraParam = params.get("era");
    const categoryParam = params.get("category");
    const relTypeParam = params.get("relType");
    const pathStartParam = params.get("from");
    const pathEndParam = params.get("to");

    if (nodeParam && nodeDataMap.has(nodeParam)) setSelectedNode(nodeParam);
    if (viewParam === "2d" || viewParam === "3d") setViewMode(viewParam);
    if (eraParam && ERA_LABELS[eraParam]) setSelectedEra(eraParam);
    if (categoryParam && CATEGORY_FILTERS.some((c) => c.key === categoryParam)) setSelectedCategory(categoryParam);
    if (relTypeParam && REL_TYPE_FILTERS.some((r) => r.key === relTypeParam)) setSelectedRelType(relTypeParam);
    if (pathStartParam && nodeDataMap.has(pathStartParam) && pathEndParam && nodeDataMap.has(pathEndParam)) {
      setPathMode(true);
      setPathStart(pathStartParam);
      setPathEnd(pathEndParam);
    }

    setUrlInitialized(true);
  }, [urlInitialized]);

  // ── State → URL param (sync) ──
  useEffect(() => {
    if (!urlInitialized || typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (selectedNode) params.set("node", selectedNode);
    if (viewMode !== "2d") params.set("view", viewMode);
    if (selectedEra !== "all") params.set("era", selectedEra);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedRelType !== "all") params.set("relType", selectedRelType);
    if (pathMode && pathStart) params.set("from", pathStart);
    if (pathMode && pathEnd) params.set("to", pathEnd);

    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [selectedNode, viewMode, selectedEra, selectedCategory, selectedRelType, pathMode, pathStart, pathEnd, urlInitialized]);

  // ── Path computation ──
  useEffect(() => {
    if (pathStart && pathEnd && pathStart !== pathEnd) {
      const result = engine.findPath(pathStart, pathEnd);
      setPathResult(result);
    } else {
      setPathResult(null);
    }
  }, [pathStart, pathEnd, engine]);

  // ── Filtered data ──
  const { filteredNodes, filteredLinks } = useMemo(() => {
    // Build person set
    let persons = allPersons;
    if (selectedCategory !== "all") {
      persons = persons.filter((p: any) => p.category === selectedCategory);
    }
    if (selectedEra !== "all") {
      persons = persons.filter((p: any) => p.era === selectedEra);
    }

    // Time range filter
    if (timeFilterActive) {
      persons = persons.filter((p: any) => {
        if (!p.period) return true;
        return p.period.start <= timeRange[1] && p.period.end >= timeRange[0];
      });
    }

    const idSet = new Set(persons.map((p: any) => p.id));

    // Add entities if enabled
    if (showEntities) {
      let entities = allEntities;
      if (selectedEra !== "all") {
        entities = entities.filter((e: any) => e.era === selectedEra);
      }
      if (timeFilterActive) {
        entities = entities.filter((e: any) => {
          if (!e.period) return true;
          return e.period.start <= timeRange[1] && e.period.end >= timeRange[0];
        });
      }
      entities.forEach((e: any) => idSet.add(e.id));
    }

    // Filter relationships
    let rels = allRelationships.filter(
      (r: any) => idSet.has(r.source) && idSet.has(r.target)
    );
    if (selectedRelType !== "all") {
      rels = rels.filter((r: any) => r.type === selectedRelType);
    }

    // Build nodes
    const nodes: SimNode[] = [];

    persons.forEach((p: any) => {
      const conn = connectionCounts[p.id] || 0;
      nodes.push({
        id: p.id,
        data: p,
        nodeType: "person",
        category: p.category,
        era: p.era || "contemporary",
        connections: conn,
        radius: Math.max(4, Math.min(16, 3 + Math.sqrt(conn) * 2.5)),
        name: p.name,
      });
    });

    if (showEntities) {
      let entities = allEntities;
      if (selectedEra !== "all") {
        entities = entities.filter((e: any) => e.era === selectedEra);
      }
      entities.forEach((e: any) => {
        const conn = connectionCounts[e.id] || 0;
        nodes.push({
          id: e.id,
          data: e,
          nodeType: "entity",
          category: e.type,
          entityType: e.type,
          era: e.era || "contemporary",
          connections: conn,
          radius: Math.max(5, Math.min(14, 4 + Math.sqrt(conn) * 2)),
          name: e.name,
        });
      });
    }

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

    return { filteredNodes: nodes, filteredLinks: links };
  }, [selectedCategory, selectedEra, selectedRelType, showEntities, connectionCounts, timeFilterActive, timeRange]);

  // ── 3D graph data ──
  const graph3DData = useMemo(() => {
    const nodes3D = filteredNodes.map((n) => ({
      id: n.id,
      name: n.name,
      nodeType: n.nodeType,
      category: n.category,
      entityType: n.entityType,
      era: n.era,
      connections: n.connections,
      val: Math.max(1, n.connections),
    }));
    const nodeIdSet = new Set(nodes3D.map((n) => n.id));
    const links3D = filteredLinks
      .filter((l) => nodeIdSet.has(l.source as string) && nodeIdSet.has(l.target as string))
      .map((l) => ({
        source: l.source as string,
        target: l.target as string,
        type: l.type,
        strength: l.strength,
        description: l.description,
      }));
    return { nodes: nodes3D, links: links3D };
  }, [filteredNodes, filteredLinks]);

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

    const interFirstLinks: any[] = [];
    allRelationships.forEach((r: any) => {
      if (selectedRelType !== "all" && r.type !== selectedRelType) return;
      if (first.has(r.source) && first.has(r.target)) {
        interFirstLinks.push(r);
      }
    });

    return {
      center: selectedNode,
      first: Array.from(first).filter((id) => nodeDataMap.has(id)),
      second: Array.from(second).filter((id) => nodeDataMap.has(id)),
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

  // ── Search (persons + entities) ──
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: any[] = [];

    allPersons.forEach((p: any) => {
      if (p.name.ko.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q)) {
        results.push({ ...p, nodeType: "person" });
      }
    });
    allEntities.forEach((e: any) => {
      if (e.name.ko.toLowerCase().includes(q) || e.name.en.toLowerCase().includes(q)) {
        results.push({ ...e, nodeType: "entity" });
      }
    });

    return results.slice(0, 12);
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

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Build nodes
    const nodes: SimNode[] = filteredNodes.map((n) => {
      const anchorKey = n.nodeType === "entity" ? (n.entityType || "concept") : n.category;
      const anchor = CATEGORY_ANCHORS[anchorKey] || { x: 0, y: 0 };
      return {
        ...n,
        x: anchor.x * width * 0.3 + width / 2 + (Math.random() - 0.5) * 100,
        y: anchor.y * height * 0.3 + height / 2 + (Math.random() - 0.5) * 100,
      };
    });

    const nodeMap = new Map<string, SimNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const links: SimLink[] = filteredLinks
      .filter((l) => nodeMap.has(l.source as string) && nodeMap.has(l.target as string))
      .map((l) => ({ ...l }));

    nodesRef.current = nodes;
    linksRef.current = links;

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

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
          const anchorKey = d.nodeType === "entity" ? (d.entityType || "concept") : d.category;
          const anchor = CATEGORY_ANCHORS[anchorKey];
          return anchor ? width / 2 + anchor.x * width * 0.3 : width / 2;
        }).strength(0.07)
      )
      .force(
        "y",
        d3.forceY<SimNode>().y((d) => {
          const anchorKey = d.nodeType === "entity" ? (d.entityType || "concept") : d.category;
          const anchor = CATEGORY_ANCHORS[anchorKey];
          return anchor ? height / 2 + anchor.y * height * 0.3 : height / 2;
        }).strength(0.07)
      )
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    simulationRef.current = simulation;
    setIsSimReady(true);

    // Pin selected node
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

    function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
    }

    function draw() {
      if (!ctx) return;
      const transform = transformRef.current;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Fresco ivory background
      ctx.fillStyle = "#FAF6E9";
      ctx.fillRect(0, 0, width, height);

      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      const currentHover = hoveredNodeRef.current;
      const currentSelected = selectedNodeRef.current;
      const currentPathNodes = pathNodesRef.current;
      const currentPathResult = pathResultRef.current;
      const isPathHighlight = currentPathNodes.size > 0;

      // Highlight set
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

        // Path mode highlighting takes priority
        if (isPathHighlight) {
          const sid = source.id;
          const tid = target.id;
          const pathArr = currentPathResult?.path || [];
          let isPathLink = false;
          for (let pi = 0; pi < pathArr.length - 1; pi++) {
            if ((pathArr[pi] === sid && pathArr[pi + 1] === tid) || (pathArr[pi] === tid && pathArr[pi + 1] === sid)) {
              isPathLink = true;
              break;
            }
          }
          if (isPathLink) {
            alpha = 0.85;
            lineWidth = 3;
          } else if (currentPathNodes.has(sid) || currentPathNodes.has(tid)) {
            alpha = 0.12;
            lineWidth = 0.5;
          } else {
            alpha = 0.03;
            lineWidth = 0.2;
          }
        } else if (currentSelected && egoFirstSet) {
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

        if (l.type === "parallel" || l.type === "contextual" || l.type === "opposed_to") {
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
        let strokeColor = "rgba(250,246,233,0.08)";
        let strokeWidth = 0.5;
        let drawLabel = node.radius >= 8;
        let labelAlpha = 0.7;

        // Path mode highlighting takes priority
        if (isPathHighlight) {
          if (currentPathNodes.has(node.id)) {
            nodeAlpha = 1;
            strokeColor = "rgba(212,175,55,0.8)";
            strokeWidth = 2.5;
            drawLabel = true;
            labelAlpha = 1;
          } else {
            nodeAlpha = 0.06;
            strokeWidth = 0;
            drawLabel = false;
          }
        } else if (currentSelected && egoFirstSet) {
          if (node.id === currentSelected) {
            nodeAlpha = 1;
            strokeColor = "rgba(250,246,233,0.8)";
            strokeWidth = 2;
            drawLabel = true;
            labelAlpha = 1;
          } else if (egoFirstSet.has(node.id)) {
            nodeAlpha = 0.9;
            strokeColor = "rgba(250,246,233,0.3)";
            strokeWidth = 1;
            drawLabel = true;
            labelAlpha = 0.85;
          } else if (egoSecondSet?.has(node.id)) {
            nodeAlpha = 0.4;
            strokeColor = "rgba(250,246,233,0.1)";
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
            strokeColor = "rgba(250,246,233,0.5)";
            strokeWidth = 1.5;
            drawLabel = true;
            labelAlpha = 1;
          } else {
            nodeAlpha = 0.15;
            drawLabel = false;
          }
        }

        const color = getNodeColor(node);

        ctx.globalAlpha = nodeAlpha;

        // Draw shape: circle for persons, diamond for entities
        if (node.nodeType === "entity") {
          drawDiamond(ctx, node.x, node.y, node.radius);
          ctx.fillStyle = color;
          ctx.fill();
          if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          if (strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;

        // Glow for selected center node (gold glow)
        if (currentSelected && node.id === currentSelected) {
          if (node.nodeType === "entity") {
            drawDiamond(ctx, node.x, node.y, node.radius + 6);
          } else {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          }
          ctx.strokeStyle = "rgba(184,134,11,0.5)";
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Label
        if (drawLabel) {
          const label = node.name.ko;
          const fontSize = node.id === currentSelected ? 12 : node.radius >= 10 ? 10 : 9;
          ctx.font = `${node.id === currentSelected ? "bold " : ""}${fontSize}px "Pretendard", -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.globalAlpha = labelAlpha;

          // Label text outline (parchment background for readability)
          ctx.fillStyle = "rgba(240,230,211,0.9)";
          ctx.fillText(label, node.x + 0.5, node.y + node.radius + 3.5);
          ctx.fillText(label, node.x - 0.5, node.y + node.radius + 3.5);
          ctx.fillText(label, node.x, node.y + node.radius + 4.5);
          ctx.fillText(label, node.x, node.y + node.radius + 2.5);

          // Label text (ink-dark)
          ctx.fillStyle = `rgba(44,36,22,${labelAlpha})`;
          ctx.fillText(label, node.x, node.y + node.radius + 3);

          ctx.globalAlpha = 1;
        }
      });

      // ── Hover tooltip ──
      if (currentHover && !currentSelected) {
        const hNode = nodeMap.get(currentHover);
        if (hNode && hNode.x != null && hNode.y != null) {
          const name = hNode.name.ko;
          const en = hNode.name.en;
          const label = `${name} (${en})`;
          const typeLabel = hNode.nodeType === "entity"
            ? ENTITY_TYPE_LABELS[hNode.entityType || ""] || "\uC5D4\uD130\uD2F0"
            : getCategoryLabel(hNode.category);
          const connText = `${hNode.connections} \uC5F0\uACB0`;

          ctx.font = 'bold 12px "Pretendard", -apple-system, sans-serif';
          const textW = Math.max(ctx.measureText(label).width, ctx.measureText(connText).width + 60);
          const boxW = textW + 20;
          const boxH = 44;
          const bx = hNode.x - boxW / 2;
          const by = hNode.y - hNode.radius - boxH - 8;

          // Tooltip background (parchment)
          ctx.fillStyle = "rgba(240,230,211,0.95)";
          ctx.beginPath();
          ctx.roundRect(bx, by, boxW, boxH, 4);
          ctx.fill();
          ctx.strokeStyle = "rgba(212,196,171,0.6)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Tooltip text (ink-dark)
          ctx.fillStyle = "#2C2416";
          ctx.font = 'bold 11px "Pretendard", -apple-system, sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, hNode.x, by + 16);

          ctx.fillStyle = getNodeColor(hNode);
          ctx.font = '10px "Pretendard", -apple-system, sans-serif';
          ctx.fillText(
            `${typeLabel} | ${ERA_LABELS[hNode.era] || hNode.era} | ${connText}`,
            hNode.x,
            by + 32
          );
        }
      }

      // Category anchor labels (faint)
      if (!currentSelected && !currentHover) {
        Object.entries(CATEGORY_ANCHORS).forEach(([cat, anchor]) => {
          // Only show person category labels
          const info = CATEGORY_FILTERS.find((c) => c.key === cat);
          if (!info) return;

          const ax = width / 2 + anchor.x * width * 0.35;
          const ay = height / 2 + anchor.y * height * 0.35;

          ctx.font = 'bold 11px "Pretendard", -apple-system, sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = info.color;
          ctx.fillText(info.label, ax, ay);
          ctx.globalAlpha = 1;
        });
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    simulation.on("tick", () => {});

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
        canvasSelection.on(".zoom", null);
      }
    });

    canvas.addEventListener("mouseup", () => {
      if (isDragging && dragNode) {
        if (dragNode.id !== selectedNodeRef.current) {
          dragNode.fx = null;
          dragNode.fy = null;
        }
        isDragging = false;
        dragNode = null;
        simulation.alphaTarget(0);
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
        if (pathModeRef.current) {
          // Path mode: set start or end node
          if (!pathStartRef.current) {
            setPathStart(hit.id);
          } else if (!pathEndRef.current) {
            setPathEnd(hit.id);
          } else {
            // Both set: restart with new start
            setPathStart(hit.id);
            setPathEnd(null);
          }
        } else {
          setSelectedNode((prev) => (prev === hit.id ? null : hit.id));
        }
      }
    });

    canvas.addEventListener("mouseleave", () => {
      hoveredNodeRef.current = null;
      setHoveredNode(null);
    });

    // ── Touch events ──
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNodes, filteredLinks, canvasSize, egoData, viewMode]);

  // Refs to avoid stale closures
  const hoveredNodeRef = useRef<string | null>(null);
  const selectedNodeRef = useRef<string | null>(selectedNode);
  const pathModeRef = useRef(false);
  const pathStartRef = useRef<string | null>(null);
  const pathEndRef = useRef<string | null>(null);
  const pathNodesRef = useRef<Set<string>>(new Set());
  const pathResultRef = useRef<KGPathResult | null>(null);

  useEffect(() => { selectedNodeRef.current = selectedNode; }, [selectedNode]);
  useEffect(() => { hoveredNodeRef.current = hoveredNode; }, [hoveredNode]);
  useEffect(() => { pathModeRef.current = pathMode; }, [pathMode]);
  useEffect(() => { pathStartRef.current = pathStart; }, [pathStart]);
  useEffect(() => { pathEndRef.current = pathEnd; }, [pathEnd]);
  useEffect(() => {
    pathResultRef.current = pathResult;
    pathNodesRef.current = pathResult ? new Set(pathResult.path) : new Set();
  }, [pathResult]);

  // ── Focus search result ──
  const focusOnNode = useCallback(
    (id: string) => {
      setSelectedNode(id);
      setSearchQuery("");

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
    setPathMode(false);
    setPathStart(null);
    setPathEnd(null);
    setPathResult(null);
    setTimeFilterActive(false);

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

    nodesRef.current.forEach((n) => {
      n.fx = null;
      n.fy = null;
    });
    simulationRef.current?.alpha(0.3).restart();
  }, []);

  // ── Detail panel content ──
  const selectedData = selectedNode ? nodeDataMap.get(selectedNode) : null;

  // Stats
  const totalNodes = allPersons.length + (showEntities ? allEntities.length : 0);

  return (
    <div className="min-h-screen bg-[var(--fresco-ivory)]">
      {/* Header */}
      <div className="border-b border-[var(--fresco-shadow)] bg-[var(--fresco-ivory)]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-[#B8860B]/20 to-[#D4A84B]/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-[#B8860B]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--ink-dark)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  인드라망 &mdash; 인류 지성의 연결 지도
                </h1>
                <p className="text-sm text-[var(--ink-light)]" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                  {filteredNodes.length}개 노드, {filteredLinks.length}개 관계
                  {showEntities && (
                    <span className="text-[#7A5478] ml-1">
                      (인물 {allPersons.length} + 주제 {allEntities.length})
                    </span>
                  )}
                  {selectedNode && selectedData && (
                    <span className="text-[#B8860B] ml-2">
                      | {selectedData.name.ko} 중심 보기
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 2D/3D Toggle */}
              <button
                onClick={() => setViewMode(viewMode === "2d" ? "3d" : "2d")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all",
                  viewMode === "3d"
                    ? "bg-[#B8860B]/15 text-[#B8860B] ring-1 ring-[#B8860B]/30"
                    : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
                )}
                title={viewMode === "2d" ? "3D 구체 뷰로 전환" : "2D 평면 뷰로 전환"}
              >
                {viewMode === "2d" ? <Globe className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
                {viewMode === "2d" ? "3D" : "2D"}
              </button>

              {/* Path Finder Toggle */}
              <button
                onClick={() => {
                  setPathMode(!pathMode);
                  if (pathMode) {
                    setPathStart(null);
                    setPathEnd(null);
                    setPathResult(null);
                  } else {
                    setSelectedNode(null);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all",
                  pathMode
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] ring-1 ring-[#D4AF37]/30"
                    : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
                )}
                title="두 노드 사이 경로 탐색"
              >
                <Route className="w-3.5 h-3.5" />
                경로
              </button>

              {/* Time Slider Toggle */}
              <button
                onClick={() => setTimeFilterActive(!timeFilterActive)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all",
                  timeFilterActive
                    ? "bg-[#14B8A6]/15 text-[#14B8A6] ring-1 ring-[#14B8A6]/30"
                    : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
                )}
                title="시간 범위 필터"
              >
                <Clock className="w-3.5 h-3.5" />
                시간
              </button>

              {/* Entity Toggle */}
              <button
                onClick={() => setShowEntities(!showEntities)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all",
                  showEntities
                    ? "bg-[#7A5478]/15 text-[#7A5478] ring-1 ring-[#7A5478]/30"
                    : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
                )}
                title="주제(사건/사상/기관 등) 표시"
              >
                <Diamond className="w-3.5 h-3.5" />
                주제
                {showEntities ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
              </button>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all",
                  showFilters
                    ? "bg-[#B8860B]/15 text-[#B8860B] ring-1 ring-[#B8860B]/30"
                    : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                필터
                {(selectedCategory !== "all" || selectedEra !== "all" || selectedRelType !== "all") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
                )}
              </button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faded)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="인물/주제 검색..."
                  className="pl-9 pr-4 py-2 rounded bg-[var(--fresco-aged)]/50 border border-[var(--fresco-shadow)] text-sm text-[var(--ink-dark)] placeholder-[var(--ink-faded)] w-48 focus:w-64 transition-all focus:outline-none focus:ring-1 focus:ring-[#B8860B]/50"
                  style={{ fontFamily: "'Pretendard', sans-serif" }}
                />
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-[var(--fresco-parchment)] border border-[var(--fresco-shadow)] rounded overflow-hidden z-50 max-h-64 overflow-y-auto">
                    {searchResults.map((item: any) => {
                      const isEntity = item.nodeType === "entity";
                      const color = isEntity
                        ? ENTITY_TYPE_COLORS[item.type] || "#9C8B73"
                        : getCategoryHexColor(item.category);
                      const typeLabel = isEntity
                        ? ENTITY_TYPE_LABELS[item.type] || "주제"
                        : getCategoryLabel(item.category);
                      return (
                        <button
                          key={item.id}
                          onClick={() => focusOnNode(item.id)}
                          className="w-full px-4 py-2 text-left hover:bg-[var(--fresco-aged)]/50 flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              "w-5 h-5 flex items-center justify-center text-[8px] font-bold",
                              isEntity ? "rotate-45 rounded-sm" : "rounded-full"
                            )}
                            style={{
                              backgroundColor: color + "30",
                              color: color,
                            }}
                          >
                            <span className={isEntity ? "-rotate-45" : ""}>
                              {item.name.ko[0]}
                            </span>
                          </div>
                          <span className="text-sm text-[var(--ink-dark)]">{item.name.ko}</span>
                          <span className="text-xs text-[var(--ink-faded)] ml-auto">
                            {typeLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reset - prominent */}
              <button
                onClick={resetView}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[var(--fresco-aged)] hover:bg-[var(--fresco-shadow)] border border-[var(--fresco-shadow)] transition-colors"
                title="전체 초기화"
              >
                <RotateCcw className="w-4 h-4 text-[#B8860B]" />
                <span className="text-xs font-medium text-[var(--ink-dark)] hidden sm:inline">초기화</span>
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 rounded bg-[var(--fresco-aged)]/50 hover:bg-[var(--fresco-aged)] transition-colors"
              >
                <Info className="w-5 h-5 text-[var(--ink-light)]" />
              </button>
            </div>
          </div>

          {showInfo && (
            <div className="mb-3 p-4 rounded bg-[var(--fresco-aged)]/50 border border-[var(--fresco-shadow)]">
              <h3 className="text-sm font-bold text-[#B8860B] mb-2 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                <Sparkles className="w-4 h-4" />
                인드라망(Indra&apos;s Net)이란?
              </h3>
              <p className="text-sm text-[var(--ink-medium)] mb-2" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                불교 화엄경의 개념으로, 모든 존재가 서로를 비추는 무한한 그물입니다.
                인류의 모든 사상은 서로 연결되어 있으며, 하나를 이해하면 전체의 빛이 보입니다.
              </p>
              <p className="text-xs text-[var(--ink-light)]" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                <span className="text-[#B8860B]">&#9679;</span> 원형 = 인물 | <span className="text-[#7A5478]">&#9670;</span> 다이아몬드 = 주제(사건·사상·경전 등) |
                노드 클릭 = 1-2차 관계망 탐색 | 휠 = 확대/축소 | 드래그 = 이동
              </p>
            </div>
          )}

          {/* Filters - collapsible */}
          {showFilters && (
          <div className="flex flex-wrap gap-2 items-center animate-in slide-in-from-top-2 duration-200">
            <span className="text-xs text-[var(--ink-faded)] mr-1" style={{ fontFamily: "'Pretendard', sans-serif" }}>카테고리:</span>
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
                    : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
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

            <span className="text-[var(--fresco-shadow)] mx-1">|</span>
            <span className="text-xs text-[var(--ink-faded)] mr-1" style={{ fontFamily: "'Pretendard', sans-serif" }}>시대:</span>
            <button
              onClick={() => setSelectedEra("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedEra === "all"
                  ? "bg-[var(--fresco-shadow)] text-[var(--ink-dark)] ring-1 ring-[var(--fresco-shadow)]"
                  : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
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
                    : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
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

            <span className="text-[var(--fresco-shadow)] mx-1">|</span>
            <span className="text-xs text-[var(--ink-faded)] mr-1" style={{ fontFamily: "'Pretendard', sans-serif" }}>관계:</span>
            {REL_TYPE_FILTERS.map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedRelType(t.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedRelType === t.key
                    ? "bg-[#B8860B]/20 text-[#B8860B] ring-1 ring-[#B8860B]/50"
                    : "bg-[var(--fresco-aged)]/50 text-[var(--ink-light)] hover:bg-[var(--fresco-aged)]"
                )}
              >
                {t.label}
              </button>
            ))}

            {selectedNode && (
              <button
                onClick={() => setSelectedNode(null)}
                className="px-3 py-1.5 rounded-full text-xs bg-[#8B4040]/15 text-[#8B4040] hover:bg-[#8B4040]/25 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> 선택 해제
              </button>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas Area */}
          <div className="lg:col-span-3" ref={containerRef}>
            <div className="relative bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] overflow-hidden">
              {/* Category + Entity Legend */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 pointer-events-none">
                {CATEGORY_FILTERS.slice(1).map((c) => (
                  <div key={c.key} className="flex items-center gap-1 text-[9px] text-[var(--ink-light)]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </div>
                ))}
                {showEntities && (
                  <>
                    <div className="w-px h-3 bg-[var(--fresco-shadow)] mx-1" />
                    {Object.entries(ENTITY_TYPE_LABELS).map(([type, label]) => (
                      <div key={type} className="flex items-center gap-1 text-[9px] text-[var(--ink-light)]">
                        <div
                          className="w-2 h-2 rotate-45 rounded-[1px]"
                          style={{ backgroundColor: ENTITY_TYPE_COLORS[type] }}
                        />
                        {label}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* 2D Canvas */}
              {viewMode === "2d" && (
                <canvas
                  ref={canvasRef}
                  style={{
                    width: "100%",
                    height: "calc(100vh - 280px)",
                    minHeight: "550px",
                    display: "block",
                  }}
                />
              )}

              {/* 3D View */}
              {viewMode === "3d" && (
                <div style={{ width: "100%", height: "calc(100vh - 280px)", minHeight: "550px" }}>
                  <IndraNet3D
                    nodes={graph3DData.nodes as any}
                    links={graph3DData.links as any}
                    width={canvasSize.width}
                    height={Math.max(550, canvasSize.height)}
                    onNodeClick={(nodeId) => setSelectedNode((prev) => (prev === nodeId ? null : nodeId))}
                    selectedNode={selectedNode}
                  />
                </div>
              )}

              {/* Stats overlay */}
              <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] text-[var(--ink-faded)] pointer-events-none">
                <span>{viewMode === "3d" ? "3D" : "2D"} | 노드: {filteredNodes.length}</span>
                <span>연결: {filteredLinks.length}</span>
                {selectedNode && egoData && (
                  <>
                    <span>1차: {egoData.first.length}</span>
                    <span>2차: {egoData.second.length}</span>
                  </>
                )}
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] text-[var(--ink-faded)] pointer-events-none">
                {pathMode
                  ? "경로 모드: 시작/도착 노드를 클릭하세요"
                  : viewMode === "3d"
                    ? "드래그: 회전 | 스크롤: 확대/축소 | 클릭: 선택"
                    : "스크롤: 확대/축소 | 드래그: 이동 | 클릭: 선택"}
              </div>

              {/* Path mode indicator overlay */}
              {pathMode && (
                <div className="absolute top-3 right-3 z-10 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded p-2 text-xs text-[#D4AF37] font-medium flex items-center gap-2">
                  <Route className="w-3.5 h-3.5" />
                  {!pathStart ? "시작점을 클릭하세요" : !pathEnd ? "도착점을 클릭하세요" : pathResult ? `경로: ${pathResult.length}단계` : "경로 없음"}
                </div>
              )}
            </div>

            {/* Time Slider */}
            {timeFilterActive && (
              <div className="mt-2 p-3 bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)]">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-4 h-4 text-[#14B8A6]" />
                  <span className="text-xs font-medium text-[var(--ink-dark)]">시간 범위</span>
                  <span className="text-xs text-[var(--ink-light)] ml-auto">
                    {timeRange[0] < 0 ? `BC ${Math.abs(timeRange[0])}` : timeRange[0]}
                    {" ~ "}
                    {timeRange[1] < 0 ? `BC ${Math.abs(timeRange[1])}` : timeRange[1]}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min={-3000}
                    max={2100}
                    step={50}
                    value={timeRange[0]}
                    onChange={(e) => setTimeRange([parseInt(e.target.value), timeRange[1]])}
                    className="w-full accent-[#14B8A6] h-1"
                  />
                  <input
                    type="range"
                    min={-3000}
                    max={2100}
                    step={50}
                    value={timeRange[1]}
                    onChange={(e) => setTimeRange([timeRange[0], parseInt(e.target.value)])}
                    className="w-full accent-[#14B8A6] h-1"
                  />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-[var(--ink-faded)]">
                  <span>BC 3000</span>
                  <span>0</span>
                  <span>500</span>
                  <span>1500</span>
                  <span>2100</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {Object.entries(ERA_LABELS).map(([era, label]) => {
                    const ranges: Record<string, [number, number]> = {
                      ancient: [-3000, 500], medieval: [500, 1500], modern: [1500, 1900], contemporary: [1900, 2100],
                    };
                    return (
                      <button
                        key={era}
                        onClick={() => setTimeRange(ranges[era])}
                        className="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
                        style={{ backgroundColor: ERA_COLORS[era] + "20", color: ERA_COLORS[era] }}
                      >
                        {label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setTimeRange([-3000, 2100])}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--fresco-aged)] text-[var(--ink-light)]"
                  >
                    전체
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Path Finder Panel */}
            {pathMode && (
              <div className="bg-[var(--fresco-parchment)] rounded border border-[#D4AF37]/30 p-5">
                <h3 className="text-sm font-bold text-[#D4AF37] mb-3 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <Route className="w-4 h-4" />
                  경로 탐색기
                </h3>

                {/* Start Node */}
                <div className="mb-3">
                  <label className="text-xs text-[var(--ink-light)] mb-1 block">시작점</label>
                  {pathStart ? (
                    <div className="flex items-center gap-2 p-2 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-sm text-[var(--ink-dark)] flex-1">{nodeDataMap.get(pathStart)?.name.ko || pathStart}</span>
                      <button onClick={() => { setPathStart(null); setPathEnd(null); setPathResult(null); }} className="text-[var(--ink-faded)] hover:text-[var(--ink-dark)]">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-[var(--fresco-aged)]/50 border border-dashed border-[var(--fresco-shadow)] text-xs text-[var(--ink-faded)] text-center">
                      그래프에서 노드를 클릭하세요
                    </div>
                  )}
                </div>

                {/* End Node */}
                <div className="mb-3">
                  <label className="text-xs text-[var(--ink-light)] mb-1 block">도착점</label>
                  {pathEnd ? (
                    <div className="flex items-center gap-2 p-2 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-sm text-[var(--ink-dark)] flex-1">{nodeDataMap.get(pathEnd)?.name.ko || pathEnd}</span>
                      <button onClick={() => { setPathEnd(null); setPathResult(null); }} className="text-[var(--ink-faded)] hover:text-[var(--ink-dark)]">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-[var(--fresco-aged)]/50 border border-dashed border-[var(--fresco-shadow)] text-xs text-[var(--ink-faded)] text-center">
                      {pathStart ? "도착점을 클릭하세요" : "시작점을 먼저 선택하세요"}
                    </div>
                  )}
                </div>

                {/* Swap button */}
                {pathStart && pathEnd && (
                  <button
                    onClick={() => { const tmp = pathStart; setPathStart(pathEnd); setPathEnd(tmp); }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 mb-3 rounded text-xs text-[var(--ink-light)] bg-[var(--fresco-aged)]/50 hover:bg-[var(--fresco-aged)] transition-colors"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    시작/도착 교환
                  </button>
                )}

                {/* Path search */}
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-faded)]" />
                  <input
                    type="text"
                    value={pathSearch}
                    onChange={(e) => setPathSearch(e.target.value)}
                    placeholder="노드 검색..."
                    className="w-full pl-8 pr-3 py-2 rounded bg-[var(--fresco-aged)]/50 border border-[var(--fresco-shadow)] text-xs text-[var(--ink-dark)] placeholder-[var(--ink-faded)] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50"
                  />
                  {pathSearch && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-[var(--fresco-parchment)] border border-[var(--fresco-shadow)] rounded overflow-hidden z-50 max-h-40 overflow-y-auto">
                      {[...allPersons.map((p: any) => ({ ...p, nodeType: "person" })), ...allEntities.map((e: any) => ({ ...e, nodeType: "entity" }))]
                        .filter((item: any) => item.name.ko.toLowerCase().includes(pathSearch.toLowerCase()) || item.name.en.toLowerCase().includes(pathSearch.toLowerCase()))
                        .slice(0, 8)
                        .map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (!pathStart) setPathStart(item.id);
                              else if (!pathEnd) setPathEnd(item.id);
                              setPathSearch("");
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-[var(--fresco-aged)]/50 text-xs flex items-center gap-2"
                          >
                            <span className="text-[var(--ink-dark)]">{item.name.ko}</span>
                            <span className="text-[var(--ink-faded)] ml-auto">{item.name.en}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Path Result */}
                {pathResult && (
                  <div className="mt-3 pt-3 border-t border-[var(--fresco-shadow)]">
                    <div className="text-xs text-[#D4AF37] font-medium mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      경로 발견 ({pathResult.length}단계)
                    </div>
                    <div className="space-y-1">
                      {pathResult.path.map((nodeId, idx) => {
                        const node = nodeDataMap.get(nodeId);
                        if (!node) return null;
                        const rel = idx < pathResult.relationships.length ? pathResult.relationships[idx] : null;
                        return (
                          <div key={nodeId}>
                            <div
                              className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-[var(--fresco-aged)]/50 transition-colors"
                              onClick={() => focusOnNode(nodeId)}
                            >
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ backgroundColor: idx === 0 ? "#D4AF37" : idx === pathResult.path.length - 1 ? "#D4AF37" : "var(--ink-light)" }}>
                                {idx + 1}
                              </div>
                              <span className="text-sm text-[var(--ink-dark)]">{node.name.ko}</span>
                            </div>
                            {rel && (
                              <div className="ml-5 pl-3 border-l-2 border-[#D4AF37]/20 py-1">
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: getRelColor(rel.type, 0.2), color: getRelColor(rel.type, 1) }}>
                                  {RELATIONSHIP_LABELS[rel.type] || rel.type}
                                </span>
                                {rel.description && (
                                  <p className="text-[10px] text-[var(--ink-faded)] mt-0.5 line-clamp-2">{rel.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Compare link */}
                    {pathStart && pathEnd && (
                      <Link
                        href={`/compare?a=${pathStart}&b=${pathEnd}`}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium bg-[#B8860B]/10 text-[#B8860B] hover:bg-[#B8860B]/20 transition-colors"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        두 노드 비교하기
                      </Link>
                    )}
                  </div>
                )}

                {pathStart && pathEnd && !pathResult && (
                  <div className="mt-3 pt-3 border-t border-[var(--fresco-shadow)] text-center">
                    <p className="text-xs text-[var(--ink-faded)]">두 노드 사이에 연결 경로가 없습니다</p>
                  </div>
                )}
              </div>
            )}

            {selectedNode && selectedData ? (
              <>
                {/* Selected Node Info */}
                <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {selectedData.nodeType === "entity" ? (
                      <div
                        className="w-12 h-12 rotate-45 rounded-md flex items-center justify-center text-lg font-bold"
                        style={{
                          backgroundColor: (ENTITY_TYPE_COLORS[selectedData.type] || "#9C8B73") + "30",
                          color: ENTITY_TYPE_COLORS[selectedData.type] || "#9C8B73",
                        }}
                      >
                        <span className="-rotate-45">{selectedData.name.ko[0]}</span>
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{
                          backgroundColor: getCategoryHexColor(selectedData.category) + "30",
                          color: getCategoryHexColor(selectedData.category),
                        }}
                      >
                        {selectedData.name.ko[0]}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-[var(--ink-dark)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {selectedData.name.ko}
                      </h2>
                      <p className="text-sm text-[var(--ink-light)]" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                        {selectedData.name.en}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor:
                          selectedData.nodeType === "entity"
                            ? (ENTITY_TYPE_COLORS[selectedData.type] || "#9C8B73") + "20"
                            : getCategoryHexColor(selectedData.category) + "20",
                        color:
                          selectedData.nodeType === "entity"
                            ? ENTITY_TYPE_COLORS[selectedData.type] || "#9C8B73"
                            : getCategoryHexColor(selectedData.category),
                      }}
                    >
                      {selectedData.nodeType === "entity"
                        ? ENTITY_TYPE_LABELS[selectedData.type] || "주제"
                        : getCategoryLabel(selectedData.category)}
                    </span>
                    {selectedData.era && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: ERA_COLORS[selectedData.era] + "20",
                          color: ERA_COLORS[selectedData.era],
                        }}
                      >
                        {ERA_LABELS[selectedData.era]}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-xs bg-[var(--fresco-aged)]/50 text-[var(--ink-light)]">
                      {connectionCounts[selectedData.id] || 0} 연결
                    </span>
                  </div>
                  <p className="text-sm text-[var(--ink-medium)] leading-relaxed mb-3 line-clamp-4" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                    {selectedData.summary}
                  </p>
                  <Link
                    href={
                      selectedData.nodeType === "entity"
                        ? `/entities/${selectedData.id}`
                        : `/persons/${selectedData.id}`
                    }
                    className="text-sm text-[#B8860B] hover:text-[#D4A84B] transition-colors"
                  >
                    상세 페이지 &rarr;
                  </Link>
                </div>

                {/* Connections List */}
                <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-5">
                  <h3 className="text-sm font-bold text-[var(--ink-dark)] mb-3 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    <Layers className="w-4 h-4 text-[#B8860B]" />
                    연결 관계 ({nodeRelationships.length})
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {nodeRelationships.map((rel: any, i: number) => {
                      const other = nodeDataMap.get(rel.other);
                      if (!other) return null;
                      const typeLabel = RELATIONSHIP_LABELS[rel.type] || rel.type;
                      const isEntity = other.nodeType === "entity";
                      const otherColor = isEntity
                        ? ENTITY_TYPE_COLORS[other.type] || "#9C8B73"
                        : getCategoryHexColor(other.category);
                      return (
                        <div
                          key={i}
                          className="p-3 rounded bg-[var(--fresco-aged)]/50 border-l-2 cursor-pointer hover:bg-[var(--fresco-aged)] transition-colors"
                          style={{ borderLeftColor: getRelColor(rel.type, 0.6) }}
                          onClick={() => focusOnNode(rel.other)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-4 h-4",
                                  isEntity ? "rotate-45 rounded-sm" : "rounded-full"
                                )}
                                style={{ backgroundColor: otherColor }}
                              />
                              <span className="text-sm font-medium text-[var(--ink-dark)]">
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
                          <p className="text-xs text-[var(--ink-light)] line-clamp-2" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                            {rel.description}
                          </p>
                        </div>
                      );
                    })}
                    {nodeRelationships.length === 0 && (
                      <p className="text-xs text-[var(--ink-faded)] text-center py-4">
                        연결된 관계가 없습니다
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Stats */}
                <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-5">
                  <h3 className="text-sm font-bold text-[var(--ink-dark)] mb-3 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    <Sparkles className="w-4 h-4 text-[#B8860B]" />
                    인드라망 통계
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-[var(--fresco-aged)]/50 text-center">
                      <div className="text-2xl font-bold text-[var(--ink-dark)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {allPersons.length}
                      </div>
                      <div className="text-xs text-[var(--ink-light)]">인물</div>
                    </div>
                    <div className="p-3 rounded bg-[var(--fresco-aged)]/50 text-center">
                      <div className="text-2xl font-bold text-[var(--ink-dark)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {allRelationships.length}
                      </div>
                      <div className="text-xs text-[var(--ink-light)]">연결</div>
                    </div>
                    {showEntities && (
                      <div className="p-3 rounded bg-[#7A5478]/10 text-center col-span-2">
                        <div className="text-2xl font-bold text-[#7A5478]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {allEntities.length}
                        </div>
                        <div className="text-xs text-[var(--ink-light)]">주제 (사건·사상·경전 등)</div>
                      </div>
                    )}
                    {CATEGORY_FILTERS.slice(1).map((c) => {
                      const count = allPersons.filter(
                        (p: any) => p.category === c.key
                      ).length;
                      return (
                        <div
                          key={c.key}
                          className="p-2 rounded text-center"
                          style={{ backgroundColor: c.color + "15" }}
                        >
                          <div className="text-lg font-bold" style={{ color: c.color, fontFamily: "'Cormorant Garamond', serif" }}>
                            {count}
                          </div>
                          <div className="text-[10px] text-[var(--ink-light)]">{c.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Most Connected */}
                <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-5">
                  <h3 className="text-sm font-bold text-[var(--ink-dark)] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    가장 많이 연결된 노드
                  </h3>
                  <div className="space-y-2">
                    {[...allPersons.map((p: any) => ({ ...p, nodeType: "person" })),
                      ...(showEntities ? allEntities.map((e: any) => ({ ...e, nodeType: "entity" })) : [])]
                      .map((item: any) => ({
                        ...item,
                        connections: connectionCounts[item.id] || 0,
                      }))
                      .sort((a: any, b: any) => b.connections - a.connections)
                      .slice(0, 15)
                      .map((item: any) => {
                        const isEntity = item.nodeType === "entity";
                        const color = isEntity
                          ? ENTITY_TYPE_COLORS[item.type] || "#9C8B73"
                          : getCategoryHexColor(item.category);
                        const typeLabel = isEntity
                          ? ENTITY_TYPE_LABELS[item.type] || "주제"
                          : getCategoryLabel(item.category);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-[var(--fresco-aged)]/50 cursor-pointer transition-colors"
                            onClick={() => focusOnNode(item.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-6 h-6 flex items-center justify-center text-[10px] font-bold",
                                  isEntity ? "rotate-45 rounded-sm" : "rounded-full"
                                )}
                                style={{
                                  backgroundColor: color + "30",
                                  color: color,
                                }}
                              >
                                <span className={isEntity ? "-rotate-45" : ""}>
                                  {item.name.ko[0]}
                                </span>
                              </div>
                              <span className="text-sm text-[var(--ink-medium)]">
                                {item.name.ko}
                              </span>
                              <span className="text-[10px] text-[var(--ink-faded)]">
                                {typeLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-[var(--ink-faded)]">
                                {item.connections}
                              </span>
                              <Network className="w-3 h-3 text-[var(--ink-faded)]" />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Guide */}
                <div className="bg-[var(--fresco-parchment)] rounded border border-[var(--fresco-shadow)] p-5">
                  <h3 className="text-sm font-bold text-[var(--ink-dark)] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    사용 가이드
                  </h3>
                  <ul className="text-xs text-[var(--ink-light)] space-y-1.5" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                    <li>- <span className="text-[#B8860B]">&#9679;</span> 원형 = 인물, <span className="text-[#7A5478]">&#9670;</span> 다이아몬드 = 주제</li>
                    <li>- 노드 클릭 시 1, 2차 관계망이 강조됩니다</li>
                    <li>- 마우스 휠로 확대/축소, 드래그로 이동</li>
                    <li>- 노드를 드래그하여 위치 조정 가능</li>
                    <li>- 카테고리/시대/관계 필터로 원하는 영역만 탐색</li>
                    <li>- 노드 색상 = 카테고리/유형, 크기 = 연결 수</li>
                    <li>- 선 색상 = 관계 유형 (영향/대립/사제/창설 등)</li>
                    <li>- 주제 토글로 사건·사상·경전 노드 표시/숨기기</li>
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
