// ============================================================
// Sophia Atlas — Knowledge Graph Engine v6.0
// 인드라망의 두뇌: 중심성, 커뮤니티, 경로, 유사도, 시간 추론
// ============================================================

import {
  buildAdjacencyList,
  findShortestPath,
  getNeighborhood,
  calculateDegreeCentrality,
  getConnectedComponents,
  getRelationTypesBetween,
} from "./graph-utils";
import type { Relationship } from "@/types/index";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface KnowledgeNode {
  id: string;
  name: { ko: string; en: string };
  nodeType: "person" | "entity";
  category: string;
  entityType?: string;
  era: string;
  period?: { start: number; end: number };
  tags?: string[];
  connections: number;
}

export interface PathResult {
  path: string[];
  length: number;
  relationships: { source: string; target: string; type: string; description: string }[];
}

export interface CommunityResult {
  communityId: number;
  members: string[];
  label: string; // auto-generated label from dominant category/era
  size: number;
}

export interface ComparisonResult {
  nodeA: string;
  nodeB: string;
  sharedConnections: string[];
  shortestPath: PathResult | null;
  jaccardSimilarity: number;
  commonCommunity: boolean;
  sharedTags: string[];
  eraOverlap: boolean;
  relationshipsBetween: Relationship[];
}

export interface CentralityScores {
  degree: Map<string, number>;
  betweenness: Map<string, number>;
  pageRank: Map<string, number>;
}

export interface TemporalSlice {
  era: string;
  yearRange: [number, number];
  nodeIds: string[];
  edgeCount: number;
}

// ────────────────────────────────────────────────────────────
// Knowledge Graph Engine
// ────────────────────────────────────────────────────────────

export class KnowledgeGraphEngine {
  private nodes: Map<string, KnowledgeNode>;
  private relationships: Relationship[];
  private adjList: Map<string, Set<string>>;

  // Pre-computed metrics (lazy)
  private _centrality: CentralityScores | null = null;
  private _communities: CommunityResult[] | null = null;
  private _components: string[][] | null = null;

  constructor(nodes: KnowledgeNode[], relationships: Relationship[]) {
    this.nodes = new Map(nodes.map((n) => [n.id, n]));
    this.relationships = relationships.filter(
      (r) => nodes.some((n) => n.id === r.source) && nodes.some((n) => n.id === r.target)
    );
    this.adjList = buildAdjacencyList(this.relationships);
  }

  // ── Getters ──

  getNode(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): KnowledgeNode[] {
    return [...this.nodes.values()];
  }

  getRelationships(): Relationship[] {
    return this.relationships;
  }

  // ── Path Finding ──

  findPath(startId: string, endId: string): PathResult | null {
    const path = findShortestPath(this.adjList, startId, endId);
    if (!path) return null;

    const relationships: PathResult["relationships"] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const rels = getRelationTypesBetween(this.relationships, path[i], path[i + 1]);
      if (rels.length > 0) {
        relationships.push({
          source: path[i],
          target: path[i + 1],
          type: rels[0].type,
          description: rels[0].description || "",
        });
      }
    }

