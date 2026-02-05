"use client";

import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";

// ── Types ──

interface NodeData {
  id: string;
  name: { ko: string; en: string };
  nodeType: "person" | "entity";
  category: string;
  entityType?: string;
  era: string;
  connections: number;
  val: number;
}

interface LinkData {
  source: string;
  target: string;
  type: string;
  strength: number;
  description: string;
}

interface IndraNet3DProps {
  nodes: NodeData[];
  links: LinkData[];
  width: number;
  height: number;
  onNodeClick?: (nodeId: string) => void;
  selectedNode?: string | null;
}

// ── Colors ──

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

const RELATIONSHIP_COLORS: Record<string, string> = {
  influenced: "#60A5FA",
  teacher_student: "#60A5FA",
  opposed: "#F87171",
  criticized: "#F87171",
  developed: "#4ADE80",
  parallel: "#C084FC",
  contextual: "#FACC15",
  contemporary: "#94A3B8",
  collaborated: "#FB923C",
  founded: "#34D399",
  advocated: "#34D399",
  authored: "#818CF8",
  member_of: "#A855F7",
  participated: "#FBBF24",
  caused: "#EF4444",
  affected_by: "#94A3B8",
  belongs_to: "#A855F7",
  preceded: "#FBBF24",
  part_of: "#A855F7",
  opposed_to: "#F87171",
  evolved_into: "#4ADE80",
};

function getNodeColor(node: NodeData): string {
  if (node.nodeType === "entity") {
    return ENTITY_TYPE_COLORS[node.entityType || "concept"] || "#9C8B73";
  }
  return CATEGORY_COLORS[node.category] || "#7A6B55";
}

function getLinkColor(link: LinkData): string {
  return RELATIONSHIP_COLORS[link.type] || "#B8860B";
}

// ── Component ──

