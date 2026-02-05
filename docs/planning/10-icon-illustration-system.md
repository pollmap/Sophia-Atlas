# 10. 아이콘 & 일러스트레이션 시스템 (Icon & Illustration System)

> Sophia Atlas의 시각적 아이덴티티를 구성하는 아이콘, 심볼, 일러스트레이션 체계

---

## 1. 설계 원칙

### 1.1 Fresco Design System과의 통합

아이콘/일러스트 시스템은 Fresco Design System의 시각 언어를 따른다:

```
핵심 원칙
─────────
1. 프레스코 미학: 르네상스 프레스코 벽화의 따뜻하고 인간적인 질감
2. 학술적 권위: 고전 문헌의 인쇄물, 판화 스타일 참조
3. 의미 전달: 장식이 아닌 정보 전달 도구로서의 아이콘
4. 일관성: 모든 아이콘이 동일한 시각적 무게와 스타일
5. 접근성: 색상에 의존하지 않는 형태적 구분
```

### 1.2 컬러 팔레트 (아이콘용)

```
Primary (주 컬러)
├── Sepia Ink: #2C2416 (기본 아이콘)
├── Dark Gold: #B8860B (강조 아이콘)
├── Copper: #8B5E3C (보조 아이콘)
└── Warm Gray: #5C4A32 (비활성)

Category Colors (카테고리별)
├── Philosopher: #6366F1 (인디고)
├── Religious Figure: #F59E0B (앰버)
├── Scientist: #10B981 (에메랄드)
├── Historical Figure: #EF4444 (레드)
└── Cultural Figure: #EC4899 (핑크)

Era Colors (시대별)
├── Ancient: #D4AF37 (황금)
├── Medieval: #7C3AED (보라)
├── Modern: #14B8A6 (청록)
└── Contemporary: #64748B (회색)
```

---

## 2. 아이콘 시스템

### 2.1 아이콘 라이브러리 선택

```
기본: Lucide React
├── 경량 (트리 셰이킹 지원)
├── 일관된 24x24 그리드
├── ISC 라이선스 (자유 사용)
├── 300+ 아이콘
└── React 네이티브 지원

보조: 커스텀 SVG 아이콘
├── Sophia Atlas 전용 심볼
├── 카테고리 아이콘
├── 관계 유형 아이콘
└── 장식 요소
```

### 2.2 카테고리 아이콘 매핑

```typescript
// src/components/common/CategoryIcon.tsx

import {
  BookOpen,    // 철학
  ScrollText,  // 종교
  Atom,        // 과학
  Crown,       // 역사
  Palette,     // 문화
  Globe,       // 엔터티-사건
  Lightbulb,   // 엔터티-이념
  Users,       // 엔터티-운동
  Landmark,    // 엔터티-기관
  BookMarked,  // 엔터티-경전
  Sparkles,    // 엔터티-개념
} from 'lucide-react';

export const CATEGORY_ICONS = {
  // Person 카테고리
  philosopher: BookOpen,
  religious_figure: ScrollText,
  scientist: Atom,
  historical_figure: Crown,
  cultural_figure: Palette,

  // Entity 타입
  event: Globe,
  ideology: Lightbulb,
  movement: Users,
  institution: Landmark,
  text: BookMarked,
  concept: Sparkles,
} as const;

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 20, className }: CategoryIconProps) {
  const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
  if (!IconComponent) return null;

  return (
    <IconComponent
      size={size}
      className={className}
      aria-label={getCategoryLabel(category)}
    />
  );
}
```

### 2.3 관계 유형 아이콘

