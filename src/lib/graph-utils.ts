// ============================================================
// Sophia Atlas - Graph Computation Utilities
// 인드라망 시각화 및 그래프 분석을 위한 유틸리티
// ============================================================

import type {
  Person,
  PersonCategory,
  Era,
  Entity,
  EntityType,
  Relationship,
  RelationshipStrength,
  GraphNode,
  GraphEdge,
  PersonRelationType,
} from "@/types/index";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

/** 그래프 필터 옵션 */
export interface GraphFilter {
  categories?: PersonCategory[];
  eras?: Era[];
  entityTypes?: EntityType[];
  relationTypes?: string[];
  centerNodeId?: string;
  depth?: number;
}

/** buildGraphData 반환 타입 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ────────────────────────────────────────────────────────────
// Adjacency List
// ────────────────────────────────────────────────────────────

/**
 * 관계 목록으로부터 인접 리스트(adjacency list)를 구성한다.
 * 방향 무관하게 양방향 엣지를 추가한다(undirected view).
 * 특정 방향성이 필요하면 별도 함수 사용.
 */
export function buildAdjacencyList(
  relationships: Relationship[]
): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();

  for (const rel of relationships) {
    if (!adj.has(rel.source)) {
      adj.set(rel.source, new Set());
    }
    if (!adj.has(rel.target)) {
      adj.set(rel.target, new Set());
    }
    adj.get(rel.source)!.add(rel.target);
    adj.get(rel.target)!.add(rel.source);
  }

  return adj;
}

// ────────────────────────────────────────────────────────────
// Shortest Path (BFS)
// ────────────────────────────────────────────────────────────

/**
 * BFS 기반 최단 경로 탐색.
 * 경로가 없으면 null 반환.
 * 반환 배열은 [start, ..., end] 형태.
 */
