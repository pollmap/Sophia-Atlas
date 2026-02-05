# 07. 도메인 확장 아키텍처 (Domain Expansion Architecture)

> Sophia Atlas가 철학 32명에서 1,000명+ 인물, 300개+ 엔터티로 확장하기 위한 체계적 아키텍처

---

## 1. 확장 전략 개요

### 1.1 현재 → 목표

```
v1 (현재)                    v2 (MVP)                    v3 (목표)
─────────                    ────────                    ────────
철학자 32명                   인물 200명 (MVP)             인물 1,000명+
종교 12개                     엔터티 100개+                엔터티 300개+
관계 90개                     관계 2,000개+                관계 5,000개+
페이지 ~25개                  페이지 ~350개                페이지 ~1,500개+
번들 ~200KB                   번들 ~600KB                  번들 ~2MB (분할)
```

### 1.2 확장 원칙

1. **점진적 확장 (Incremental)**: MVP 200명 → 573명 → 1,000명+ 단계적 추가
2. **데이터 주도 (Data-Driven)**: 새 도메인 추가 시 코드 변경 최소화
3. **성능 보존 (Performance-First)**: 데이터 증가에도 초기 로딩 3초 이내
4. **품질 우선 (Quality over Quantity)**: 빈약한 100명보다 충실한 50명이 낫다
5. **구조적 일관성 (Structural Consistency)**: 모든 도메인이 동일한 스키마 준수

---

## 2. 도메인 분류 체계

### 2.1 카테고리 아키텍처

```
Root
├── philosopher (187명)
│   ├── pre_socratic (15)
│   ├── classical_greek (8)
│   ├── sophist (5)
│   ├── hellenistic (7)
│   ├── roman_late_ancient (12)
│   ├── patristic (6)
│   ├── scholastic (14)
│   ├── islamic_jewish (12)
│   ├── renaissance_early_modern (10)
│   ├── rationalist (5)
│   ├── empiricist (6)
│   ├── enlightenment (10)
│   ├── german_idealist (8)
│   ├── 19th_century (6)
│   ├── existentialist (12)
│   ├── analytic (18)
│   ├── critical_theory (10)
│   ├── poststructuralist (10)
│   ├── ethics_political (8)
│   ├── contemporary_other (5)
│   ├── chinese (18)
│   ├── indian (12)
│   └── korean (5)
│
├── religious_figure (156명)
│   ├── christianity (65)
│   │   ├── apostolic (12)
│   │   ├── patristic (10)
│   │   ├── medieval (15)
│   │   ├── reformation (10)
│   │   └── modern (18)
│   ├── islam (35)
│   │   ├── prophetic (5)
│   │   ├── classical (15)
│   │   └── sufi (15)
│   ├── buddhism (30)
│   │   ├── theravada (8)
│   │   ├── mahayana (12)
│   │   └── zen_chan (10)
│   ├── hinduism (15)
│   └── judaism (11)
│
├── scientist (130명)
│   ├── ancient_medieval (20)
│   ├── scientific_revolution (20)
│   ├── mathematics (10)
│   ├── physics (35)
│   ├── chemistry (10)
│   ├── biology_medicine (25)
│   └── computer_science (10)
│
├── historical_figure (70명)
│   ├── political (40)
│   ├── military (15)
│   └── social_activist (15)
│
└── cultural_figure (30명)
    ├── literature (15)
    └── arts_music (15)
```

### 2.2 서브카테고리 타입 정의

```typescript
// src/types/categories.ts

type PhilosopherSubcategory =
  | 'pre_socratic' | 'classical_greek' | 'sophist' | 'hellenistic'
  | 'roman_late_ancient' | 'patristic' | 'scholastic' | 'islamic_jewish'
  | 'renaissance_early_modern' | 'rationalist' | 'empiricist' | 'enlightenment'
  | 'german_idealist' | '19th_century' | 'existentialist' | 'analytic'
  | 'critical_theory' | 'poststructuralist' | 'ethics_political'
  | 'contemporary_other' | 'chinese' | 'indian' | 'korean';

type ReligiousFigureSubcategory =
  | 'christianity_apostolic' | 'christianity_patristic' | 'christianity_medieval'
  | 'christianity_reformation' | 'christianity_modern'
  | 'islam_prophetic' | 'islam_classical' | 'islam_sufi'
  | 'buddhism_theravada' | 'buddhism_mahayana' | 'buddhism_zen'
  | 'hinduism' | 'judaism';

type ScientistSubcategory =
  | 'ancient_medieval' | 'scientific_revolution' | 'mathematics'
  | 'physics' | 'chemistry' | 'biology_medicine' | 'computer_science';

type HistoricalFigureSubcategory =
  | 'political' | 'military' | 'social_activist';

type CulturalFigureSubcategory =
  | 'literature' | 'arts_music';

type PersonSubcategory =
  | PhilosopherSubcategory
  | ReligiousFigureSubcategory
  | ScientistSubcategory
  | HistoricalFigureSubcategory
  | CulturalFigureSubcategory;
```