```typescript
// src/components/common/RelationshipIcon.tsx

import {
  ArrowRight,      // influenced, teacher_student
  ArrowLeftRight,  // opposed, parallel
  GitBranch,       // developed
  Link2,           // contextual, contemporary
  Handshake,       // collaborated
  Building2,       // founded, member_of
  Pen,             // authored
  Heart,           // advocated
  X,               // criticized
  Tag,             // belongs_to
  Timer,           // preceded
  GitMerge,        // evolved_into, caused
  Layers,          // part_of
} from 'lucide-react';

export const RELATIONSHIP_ICONS = {
  // Person ↔ Person
  influenced: ArrowRight,
  opposed: ArrowLeftRight,
  developed: GitBranch,
  parallel: ArrowLeftRight,
  contextual: Link2,
  teacher_student: ArrowRight,
  collaborated: Handshake,
  contemporary: Link2,

  // Person ↔ Entity
  founded: Building2,
  member_of: Building2,
  participated: ArrowRight,
  caused: GitMerge,
  affected_by: ArrowRight,
  authored: Pen,
  advocated: Heart,
  criticized: X,
  belongs_to: Tag,

  // Entity ↔ Entity
  preceded: Timer,
  'entity_caused': GitMerge,
  part_of: Layers,
  opposed_to: ArrowLeftRight,
  evolved_into: GitMerge,
  'entity_influenced': ArrowRight,
} as const;
```

### 2.4 네비게이션 아이콘

```typescript
// 주요 네비게이션 아이콘 매핑

const NAV_ICONS = {
  home: Home,
  philosophy: BookOpen,
  religion: ScrollText,
  science: Atom,
  history: Crown,
  culture: Palette,
  persons: Users,
  entities: Database,
  connections: Network,
  search: Search,
  learn: GraduationCap,
  about: Info,
  timeline: Clock,
  map: MapPin,
  graph: GitBranch,
  tree: TreeDeciduous,
  compare: BarChart3,
  questions: HelpCircle,
};
```

### 2.5 아이콘 크기 체계

```
크기 체계 (px)
──────────────
xs:  14px  — 인라인 텍스트 옆, 뱃지 내
sm:  16px  — 작은 버튼, 태그
md:  20px  — 기본 (네비게이션, 카드 헤더)
lg:  24px  — 섹션 헤더, 강조
xl:  32px  — 히어로 영역, 빈 상태
2xl: 48px  — 페이지 타이틀 장식

사용 규칙:
- 아이콘은 항상 텍스트와 함께 사용 (아이콘만 단독 사용 시 aria-label 필수)
- 아이콘 색상은 인접 텍스트 색상과 동일하거나 카테고리 컬러
- 호버 시 아이콘 색상 변경: opacity 0.7 → 1.0
```

---

## 3. 커스텀 심볼 시스템

### 3.1 Sophia Atlas 로고

```
로고 구성
─────────
메인 로고: 인드라망(Indra's Net) 모티프
├── 중앙: 연결된 보석(노드) 네트워크
├── 외곽: 원형 프레임 (지구/아틀라스 상징)
├── 텍스트: "SOPHIA ATLAS" (Cormorant Garamond)
└── 서브텍스트: "인류 사상의 시공간 지도"

변형:
├── Full: 아이콘 + 텍스트 (가로)
├── Stacked: 아이콘 + 텍스트 (세로)
├── Icon only: 아이콘만 (파비콘, 작은 공간)
└── Text only: 텍스트만 (좁은 헤더)
```