export function findShortestPath(
  adjList: Map<string, Set<string>>,
  start: string,
  end: string
): string[] | null {
  if (start === end) return [start];
  if (!adjList.has(start) || !adjList.has(end)) return null;

  const visited = new Set<string>([start]);
  const parent = new Map<string, string>();
  const queue: string[] = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjList.get(current);
    if (!neighbors) continue;

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      parent.set(neighbor, current);

      if (neighbor === end) {
        // Reconstruct path
        const path: string[] = [end];
        let node = end;
        while (node !== start) {
          node = parent.get(node)!;
          path.unshift(node);
        }
        return path;
      }

      queue.push(neighbor);
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// Neighborhood (N-hop subgraph)
// ────────────────────────────────────────────────────────────

/**
 * 지정된 노드로부터 depth 홉 이내의 모든 노드를 반환한다.
 * depth=0이면 자기 자신만, depth=1이면 직접 이웃까지.
 */
export function getNeighborhood(
  adjList: Map<string, Set<string>>,
  nodeId: string,
  depth: number
): Set<string> {
  const result = new Set<string>([nodeId]);
  if (!adjList.has(nodeId) || depth <= 0) return result;

  let frontier = new Set<string>([nodeId]);

  for (let d = 0; d < depth; d++) {
    const nextFrontier = new Set<string>();
    for (const node of frontier) {
      const neighbors = adjList.get(node);
      if (!neighbors) continue;
      for (const neighbor of neighbors) {
        if (!result.has(neighbor)) {
          result.add(neighbor);
          nextFrontier.add(neighbor);
        }
      }
    }
    frontier = nextFrontier;
    if (frontier.size === 0) break;
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// Degree Centrality
// ────────────────────────────────────────────────────────────

/**
 * 각 노드의 차수 중심성(degree centrality) 계산.
 * 값은 0~1 범위 (연결 수 / (전체 노드 수 - 1)).
 */
export function calculateDegreeCentrality(
  adjList: Map<string, Set<string>>
): Map<string, number> {
  const centrality = new Map<string, number>();
  const n = adjList.size;
  const denominator = Math.max(n - 1, 1); // 0으로 나누기 방지

  for (const [nodeId, neighbors] of adjList) {
    centrality.set(nodeId, neighbors.size / denominator);
  }

  return centrality;
}

// ────────────────────────────────────────────────────────────
// Connected Components
// ────────────────────────────────────────────────────────────

/**
 * 연결 요소(connected components)를 반환한다.
 * 각 요소는 노드 ID 배열. 큰 요소부터 정렬.
 */
export function getConnectedComponents(
  adjList: Map<string, Set<string>>
): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const nodeId of adjList.keys()) {
    if (visited.has(nodeId)) continue;

    // BFS로 해당 요소의 모든 노드 수집
    const component: string[] = [];
    const queue: string[] = [nodeId];
    visited.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);

      const neighbors = adjList.get(current);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  // 큰 요소부터 정렬
  components.sort((a, b) => b.length - a.length);
  return components;
}

// ────────────────────────────────────────────────────────────
// Build D3 Graph Data
// ────────────────────────────────────────────────────────────

/**
 * D3 Force-directed 시각화를 위한 그래프 데이터를 구성한다.
 *
 * 필터 적용 순서:
 * 1. categories / eras / entityTypes 로 노드 필터링
 * 2. centerNodeId + depth 가 있으면 이웃 서브그래프 추출
 * 3. relationTypes 로 엣지 필터링
 * 4. 필터된 노드에 연결된 엣지만 유지
 */
export function buildGraphData(
  persons: Person[],
  entities: Entity[],
  relationships: Relationship[],
  filter?: GraphFilter
): GraphData {
  // ── 1단계: 노드 후보 수집 ──

  let personCandidates = persons;
  let entityCandidates = entities;

  if (filter?.categories && filter.categories.length > 0) {
    const cats = new Set(filter.categories);
    personCandidates = personCandidates.filter(
      (p) =>
        cats.has(p.category) ||
        (p.categories && p.categories.some((c) => cats.has(c)))
    );
  }

  if (filter?.eras && filter.eras.length > 0) {
    const eras = new Set(filter.eras);
    personCandidates = personCandidates.filter((p) => eras.has(p.era));
    entityCandidates = entityCandidates.filter(
      (e) => e.era && eras.has(e.era)
    );
  }

  if (filter?.entityTypes && filter.entityTypes.length > 0) {
    const types = new Set(filter.entityTypes);
    entityCandidates = entityCandidates.filter((e) => types.has(e.type));
  }

  // 노드 ID 집합
  let nodeIds = new Set<string>([
    ...personCandidates.map((p) => p.id),
    ...entityCandidates.map((e) => e.id),
  ]);

  // ── 2단계: 중심 노드 기반 이웃 서브그래프 ──

  if (filter?.centerNodeId && nodeIds.has(filter.centerNodeId)) {
    const depth = filter.depth ?? 2;
    const adjList = buildAdjacencyList(relationships);
    const neighborhood = getNeighborhood(adjList, filter.centerNodeId, depth);
    // 교집합: 필터를 통과한 노드 중 이웃에 포함된 것만
    nodeIds = new Set([...nodeIds].filter((id) => neighborhood.has(id)));
  }

  // ── 3단계: 엣지 필터링 ──

  let filteredRels = relationships;
  if (filter?.relationTypes && filter.relationTypes.length > 0) {
    const relTypes = new Set(filter.relationTypes);
    filteredRels = filteredRels.filter((r) => relTypes.has(r.type));
  }

  // 양 끝 노드가 모두 nodeIds에 있는 엣지만 유지
  filteredRels = filteredRels.filter(
    (r) => nodeIds.has(r.source) && nodeIds.has(r.target)
  );

  // ── 4단계: 연결 수 계산 ──

  const connectionCount = new Map<string, number>();
  for (const rel of filteredRels) {
    connectionCount.set(rel.source, (connectionCount.get(rel.source) ?? 0) + 1);
    connectionCount.set(rel.target, (connectionCount.get(rel.target) ?? 0) + 1);
  }

  // ── 5단계: Person 룩업 맵 (Entity 노드를 GraphNode로 변환 시 기본값 필요) ──

  const personMap = new Map(personCandidates.map((p) => [p.id, p]));
  const entityMap = new Map(entityCandidates.map((e) => [e.id, e]));

  // ── 6단계: GraphNode 목록 구성 ──

  const nodes: GraphNode[] = [];

  for (const id of nodeIds) {
    const person = personMap.get(id);
    if (person) {
      nodes.push({
        id: person.id,
        name: person.name.ko,
        era: person.era,
        category: person.category,
        connectionCount: connectionCount.get(id) ?? 0,
      });
      continue;
    }

    const entity = entityMap.get(id);
    if (entity) {
      // Entity는 PersonCategory가 아니므로 타입 매핑 필요.
      // GraphNode의 category는 PersonCategory이므로 가장 가까운 값으로 매핑.
      // 여기서는 "philosopher"를 기본값으로 사용하되, UI에서 entity/person 구분은
      // 별도 속성 또는 id 기반으로 처리할 수 있다.
      nodes.push({
        id: entity.id,
        name: entity.name.ko,
        era: entity.era ?? "contemporary",
        category: "philosopher" as PersonCategory, // entity 기본값
        connectionCount: connectionCount.get(id) ?? 0,
      });
    }
  }

  // ── 7단계: GraphEdge 목록 구성 ──

  const edges: GraphEdge[] = filteredRels.map((r) => ({
    source: r.source,
    target: r.target,
    type: r.type as PersonRelationType,
    strength: (r.strength ?? 2) as RelationshipStrength,
  }));

  return { nodes, edges };
}

// ────────────────────────────────────────────────────────────
// Utility: Sorted by centrality
// ────────────────────────────────────────────────────────────

/**
 * 중심성 기준으로 상위 N개 노드 ID를 반환한다.
 */
export function getTopNodesByCentrality(
  adjList: Map<string, Set<string>>,
  topN: number
): string[] {
  const centrality = calculateDegreeCentrality(adjList);
  return [...centrality.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([id]) => id);
}

/**
 * 두 노드 사이의 관계 유형을 반환한다.
 * 관계가 없으면 빈 배열.
 */
export function getRelationTypesBetween(
  relationships: Relationship[],
  nodeA: string,
  nodeB: string
): Relationship[] {
  return relationships.filter(
    (r) =>
      (r.source === nodeA && r.target === nodeB) ||
      (r.source === nodeB && r.target === nodeA)
  );
}