### 2.3 엔터티 도메인 확장

```
Entity Types
├── event (40개+)
│   ├── political_revolution (10)
│   ├── intellectual_movement (10)
│   ├── scientific_discovery (10)
│   └── religious_schism (10)
│
├── ideology (25개+)
│   ├── philosophical (10)
│   ├── political (10)
│   └── social (5)
│
├── movement (20개+)
│   ├── philosophical_school (10)
│   └── social_movement (10)
│
├── institution (15개+)
│   ├── academy (5)
│   ├── religious_order (5)
│   └── learned_society (5)
│
├── text (20개+)
│   ├── scripture (8)
│   ├── philosophical_work (7)
│   └── scientific_work (5)
│
└── concept (30개+)
    ├── philosophical (15)
    ├── scientific (10)
    └── religious (5)
```

---

## 3. 데이터 파일 분할 전략

### 3.1 파일 구조

```
src/data/
├── persons/
│   ├── philosophers.json          # 187명 (~190KB)
│   ├── religious-figures.json     # 156명 (~160KB)
│   ├── scientists.json            # 130명 (~130KB)
│   └── historical-figures.json    # 100명 (~100KB)
│
├── entities/
│   ├── events.json                # 40개+ (~50KB)
│   ├── ideologies.json            # 25개+ (~30KB)
│   ├── movements.json             # 20개+ (~25KB)
│   ├── institutions.json          # 15개+ (~18KB)
│   ├── texts.json                 # 20개+ (~25KB)
│   └── concepts.json              # 30개+ (~35KB)
│
├── relationships/
│   ├── person-person.json         # ~1500관계 (~200KB)
│   ├── person-entity.json         # ~300관계 (~40KB)
│   └── entity-entity.json         # ~200관계 (~25KB)
│
├── religions.json                 # 15개 (~20KB)
├── quotes.json                    # 500개+ (~60KB)
└── glossary.json                  # 200개+ (~30KB)

총 예상: ~1.1MB (압축 시 ~300KB)
```

### 3.2 청크 분할 (v3 대비)

1,000명+ 규모에서는 단일 JSON이 비효율적. 청크 분할 전략:

```typescript
// src/lib/data-loader.ts

// Phase 2: 단일 파일 로딩 (573명 규모)
export async function loadAllPersons(): Promise<Person[]> {
  const [philosophers, religious, scientists, historical] = await Promise.all([
    import('@/data/persons/philosophers.json'),
    import('@/data/persons/religious-figures.json'),
    import('@/data/persons/scientists.json'),
    import('@/data/persons/historical-figures.json'),
  ]);
  return [...philosophers, ...religious, ...scientists, ...historical];
}

// Phase 3: 청크 분할 로딩 (1,000명+ 규모)
// 시대별 분할
export async function loadPersonsByEra(era: Era): Promise<Person[]> {
  const chunk = await import(`@/data/persons/by-era/${era}.json`);
  return chunk.default;
}

// 카테고리+시대 교차 분할
export async function loadPersonsChunk(
  category: PersonCategory,
  era: Era
): Promise<Person[]> {
  const chunk = await import(
    `@/data/persons/chunks/${category}-${era}.json`
  );
  return chunk.default;
}
```

### 3.3 인덱스 파일 전략

전체 데이터를 로드하지 않고 검색/필터링을 위한 경량 인덱스:

```typescript
// src/data/indices/person-index.json
// 인물당 ~100바이트 → 1000명 ≈ 100KB
interface PersonIndex {
  id: string;
  name: { ko: string; en: string };
  era: Era;
  category: PersonCategory;
  subcategory: string;
  period: { start: number; end: number };
  location: { lat: number; lng: number };
  mvp: boolean;
  tags: string[];  // 검색용
}

// src/data/indices/entity-index.json
interface EntityIndex {
  id: string;
  type: EntityType;
  name: { ko: string; en: string };
  era?: Era;
  period?: { start: number; end?: number };
  tags: string[];
}

// src/data/indices/relationship-index.json
// 관계당 ~50바이트 → 5000관계 ≈ 250KB
interface RelationshipIndex {
  source: string;
  target: string;
  type: string;
  strength?: number;
}
```

