# 09. 기술 아키텍처 & 성능 (Technical Architecture & Performance)

> Sophia Atlas의 기술 스택, 빌드 파이프라인, 성능 최적화, 배포 전략 상세 설계

---

## 1. 기술 스택 상세

### 1.1 핵심 스택

```
Layer           Technology          Version    Purpose
────────────    ──────────────      ───────    ────────────────────
Framework       Next.js             14.x       App Router, SSG
Language        TypeScript          5.x        타입 안전성
Styling         Tailwind CSS        3.x        유틸리티 퍼스트
UI Components   shadcn/ui           latest     접근성 보장
Visualization   D3.js               7.x        Force Graph, Timeline
Map             React-Leaflet       4.x        세계지도
Search          Fuse.js             7.x        클라이언트 퍼지 검색
Fonts           Cormorant Garamond  -          영문 제목
                Noto Serif KR       -          한글 본문
                Inter               -          영문 본문/UI
Deployment      Vercel / GH Pages   -          정적 호스팅
CI/CD           GitHub Actions      -          자동 빌드/배포
Package Mgr     npm                 10.x       의존성 관리
```

### 1.2 의존성 관리 원칙

```
핵심 원칙:
1. 최소 의존성: 꼭 필요한 패키지만 설치
2. 번들 크기 감시: 새 패키지 추가 시 번들 영향 분석
3. peer dependency 충돌 방지: 주요 라이브러리 버전 고정
4. 보안 업데이트: npm audit 주간 실행
```

```json
// package.json 주요 의존성 (예상)
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "d3": "^7.9.0",
    "react-leaflet": "^4.2.0",
    "leaflet": "^1.9.0",
    "fuse.js": "^7.0.0",
    "lucide-react": "^0.400.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "@types/d3": "^7.4.0",
    "@types/leaflet": "^1.9.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 2. 아키텍처 패턴

### 2.1 App Router 구조

```
src/app/
├── layout.tsx              # Root Layout (fonts, metadata, theme)
├── page.tsx                # Home Dashboard
├── globals.css             # Tailwind + Fresco tokens
│
├── philosophy/
│   ├── layout.tsx          # Philosophy section layout
│   ├── timeline/page.tsx   # SSG
│   ├── graph/page.tsx      # CSR (D3.js)
│   ├── questions/page.tsx  # SSG
│   └── [id]/page.tsx       # SSG + generateStaticParams
│
├── religion/
│   ├── map/page.tsx        # CSR (Leaflet)
│   ├── tree/page.tsx       # CSR (D3.js)
│   ├── compare/page.tsx    # SSG
│   └── [id]/page.tsx       # SSG + generateStaticParams
│
├── persons/
│   ├── page.tsx            # SSG (목록) + CSR (필터)
│   └── [id]/page.tsx       # SSG + generateStaticParams
│
├── entities/
│   ├── page.tsx            # SSG
│   └── [id]/page.tsx       # SSG + generateStaticParams
│
├── science/
│   ├── page.tsx            # SSG
│   ├── timeline/page.tsx   # SSG
│   └── fields/page.tsx     # SSG
│
├── history/
│   ├── page.tsx            # SSG
│   ├── timeline/page.tsx   # SSG
│   └── civilizations/page.tsx # SSG
│
├── culture/
│   ├── page.tsx            # SSG
│   └── movements/page.tsx  # SSG
│
├── connections/page.tsx    # CSR (D3.js Force Graph)
├── search/page.tsx         # CSR (Fuse.js)
├── learn/page.tsx          # SSG
└── about/page.tsx          # SSG
```

### 2.2 렌더링 전략

```typescript
// 페이지별 렌더링 전략

// Strategy 1: 완전 정적 (SSG)
// 대상: 콘텐츠 페이지, 인물 상세, 엔터티 상세
// 방법: generateStaticParams + JSON import
export async function generateStaticParams() {
  const persons = await loadAllPersons();
  return persons.map((p) => ({ id: p.id }));
}

// Strategy 2: 정적 쉘 + 클라이언트 렌더링 (SSG + CSR)
// 대상: 시각화 페이지 (그래프, 지도, 타임라인)
// 방법: 'use client' + dynamic import + useEffect
'use client';
const ForceGraph = dynamic(() => import('@/components/visualization/ForceGraph'), {
  ssr: false,
  loading: () => <GraphSkeleton />,
});