export default function IndraNet3D({
  nodes,
  links,
  width,
  height,
  onNodeClick,
  selectedNode,
}: IndraNet3DProps) {
  const fgRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Build graph data
  const graphData = useMemo(() => {
    const nodeIdSet = new Set(nodes.map((n) => n.id));
    const filteredLinks = links.filter(
      (l) => nodeIdSet.has(l.source) && nodeIdSet.has(l.target)
    );
    return { nodes: [...nodes], links: [...filteredLinks] };
  }, [nodes, links]);

  // Highlight connected nodes
  const connectedSet = useMemo(() => {
    const set = new Set<string>();
    if (!selectedNode && !hoveredNode) return set;
    const focusId = selectedNode || hoveredNode;
    set.add(focusId!);
    links.forEach((l) => {
      const src = typeof l.source === "object" ? (l.source as any).id : l.source;
      const tgt = typeof l.target === "object" ? (l.target as any).id : l.target;
      if (src === focusId) set.add(tgt);
      if (tgt === focusId) set.add(src);
    });
    return set;
  }, [selectedNode, hoveredNode, links]);

  // Sphere layout force
  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;

    // Add radial force to push nodes onto a sphere surface
    const sphereRadius = Math.min(width, height) * 0.4;
    fg.d3Force("radial",
      (function() {
        // Custom radial force in 3D
        let nodes: any[] = [];
        function force(alpha: number) {
          for (const node of nodes) {
            const x = node.x || 0;
            const y = node.y || 0;
            const z = node.z || 0;
            const dist = Math.sqrt(x * x + y * y + z * z) || 1;
            const factor = (sphereRadius - dist) / dist * alpha * 0.3;
            node.vx = (node.vx || 0) + x * factor;
            node.vy = (node.vy || 0) + y * factor;
            node.vz = (node.vz || 0) + z * factor;
          }
        }
        force.initialize = function(_nodes: any[]) { nodes = _nodes; };
        return force;
      })()
    );

    // Weaker default forces for sphere layout
    fg.d3Force("charge")?.strength(-30).distanceMax(300);
    fg.d3Force("link")?.distance((l: any) => 40 + (3 - (l.strength || 1)) * 20);
    fg.d3Force("center")?.strength(0.02);
  }, [width, height]);

  // Camera auto-rotate
  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;

    // Set initial camera distance
    const sphereRadius = Math.min(width, height) * 0.4;
    fg.cameraPosition({ z: sphereRadius * 3 });

    // Auto-rotate slowly
    let angle = 0;
    const interval = setInterval(() => {
      if (selectedNode || hoveredNode) return; // stop rotating when interacting
      angle += 0.002;
      const dist = sphereRadius * 3;
      fg.cameraPosition({
        x: dist * Math.sin(angle),
        z: dist * Math.cos(angle),
      });
    }, 30);

    return () => clearInterval(interval);
  }, [width, height, selectedNode, hoveredNode]);

  // Node click handler
  const handleNodeClick = useCallback(
    (node: any) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
      // Focus on clicked node
      if (fgRef.current) {
        const distance = 200;
        const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
        fgRef.current.cameraPosition(
          { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
          node,
          1000
        );
      }
    },
    [onNodeClick]
  );

  // Custom node rendering with Three.js
  const nodeThreeObject = useCallback(
    (node: any) => {
      const color = getNodeColor(node);
      const isHighlighted = connectedSet.size === 0 || connectedSet.has(node.id);
      const isSelected = node.id === selectedNode;
      const opacity = isHighlighted ? 1 : 0.15;
      const size = Math.max(3, Math.min(12, 2 + Math.sqrt(node.connections || 1) * 1.8));

      const group = new THREE.Group();

      if (node.nodeType === "entity") {
        // Diamond (octahedron) for entities
        const geometry = new THREE.OctahedronGeometry(size);
        const material = new THREE.MeshLambertMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: opacity,
        });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      } else {
        // Sphere for persons
        const geometry = new THREE.SphereGeometry(size, 16, 12);
        const material = new THREE.MeshLambertMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: opacity,
        });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      }

      // Glow ring for selected node
      if (isSelected) {
        const glowGeometry = new THREE.RingGeometry(size + 3, size + 5, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xb8860b,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glowMesh);
      }

      // Label sprite for significant nodes
      if (size >= 5 || isSelected || (connectedSet.has(node.id) && connectedSet.size > 0)) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = 256;
          canvas.height = 64;
          ctx.font = `bold 24px Pretendard, -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Background
          ctx.fillStyle = "rgba(250,246,233,0.85)";
          const textWidth = ctx.measureText(node.name.ko).width;
          ctx.fillRect(128 - textWidth / 2 - 6, 16, textWidth + 12, 32);
          // Text
          ctx.fillStyle = isSelected ? "#B8860B" : "#2C2416";
          ctx.fillText(node.name.ko, 128, 32);
        }
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: isHighlighted ? 0.9 : 0.3,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(40, 10, 1);
        sprite.position.set(0, size + 8, 0);
        group.add(sprite);
      }

      return group;
    },
    [connectedSet, selectedNode]
  );

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      nodeId="id"
      nodeVal="val"
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      linkColor={(link: any) => {
        const isHighlighted =
          connectedSet.size > 0 &&
          (connectedSet.has(typeof link.source === "object" ? link.source.id : link.source) ||
            connectedSet.has(typeof link.target === "object" ? link.target.id : link.target));
        const color = getLinkColor(link);
        if (connectedSet.size === 0) return color + "40";
        return isHighlighted ? color + "AA" : color + "10";
      }}
      linkWidth={(link: any) => {
        const isHighlighted =
          connectedSet.size > 0 &&
          (connectedSet.has(typeof link.source === "object" ? link.source.id : link.source) ||
            connectedSet.has(typeof link.target === "object" ? link.target.id : link.target));
        return isHighlighted ? (link.strength || 1) * 1.5 : 0.3;
      }}
      linkOpacity={0.6}
      linkDirectionalParticles={(link: any) => {
        const isHighlighted =
          connectedSet.size > 0 &&
          (connectedSet.has(typeof link.source === "object" ? link.source.id : link.source) ||
            connectedSet.has(typeof link.target === "object" ? link.target.id : link.target));
        return isHighlighted ? 2 : 0;
      }}
      linkDirectionalParticleWidth={2}
      linkDirectionalParticleSpeed={0.005}
      onNodeClick={handleNodeClick}
      onNodeHover={(node: any) => setHoveredNode(node ? node.id : null)}
      enableNodeDrag={true}
      enableNavigationControls={true}
      showNavInfo={false}
    />
  );
}