```svg
<!-- 로고 컨셉 (SVG 스케치) -->
<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <!-- 외곽 원 -->
  <circle cx="24" cy="24" r="22" fill="none"
    stroke="#B8860B" stroke-width="1.5" opacity="0.6" />

  <!-- 인드라망 노드들 -->
  <circle cx="24" cy="12" r="3" fill="#D4AF37" />
  <circle cx="12" cy="28" r="3" fill="#6366F1" />
  <circle cx="36" cy="28" r="3" fill="#10B981" />
  <circle cx="24" cy="36" r="2.5" fill="#F59E0B" />
  <circle cx="16" cy="18" r="2.5" fill="#EF4444" />
  <circle cx="32" cy="18" r="2.5" fill="#EC4899" />

  <!-- 연결선 -->
  <line x1="24" y1="12" x2="12" y2="28" stroke="#B8860B" stroke-width="0.8" opacity="0.5" />
  <line x1="24" y1="12" x2="36" y2="28" stroke="#B8860B" stroke-width="0.8" opacity="0.5" />
  <line x1="12" y1="28" x2="36" y2="28" stroke="#B8860B" stroke-width="0.8" opacity="0.5" />
  <line x1="24" y1="12" x2="16" y2="18" stroke="#B8860B" stroke-width="0.8" opacity="0.3" />
  <line x1="24" y1="12" x2="32" y2="18" stroke="#B8860B" stroke-width="0.8" opacity="0.3" />
  <line x1="16" y1="18" x2="12" y2="28" stroke="#B8860B" stroke-width="0.8" opacity="0.3" />
  <line x1="32" y1="18" x2="36" y2="28" stroke="#B8860B" stroke-width="0.8" opacity="0.3" />
  <line x1="12" y1="28" x2="24" y2="36" stroke="#B8860B" stroke-width="0.8" opacity="0.3" />
  <line x1="36" y1="28" x2="24" y2="36" stroke="#B8860B" stroke-width="0.8" opacity="0.3" />

  <!-- 중앙 보석 (Sophia) -->
  <circle cx="24" cy="24" r="4" fill="#B8860B" opacity="0.9" />
  <circle cx="24" cy="24" r="2" fill="#FAF6E9" />
</svg>
```

### 3.2 시대 심볼

```
각 시대를 상징하는 커스텀 심볼:

Ancient (고대) — 그리스 기둥
├── 이오니아식 기둥 실루엣
├── 컬러: #D4AF37 (황금)
└── 사용: 타임라인 시대 구분, 필터 아이콘

Medieval (중세) — 고딕 아치
├── 첨두형 아치 실루엣
├── 컬러: #7C3AED (보라)
└── 사용: 타임라인 시대 구분, 필터 아이콘

Modern (근대) — 나침반 장미
├── 탐험/발견의 시대 상징
├── 컬러: #14B8A6 (청록)
└── 사용: 타임라인 시대 구분, 필터 아이콘

Contemporary (현대) — 원자 모형
├── 전자 궤도 실루엣
├── 컬러: #64748B (회색)
└── 사용: 타임라인 시대 구분, 필터 아이콘
```

```typescript
// src/components/common/EraSymbol.tsx

export function EraSymbol({ era, size = 24 }: { era: Era; size?: number }) {
  const symbols: Record<Era, React.FC<SVGProps>> = {
    ancient: AncientColumnSVG,
    medieval: GothicArchSVG,
    modern: CompassRoseSVG,
    contemporary: AtomModelSVG,
  };

  const Symbol = symbols[era];
  return <Symbol width={size} height={size} aria-label={getEraLabel(era)} />;
}
```

### 3.3 종교 심볼

```
각 종교의 공식/전통 심볼:

기독교     — 십자가 (Cross)
이슬람     — 초승달과 별 (Crescent and Star)
불교       — 법륜 (Dharmachakra)
힌두교     — 옴 (Om / ॐ)
유대교     — 다윗의 별 (Star of David)
도교       — 태극 (Yin-Yang / 陰陽)
유교       — 仁 문자 (서예체)
조로아스터 — 파라바하르 (Faravahar)
시크교     — 칸다 (Khanda)
자이나교   — 아힘사 손 (Ahimsa Hand)
바하이     — 아홉 꼭지 별 (Nine-Pointed Star)
신토       — 도리이 (Torii)

규칙:
- 존중: 모든 종교 심볼은 동등한 크기/무게로 표현
- 정확성: 공식 심볼 형태 준수
- 중립성: 장식적 변형 최소화
```

### 3.4 철학 학파 심볼

```
학파별 개념적 심볼:

스토아학파     — 기둥 (Pillar): 견딤, 이성
에피쿠로스학파 — 정원 (Garden): 에피쿠로스의 정원
아카데메이아   — 올리브 나무: 플라톤의 학원 부지
리케이온       — 산책로: 소요학파(Peripatetic)
경험론         — 눈 (Eye): 감각 경험
합리론         — 톱니바퀴 (Gear): 이성적 추론
실존주의       — 갈림길 (Crossroads): 선택과 자유
분석철학       — 프리즘: 분석과 분해
현상학         — 괄호 (Brackets): 판단중지(에포케)
해석학         — 원 (Circle): 해석학적 순환
```