// Strategy 3: 클라이언트 전용 (CSR)
// 대상: 검색, 필터링
// 방법: 'use client' + useState/useEffect
```

### 2.3 컴포넌트 아키텍처

```
컴포넌트 계층
─────────────
Level 1: Primitives (shadcn/ui)
├── Button, Card, Badge, Dialog, Tooltip
├── Accordion, Tabs, ScrollArea
└── Input, Select, Checkbox

Level 2: Domain Components
├── PersonCard, PersonList, PersonFilter
├── EntityCard, EntityTimeline
├── RelationshipBadge, RelationshipLine
├── EraTag, CategoryBadge
└── QuoteCard, GlossaryItem

Level 3: Visualization Components
├── ForceGraph (D3.js)
├── TimelineView (D3.js + SVG)
├── WorldMap (React-Leaflet)
├── BranchTree (D3.js)
├── CompareMatrix (table + chart)
└── IndraNet (custom SVG)

Level 4: Page Sections
├── HeroBanner, StatsGrid
├── FeaturedPersons, RecentActivity
├── RelatedPersonsPanel, TimelineSection
└── NavigationSidebar, BreadcrumbNav

Level 5: Layouts
├── RootLayout (global nav, footer)
├── SectionLayout (domain-specific sidebar)
└── DetailLayout (person/entity detail template)
```

### 2.4 상태 관리

```typescript
// 정적 사이트이므로 서버 상태 관리 불필요
// 클라이언트 상태만 관리

// 1. URL 상태 (필터, 검색어, 뷰 옵션)
// → Next.js searchParams + useRouter
function useFilterParams() {
  const searchParams = useSearchParams();
  return {
    era: searchParams.get('era') as Era | null,
    category: searchParams.get('category') as PersonCategory | null,
    q: searchParams.get('q') || '',
  };
}

// 2. UI 상태 (토글, 모달, 사이드바)
// → useState (컴포넌트 로컬)

// 3. 시각화 상태 (줌, 선택된 노드, 필터)
// → useReducer (복잡한 상태 로직)
interface GraphState {
  selectedNode: string | null;
  hoveredNode: string | null;
  zoom: number;
  center: [number, number];
  filters: {
    eras: Era[];
    categories: PersonCategory[];
    relationTypes: string[];
  };
  layout: 'force' | 'radial' | 'hierarchical';
}

type GraphAction =
  | { type: 'SELECT_NODE'; id: string }
  | { type: 'HOVER_NODE'; id: string | null }
  | { type: 'SET_ZOOM'; level: number }
  | { type: 'TOGGLE_ERA'; era: Era }
  | { type: 'SET_LAYOUT'; layout: GraphState['layout'] };

// 4. 테마 상태 (다크/라이트)
// → CSS 변수 + localStorage + system preference
```

---

## 3. 데이터 로딩 아키텍처

### 3.1 통합 데이터 로더

```typescript
// src/lib/data-loader.ts

import type { Person, Entity, Relationship, Religion } from '@/types';

// ── 캐시 ─────────────────────────────
let personCache: Person[] | null = null;
let entityCache: Entity[] | null = null;
let relationshipCache: Relationship[] | null = null;

// ── Person 로더 ─────────────────────
export async function loadAllPersons(): Promise<Person[]> {
  if (personCache) return personCache;

  const [philosophers, religious, scientists, historical] = await Promise.all([
    import('@/data/persons/philosophers.json').then(m => m.default),
    import('@/data/persons/religious-figures.json').then(m => m.default),
    import('@/data/persons/scientists.json').then(m => m.default),
    import('@/data/persons/historical-figures.json').then(m => m.default),
  ]);

  personCache = [...philosophers, ...religious, ...scientists, ...historical];
  return personCache;
}

export async function loadPersonById(id: string): Promise<Person | undefined> {
  const persons = await loadAllPersons();
  return persons.find(p => p.id === id);
}

export async function loadPersonsByCategory(
  category: PersonCategory
): Promise<Person[]> {
  const persons = await loadAllPersons();
  return persons.filter(p =>
    p.category === category || p.categories?.includes(category)
  );
}

export async function loadPersonsByEra(era: Era): Promise<Person[]> {
  const persons = await loadAllPersons();
  return persons.filter(p => p.era === era);
}

export async function loadMVPPersons(): Promise<Person[]> {
  const persons = await loadAllPersons();
  return persons.filter(p => p.mvp);
}