---

## 4. MVP 우선순위 시스템

### 4.1 MVP 선정 기준

각 인물에 MVP 점수를 부여 (0-100):

```typescript
interface MVPScore {
  historicalImpact: number;     // 0-25: 역사적 영향력
  crossDomainRelevance: number; // 0-25: 교차 도메인 관련성
  pedagogicalValue: number;     // 0-25: 교육적 가치
  connectionDensity: number;    // 0-25: 관계 밀도
}

// MVP 기준: 총점 60점 이상
```

### 4.2 MVP 200명 구성

| 카테고리 | MVP 수 | 선정 기준 |
|----------|--------|-----------|
| 철학자 | 75명 | 서양 50 + 동양 25, 시대별 균형 |
| 종교 인물 | 52명 | 5대 종교 균형 배분 |
| 과학자 | 48명 | 분야별 균형, 철학적 연관 우선 |
| 역사/문화 | 25명 | 사상사 관련 인물 우선 |

### 4.3 MVP 구현 순서

```
Wave 1 (핵심 50명) — 가장 많은 관계를 가진 허브 인물
├── 소크라테스, 플라톤, 아리스토텔레스 (철학 핵심)
├── 데카르트, 칸트, 헤겔, 니체 (근대 핵심)
├── 석가모니, 예수, 무함마드 (종교 창시자)
├── 뉴턴, 아인슈타인, 다윈 (과학 핵심)
├── 공자, 노자, 주희 (동양 핵심)
└── ... (관계 밀도 상위 50명)

Wave 2 (확장 100명) — Wave 1과 직접 연결된 인물
├── Wave 1 인물의 스승/제자
├── Wave 1 인물이 속한 학파의 핵심 인물
└── Wave 1 엔터티와 관련된 핵심 인물

Wave 3 (완성 50명) — 도메인 균형 보완
├── 과소 대표 시대/지역 보강
├── 여성 사상가 보강
└── 비서양 사상가 보강
```

---

## 5. 도메인 간 교차점 설계

### 5.1 교차 도메인 매핑

Sophia Atlas의 핵심 가치는 **도메인 간 연결**에 있다:

```
철학 ←→ 종교
├── 아우구스티누스: 신학 + 플라톤주의
├── 아퀴나스: 스콜라철학 + 아리스토텔레스
├── 이븐 시나: 이슬람 철학 + 형이상학
├── 원효: 불교 + 화쟁 사상
└── 파스칼: 합리론 + 기독교 변증

철학 ←→ 과학
├── 아리스토텔레스: 자연철학의 시조
├── 데카르트: 합리론 + 좌표계
├── 라이프니츠: 모나드론 + 미적분
├── 칸트: 인식론 + 성운설
├── 화이트헤드: 과정철학 + 수학기초론
└── 쿤: 과학철학 + 패러다임

종교 ←→ 역사
├── 콘스탄티누스: 기독교 공인
├── 무함마드: 이슬람 제국 건설
├── 루터: 종교개혁 → 30년 전쟁
├── 간디: 힌두 사상 + 독립운동
└── 달라이 라마: 불교 + 티베트 정치

과학 ←→ 철학
├── 갈릴레오: 과학혁명 + 교회 갈등
├── 다윈: 진화론 → 사회진화론 논쟁
├── 아인슈타인: 상대성 → 시공간 철학
├── 하이젠베르크: 불확정성 → 인식론
└── 튜링: 계산이론 → 마음의 철학
```

### 5.2 교차점 시각화 전략

```typescript
// 교차 도메인 뷰 컴포넌트
interface CrossDomainView {
  // 벤 다이어그램: 2-3 도메인 간 교집합 인물 표시
  vennDiagram: {
    domains: PersonCategory[];
    intersections: Person[];
  };

  // 산키 다이어그램: 도메인 간 영향 흐름
  sankeyFlow: {
    nodes: (Person | Entity)[];
    links: Relationship[];
    flowDirection: 'temporal' | 'causal';
  };

  // 히트맵: 시대×도메인 밀도
  densityHeatmap: {
    xAxis: Era[];
    yAxis: PersonCategory[];
    cells: { count: number; persons: string[] }[][];
  };
}
```