---

## 4. 일러스트레이션 시스템

### 4.1 일러스트 스타일

```
스타일 가이드
─────────────
베이스: 르네상스 판화/에칭 스타일
├── 선 작업: 세밀한 해칭(hatching), 크로스해칭
├── 컬러: 단색 (세피아) 또는 제한된 팔레트
├── 질감: 종이/양피지 위의 인쇄물 느낌
├── 디테일: 학술적이고 정교한
└── 모던 터치: 깔끔한 벡터, 단순화된 형태

피해야 할 것:
├── 만화/카툰 스타일
├── 사실적 사진/포토리얼리즘
├── 과도한 그래디언트/그림자
├── 네온/사이버 컬러
└── 이모지/클립아트 스타일
```

### 4.2 인물 일러스트 (v3+)

```
인물 초상화 스타일 가이드
─────────────────────────
스타일: 선화(Line Drawing) + 해칭 (프레스코/판화풍)
크기: 300x300px (원본), 100x100px (썸네일)
형식: SVG (벡터) 또는 WebP (래스터)
배경: 투명 또는 담황색 (#FAF6E9)

계층:
├── Tier 1 (MVP 50명): 상세 초상화
├── Tier 2 (MVP 200명): 간략 초상화
├── Tier 3 (나머지): 카테고리 기본 실루엣
└── 플레이스홀더: 카테고리별 기본 아이콘

인물 초상화 예시 (CSS 기반 플레이스홀더):
┌─────────────────┐
│    ┌───────┐    │
│    │  👤   │    │  ← 카테고리 색상 배경
│    │ (실루엣)│    │     + 이니셜 텍스트
│    └───────┘    │
│   소크라테스     │
│  BC 470-399     │
└─────────────────┘
```

```typescript
// src/components/common/PersonAvatar.tsx

interface PersonAvatarProps {
  person: Person;
  size: 'sm' | 'md' | 'lg';
}

export function PersonAvatar({ person, size }: PersonAvatarProps) {
  const sizeMap = { sm: 40, md: 80, lg: 160 };
  const px = sizeMap[size];

  // 이미지가 있으면 이미지 사용
  // if (person.imageUrl) {
  //   return <img src={person.imageUrl} ... />;
  // }

  // 플레이스홀더: 카테고리 색상 + 이니셜
  const bgColor = getCategoryColor(person.category);
  const initials = person.name.ko.slice(0, 1);

  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: px,
        height: px,
        backgroundColor: `${bgColor}20`,
        border: `2px solid ${bgColor}`,
      }}
      aria-label={person.name.ko}
    >
      <span
        className="font-serif font-bold"
        style={{ fontSize: px * 0.4, color: bgColor }}
      >
        {initials}
      </span>
    </div>
  );
}
```

### 4.3 장면 일러스트

```
특별 장면 일러스트 (히어로 배너, 섹션 구분)
─────────────────────────────────────────

1. 홈페이지 히어로: 인드라망 시각화
   - 보석으로 연결된 사상가들의 네트워크
   - 따뜻한 금빛 톤
   - 투명한 연결선이 빛나는 효과

2. 철학 섹션: 아테네 학당 모티프
   - 라파엘로의 '아테네 학당' 단순화
   - 아치형 구조 + 사상가 실루엣들
   - 세피아 톤

3. 종교 섹션: 세계 종교 심볼 만다라
   - 중앙에서 방사형으로 배치된 종교 심볼
   - 각 심볼이 빛의 선으로 연결
   - 따뜻한 금빛

4. 과학 섹션: 과학 도구와 수식
   - 망원경, 현미경, 원자 모형 등
   - 판화 스타일의 과학 기구
   - 배경에 수식/방정식

5. 역사 섹션: 고대 지도 스타일
   - 중세 세계지도(Mappa Mundi) 모티프
   - 양피지 질감
   - 문명권 표시

6. 문화 섹션: 예술 도구 콜라주
   - 붓, 펜, 악기, 마스크 등
   - 다양한 문화의 예술 도구
   - 에칭 스타일
```