// ── Entity 로더 ─────────────────────
export async function loadAllEntities(): Promise<Entity[]> {
  if (entityCache) return entityCache;

  const [events, ideologies, movements, institutions, texts, concepts] =
    await Promise.all([
      import('@/data/entities/events.json').then(m => m.default),
      import('@/data/entities/ideologies.json').then(m => m.default),
      import('@/data/entities/movements.json').then(m => m.default),
      import('@/data/entities/institutions.json').then(m => m.default),
      import('@/data/entities/texts.json').then(m => m.default),
      import('@/data/entities/concepts.json').then(m => m.default),
    ]);

  entityCache = [
    ...events, ...ideologies, ...movements,
    ...institutions, ...texts, ...concepts
  ];
  return entityCache;
}

// ── Relationship 로더 ───────────────
export async function loadAllRelationships(): Promise<Relationship[]> {
  if (relationshipCache) return relationshipCache;

  const [pp, pe, ee] = await Promise.all([
    import('@/data/relationships/person-person.json').then(m => m.default),
    import('@/data/relationships/person-entity.json').then(m => m.default),
    import('@/data/relationships/entity-entity.json').then(m => m.default),
  ]);

  relationshipCache = [...pp, ...pe, ...ee];
  return relationshipCache;
}

export async function loadRelationshipsFor(id: string): Promise<Relationship[]> {
  const all = await loadAllRelationships();
  return all.filter(r => r.source === id || r.target === id);
}

// ── 그래프 데이터 ───────────────────
export interface GraphData {
  nodes: (Person | Entity)[];
  edges: Relationship[];
}

export async function loadGraphData(filters?: {
  eras?: Era[];
  categories?: PersonCategory[];
  entityTypes?: string[];
}): Promise<GraphData> {
  const [persons, entities, relationships] = await Promise.all([
    loadAllPersons(),
    loadAllEntities(),
    loadAllRelationships(),
  ]);

  let filteredPersons = persons;
  let filteredEntities = entities;

  if (filters?.eras?.length) {
    filteredPersons = filteredPersons.filter(p => filters.eras!.includes(p.era));
    filteredEntities = filteredEntities.filter(e => e.era && filters.eras!.includes(e.era));
  }

  if (filters?.categories?.length) {
    filteredPersons = filteredPersons.filter(p =>
      filters.categories!.includes(p.category)
    );
  }

  const nodeIds = new Set([
    ...filteredPersons.map(p => p.id),
    ...filteredEntities.map(e => e.id),
  ]);

  const filteredEdges = relationships.filter(
    r => nodeIds.has(r.source) && nodeIds.has(r.target)
  );

  return {
    nodes: [...filteredPersons, ...filteredEntities],
    edges: filteredEdges,
  };
}
```

### 3.2 검색 인덱스 구성

```typescript
// src/lib/search.ts

import Fuse from 'fuse.js';
import type { Person, Entity } from '@/types';

interface SearchableItem {
  id: string;
  type: 'person' | 'entity';
  name_ko: string;
  name_en: string;
  summary: string;
  tags: string[];
  era?: string;
  category?: string;
}