### 5.3 교차 태그 시스템

```typescript
// 도메인 교차를 위한 태그 분류
const crossDomainTags = {
  thematic: [
    '인식론', '존재론', '윤리학', '정치철학', '미학',
    '자유의지', '결정론', '이원론', '일원론', '유물론',
    '신비주의', '합리주의', '경험주의', '실용주의'
  ],
  methodological: [
    '변증법', '분석적방법', '현상학', '해석학',
    '실험적방법', '명상', '문답법', '비판적방법'
  ],
  temporal: [
    '축의시대', '헬레니즘', '중세', '르네상스',
    '계몽주의', '낭만주의', '모더니즘', '포스트모더니즘'
  ],
  geographical: [
    '그리스', '로마', '중동', '인도', '중국', '한국', '일본',
    '서유럽', '독일', '프랑스', '영미', '러시아'
  ]
};
```

---

## 6. 새 도메인 추가 프로토콜

### 6.1 도메인 추가 체크리스트

새 카테고리(예: `economist`, `psychologist`)를 추가할 때:

```markdown
## 새 도메인 추가 체크리스트

### 1. 타입 정의
- [ ] PersonCategory에 새 카테고리 추가
- [ ] PersonSubcategory에 서브카테고리 추가
- [ ] 카테고리 전용 필드 정의 (선택)
- [ ] 카테고리 컬러/아이콘 정의

### 2. 데이터 파일
- [ ] src/data/persons/{category}.json 생성
- [ ] MVP 인물 선정 및 데이터 작성
- [ ] 기존 인물과의 관계 데이터 추가
- [ ] 인덱스 파일 업데이트

### 3. 컴포넌트
- [ ] 카테고리 필터에 새 항목 추가
- [ ] PersonCard에 카테고리 뱃지 스타일 추가
- [ ] 타임라인/지도에 새 카테고리 표시 확인

### 4. 페이지
- [ ] 도메인 전용 페이지 필요 여부 결정
- [ ] 필요 시 /domain/page.tsx 생성
- [ ] 네비게이션에 추가

### 5. 검증
- [ ] 빌드 통과 확인
- [ ] 교차 도메인 관계 정상 표시 확인
- [ ] 검색에서 새 인물 노출 확인
- [ ] 정적 페이지 생성 확인
```

### 6.2 도메인 레지스트리

```typescript
// src/lib/domain-registry.ts
// 새 도메인 추가 시 이 파일만 수정하면 UI 자동 반영

export const DOMAIN_REGISTRY: Record<PersonCategory, DomainConfig> = {
  philosopher: {
    label: { ko: '철학자', en: 'Philosopher' },
    color: '#6366F1',
    icon: 'BookOpen',
    subcategories: [ /* ... */ ],
    specificFields: ['school', 'concepts', 'questions'],
    dataFile: 'persons/philosophers.json',
    dedicatedPage: '/philosophy',
    timelineEnabled: true,
    mapEnabled: true,
  },
  religious_figure: {
    label: { ko: '종교 인물', en: 'Religious Figure' },
    color: '#F59E0B',
    icon: 'Scroll',
    subcategories: [ /* ... */ ],
    specificFields: ['religionId', 'role'],
    dataFile: 'persons/religious-figures.json',
    dedicatedPage: '/religion',
    timelineEnabled: true,
    mapEnabled: true,
  },
  scientist: {
    label: { ko: '과학자', en: 'Scientist' },
    color: '#10B981',
    icon: 'Atom',
    subcategories: [ /* ... */ ],
    specificFields: ['field', 'discoveries'],
    dataFile: 'persons/scientists.json',
    dedicatedPage: '/science',
    timelineEnabled: true,
    mapEnabled: true,
  },
  historical_figure: {
    label: { ko: '역사 인물', en: 'Historical Figure' },
    color: '#EF4444',
    icon: 'Crown',
    subcategories: [ /* ... */ ],
    specificFields: ['domain', 'achievements'],
    dataFile: 'persons/historical-figures.json',
    dedicatedPage: '/history',
    timelineEnabled: true,
    mapEnabled: true,
  },
  cultural_figure: {
    label: { ko: '문화 인물', en: 'Cultural Figure' },
    color: '#EC4899',
    icon: 'Palette',
    subcategories: [ /* ... */ ],
    specificFields: ['domain', 'achievements'],
    dataFile: 'persons/cultural-figures.json',
    dedicatedPage: '/culture',
    timelineEnabled: true,
    mapEnabled: true,
  },
};

export interface DomainConfig {
  label: { ko: string; en: string };
  color: string;
  icon: string;
  subcategories: { value: string; label: { ko: string; en: string } }[];
  specificFields: string[];
  dataFile: string;
  dedicatedPage: string;
  timelineEnabled: boolean;
  mapEnabled: boolean;
}
```