### 4.4 빈 상태(Empty State) 일러스트

```
각 빈 상태에 맞는 심플한 일러스트:

검색 결과 없음:
├── 일러스트: 물음표가 달린 돋보기
├── 메시지: "검색 결과가 없습니다"
└── 스타일: 세피아 선화, 60x60px

데이터 로딩 중:
├── 일러스트: 모래시계 또는 두루마리 펼치기
├── 메시지: "지식의 지도를 펼치는 중..."
└── 스타일: 세피아 선화 + 회전 애니메이션

에러 발생:
├── 일러스트: 찢어진 양피지
├── 메시지: "예기치 않은 오류가 발생했습니다"
└── 스타일: 세피아 선화

관계 없음:
├── 일러스트: 끊어진 사슬
├── 메시지: "아직 등록된 관계가 없습니다"
└── 스타일: 세피아 선화
```

---

## 5. 그래프 노드 디자인

### 5.1 노드 시각화 규칙

```
그래프 노드 디자인
──────────────────

기본 노드:
┌──────────────────┐
│  ◯ 원형          │  크기: 관계 수에 비례 (8~32px)
│  색상: 카테고리   │  테두리: 시대별 컬러
│  레이블: 이름     │  투명도: MVP=1.0, 비MVP=0.7
└──────────────────┘

선택된 노드:
┌──────────────────┐
│  ◎ 이중 원       │  외곽 링 추가 (골드)
│  크기: 1.5배     │  레이블: 확대 + 상세 정보
│  그림자 효과     │  연결 노드 하이라이트
└──────────────────┘

호버 노드:
┌──────────────────┐
│  크기: 1.2배     │  부드러운 스케일 전환
│  투명도: 1.0     │  툴팁 표시
│  연결선 강조     │  관련 노드만 하이라이트
└──────────────────┘
```

### 5.2 노드 크기 공식

```typescript
// src/lib/graph-utils.ts

function getNodeRadius(node: GraphNode, relationships: Relationship[]): number {
  const MIN_RADIUS = 6;
  const MAX_RADIUS = 28;

  // 관계 수 기반 크기
  const connectionCount = relationships.filter(
    r => r.source === node.id || r.target === node.id
  ).length;

  // 로그 스케일 (큰 차이 완화)
  const scale = Math.log2(connectionCount + 1) / Math.log2(50);
  const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.min(scale, 1);

  // MVP 보너스
  if ('mvp' in node && node.mvp) {
    return radius * 1.2;
  }

  return radius;
}

function getNodeColor(node: GraphNode): string {
  if ('category' in node) {
    return CATEGORY_COLORS[node.category as PersonCategory] || '#64748B';
  }
  if ('type' in node) {
    return ENTITY_TYPE_COLORS[node.type as EntityType] || '#64748B';
  }
  return '#64748B';
}

function getNodeBorderColor(node: GraphNode): string {
  if ('era' in node && node.era) {
    return ERA_COLORS[node.era as Era] || '#64748B';
  }
  return '#64748B';
}
```

### 5.3 엣지 디자인

```
관계 유형별 엣지 스타일
──────────────────────

influenced / teacher_student:
├── 스타일: 실선 + 화살표
├── 색상: #3B82F6 (Blue)
└── 두께: strength 비례 (1~3px)

opposed:
├── 스타일: 실선 + 양쪽 화살표
├── 색상: #EF4444 (Red)
└── 두께: strength 비례

developed:
├── 스타일: 실선 + 화살표
├── 색상: #10B981 (Green)
└── 두께: strength 비례

parallel:
├── 스타일: 점선
├── 색상: #8B5CF6 (Purple)
└── 두께: 1px

contextual / contemporary:
├── 스타일: 점선
├── 색상: #94A3B8 (Gray)
└── 두께: 1px

collaborated:
├── 스타일: 실선 (양방향)
├── 색상: #F97316 (Orange)
└── 두께: strength 비례
```