    return { path, length: path.length - 1, relationships };
  }

  /** Find all paths up to maxLength between two nodes */
  findAllPaths(startId: string, endId: string, maxLength: number = 4): PathResult[] {
    const results: PathResult[] = [];
    const visited = new Set<string>();

    const dfs = (current: string, target: string, path: string[], depth: number) => {
      if (depth > maxLength) return;
      if (current === target && path.length > 1) {
        const relationships: PathResult["relationships"] = [];
        for (let i = 0; i < path.length - 1; i++) {
          const rels = getRelationTypesBetween(this.relationships, path[i], path[i + 1]);
          if (rels.length > 0) {
            relationships.push({
              source: path[i],
              target: path[i + 1],
              type: rels[0].type,
              description: rels[0].description || "",
            });
          }
        }
        results.push({ path: [...path], length: path.length - 1, relationships });
        return;
      }

      const neighbors = this.adjList.get(current);
      if (!neighbors) return;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          path.push(neighbor);
          dfs(neighbor, target, path, depth + 1);
          path.pop();
          visited.delete(neighbor);
        }
      }
    };

    visited.add(startId);
    dfs(startId, endId, [startId], 0);
    results.sort((a, b) => a.length - b.length);
    return results.slice(0, 10); // top 10 paths
  }

  // ── Centrality Analysis ──

  getCentrality(): CentralityScores {
    if (this._centrality) return this._centrality;

    const degree = calculateDegreeCentrality(this.adjList);
    const betweenness = this.calculateBetweenness();
    const pageRank = this.calculatePageRank();

    this._centrality = { degree, betweenness, pageRank };
    return this._centrality;
  }

  /** Betweenness centrality — how many shortest paths pass through each node */
  private calculateBetweenness(): Map<string, number> {
    const betweenness = new Map<string, number>();
    const nodeIds = [...this.adjList.keys()];

    for (const id of nodeIds) {
      betweenness.set(id, 0);
    }

    // Sample-based approximation for performance (random 200 pairs)
    const sampleSize = Math.min(200, nodeIds.length);
    const sampled = nodeIds.length <= sampleSize
      ? nodeIds
      : nodeIds.sort(() => Math.random() - 0.5).slice(0, sampleSize);

    for (const source of sampled) {
      // BFS from source
      const dist = new Map<string, number>();
      const sigma = new Map<string, number>(); // # shortest paths
      const pred = new Map<string, string[]>();
      const stack: string[] = [];
      const queue: string[] = [source];

      for (const v of nodeIds) {
        dist.set(v, -1);
        sigma.set(v, 0);
        pred.set(v, []);
      }
      dist.set(source, 0);
      sigma.set(source, 1);

      while (queue.length > 0) {
        const v = queue.shift()!;
        stack.push(v);
        const neighbors = this.adjList.get(v);
        if (!neighbors) continue;

        for (const w of neighbors) {
          // First visit?
          if (dist.get(w)! < 0) {
            queue.push(w);
            dist.set(w, dist.get(v)! + 1);
          }
          // Shortest path to w via v?
          if (dist.get(w) === dist.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
            pred.get(w)!.push(v);
          }
        }
      }

      // Back-propagation
      const delta = new Map<string, number>();
      for (const v of nodeIds) delta.set(v, 0);

      while (stack.length > 0) {
        const w = stack.pop()!;
        for (const v of pred.get(w)!) {
          const d = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
          delta.set(v, delta.get(v)! + d);
        }
        if (w !== source) {
          betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
        }
      }
    }

    // Normalize
    const n = nodeIds.length;
    const scale = n > 2 ? 1 / ((n - 1) * (n - 2)) : 1;
    const normFactor = nodeIds.length <= sampleSize ? 1 : nodeIds.length / sampleSize;

    for (const [id, val] of betweenness) {
      betweenness.set(id, val * scale * normFactor);
    }

    return betweenness;
  }

  /** PageRank — iterative eigenvector centrality variant */
  private calculatePageRank(damping: number = 0.85, iterations: number = 30): Map<string, number> {
    const nodeIds = [...this.adjList.keys()];
    const n = nodeIds.length;
    if (n === 0) return new Map();

    const rank = new Map<string, number>();
    const initial = 1 / n;
    for (const id of nodeIds) rank.set(id, initial);

    for (let iter = 0; iter < iterations; iter++) {
      const newRank = new Map<string, number>();
      for (const id of nodeIds) newRank.set(id, (1 - damping) / n);

      for (const id of nodeIds) {
        const neighbors = this.adjList.get(id);
        if (!neighbors || neighbors.size === 0) {
          // Dangling node: distribute evenly
          const share = rank.get(id)! * damping / n;
          for (const j of nodeIds) newRank.set(j, newRank.get(j)! + share);
        } else {
          const share = rank.get(id)! * damping / neighbors.size;
          for (const neighbor of neighbors) {
            newRank.set(neighbor, newRank.get(neighbor)! + share);
          }
        }
      }

      for (const [id, val] of newRank) rank.set(id, val);
    }

    return rank;
  }

  // ── Community Detection (Label Propagation) ──

  getCommunities(): CommunityResult[] {
    if (this._communities) return this._communities;

    const nodeIds = [...this.adjList.keys()];
    const labels = new Map<string, number>();

    // Initialize: each node is its own community
    nodeIds.forEach((id, i) => labels.set(id, i));

    // Iterate until convergence
    const maxIter = 30;
    for (let iter = 0; iter < maxIter; iter++) {
      let changed = false;
      // Shuffle for randomized order
      const shuffled = [...nodeIds].sort(() => Math.random() - 0.5);

      for (const nodeId of shuffled) {
        const neighbors = this.adjList.get(nodeId);
        if (!neighbors || neighbors.size === 0) continue;

        // Count neighbor labels (weighted by edge strength)
        const labelCounts = new Map<number, number>();
        for (const neighbor of neighbors) {
          const label = labels.get(neighbor)!;
          // Weight by relationship strength
          const rels = getRelationTypesBetween(this.relationships, nodeId, neighbor);
          const weight = rels.length > 0 ? (rels[0].strength || 1) : 1;
          labelCounts.set(label, (labelCounts.get(label) || 0) + weight);
        }

        // Pick most frequent label
        let maxCount = 0;
        let maxLabel = labels.get(nodeId)!;
        for (const [label, count] of labelCounts) {
          if (count > maxCount) {
            maxCount = count;
            maxLabel = label;
          }
        }

        if (maxLabel !== labels.get(nodeId)) {
          labels.set(nodeId, maxLabel);
          changed = true;
        }
      }

      if (!changed) break;
    }

    // Aggregate communities
    const communityMap = new Map<number, string[]>();
    for (const [nodeId, label] of labels) {
      if (!communityMap.has(label)) communityMap.set(label, []);
      communityMap.get(label)!.push(nodeId);
    }

    this._communities = [...communityMap.entries()]
      .map(([communityId, members]) => {
        // Auto-generate label from dominant category/era
        const catCounts: Record<string, number> = {};
        const eraCounts: Record<string, number> = {};
        for (const id of members) {
          const node = this.nodes.get(id);
          if (node) {
            catCounts[node.category] = (catCounts[node.category] || 0) + 1;
            eraCounts[node.era] = (eraCounts[node.era] || 0) + 1;
          }
        }
        const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "mixed";
        const topEra = Object.entries(eraCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "mixed";

        return {
          communityId,
          members,
          label: `${topCat}-${topEra}`,
          size: members.length,
        };
      })
      .filter((c) => c.size >= 2) // Skip singletons
      .sort((a, b) => b.size - a.size);

    return this._communities;
  }

  // ── Comparison Engine ──

  compare(nodeAId: string, nodeBId: string): ComparisonResult | null {
    const nodeA = this.nodes.get(nodeAId);
    const nodeB = this.nodes.get(nodeBId);
    if (!nodeA || !nodeB) return null;

    const neighborsA = this.adjList.get(nodeAId) || new Set<string>();
    const neighborsB = this.adjList.get(nodeBId) || new Set<string>();

    // Shared connections
    const sharedConnections = [...neighborsA].filter((n) => neighborsB.has(n));

    // Jaccard similarity
    const union = new Set([...neighborsA, ...neighborsB]);
    const jaccardSimilarity = union.size > 0 ? sharedConnections.length / union.size : 0;

    // Shortest path
    const shortestPath = this.findPath(nodeAId, nodeBId);

    // Common community
    const communities = this.getCommunities();
    const communityA = communities.find((c) => c.members.includes(nodeAId));
    const communityB = communities.find((c) => c.members.includes(nodeBId));
    const commonCommunity = !!(communityA && communityB && communityA.communityId === communityB.communityId);

    // Shared tags
    const tagsA = new Set(nodeA.tags || []);
    const sharedTags = (nodeB.tags || []).filter((t) => tagsA.has(t));

    // Era overlap
    const eraOverlap = nodeA.era === nodeB.era;

    // Direct relationships
    const relationshipsBetween = getRelationTypesBetween(this.relationships, nodeAId, nodeBId);

    return {
      nodeA: nodeAId,
      nodeB: nodeBId,
      sharedConnections,
      shortestPath,
      jaccardSimilarity,
      commonCommunity,
      sharedTags,
      eraOverlap,
      relationshipsBetween,
    };
  }

  // ── Temporal Analysis ──

  getTemporalSlices(): TemporalSlice[] {
    const eraRanges: Record<string, [number, number]> = {
      ancient: [-3000, 500],
      medieval: [500, 1500],
      modern: [1500, 1900],
      contemporary: [1900, 2100],
    };

    return Object.entries(eraRanges).map(([era, yearRange]) => {
      const nodeIds = [...this.nodes.values()]
        .filter((n) => n.era === era)
        .map((n) => n.id);

      const nodeSet = new Set(nodeIds);
      const edgeCount = this.relationships.filter(
        (r) => nodeSet.has(r.source) && nodeSet.has(r.target)
      ).length;

      return { era, yearRange, nodeIds, edgeCount };
    });
  }

  /** Get nodes active during a specific time range */
  getNodesInTimeRange(startYear: number, endYear: number): KnowledgeNode[] {
    return [...this.nodes.values()].filter((n) => {
      if (!n.period) return false;
      // Node overlaps with time range
      return n.period.start <= endYear && n.period.end >= startYear;
    });
  }

  // ── Influence Chain ──

  /** Find the longest influence chain (directed path) from a node */
  getInfluenceChain(nodeId: string, direction: "forward" | "backward" = "forward"): string[] {
    const directedAdj = new Map<string, Set<string>>();

    for (const rel of this.relationships) {
      if (rel.type !== "influenced" && rel.type !== "teacher_student" && rel.type !== "developed") continue;

      const from = direction === "forward" ? rel.source : rel.target;
      const to = direction === "forward" ? rel.target : rel.source;

      if (!directedAdj.has(from)) directedAdj.set(from, new Set());
      directedAdj.get(from)!.add(to);
    }

    // DFS for longest path
    let longestPath: string[] = [nodeId];
    const visited = new Set<string>([nodeId]);

    const dfs = (current: string, path: string[]) => {
      if (path.length > longestPath.length) {
        longestPath = [...path];
      }

      const neighbors = directedAdj.get(current);
      if (!neighbors) return;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          path.push(neighbor);
          dfs(neighbor, path);
          path.pop();
          visited.delete(neighbor);
        }
      }
    };

    dfs(nodeId, [nodeId]);
    return longestPath;
  }

  // ── Top Nodes ──

  getTopNodes(metric: "degree" | "betweenness" | "pageRank", topN: number = 20): { id: string; score: number }[] {
    const centrality = this.getCentrality();
    const scores = centrality[metric];

    return [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([id, score]) => ({ id, score }));
  }

  // ── Bridge Nodes (connect different communities) ──

  getBridgeNodes(topN: number = 10): { id: string; communities: number[] }[] {
    const communities = this.getCommunities();
    const nodeCommunities = new Map<string, Set<number>>();

    for (const community of communities) {
      for (const member of community.members) {
        if (!nodeCommunities.has(member)) nodeCommunities.set(member, new Set());
        nodeCommunities.get(member)!.add(community.communityId);
      }
    }

    // Nodes that connect to multiple communities via their neighbors
    const bridgeScores: { id: string; communities: number[] }[] = [];

    for (const [nodeId, neighbors] of this.adjList) {
      const neighborCommunities = new Set<number>();
      for (const neighbor of neighbors) {
        const comms = nodeCommunities.get(neighbor);
        if (comms) {
          for (const c of comms) neighborCommunities.add(c);
        }
      }
      if (neighborCommunities.size >= 2) {
        bridgeScores.push({ id: nodeId, communities: [...neighborCommunities] });
      }
    }

    return bridgeScores
      .sort((a, b) => b.communities.length - a.communities.length)
      .slice(0, topN);
  }
}