---

## 7. 지역/문명권 확장

### 7.1 지역 분류 체계

```typescript
type GeoRegion =
  | 'greece' | 'rome' | 'mediterranean'
  | 'western_europe' | 'central_europe' | 'eastern_europe'
  | 'britain' | 'france' | 'germany' | 'iberia' | 'scandinavia'
  | 'middle_east' | 'persia' | 'arabia' | 'ottoman'
  | 'india' | 'southeast_asia' | 'tibet'
  | 'china' | 'korea' | 'japan'
  | 'north_africa' | 'sub_saharan_africa'
  | 'north_america' | 'south_america'
  | 'central_asia' | 'russia';

// 문명권 그룹
const civilizationGroups = {
  'greco_roman': ['greece', 'rome', 'mediterranean'],
  'western': ['western_europe', 'central_europe', 'britain', 'france', 'germany'],
  'islamic': ['middle_east', 'persia', 'arabia', 'ottoman', 'north_africa'],
  'indian': ['india', 'southeast_asia', 'tibet'],
  'east_asian': ['china', 'korea', 'japan'],
  'modern_global': ['north_america', 'south_america', 'russia'],
};
```

### 7.2 지역별 확장 우선순위

```
Priority 1 (MVP): 가장 많은 인물이 분포한 지역
├── 그리스/로마 (고대 철학, 과학)
├── 서유럽 (근대 철학, 과학혁명)
├── 인도 (불교, 힌두교, 인도철학)
├── 중국 (유교, 도교, 중국철학)
└── 중동 (이슬람, 유대교, 이슬람철학)

Priority 2: 교차점이 풍부한 지역
├── 독일/오스트리아 (관념론, 비판이론, 물리학)
├── 프랑스 (계몽주의, 실존주의, 후기구조주의)
├── 영국 (경험론, 분석철학, 진화론)
└── 한국 (불교, 성리학, 실학)

Priority 3: 서사 완성을 위한 보강
├── 일본 (선불교, 교토학파)
├── 러시아 (도스토예프스키, 톨스토이)
├── 북미 (실용주의, 현대과학)
└── 아프리카 (우분투, 탈식민사상)
```

### 7.3 동서양 균형 전략

현재 서양 편중 우려에 대한 대응:

```
목표 비율 (v3)
├── 서양 사상: 55% (그리스/로마/유럽/미주)
├── 동아시아: 20% (중국/한국/일본)
├── 남아시아: 12% (인도/티베트/동남아)
├── 중동/이슬람: 10% (아랍/페르시아/오스만)
└── 기타: 3% (아프리카/중앙아시아)
```

동양 사상의 독자적 분류 체계:

```typescript
// 동양 철학 전용 서브카테고리
const easternPhilosophyTaxonomy = {
  chinese: {
    schools: ['유교', '도교', '법가', '묵가', '명가', '음양가', '양명학', '성리학'],
    periods: ['선진(先秦)', '한대', '위진남북조', '당송', '명청', '근현대'],
  },
  indian: {
    schools: ['베단타', '상캬', '요가', '니야야', '바이셰시카', '미맘사', '불교', '자이나교'],
    periods: ['베다시대', '우파니샤드', '슈라마나', '고전', '중세', '근현대'],
  },
  korean: {
    schools: ['불교', '성리학', '양명학', '실학', '동학', '원불교'],
    periods: ['삼국시대', '고려', '조선전기', '조선후기', '근현대'],
  },
  japanese: {
    schools: ['선불교', '순수토지', '국학', '교토학파'],
    periods: ['나라/헤이안', '가마쿠라', '무로마치', '에도', '메이지이후'],
  },
};
```

---

## 8. 시대 구분 정밀화

### 8.1 현재 4단계 → 확장 시대 구분