```typescript
// src/lib/graph-utils.ts

interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  markerEnd?: string;
  markerStart?: string;
  opacity: number;
}

function getEdgeStyle(rel: Relationship): EdgeStyle {
  const baseWidth = (rel.strength || 1) * 1;

  const styles: Record<string, Partial<EdgeStyle>> = {
    influenced: { stroke: '#3B82F6', markerEnd: 'arrow' },
    teacher_student: { stroke: '#3B82F6', markerEnd: 'arrow', strokeWidth: baseWidth * 1.5 },
    opposed: { stroke: '#EF4444', markerEnd: 'arrow', markerStart: 'arrow' },
    developed: { stroke: '#10B981', markerEnd: 'arrow' },
    parallel: { stroke: '#8B5CF6', strokeDasharray: '4 4' },
    contextual: { stroke: '#94A3B8', strokeDasharray: '2 4' },
    contemporary: { stroke: '#94A3B8', strokeDasharray: '2 4' },
    collaborated: { stroke: '#F97316' },
    founded: { stroke: '#B8860B', markerEnd: 'diamond' },
    authored: { stroke: '#6366F1', markerEnd: 'arrow' },
  };

  const specific = styles[rel.type] || {};

  return {
    stroke: specific.stroke || '#94A3B8',
    strokeWidth: specific.strokeWidth || baseWidth,
    strokeDasharray: specific.strokeDasharray,
    markerEnd: specific.markerEnd,
    markerStart: specific.markerStart,
    opacity: rel.strength === 3 ? 0.8 : rel.strength === 2 ? 0.5 : 0.3,
  };
}
```

---

## 6. 지도 마커 디자인

### 6.1 마커 스타일

```
지도 마커 계층
──────────────

Level 1: 개별 인물 마커
├── 형태: 원형 (카테고리 색상)
├── 크기: 8px
├── 테두리: 시대별 색상
└── 호버: 이름 툴팁

Level 2: 클러스터 마커 (줌 아웃 시)
├── 형태: 원형 + 숫자 표시
├── 크기: 인물 수에 비례 (20~50px)
├── 색상: 다수 카테고리의 혼합 (파이 차트 스타일)
└── 클릭: 줌 인

Level 3: 지역 마커 (최대 줌 아웃)
├── 형태: 지역명 + 인물 수
├── 크기: 지역 중요도에 비례
└── 스타일: 고지도 레이블 느낌

특수 마커:
├── 사건(Event): 별 모양 (★)
├── 기관(Institution): 건물 아이콘
├── 이동 경로: 점선 화살표
└── 영향 전파: 물결 효과 (동심원)
```

### 6.2 마커 구현

```typescript
// src/components/visualization/MapMarker.tsx

import L from 'leaflet';

function createPersonMarker(person: Person): L.DivIcon {
  const color = getCategoryColor(person.category);
  const borderColor = getEraColor(person.era);
  const size = person.mvp ? 12 : 8;

  return L.divIcon({
    className: 'person-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid ${borderColor};
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>
    `,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  });
}