export function buildSearchIndex(
  persons: Person[],
  entities: Entity[]
): Fuse<SearchableItem> {
  const items: SearchableItem[] = [
    ...persons.map(p => ({
      id: p.id,
      type: 'person' as const,
      name_ko: p.name.ko,
      name_en: p.name.en,
      summary: p.summary,
      tags: p.tags,
      era: p.era,
      category: p.category,
    })),
    ...entities.map(e => ({
      id: e.id,
      type: 'entity' as const,
      name_ko: e.name.ko,
      name_en: e.name.en,
      summary: e.summary,
      tags: e.tags,
      era: e.era,
      category: e.type,
    })),
  ];

  return new Fuse(items, {
    keys: [
      { name: 'name_ko', weight: 3 },
      { name: 'name_en', weight: 2.5 },
      { name: 'tags', weight: 2 },
      { name: 'summary', weight: 1 },
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  });
}
```

---

## 4. 빌드 & 배포

### 4.1 Next.js 빌드 설정

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 내보내기 (GitHub Pages / Vercel static)
  // output: 'export',  // GitHub Pages용 — Vercel에서는 주석 처리

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    // output: 'export' 시:
    // unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,  // 타입 오류는 반드시 잡음
  },

  // GitHub Pages basePath
  // basePath: '/Sophia-Atlas',

  // 트레일링 슬래시 (정적 배포 호환)
  trailingSlash: true,

  // 번들 분석
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.plugins.push(new BundleAnalyzerPlugin());
  //   }
  //   return config;
  // },
};

module.exports = nextConfig;
```

### 4.2 빌드 최적화

```
빌드 성능 목표
──────────────
총 빌드 시간: < 3분 (573명 기준)
정적 페이지 수: ~750페이지
출력 디렉토리 크기: < 50MB

최적화 전략:
1. generateStaticParams 병렬 처리 (Next.js 기본)
2. JSON import 트리 셰이킹
3. 이미지 미사용 (초기 — 텍스트/SVG만)
4. D3.js dynamic import (SSR 제외)
5. Leaflet dynamic import (SSR 제외)
```

### 4.3 배포 파이프라인

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate data
        run: npm run validate

      - name: Build
        run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      # Vercel 배포 시:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      # GitHub Pages 배포 시:
      # - name: Deploy to GitHub Pages
      #   uses: peaceiris/actions-gh-pages@v3
      #   with:
      #     github_token: ${{ secrets.GITHUB_TOKEN }}
      #     publish_dir: ./out
```

### 4.4 프리뷰 배포

```yaml
# .github/workflows/preview.yml

name: Preview Deployment
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run validate
      - run: npm run build

      - name: Deploy Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          # no --prod flag = preview deployment

      - name: Comment PR with Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `🔍 Preview deployed: ${previewUrl}`
            });
```

---

## 5. 성능 최적화

### 5.1 성능 예산 (Performance Budget)

```
메트릭                   목표값        측정 도구
─────────────────        ──────        ──────────
First Contentful Paint   < 1.5s       Lighthouse
Largest Contentful Paint < 2.5s       Lighthouse
Time to Interactive      < 3.0s       Lighthouse
Cumulative Layout Shift  < 0.1        Lighthouse
Total Blocking Time      < 200ms      Lighthouse
Lighthouse Score         > 90         Lighthouse
초기 JS 번들             < 150KB gz   webpack-bundle-analyzer
총 페이지 크기           < 500KB      Chrome DevTools
```

### 5.2 번들 최적화

```typescript
// 1. D3.js 선택적 import (트리 셰이킹)
// BAD: import * as d3 from 'd3';  // ~500KB
// GOOD:
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force';
import { select } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { zoom } from 'd3-zoom';
import { drag } from 'd3-drag';
// → ~80KB

// 2. Leaflet 동적 import
const MapComponent = dynamic(
  () => import('@/components/visualization/WorldMap'),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

// 3. 코드 스플리팅 (라우트 기반 — Next.js 자동)
// 각 페이지는 자동으로 별도 청크로 분리됨

// 4. 대형 데이터 지연 로딩
export function usePersons(filters?: PersonFilter) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPersons().then(all => {
      const filtered = filters ? applyFilters(all, filters) : all;
      setPersons(filtered);
      setLoading(false);
    });
  }, [filters]);

  return { persons, loading };
}
```

### 5.3 렌더링 최적화

```typescript
// 1. 가상화 (1000명+ 목록)
import { useVirtualizer } from '@tanstack/react-virtual';