```typescript
// 현재: 4단계 (broad)
type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

// 확장: 세부 시대 (fine-grained)
type DetailedEra =
  | 'prehistoric'          // ~BC 3000
  | 'ancient_early'        // BC 3000~BC 500 (이집트, 메소포타미아)
  | 'axial_age'            // BC 800~BC 200 (축의 시대)
  | 'classical'            // BC 500~AD 200 (그리스·로마, 한대)
  | 'late_ancient'         // AD 200~500 (교부시대, 위진)
  | 'early_medieval'       // 500~1000 (암흑기, 이슬람 황금기)
  | 'high_medieval'        // 1000~1300 (스콜라, 십자군)
  | 'late_medieval'        // 1300~1500 (르네상스 초기)
  | 'early_modern'         // 1500~1700 (종교개혁, 과학혁명)
  | 'enlightenment'        // 1700~1800 (계몽주의)
  | 'long_19th_century'    // 1789~1914 (혁명의 시대)
  | 'early_20th_century'   // 1914~1945 (양차대전)
  | 'postwar'              // 1945~1989 (냉전)
  | 'contemporary';        // 1989~현재

// 매핑: DetailedEra → Era (기존 호환)
const eraMapping: Record<DetailedEra, Era> = {
  prehistoric: 'ancient',
  ancient_early: 'ancient',
  axial_age: 'ancient',
  classical: 'ancient',
  late_ancient: 'ancient',
  early_medieval: 'medieval',
  high_medieval: 'medieval',
  late_medieval: 'medieval',
  early_modern: 'modern',
  enlightenment: 'modern',
  long_19th_century: 'modern',
  early_20th_century: 'contemporary',
  postwar: 'contemporary',
  contemporary: 'contemporary',
};
```

### 8.2 축의 시대 (Axial Age) 특별 처리

카를 야스퍼스가 제안한 축의 시대(BC 800~BC 200)는 Sophia Atlas의 핵심 서사:

```
축의 시대 동시성 맵
─────────────────────
BC 600                    BC 500                    BC 400
  │                         │                         │
  ├─ 탈레스 (그리스)         ├─ 붓다 (인도)             ├─ 소크라테스 (그리스)
  ├─ 조로아스터 (페르시아)    ├─ 공자 (중국)             ├─ 플라톤 (그리스)
  ├─ 예레미야 (이스라엘)      ├─ 노자 (중국)             ├─ 아리스토텔레스 (그리스)
  │                         ├─ 마하비라 (인도)           ├─ 맹자 (중국)
  │                         ├─ 파르메니데스 (그리스)      ├─ 장자 (중국)
  │                         └─ 헤라클레이토스 (그리스)     └─ 묵자 (중국)

→ 세계 각지에서 독립적으로 철학적 각성이 일어난 시기
→ 인드라망의 parallel 관계로 표현
```

---

## 9. 관계 밀도 관리

### 9.1 관계 증가 예측

```
인물 수 증가에 따른 관계 수 증가 (이론적)
─────────────────────────────────────────
인물 32명   → 관계 90개    (밀도: 0.18)
인물 200명  → 관계 2,000개  (밀도: 0.10)
인물 573명  → 관계 5,000개  (밀도: 0.03)
인물 1000명 → 관계 8,000개  (밀도: 0.016)

* 밀도 = 실제관계수 / 가능한관계수(n*(n-1)/2)
* 밀도 감소는 정상 — 모든 인물이 연결되지는 않음
```

### 9.2 관계 우선순위

```
Priority 1: 직접적 사제/영향 관계 (strength: 3)
├── 소크라테스 → 플라톤 (teacher_student)
├── 플라톤 → 아리스토텔레스 (teacher_student)
└── ~300개 (핵심 지식 그래프의 뼈대)

Priority 2: 주요 사상적 영향 (strength: 2)
├── 칸트 → 헤겔 (developed)
├── 마르크스 → 레닌 (influenced)
└── ~1,000개 (그래프의 주요 연결)

Priority 3: 간접적/구조적 유사 (strength: 1)
├── 스토아학파 ↔ 불교 (parallel)
├── 칸트 ↔ 프랑스혁명 (contextual)
└── ~3,700개 (배경 연결, 선택적 표시)
```

### 9.3 관계 품질 가이드라인

```markdown
## 좋은 관계 데이터 작성법

### DO
- 구체적 설명: "아리스토텔레스의 형상/질료 이론은 플라톤 이데아론에 대한 비판적 발전"
- 역사적 근거 명시: "1637년 방법서설 출간 후 스피노자가 이를 발전시킴"
- strength를 신중하게 부여: 3은 핵심 관계만

### DON'T
- 모호한 설명: "서로 영향을 주었다"
- 근거 없는 관계: 동시대라는 이유만으로 contextual 남발
- 과도한 관계: 한 인물당 최대 20개 직접 관계 권장
```