function createClusterMarker(count: number, categories: PersonCategory[]): L.DivIcon {
  const size = Math.min(20 + count * 0.5, 50);
  const mainColor = getMajorityColor(categories);

  return L.divIcon({
    className: 'cluster-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${mainColor}40;
        border: 2px solid ${mainColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
        font-size: ${Math.max(10, size * 0.35)}px;
        font-weight: 600;
        color: ${mainColor};
      ">${count}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
```

---

## 7. 타임라인 시각 요소

### 7.1 타임라인 디자인

```
타임라인 시각 구성
──────────────────

시간축:
├── 가로 방향 (좌→우: 과거→현재)
├── 눈금: 100년 단위 (줌 아웃), 10년 단위 (줌 인)
├── 시대 구분: 배경색 밴드 (시대별 컬러, 투명도 10%)
└── 현재 연도 표시: 우측 끝

인물 표시:
├── 생존 기간: 가로 막대 (카테고리 색상)
├── 주요 사건: 막대 위 점 표시
├── 이름: 막대 옆 또는 호버 시 표시
└── 정렬: 카테고리별 행 또는 자동 배치

사건 오버레이:
├── 수직선 + 라벨
├── 기간 이벤트: 반투명 직사각형
├── 색상: 엔터티 타입별
└── 호버: 사건 상세 + 관련 인물

축의 시대 하이라이트:
├── BC 800~BC 200 영역 특별 표시
├── 동시대 사상가 연결선
└── 설명 라벨
```

### 7.2 타임라인 마커

```typescript
// 인물 생존 기간 막대
interface TimelineBar {
  personId: string;
  x: number;        // 시작 위치 (pixel)
  width: number;    // 기간 길이 (pixel)
  y: number;        // 행 위치
  color: string;    // 카테고리 컬러
  borderColor: string; // 시대 컬러
  label: string;    // 인물 이름
  mvp: boolean;     // 강조 여부
}

// 사건 마커
interface TimelineEvent {
  entityId: string;
  x: number;        // 위치 (pixel)
  width?: number;   // 기간 이벤트의 경우 너비
  label: string;
  color: string;    // 엔터티 타입 컬러
  icon: string;     // 엔터티 타입 아이콘
}
```

---

## 8. 분파 트리 시각 요소

### 8.1 트리 노드 디자인

```
종교 분파 트리 노드
──────────────────

루트 노드 (원시 종교):
├── 크기: 큰 원 (40px)
├── 색상: 종교별 메인 컬러
├── 테두리: 골드
└── 아이콘: 종교 심볼

주요 분파 노드:
├── 크기: 중간 원 (28px)
├── 색상: 종교별 서브 컬러
├── 레이블: 분파명 + 연도
└── 예: 가톨릭, 정교회, 개신교

세부 분파 노드:
├── 크기: 작은 원 (18px)
├── 색상: 연한 서브 컬러
├── 레이블: 호버 시 표시
└── 예: 루터교, 장로교, 감리교

연결선:
├── 직접 분파: 실선
├── 영향: 점선
├── 분기점: 연도 표시 라벨
└── 커브: 부드러운 베지어 곡선
```

---

## 9. UI 컴포넌트 아이콘 가이드

### 9.1 버튼 아이콘

```
버튼 유형별 아이콘 사용
──────────────────────

Primary 버튼:
├── 탐색하기: ArrowRight →
├── 검색: Search 🔍
├── 비교하기: BarChart3
└── 관계 보기: Network

Secondary 버튼:
├── 필터: Filter
├── 정렬: ArrowUpDown
├── 뷰 전환: LayoutGrid / List
└── 더 보기: ChevronDown

Tertiary 버튼:
├── 공유: Share2
├── 링크 복사: Link2
├── 외부 링크: ExternalLink
└── 돌아가기: ArrowLeft

Toggle 버튼:
├── 다크모드: Sun / Moon
├── 사이드바: PanelLeft / PanelLeftClose
├── 펼치기/접기: ChevronDown / ChevronUp
└── 전체화면: Maximize / Minimize
```

### 9.2 상태 아이콘

```
알림/상태 표시
──────────────
정보: Info (원형 i)
성공: Check (체크마크)
경고: AlertTriangle (삼각형 !)
에러: XCircle (원형 X)
로딩: Loader2 (회전)
비어있음: Inbox (빈 상자)
```

### 9.3 뱃지 아이콘

```
뱃지 유형
─────────
시대 뱃지: [시대심볼] + "고대" / "중세" / "근대" / "현대"
카테고리 뱃지: [카테고리아이콘] + "철학자" / "종교" / "과학"
MVP 뱃지: Star ★ (금색)
관계 수 뱃지: Link2 + 숫자
```

---

## 10. 반응형 아이콘 가이드

### 10.1 디바이스별 아이콘 크기

```
              Desktop    Tablet     Mobile
─────────     ───────    ──────     ──────
Nav icon      20px       20px       24px (터치 영역)
Card icon     20px       18px       16px
Badge icon    14px       14px       12px
Hero icon     48px       40px       32px
Graph node    8-32px     6-24px     6-20px
Map marker    8-12px     8-12px     10-14px
```

### 10.2 터치 대응

```
터치 디바이스 규칙:
├── 최소 터치 영역: 44x44px (Apple HIG)
├── 아이콘이 작아도 터치 영역은 유지
├── 호버 상태 → 탭 상태로 변환
├── 더블 탭 방지 (300ms 딜레이 제거)
└── 핀치 줌: 그래프/지도에서 지원
```

---

## 11. 아이콘 접근성

### 11.1 접근성 규칙

```typescript
// 모든 아이콘 컴포넌트의 접근성 패턴

// 장식용 아이콘 (텍스트 동반)
<BookOpen aria-hidden="true" />
<span>철학자</span>

// 의미 전달 아이콘 (텍스트 없음)
<Search aria-label="검색" role="img" />

// 인터랙티브 아이콘 (버튼 내)
<button aria-label="다크 모드 전환">
  <Moon aria-hidden="true" />
</button>

// 상태 표시 아이콘
<div role="status" aria-live="polite">
  <Loader2 className="animate-spin" aria-hidden="true" />
  <span className="sr-only">로딩 중...</span>
</div>
```

### 11.2 고대비 모드

```css
/* 고대비 모드에서 아이콘 가시성 보장 */
@media (forced-colors: active) {
  .icon {
    forced-color-adjust: auto;
  }

  .category-badge {
    border: 2px solid currentColor;
  }

  .graph-node {
    outline: 2px solid currentColor;
  }
}
```

---

## 12. 아이콘 에셋 관리

### 12.1 파일 구조

```
public/
├── icons/
│   ├── logo/
│   │   ├── sophia-atlas-full.svg
│   │   ├── sophia-atlas-icon.svg
│   │   └── sophia-atlas-text.svg
│   ├── era/
│   │   ├── ancient.svg
│   │   ├── medieval.svg
│   │   ├── modern.svg
│   │   └── contemporary.svg
│   ├── religion/
│   │   ├── christianity.svg
│   │   ├── islam.svg
│   │   ├── buddhism.svg
│   │   ├── hinduism.svg
│   │   ├── judaism.svg
│   │   └── ...
│   └── favicon/
│       ├── favicon.ico
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       ├── apple-touch-icon.png
│       └── site.webmanifest

src/components/icons/
├── EraSymbols.tsx       # SVG 시대 심볼 컴포넌트
├── ReligionSymbols.tsx  # SVG 종교 심볼 컴포넌트
├── LogoVariants.tsx     # 로고 변형 컴포넌트
└── index.ts             # 통합 export
```

### 12.2 SVG 최적화

```
SVG 최적화 규칙
───────────────
1. SVGO로 최적화 (불필요한 메타데이터 제거)
2. viewBox 명시 (width/height 제거 → CSS로 제어)
3. currentColor 사용 (CSS로 색상 제어)
4. 최대 파일 크기: 2KB (단순 아이콘), 10KB (복잡 일러스트)
5. 인라인 SVG 선호 (HTTP 요청 절약)
```

---

## 13. 요약

```
아이콘 & 일러스트 시스템 핵심
─────────────────────────────
1. Lucide React 기본 + 커스텀 SVG 보조
2. 카테고리/시대/관계 유형별 일관된 색상 체계
3. 프레스코(르네상스 판화) 스타일의 일러스트
4. 그래프 노드: 크기=관계수, 색상=카테고리, 테두리=시대
5. 지도 마커: 클러스터링 + 카테고리 파이 차트
6. 접근성: aria-label, 고대비 모드, 터치 영역 44px
7. SVG 최적화: SVGO, currentColor, 인라인
```