function PersonList({ persons }: { persons: Person[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: persons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,  // 카드 높이
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <PersonCard
            key={persons[virtualItem.index].id}
            person={persons[virtualItem.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateY(${virtualItem.start}px)`,
              width: '100%',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// 2. 메모이제이션
const PersonCard = memo(function PersonCard({ person }: { person: Person }) {
  // ...렌더링
});

// 3. D3.js Canvas 렌더링 (500+ 노드)
function renderGraphCanvas(
  canvas: HTMLCanvasElement,
  nodes: GraphNode[],
  edges: GraphEdge[]
) {
  const ctx = canvas.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  // 엣지 렌더링
  ctx.globalAlpha = 0.3;
  for (const edge of edges) {
    ctx.beginPath();
    ctx.moveTo(edge.source.x, edge.source.y);
    ctx.lineTo(edge.target.x, edge.target.y);
    ctx.strokeStyle = getEdgeColor(edge.type);
    ctx.lineWidth = edge.strength || 1;
    ctx.stroke();
  }

  // 노드 렌더링
  ctx.globalAlpha = 1;
  for (const node of nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, getNodeRadius(node), 0, Math.PI * 2);
    ctx.fillStyle = getCategoryColor(node.category);
    ctx.fill();
    ctx.strokeStyle = getEraColor(node.era);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
```

### 5.4 이미지 최적화

```
현재: 이미지 없음 (텍스트 + SVG 아이콘)
미래: 인물 초상화/일러스트 추가 시

전략:
1. WebP 포맷 사용 (JPEG 대비 30% 절약)
2. 반응형 이미지 (srcset)
3. 지연 로딩 (loading="lazy")
4. 블러 플레이스홀더 (blurDataURL)
5. CDN 캐싱 (Vercel Image Optimization)

크기 가이드:
- 썸네일 (카드): 100x100px, < 5KB
- 중간 (상세): 300x300px, < 20KB
- 큰 이미지 (히어로): 800x400px, < 50KB
```

### 5.5 폰트 최적화

```typescript
// src/app/layout.tsx

import { Cormorant_Garamond, Noto_Serif_KR, Inter } from 'next/font/google';

// Next.js 자동 최적화: subset, display=swap, preload
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-serif',
  // preload: false,  // 한글 폰트는 큼 → 선택적 preload
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

// 폰트 크기 예산:
// Cormorant Garamond (latin): ~30KB woff2
// Noto Serif KR (korean): ~200KB woff2 (서브셋)
// Inter (latin): ~25KB woff2
// 총: ~255KB (캐싱 후 0)
```

---

## 6. 접근성 (Accessibility)

### 6.1 WCAG 2.1 AA 준수 목표

```
접근성 체크리스트
────────────────
1. 색상 대비: 최소 4.5:1 (일반 텍스트), 3:1 (큰 텍스트)
2. 키보드 네비게이션: 모든 인터랙션 키보드로 가능
3. 스크린 리더: 의미론적 HTML + aria 속성
4. 모션 감소: prefers-reduced-motion 대응
5. 텍스트 크기: 200%까지 확대 가능
6. 대체 텍스트: 모든 이미지/아이콘에 aria-label
```

### 6.2 시각화 접근성

```typescript
// D3.js 그래프 접근성
function AccessibleGraph({ data }: { data: GraphData }) {
  return (
    <div role="img" aria-label="인물 관계 네트워크 그래프">
      {/* 시각적 그래프 */}
      <canvas ref={canvasRef} />

      {/* 스크린 리더용 대체 콘텐츠 */}
      <div className="sr-only">
        <h3>네트워크 요약</h3>
        <p>{data.nodes.length}명의 인물, {data.edges.length}개의 관계</p>
        <h4>주요 연결</h4>
        <ul>
          {data.edges
            .filter(e => e.strength === 3)
            .map(e => (
              <li key={`${e.source}-${e.target}`}>
                {getNodeName(e.source)} → {getNodeName(e.target)}: {e.description}
              </li>
            ))}
        </ul>
      </div>

      {/* 키보드 네비게이션 */}
      <div
        role="listbox"
        aria-label="네트워크 노드 목록"
        tabIndex={0}
        onKeyDown={handleKeyNavigation}
      >
        {data.nodes.map(node => (
          <div
            key={node.id}
            role="option"
            aria-selected={selectedNode === node.id}
            tabIndex={-1}
          >
            {node.name.ko} ({node.era})
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.3 다크/라이트 모드

```css
/* globals.css */

/* Fresco Light (기본) */
:root {
  --bg-primary: #FAF6E9;
  --bg-secondary: #F5EFD9;
  --text-primary: #2C2416;
  --text-secondary: #5C4A32;
  --accent-gold: #B8860B;
  --accent-copper: #8B5E3C;
  --border: #D4C5A0;
}

/* Fresco Dark */
[data-theme='dark'] {
  --bg-primary: #1A1612;
  --bg-secondary: #2C2416;
  --text-primary: #F5EFD9;
  --text-secondary: #D4C5A0;
  --accent-gold: #D4AF37;
  --accent-copper: #CD853F;
  --border: #5C4A32;
}

/* 시스템 설정 따르기 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    /* dark variables */
  }
}
```

---

## 7. SEO & 메타데이터

### 7.1 메타데이터 전략

```typescript
// src/app/persons/[id]/page.tsx

import { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const person = await loadPersonById(params.id);
  if (!person) return { title: 'Not Found' };

  const title = `${person.name.ko} (${person.name.en}) | Sophia Atlas`;
  const description = person.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      siteName: 'Sophia Atlas',
      locale: 'ko_KR',
      // images: [{ url: `/images/persons/${person.id}.webp` }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/persons/${person.id}`,
    },
  };
}
```

### 7.2 구조화된 데이터 (JSON-LD)

```typescript
// Person 페이지에 Schema.org Person 마크업
function PersonJsonLd({ person }: { person: Person }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name.en,
    alternateName: person.name.ko,
    description: person.summary,
    birthDate: person.period.start > 0
      ? `${person.period.start}`
      : undefined,
    deathDate: person.period.end > 0
      ? `${person.period.end}`
      : undefined,
    birthPlace: person.location?.region,
    knowsAbout: person.tags,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 7.3 사이트맵

```typescript
// scripts/generate-sitemap.ts
// 빌드 시 자동 생성

async function generateSitemap() {
  const persons = await loadAllPersons();
  const entities = await loadAllEntities();

  const urls = [
    // 고정 페이지
    '/', '/search', '/learn', '/about', '/connections',
    '/philosophy/timeline', '/philosophy/graph', '/philosophy/questions',
    '/religion/map', '/religion/tree', '/religion/compare',
    '/science', '/science/timeline', '/science/fields',
    '/history', '/history/timeline', '/history/civilizations',
    '/culture', '/culture/movements',
    '/persons', '/entities',

    // 동적 페이지
    ...persons.map(p => `/persons/${p.id}`),
    ...entities.map(e => `/entities/${e.id}`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>https://sophia-atlas.vercel.app${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${url === '/' ? '1.0' : url.includes('[') ? '0.6' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  writeFileSync('public/sitemap.xml', sitemap);
}
```

---

## 8. 에러 처리

### 8.1 에러 바운더리

```typescript
// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-fresco-ink">
          예기치 않은 오류가 발생했습니다
        </h2>
        <p className="mt-2 text-fresco-secondary">
          {error.message || '페이지를 불러오는 중 문제가 발생했습니다.'}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-fresco-gold px-4 py-2 text-white"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-fresco-gold">404</h2>
        <p className="mt-2 text-fresco-secondary">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
        <Link href="/" className="mt-4 inline-block text-fresco-gold underline">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
```

### 8.2 데이터 로딩 에러

```typescript
// 데이터 로딩 실패 시 graceful degradation
export async function loadPersonByIdSafe(id: string): Promise<Person | null> {
  try {
    const person = await loadPersonById(id);
    return person || null;
  } catch (error) {
    console.error(`Failed to load person: ${id}`, error);
    return null;
  }
}

// 시각화 fallback
function ForceGraphWithFallback({ data }: { data: GraphData }) {
  if (data.nodes.length === 0) {
    return <EmptyState message="표시할 데이터가 없습니다" />;
  }

  if (data.nodes.length > 2000) {
    return (
      <div>
        <p>노드가 너무 많습니다 ({data.nodes.length}개). 필터를 적용해주세요.</p>
        <FilterPanel />
      </div>
    );
  }

  return <ForceGraph data={data} />;
}
```

---

## 9. 테스트 전략

### 9.1 테스트 계층

```
테스트 피라미드
──────────────
     /\
    /E2E\         Playwright (핵심 경로만)
   /──────\
  / 통합    \      데이터 검증, 빌드 테스트
 /──────────\
/ 유닛 테스트 \    유틸 함수, 데이터 변환
──────────────
```

### 9.2 데이터 테스트

```typescript
// __tests__/data/validation.test.ts

describe('Data Validation', () => {
  let persons: Person[];
  let entities: Entity[];
  let relationships: Relationship[];

  beforeAll(async () => {
    persons = await loadAllPersons();
    entities = await loadAllEntities();
    relationships = await loadAllRelationships();
  });

  test('모든 인물에 필수 필드가 있어야 함', () => {
    for (const p of persons) {
      expect(p.id).toBeTruthy();
      expect(p.name.ko).toBeTruthy();
      expect(p.name.en).toBeTruthy();
      expect(p.era).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.summary.length).toBeGreaterThan(10);
    }
  });

  test('인물 ID가 고유해야 함', () => {
    const ids = persons.map(p => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('관계의 source/target이 존재해야 함', () => {
    const allIds = new Set([
      ...persons.map(p => p.id),
      ...entities.map(e => e.id),
    ]);

    for (const rel of relationships) {
      expect(allIds.has(rel.source)).toBe(true);
      expect(allIds.has(rel.target)).toBe(true);
    }
  });

  test('시대-연도 일관성', () => {
    for (const p of persons) {
      if (p.period.start < -500) expect(p.era).toBe('ancient');
      if (p.period.start > 1900) expect(p.era).toBe('contemporary');
    }
  });

  test('MVP 인물이 200명 이상이어야 함', () => {
    const mvp = persons.filter(p => p.mvp);
    expect(mvp.length).toBeGreaterThanOrEqual(200);
  });
});
```

### 9.3 E2E 테스트 (Playwright)

```typescript
// e2e/navigation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Core Navigation', () => {
  test('홈페이지 로딩', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sophia Atlas/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('인물 페이지 접근', async ({ page }) => {
    await page.goto('/persons/socrates');
    await expect(page.locator('h1')).toContainText('소크라테스');
  });

  test('검색 기능', async ({ page }) => {
    await page.goto('/search');
    await page.fill('input[type="search"]', '플라톤');
    await expect(page.locator('.search-results')).toContainText('플라톤');
  });

  test('타임라인 렌더링', async ({ page }) => {
    await page.goto('/philosophy/timeline');
    await expect(page.locator('canvas, svg')).toBeVisible();
  });
});
```

---

## 10. 모니터링 & 분석

### 10.1 웹 바이탈 모니터링

```typescript
// src/app/layout.tsx

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 10.2 사용자 행동 분석 (프라이버시 우선)

```
수집 데이터 (익명):
├── 페이지뷰 수
├── 인기 인물 (상위 100)
├── 검색 쿼리 (상위 100)
├── 브라우저/디바이스 통계
└── 리퍼러 출처

수집하지 않는 데이터:
├── 개인 식별 정보
├── 쿠키 기반 추적
├── 제3자 트래커
└── 광고 관련 데이터
```

---

## 11. 보안

### 11.1 정적 사이트 보안

```
정적 사이트 특성상 서버 취약점이 없으나:

보안 헤더 (Vercel/nginx):
├── Content-Security-Policy: default-src 'self'
├── X-Content-Type-Options: nosniff
├── X-Frame-Options: DENY
├── Referrer-Policy: strict-origin-when-cross-origin
└── Permissions-Policy: camera=(), microphone=(), geolocation=()

기여 관련 보안:
├── PR 리뷰 필수 (direct push 금지)
├── 데이터 검증 (XSS 방지)
├── 의존성 감사 (npm audit)
└── GitHub Advanced Security (Dependabot)
```

---

## 12. 요약: 기술 의사결정 기록 (ADR)

```
ADR-001: Next.js 14 App Router 사용
├── 이유: SSG + 파일 기반 라우팅 + React 생태계
├── 대안: Astro (더 가벼우나 React 생태계 약함)
└── 상태: 채택

ADR-002: 정적 사이트 생성 (SSG)
├── 이유: 서버 비용 없음, CDN 배포, SEO 유리
├── 대안: SSR (실시간 데이터 불필요)
└── 상태: 채택

ADR-003: D3.js + Canvas (500+ 노드)
├── 이유: 대규모 그래프 성능, 커스텀 시각화 자유도
├── 대안: vis.js (간편하나 커스텀 제한), Sigma.js (WebGL)
└── 상태: 채택

ADR-004: JSON 기반 데이터 (DB 없음)
├── 이유: 정적 사이트, Git 버전 관리, 빌드 타임 import
├── 대안: SQLite (쿼리 유연하나 정적 내보내기 불가)
├── 위험: 1000명+ 시 파일 크기 → 청크 분할로 대응
└── 상태: 채택

ADR-005: Tailwind CSS + shadcn/ui
├── 이유: 유틸리티 퍼스트, 번들 크기 최소, 접근성 내장
├── 대안: CSS Modules (격리 좋으나 디자인 시스템 구축 비용)
└── 상태: 채택

ADR-006: Vercel 배포 (기본) + GitHub Pages (대안)
├── 이유: 자동 프리뷰, 최적화된 Next.js 지원
├── 대안: Netlify, Cloudflare Pages
└── 상태: 채택
```