---

## 10. 데이터 검증 시스템

### 10.1 자동 검증 규칙

```typescript
// src/lib/data-validator.ts

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

const validationRules = {
  person: [
    // 필수 필드 검증
    (p: Person) => !!p.id && !!p.name.ko && !!p.name.en,
    // 시대-연도 일관성
    (p: Person) => isEraConsistent(p.era, p.period),
    // 위치 좌표 유효성
    (p: Person) => isValidCoordinate(p.location),
    // 관계 참조 유효성 (존재하는 ID인지)
    (p: Person) => p.influences?.every(id => personExists(id)) ?? true,
    // 카테고리-서브카테고리 일관성
    (p: Person) => isSubcategoryValid(p.category, p.subcategory),
    // summary 길이 (50~300자)
    (p: Person) => p.summary.length >= 50 && p.summary.length <= 300,
  ],

  entity: [
    (e: Entity) => !!e.id && !!e.type && !!e.name.ko,
    (e: Entity) => e.relatedPersons?.every(id => personExists(id)) ?? true,
  ],

  relationship: [
    (r: Relationship) => nodeExists(r.source, r.sourceType),
    (r: Relationship) => nodeExists(r.target, r.targetType),
    // 중복 관계 검출
    (r: Relationship) => !isDuplicateRelationship(r),
    // 자기 참조 방지
    (r: Relationship) => r.source !== r.target,
    // 방향 일관성
    (r: Relationship) => isDirectionValid(r.type, r.direction),
  ],
};
```

### 10.2 빌드 시 검증

```typescript
// scripts/validate-data.ts
// npm run validate로 실행

async function validateAllData(): Promise<void> {
  const persons = await loadAllPersons();
  const entities = await loadAllEntities();
  const relationships = await loadAllRelationships();

  console.log(`검증 대상: ${persons.length}명, ${entities.length}엔터티, ${relationships.length}관계`);

  let errorCount = 0;

  // 1. 개별 검증
  for (const person of persons) {
    const result = validatePerson(person);
    if (!result.valid) {
      console.error(`[ERROR] Person ${person.id}:`, result.errors);
      errorCount += result.errors.length;
    }
  }

  // 2. 교차 참조 검증
  const allIds = new Set([
    ...persons.map(p => p.id),
    ...entities.map(e => e.id),
  ]);

  for (const rel of relationships) {
    if (!allIds.has(rel.source)) {
      console.error(`[ERROR] Relationship source not found: ${rel.source}`);
      errorCount++;
    }
    if (!allIds.has(rel.target)) {
      console.error(`[ERROR] Relationship target not found: ${rel.target}`);
      errorCount++;
    }
  }

  // 3. 고아 노드 경고 (관계가 하나도 없는 인물)
  const connectedIds = new Set(relationships.flatMap(r => [r.source, r.target]));
  const orphans = persons.filter(p => !connectedIds.has(p.id));
  if (orphans.length > 0) {
    console.warn(`[WARN] ${orphans.length} persons have no relationships:`,
      orphans.map(p => p.id).join(', '));
  }

  // 4. 결과
  if (errorCount > 0) {
    console.error(`\n❌ ${errorCount} errors found. Fix before deploying.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All data valid.`);
  }
}
```

---

## 11. 마이그레이션 전략

### 11.1 v1 → v2 마이그레이션

```typescript
// scripts/migrate-v1-to-v2.ts

interface V1Philosopher {
  id: string;
  name: string;
  nameKo: string;
  era: string;
  born: number;
  died: number;
  // ... v1 필드
}

function migratePhilosopher(v1: V1Philosopher): Person {
  return {
    id: v1.id,
    name: {
      ko: v1.nameKo || v1.name,
      en: v1.name,
      original: v1.originalName || undefined,
    },
    era: mapEra(v1.era),
    period: {
      start: v1.born,
      end: v1.died,
      approximate: v1.born < 0,  // 고대 인물은 대략적
    },
    location: geocodeFromRegion(v1.region || v1.nationality),
    category: 'philosopher',
    categories: ['philosopher'],
    subcategory: inferSubcategory(v1),
    tags: [...(v1.traditions || []), ...(v1.interests || [])],
    mvp: v1.importance >= 7,  // v1의 중요도 7 이상 → MVP
    summary: v1.description || '',
    detailed: v1.longDescription || '',
    keyWorks: (v1.majorWorks || []).map(w => ({
      title: w.title || w,
      year: w.year,
    })),
    quotes: (v1.quotes || []).map(q => ({
      text: q.text || q,
      source: q.source || '',
    })),
    influences: v1.influences || [],
    influenced: v1.influenced || [],
    school: v1.traditions || [],
    concepts: v1.concepts || v1.keyIdeas || [],
    questions: v1.questions || [],
  };
}
```

### 11.2 데이터 무결성 보장

```
마이그레이션 단계
─────────────────
1. v1 데이터 백업 (src/data/_legacy/)
2. 마이그레이션 스크립트 실행
3. 자동 검증 통과 확인
4. 수동 스팟체크 (5~10명 상세 확인)
5. 기존 페이지 렌더링 비교 테스트
6. v2 데이터 확정
7. _legacy 디렉토리 유지 (Phase 3까지)
```

---

## 12. 성능 예산

### 12.1 데이터 크기 예산

```
Phase 2 (573명) 예산
─────────────────────
persons/*.json     : 580KB (압축 150KB)
entities/*.json    : 183KB (압축 45KB)
relationships/*.json: 265KB (압축 65KB)
indices/*.json     : 150KB (압축 40KB)
religions.json     : 20KB  (압축 5KB)
quotes.json        : 60KB  (압축 15KB)
glossary.json      : 30KB  (압축 8KB)
─────────────────────
총합               : 1,288KB (압축 328KB)

Phase 3 (1000명+) 예산
─────────────────────
총합               : ~2.5MB (압축 ~650KB)
→ 초기 로딩은 인덱스만 (~100KB)
→ 상세 데이터는 on-demand 로딩
```

### 12.2 페이지 생성 예산

```
Phase 2 (573명) 정적 페이지
───────────────────────────
persons/[id]  : 573페이지
entities/[id] : 100페이지
philosophy/[id]: 32페이지 (기존 호환)
religion/[id] : 12페이지 (기존 호환)
고정 페이지   : ~25페이지
───────────────────────────
총합          : ~742페이지

빌드 시간 예상: 2~3분 (Next.js SSG)
```

---

## 13. 향후 확장 비전

### 13.1 v4 이후 잠재 도메인

```
잠재 확장 도메인 (v4+)
├── 경제학자 (economist)
│   └── 애덤 스미스, 케인스, 하이에크, 프리드먼...
├── 심리학자 (psychologist)
│   └── 프로이트, 융, 피아제, 스키너...
├── 사회학자 (sociologist)
│   └── 뒤르켐, 베버, 부르디외...
├── 언어학자 (linguist)
│   └── 소쉬르, 촘스키, 사피어...
└── 수학자 (mathematician) — 과학자에서 독립
    └── 유클리드, 가우스, 리만, 힐베르트...
```

### 13.2 비-인물 중심 탐색

```
현재: 인물 중심 (Person → Entity/Relationship)
미래: 다중 진입점

├── 개념 중심: "자유의지" → 관련 인물 20명 + 논쟁 역사
├── 시대 중심: "계몽주의" → 인물 + 사건 + 저작 + 기관
├── 지역 중심: "고대 아테네" → 소크라테스 학파 전체
├── 질문 중심: "신은 존재하는가?" → 2500년 논쟁사
└── 텍스트 중심: "순수이성비판" → 저자 + 영향 + 비판
```

### 13.3 사용자 기여 데이터

```
v4+ 커뮤니티 기여 모델
├── 인물 데이터 수정 제안 (PR 기반)
├── 새 관계 제안 (검증 파이프라인)
├── 번역 기여 (i18n)
├── 상세 해설 기고 (MDX)
└── 이미지/초상화 기여
```

---

## 14. 요약: 확장 로드맵

```
Phase 2a: MVP 50명 (핵심 허브)
├── Wave 1 데이터 작성
├── v1→v2 마이그레이션
├── 통합 데이터 로더
└── 기존 페이지 v2 연동

Phase 2b: MVP 200명 (완전한 그래프)
├── Wave 2+3 데이터 작성
├── 엔터티 50개+ 작성
├── 관계 1,000개+ 작성
└── 검증 시스템 구축

Phase 2c: 전체 573명
├── 나머지 373명 데이터 작성
├── 엔터티 100개+ 완성
├── 관계 2,000개+ 완성
└── 인덱스 파일 생성

Phase 3: 1,000명+ 확장
├── 추가 인물 427명+
├── 청크 분할 구현
├── on-demand 로딩
└── 커뮤니티 기여 시스템
```
