# Sophia Atlas — 데이터 아키텍처 & 온톨로지 설계서 v1.0

> **"인류 지성의 시공간 지도를 데이터로 구축한다"**
> 작성일: 2026-02-05 | 버전: 1.0 | 상태: Draft

---

## 목차

1. [비전 & 목표](#1-비전--목표)
2. [온톨로지 설계 철학](#2-온톨로지-설계-철학)
3. [Person 데이터 모델](#3-person-데이터-모델)
4. [Entity 데이터 모델](#4-entity-데이터-모델)
5. [Relationship 데이터 모델](#5-relationship-데이터-모델)
6. [데이터 파일 구조 & 분할 전략](#6-데이터-파일-구조--분할-전략)
7. [데이터 품질 관리](#7-데이터-품질-관리)
8. [마이그레이션 계획](#8-마이그레이션-계획)
9. [미래 확장](#9-미래-확장)
10. [부록](#10-부록)

---

## 1. 비전 & 목표

### 1.1 데이터가 곧 프로젝트의 근간이다

Sophia Atlas는 시각화 도구가 아니다. **데이터 프로젝트**이다.
아무리 아름다운 그래프와 타임라인을 만들어도, 그 위에 올라갈 데이터가 빈약하면
사용자에게 전달할 가치가 없다. 반대로 데이터가 풍부하고 정확하면,
시각화는 자연스럽게 의미를 만들어낸다.

따라서 데이터 아키텍처는 Sophia Atlas의 **첫 번째이자 가장 중요한** 설계 문서이다.

### 1.2 데이터로 표현하려는 것

우리가 데이터로 포착하려는 것은 다음과 같다:

```
┌─────────────────────────────────────────────────┐
│                인류 지성의 지도                      │
│                                                   │
│   WHO (누가)     ─── Person (인물)                  │
│   WHAT (무엇을)   ─── Entity (사건/사상/기관/개념)     │
│   HOW (어떻게)    ─── Relationship (관계/영향)        │
│   WHEN (언제)     ─── Period (시간)                  │
│   WHERE (어디서)  ─── Location (공간)                │
│                                                   │
│   이 5가지 축으로 모든 지적 활동을 포착한다              │
└─────────────────────────────────────────────────┘
```

### 1.3 규모 목표

| 단계 | 인물 | 엔터티 | 관계 | 시기 |
|------|------|--------|------|------|
| **현재 (v4)** | 565명 | 115개 | 600+ | 완료 |
| **MVP (v5)** | 200명 정제 | 150개 | 2,000+ | Phase 2 |
| **v5 완성** | 1,000명 | 300개 | 5,000+ | Phase 3 |
| **v6 확장** | 2,000명 | 500개 | 10,000+ | Phase 5 |
| **장기 목표** | 5,000명+ | 1,000개+ | 50,000+ | 2년+ |

### 1.4 핵심 원칙

1. **정확성 우선**: 양보다 질. 잘못된 데이터는 없는 것보다 해롭다.
2. **연결 중심**: 고립된 인물 데이터는 가치가 낮다. 관계가 핵심이다.
3. **점진적 확장**: MVP부터 시작해 점진적으로 깊이와 넓이를 확장한다.
4. **구조적 일관성**: 모든 데이터는 동일한 스키마를 따른다.
5. **탈중심성**: 서양 중심주의를 경계하고, 다양한 전통을 균형 있게 다룬다.

---

## 2. 온톨로지 설계 철학

### 2.1 온톨로지란 무엇인가

온톨로지(Ontology)는 원래 철학에서 "존재하는 것들의 분류 체계"를 의미한다.
정보과학에서는 **특정 도메인의 개념과 그 관계를 형식적으로 기술한 것**을 뜻한다.

Sophia Atlas의 온톨로지는 "인류 지성의 역사"라는 도메인에서:
- 어떤 **종류의 것들**이 존재하는가? (Person, Entity)
- 그것들이 어떤 **속성**을 갖는가? (필드 정의)
- 그것들 사이에 어떤 **관계**가 가능한가? (Relationship)

를 정의한다.

### 2.2 3축 모델: Person — Entity — Relationship

```
          Person (인물)
           /        \
          /          \
    Relationship ─── Entity (비인물)
    (관계)
```

**Person (인물)**: 특정 개인. 소크라테스, 다윈, 간디 등.
- 생몰년, 위치, 카테고리, 사상, 저작 등 풍부한 속성

**Entity (엔터티)**: 인물이 아닌 모든 지적 존재자.
- 사건(event): 프랑스 혁명, 과학혁명
- 사상(ideology): 실존주의, 공리주의
- 학파(movement): 스토아학파, 프랑크푸르트학파
- 기관(institution): 아카데메이아, 왕립학회
- 문헌(text): 성경, 순수이성비판
- 개념(concept): 이데아, 도(道), 공(空)
- 국가(nation): 아테네, 로마제국

**Relationship (관계)**: Person↔Person, Person↔Entity, Entity↔Entity.
- 23종 관계 유형
- 방향성, 강도, 시점 등 메타데이터

### 2.3 왜 JSON인가? (RDF/OWL 대비)

| 기준 | JSON 파일 | RDF/OWL | 선택 |
|------|-----------|---------|------|
| 학습 곡선 | 낮음 | 높음 | **JSON** |
| 도구 생태계 | 풍부 (JS/TS) | 제한적 | **JSON** |
| 쿼리 유연성 | 제한적 | SPARQL 강력 | RDF |
| 정적 생성 호환 | 완벽 | 서버 필요 | **JSON** |
| Git 버전 관리 | 우수 | 가능하나 불편 | **JSON** |
| 커뮤니티 기여 | 쉬움 | 어려움 | **JSON** |
| 추론 (inference) | 불가 | 가능 | RDF |
| 규모 한계 | ~5000건 | 무제한 | RDF |

**결론**: 현재 규모(1000~5000건)에서는 JSON이 최적이다.
5000건 이상으로 확장 시 SQLite 또는 Turso(Edge DB) 전환을 검토한다.
RDF/OWL은 학술 연동 시 내보내기 형식으로 지원하는 것이 현실적이다.

### 2.4 기존 온톨로지와의 비교

| 온톨로지 | 용도 | Sophia Atlas와의 관계 |
|----------|------|----------------------|
| **CIDOC-CRM** | 문화유산 | 사건·인물·장소 모델 참조 |
| **FOAF** | 소셜 네트워크 | Person 모델 부분 참조 |
| **Schema.org** | 웹 구조화 데이터 | SEO용 JSON-LD 출력 활용 |
| **DBpedia** | 위키피디아 구조화 | 외부 데이터 연동 참조 |
| **Wikidata** | 범용 지식그래프 | ID 매핑 및 데이터 보완 |

Sophia Atlas는 이들의 하위 호환이 아니라, **인류 지성사에 특화된 독자적 온톨로지**를 구축하되,
필요 시 위 표준들로 **매핑/내보내기**할 수 있도록 설계한다.

---

## 3. Person 데이터 모델

### 3.1 전체 TypeScript Interface

```typescript
/**
 * Person — 소피아 아틀라스의 핵심 데이터 단위
 *
 * 모든 인물(철학자, 종교인, 과학자, 역사인물, 문화인물)은
 * 이 인터페이스를 따른다.
 */
interface Person {
  // ─── 식별 ────────────────────────────────
  id: string;                          // URL slug (kebab-case, 영문)

  // ─── 이름 ────────────────────────────────
  name: {
    ko: string;                        // 한국어 표기 (기본)
    en: string;                        // 영문 표기
    original?: string;                 // 원어 표기 (그리스어, 산스크리트어 등)
    alternatives?: string[];           // 별명, 다른 표기
  };

  // ─── 시간 ────────────────────────────────
  era: Era;                            // 'ancient' | 'medieval' | 'modern' | 'contemporary'
  period: {
    start: number;                     // 출생/시작 연도 (BCE는 음수: -470)
    end: number;                       // 사망/종료 연도
    approximate?: boolean;             // 추정치 여부 (기본: false)
    startApprox?: boolean;             // 출생년만 추정
    endApprox?: boolean;               // 사망년만 추정
  };

  // ─── 공간 ────────────────────────────────
  location: {
    lat: number;                       // 위도 (주요 활동지)
    lng: number;                       // 경도
    region: string;                    // 한국어 지역명
    regions?: string[];                // 복수 활동지
  };

  // ─── 분류 ────────────────────────────────
  category: PersonCategory;            // 주 카테고리
  categories?: PersonCategory[];       // 복수 카테고리
  subcategory: PersonSubcategory;      // 세부 분류
  tags: string[];                      // 자유 태그
  mvp: boolean;                        // MVP 200명 포함 여부

  // ─── 콘텐츠 ───────────────────────────────
  summary: string;                     // 1~3문장 요약
  detailed: string;                    // 500~2000자 상세 설명
  keyWorks?: Work[];                   // 주요 저작/업적
  quotes?: PersonQuote[];              // 명언

  // ─── 관계 참조 (간략) ──────────────────────
  influences?: string[];               // 이 인물이 영향 받은 인물 id[]
  influenced?: string[];               // 이 인물이 영향 준 인물 id[]

  // ─── 철학자 전용 ──────────────────────────
  school?: string[];                   // 소속 학파
  concepts?: string[];                 // 핵심 개념
  questions?: string[];                // 탐구한 철학적 질문
  tradition?: PhilosophyTradition;     // 'western' | 'eastern' | 'islamic' | 'african'

  // ─── 종교 인물 전용 ─────────────────────
  religionId?: string;                 // 종교 id
  role?: string;                       // 역할 (예언자, 성인, 교부 등)
  sect?: string;                       // 종파
  teachings?: string[];                // 핵심 가르침

  // ─── 과학자 전용 ──────────────────────────
  field?: string[];                    // 연구 분야
  discoveries?: string[];              // 주요 발견/발명
  nobelPrize?: boolean;                // 노벨상 수상 여부
  publications?: Work[];               // 주요 논문/저서

  // ─── 역사 인물 전용 ─────────────────────
  domain?: string;                     // 활동 영역
  achievements?: string[];             // 주요 업적
  era_significance?: string;           // 시대적 의의

  // ─── 문화 인물 전용 ─────────────────────
  artForm?: string;                    // 예술 형태
  masterworks?: Work[];                // 대표작
  style?: string;                      // 양식/사조
  movement?: string;                   // 소속 운동
}
```

### 3.2 보조 타입 정의

```typescript
type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary';

type PersonCategory =
  | 'philosopher'
  | 'religious_figure'
  | 'scientist'
  | 'historical_figure'
  | 'cultural_figure';

// 시대 구분 기준
// ancient:       ~500 CE  (고대)
// medieval:      500~1500 CE  (중세)
// modern:        1500~1900 CE  (근대)
// contemporary:  1900~ CE  (현대)

interface Work {
  title: string;           // 작품/저작 제목
  year?: number;           // 출판/발표 연도
  type?: string;           // 'book' | 'paper' | 'painting' | 'symphony' | 'speech' 등
  description?: string;    // 간략 설명
}

interface PersonQuote {
  text: string;            // 명언 본문
  source?: string;         // 출처 (저작명, 연설명 등)
  year?: number;           // 발언/기록 연도
  context?: string;        // 맥락 설명
}
```

### 3.3 id 생성 규칙

| 규칙 | 설명 | 예시 |
|------|------|------|
| 형식 | kebab-case, 영문 소문자 | `socrates`, `ibn-sina` |
| 고유성 | 전체 인물 중 유일해야 함 | — |
| 길이 | 3~50자 | — |
| 문자 | `[a-z0-9-]` | — |
| 동명이인 | 접미사로 구분 | `john-of-damascus`, `john-locke` |
| 한자권 | 로마자 표기 | `confucius` (공자), `zhu-xi` (주희) |
| 아랍권 | 일반적 로마자 표기 | `ibn-rushd`, `al-ghazali` |
| 산스크리트 | IAST 간소화 | `nagarjuna`, `shankara` |

### 3.4 카테고리 체계

#### 5대 카테고리

| 카테고리 | 색상 | 아이콘 | 대상 |
|----------|------|--------|------|
| `philosopher` | #4A5D8A | BookOpen | 철학자, 사상가 |
| `religious_figure` | #B8860B | Scroll | 종교 지도자, 신학자, 신비가 |
| `scientist` | #5B7355 | Atom | 과학자, 수학자, 발명가 |
| `historical_figure` | #8B4040 | Crown | 정치가, 군인, 법률가 |
| `cultural_figure` | #7A5478 | Palette | 작가, 예술가, 음악가 |

#### 서브카테고리 전체 목록 (38종)

**철학 (23종):**

| 서브카테고리 | 시대 | 대표 인물 |
|-------------|------|-----------|
| `presocratic` | 고대 | 탈레스, 헤라클레이토스, 파르메니데스 |
| `classical_greek` | 고대 | 소크라테스, 플라톤, 아리스토텔레스 |
| `sophist` | 고대 | 프로타고라스, 고르기아스 |
| `hellenistic` | 고대 | 에피쿠로스, 제논, 디오게네스 |
| `roman_late_ancient` | 고대 | 세네카, 에픽테토스, 플로티노스 |
| `patristic` | 중세 | 아우구스티누스, 오리게네스 |
| `scholastic` | 중세 | 아퀴나스, 둔스 스코투스, 오컴 |
| `islamic_jewish` | 중세 | 이븐 시나, 이븐 루시드, 마이모니데스 |
| `renaissance` | 근대 | 마키아벨리, 에라스무스 |
| `rationalism` | 근대 | 데카르트, 스피노자, 라이프니츠 |
| `empiricism` | 근대 | 로크, 버클리, 흄 |
| `enlightenment` | 근대 | 볼테르, 루소, 몽테스키외 |
| `german_idealism` | 근대 | 칸트, 피히테, 헤겔, 쇼펜하우어 |
| `utilitarianism` | 근대 | 벤담, 밀 |
| `existentialism` | 현대 | 키르케고르, 니체, 하이데거, 사르트르 |
| `analytic` | 현대 | 프레게, 러셀, 비트겐슈타인 |
| `critical_theory` | 현대 | 마르크스, 아도르노, 하버마스 |
| `poststructuralism` | 현대 | 푸코, 데리다, 들뢰즈 |
| `political_philosophy` | 현대 | 롤스, 아렌트, 샌델 |
| `pragmatism` | 현대 | 제임스, 듀이, 로티 |
| `chinese` | 고대~현대 | 공자, 노자, 주희, 왕양명 |
| `indian` | 고대~현대 | 붓다, 나가르주나, 샹카라 |
| `korean` | 중세~근대 | 원효, 퇴계, 율곡, 다산 |

**종교 (5종):**

| 서브카테고리 | 대표 인물 |
|-------------|-----------|
| `christianity` | 예수, 바울, 아우구스티누스, 루터 |
| `islam` | 무함마드, 알 가잘리, 루미 |
| `buddhism` | 석가모니, 혜능, 달라이 라마 |
| `hinduism` | 샹카라, 라마크리슈나, 간디 |
| `judaism` | 모세, 마이모니데스, 힐렐 |

**과학 (7종):**

| 서브카테고리 | 대표 인물 |
|-------------|-----------|
| `physics` | 뉴턴, 아인슈타인, 보어 |
| `chemistry` | 라부아지에, 멘델레예프 |
| `biology` | 다윈, 크릭, 왓슨 |
| `mathematics` | 유클리드, 오일러, 가우스 |
| `medicine` | 히포크라테스, 플레밍 |
| `computer_science` | 튜링, 폰 노이만, 섀넌 |
| `astronomy` | 코페르니쿠스, 갈릴레오, 케플러 |

**역사/문화 (3종):**

| 서브카테고리 | 대표 인물 |
|-------------|-----------|
| `political` | 알렉산드로스, 나폴레옹, 링컨 |
| `literary` | 호메로스, 셰익스피어, 도스토예프스키 |
| `artistic` | 다 빈치, 바흐, 베토벤 |

### 3.5 중복 카테고리 처리

한 인물이 여러 카테고리에 속할 수 있다:

```json
{
  "id": "pascal",
  "category": "philosopher",
  "categories": ["philosopher", "scientist"],
  "subcategory": "rationalism"
}
```

**규칙:**
1. `category`는 **주 카테고리** (데이터 파일 위치 결정)
2. `categories[]`는 **모든 소속 카테고리** (UI 표시용)
3. 데이터 파일에는 주 카테고리 파일에만 저장 (중복 없음)
4. UI에서는 모든 카테고리 뷰에 표시

**대표 중복 인물:**

| 인물 | 주 카테고리 | 복수 카테고리 |
|------|------------|--------------|
| 아우구스티누스 | philosopher | philosopher, religious_figure |
| 파스칼 | philosopher | philosopher, scientist |
| 간디 | historical_figure | historical_figure, philosopher, religious_figure |
| 다 빈치 | cultural_figure | cultural_figure, scientist |
| 오마르 하이얌 | scientist | scientist, cultural_figure |
| 이븐 시나 | philosopher | philosopher, scientist |

### 3.6 period 처리 규칙

```
BCE(기원전) → 음수로 표기
  소크라테스: { start: -470, end: -399 }
  붓다:      { start: -563, end: -483, approximate: true }

CE(기원후) → 양수로 표기
  아퀴나스:  { start: 1225, end: 1274 }
  칸트:      { start: 1724, end: 1804 }

생존 인물 → end를 현재 연도 또는 0으로
  촘스키:    { start: 1928, end: 2025 }

생몰년 미상 → approximate: true + 추정치
  호메로스:  { start: -800, end: -701, approximate: true }
```

### 3.7 location 좌표 체계

- **정밀도**: 소수점 2자리 (약 1.1km 정밀도, 도시 수준)
- **기준**: 주요 활동지 (출생지가 아닌 경우가 많음)
- **복수 거점**: regions[] 배열로 복수 활동지 문자열 나열

```json
{
  "location": {
    "lat": 37.97,
    "lng": 23.72,
    "region": "그리스 아테네",
    "regions": ["그리스 아테네", "마케도니아"]
  }
}
```

---

## 4. Entity 데이터 모델

### 4.1 전체 TypeScript Interface

```typescript
/**
 * Entity — 인물이 아닌 모든 지적 존재자
 * 사건, 사상, 학파, 기관, 문헌, 개념, 국가
 */
interface Entity {
  // ─── 식별 ────────────────────────────────
  id: string;                          // kebab-case 영문
  type: EntityType;                    // 엔터티 유형

  // ─── 이름 ────────────────────────────────
  name: {
    ko: string;
    en: string;
    original?: string;
  };

  // ─── 시공간 ───────────────────────────────
  period?: {
    start: number;
    end?: number;
    approximate?: boolean;
  };
  location?: {
    lat: number;
    lng: number;
    region: string;
  };
  era?: Era;

  // ─── 콘텐츠 ───────────────────────────────
  summary: string;
  detailed?: string;
  tags: string[];

  // ─── 관계 참조 ─────────────────────────────
  relatedPersons?: string[];           // 관련 인물 id[]
  relatedEntities?: string[];          // 관련 엔터티 id[]

  // ─── 유형별 전용 필드 ──────────────────────
  // event
  significance?: string;               // 역사적 의의

  // ideology / movement
  founders?: string[];                 // 창시자 id[]
  keyPrinciples?: string[];            // 핵심 원리

  // institution
  foundedYear?: number;                // 설립 연도
  foundedBy?: string[];                // 설립자 id[]

  // text
  author?: string;                     // 저자 id
  writtenYear?: number;                // 저술 연도
  tradition?: string;                  // 소속 전통

  // concept
  domain?: string;                     // 소속 도메인
  originPerson?: string;               // 최초 제안자 id

  // nation
  capitalCity?: string;                // 수도
  governmentType?: string;             // 정치 체제
}

type EntityType =
  | 'event'
  | 'ideology'
  | 'movement'
  | 'institution'
  | 'text'
  | 'nation'
  | 'concept';
```

### 4.2 엔터티 유형별 목표 수량

| 유형 | 현재 | MVP | v5 완성 | v6 |
|------|------|-----|---------|-----|
| event | 20 | 30 | 50 | 100 |
| ideology | 15 | 25 | 40 | 80 |
| movement | 15 | 25 | 40 | 60 |
| institution | 10 | 15 | 30 | 50 |
| text | 15 | 25 | 50 | 100 |
| concept | 20 | 30 | 60 | 100 |
| nation | 10 | 15 | 30 | 50 |
| **합계** | **105** | **165** | **300** | **540** |

### 4.3 JSON 예시

```json
{
  "id": "scientific-revolution",
  "type": "event",
  "name": { "ko": "과학혁명", "en": "Scientific Revolution" },
  "period": { "start": 1543, "end": 1687 },
  "location": { "lat": 51.5, "lng": -0.1, "region": "유럽" },
  "era": "modern",
  "summary": "코페르니쿠스의 '천구의 회전에 관하여'(1543)부터 뉴턴의 '프린키피아'(1687)까지, 자연에 대한 이해가 근본적으로 변화한 시기.",
  "tags": ["과학사", "근대", "패러다임 전환"],
  "relatedPersons": ["copernicus", "galileo", "kepler", "newton", "bacon", "descartes"],
  "relatedEntities": ["principia-mathematica", "heliocentric-model", "empiricism"],
  "significance": "신학적 세계관에서 기계론적 세계관으로의 전환. 근대 과학 방법론의 확립."
}
```

---

## 5. Relationship 데이터 모델

### 5.1 전체 TypeScript Interface

```typescript
interface Relationship {
  // ─── 연결 ────────────────────────────────
  source: string;                      // 출발 노드 id
  target: string;                      // 도착 노드 id
  sourceType: 'person' | 'entity';     // 출발 노드 유형
  targetType: 'person' | 'entity';     // 도착 노드 유형

  // ─── 관계 속성 ─────────────────────────────
  type: RelationType;                  // 관계 유형
  description: string;                 // 관계 설명 (1~2문장)

  // ─── 메타데이터 ────────────────────────────
  strength?: 1 | 2 | 3;               // 관계 강도
  direction?: 'directed' | 'bidirectional';  // 방향성
  year?: number;                       // 관계 성립 시점
  tags?: string[];                     // 관계 분류 태그
}
```

### 5.2 관계 유형 23종 상세

#### Person ↔ Person (8종)

| 유형 | 방향 | 설명 | 예시 |
|------|------|------|------|
| `influenced` | → | 사상적 영향 | 소크라테스 → 플라톤 |
| `opposed` | → | 사상적 반대/비판 | 아리스토텔레스 → 플라톤(이데아론) |
| `developed` | → | 사상을 발전시킴 | 헤겔 → 칸트(변증법) |
| `parallel` | ↔ | 독립적 구조적 유사 | 스토아 ↔ 불교 |
| `contextual` | ↔ | 같은 시공간 맥락 | 사르트르 ↔ 카뮈 |
| `teacher_student` | → | 직접 사사 관계 | 아리스토텔레스 → 알렉산드로스 |
| `collaborated` | ↔ | 협력/공동 작업 | 마르크스 ↔ 엥겔스 |
| `contemporary` | ↔ | 동시대 경쟁/논쟁 | 라이프니츠 ↔ 뉴턴 |

#### Person ↔ Entity (9종)

| 유형 | 설명 | 예시 |
|------|------|------|
| `founded` | 설립/창시 | 플라톤 → 아카데메이아 |
| `member_of` | 소속/참여 | 비트겐슈타인 → 빈 학파 |
| `participated` | 사건 참여 | 루터 → 종교개혁 |
| `caused` | 사건의 사상적 원인 | 마르크스 → 러시아 혁명 |
| `affected_by` | 사건에 영향받음 | 칸트 → 프랑스 혁명 |
| `authored` | 문헌 저술 | 다윈 → 종의 기원 |
| `advocated` | 사상 옹호 | 간디 → 비폭력주의 |
| `criticized` | 사상/제도 비판 | 니체 → 기독교 도덕 |
| `belongs_to` | 사상/학파 소속 | 스피노자 → 합리론 |

#### Entity ↔ Entity (6종)

| 유형 | 설명 | 예시 |
|------|------|------|
| `preceded` | 시간적 선행 | 르네상스 → 과학혁명 |
| `caused` | 인과 관계 | 인쇄술 → 종교개혁 |
| `part_of` | 부분-전체 | 빈 학파 → 논리실증주의 |
| `opposed_to` | 대립 관계 | 유물론 ↔ 관념론 |
| `evolved_into` | 변형/발전 | 연금술 → 근대 화학 |
| `influenced` | 영향 관계 | 그리스 철학 → 이슬람 황금시대 |

### 5.3 strength 기준 정의

| 강도 | 기준 | 시각화 |
|------|------|--------|
| **3 (강)** | 직접적, 결정적 영향. 해당 관계 없이는 대상의 사상이 성립 불가 | 굵은 실선 |
| **2 (중)** | 명확한 영향. 대상의 사상 형성에 중요한 역할 | 보통 실선 |
| **1 (약)** | 간접적 또는 부분적 영향. 맥락적 연결 | 얇은 선 |

### 5.4 direction 규칙

- `directed`: source → target (단방향). influenced, teacher_student, founded, authored 등
- `bidirectional`: source ↔ target (양방향). parallel, contextual, contemporary, collaborated 등

### 5.5 관계 밀도 목표

| 메트릭 | 현재 | 목표 |
|--------|------|------|
| 인물당 평균 관계 수 | ~2개 | 8~12개 |
| Person↔Person 비율 | 80% | 50% |
| Person↔Entity 비율 | 15% | 35% |
| Entity↔Entity 비율 | 5% | 15% |
| strength 3 비율 | — | 20% |
| strength 2 비율 | — | 50% |
| strength 1 비율 | — | 30% |

---

## 6. 데이터 파일 구조 & 분할 전략

### 6.1 현재 파일 구조

```
src/data/
├── persons/
│   ├── philosophers.json          # 186명
│   ├── religious-figures.json     # 100명+
│   ├── scientists.json            # 130명
│   ├── historical-figures.json    # 100명
│   └── cultural-figures.json      # 50명+
├── entities/
│   ├── events.json
│   ├── ideologies.json
│   ├── movements.json
│   ├── institutions.json
│   ├── texts.json
│   └── concepts.json
├── relationships/
│   ├── person-person.json
│   ├── person-entity.json
│   └── entity-entity.json
├── religions.json
├── quotes.json
└── glossary.json
```

### 6.2 파일 크기 분석 & 관리

| 파일 | 현재 크기(추정) | 1000명 시 | 2000명 시 |
|------|----------------|-----------|-----------|
| philosophers.json | ~280KB | ~400KB | — |
| religious-figures.json | ~150KB | ~250KB | — |
| scientists.json | ~195KB | ~350KB | — |
| 인물 전체 | ~750KB | ~1.5MB | ~3MB |
| 엔터티 전체 | ~200KB | ~400KB | ~800KB |
| 관계 전체 | ~300KB | ~1MB | ~2.5MB |
| **총합** | **~1.2MB** | **~3MB** | **~6.3MB** |

**분할 기준**: 단일 파일 > 500KB일 때 분할 고려.

### 6.3 인덱스 파일 전략 (미래)

대규모 확장 시, 목록 페이지와 상세 페이지의 데이터를 분리:

```
src/data/
├── persons/
│   ├── _index.json                # id, name, category, era만 (목록용 ~50KB)
│   ├── philosophers.json          # 전체 데이터 (상세 페이지용)
│   └── ...
```

### 6.4 데이터 로더 API (data-loader.ts)

```typescript
// ═══════════════════════════════════════════
// data-loader.ts — 통합 데이터 접근 계층
// ═══════════════════════════════════════════

// --- Person 조회 ---
export function getAllPersons(): Person[];
export function getPersonById(id: string): Person | null;
export function getPersonsByCategory(category: PersonCategory): Person[];
export function getPersonsByEra(era: Era): Person[];
export function getPersonsByRegion(region: string): Person[];
export function getMVPPersons(): Person[];
export function searchPersons(query: string, filters?: PersonFilter): Person[];

// --- Entity 조회 ---
export function getAllEntities(): Entity[];
export function getEntityById(id: string): Entity | null;
export function getEntitiesByType(type: EntityType): Entity[];

// --- Relationship 조회 ---
export function getAllRelationships(): Relationship[];
export function getRelationshipsFor(id: string, nodeType?: 'person' | 'entity'): Relationship[];
export function getRelationshipsBetween(id1: string, id2: string): Relationship[];
export function getRelationshipsByType(type: RelationType): Relationship[];

// --- 그래프 데이터 ---
export function getGraphData(filters?: GraphFilter): {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

// --- 타임라인 데이터 ---
export function getTimelineData(filters?: TimelineFilter): TimelineItem[];

// --- 통계 ---
export function getStats(): DataStats;

// --- 필터 타입 ---
interface PersonFilter {
  category?: PersonCategory[];
  era?: Era[];
  region?: string[];
  tags?: string[];
  mvpOnly?: boolean;
}

interface GraphFilter extends PersonFilter {
  includeEntities?: boolean;
  relationTypes?: RelationType[];
  minStrength?: 1 | 2 | 3;
}
```

---

## 7. 데이터 품질 관리

### 7.1 필수 필드 검증

```typescript
// 모든 Person에 필요한 필수 필드
const REQUIRED_PERSON_FIELDS = [
  'id', 'name.ko', 'name.en', 'era',
  'period.start', 'period.end',
  'location.lat', 'location.lng', 'location.region',
  'category', 'subcategory', 'tags', 'mvp',
  'summary'
];

// 모든 Entity에 필요한 필수 필드
const REQUIRED_ENTITY_FIELDS = [
  'id', 'type', 'name.ko', 'name.en',
  'summary', 'tags'
];

// 모든 Relationship에 필요한 필수 필드
const REQUIRED_RELATIONSHIP_FIELDS = [
  'source', 'target', 'sourceType', 'targetType',
  'type', 'description'
];
```

### 7.2 참조 무결성

```
✓ Relationship.source → 실제 존재하는 Person 또는 Entity id
✓ Relationship.target → 실제 존재하는 Person 또는 Entity id
✓ Person.influences[] → 실제 존재하는 Person id[]
✓ Person.influenced[] → 실제 존재하는 Person id[]
✓ Person.religionId → 실제 존재하는 Religion id
✓ Entity.relatedPersons[] → 실제 존재하는 Person id[]
✓ Entity.relatedEntities[] → 실제 존재하는 Entity id[]
```

### 7.3 범위 검증

```typescript
// 연도 범위
assert(period.start >= -10000 && period.start <= 2030);
assert(period.end >= period.start);

// 좌표 범위
assert(location.lat >= -90 && location.lat <= 90);
assert(location.lng >= -180 && location.lng <= 180);

// strength 범위
assert(relationship.strength >= 1 && relationship.strength <= 3);

// 요약 길이
assert(person.summary.length >= 20 && person.summary.length <= 500);
```

### 7.4 검증 스크립트 설계

```bash
# scripts/validate-data.ts
npm run validate

# 출력 예시:
# ✓ 565 persons validated
# ✓ 115 entities validated
# ✓ 600 relationships validated
# ✗ ERROR: person "xyz" references non-existent person "abc"
# ✗ WARNING: person "test" has no relationships (isolated node)
#
# Summary: 2 errors, 1 warning
```

---

## 8. 마이그레이션 계획

### 8.1 v1 → v2 마이그레이션 (완료)

기존 32명 철학자 (`_legacy/philosophers.json`) → Person v2 형식 변환:
- `id` 유지
- `name` 객체화 (ko, en)
- `era`, `period`, `location` 구조화
- `category: 'philosopher'` 추가
- `subcategory` 추가
- `mvp: true` 설정

### 8.2 데이터 확장 로드맵

```
Phase 2 (현재): MVP 200명 정제
├── 철학자: 75명 MVP (총 187명 중)
├── 종교 인물: 52명 MVP (총 156명 중)
├── 과학자: 48명 MVP (총 130명 중)
├── 역사 인물: 25명 MVP (총 100명 중)
├── 엔터티: 150개
└── 관계: 2,000개

Phase 3: 1,000명 달성
├── 모든 카테고리 목표 달성
├── 엔터티: 300개
└── 관계: 5,000개

Phase 5: 2,000명+ 확장
├── 새 도메인 추가 (경제학, 심리학 등)
├── 지역 균형 (비서양 인물 확충)
├── 엔터티: 500개+
└── 관계: 10,000개+
```

---

## 9. 미래 확장

### 9.1 다국어 확장

현재: 한국어 기본 + 영문 병기.
미래: `name.ja` (일본어), `name.zh` (중국어) 추가 가능.
콘텐츠(summary, detailed)의 다국어화는 별도 파일 분리 필요.

### 9.2 외부 데이터 연동

| 소스 | 용도 | 방법 |
|------|------|------|
| **Wikidata** | ID 매핑, 데이터 보완 | `wikidataId` 필드 추가, SPARQL 쿼리 |
| **DBpedia** | 요약 텍스트, 이미지 | REST API |
| **SEP** | 철학자 상세 내용 참조 | 링크 제공 |
| **Wikipedia** | 일반 참조 | 링크 제공 |

```typescript
// 미래 확장 필드
interface Person {
  // ... 기존 필드 ...
  externalIds?: {
    wikidata?: string;       // Q-ID (예: "Q913")
    dbpedia?: string;        // DBpedia URI
    sep?: string;            // Stanford Encyclopedia slug
    wikipedia?: {
      ko?: string;           // 한국어 위키피디아
      en?: string;           // 영문 위키피디아
    };
  };
}
```

### 9.3 사용자 기여 데이터

장기적으로 커뮤니티 기여를 받을 때:
1. GitHub PR 기반 워크플로우 (초기)
2. 웹 편집기 → PR 자동 생성 (중기)
3. 리뷰/승인 프로세스 + 자동 검증 (성숙기)

---

## 10. 부록

### 10.1 관계 유형 정의 표 (전체 23종)

| # | 유형 | 분류 | 방향 | 설명 |
|---|------|------|------|------|
| 1 | influenced | P↔P | → | 사상적 영향을 줌 |
| 2 | opposed | P↔P | → | 사상적으로 반대/비판 |
| 3 | developed | P↔P | → | 기존 사상을 발전시킴 |
| 4 | parallel | P↔P | ↔ | 독립적 구조적 유사성 |
| 5 | contextual | P↔P | ↔ | 같은 시공간 맥락 공유 |
| 6 | teacher_student | P↔P | → | 직접 사사 관계 |
| 7 | collaborated | P↔P | ↔ | 협력/공동 작업 |
| 8 | contemporary | P↔P | ↔ | 동시대 경쟁/논쟁 |
| 9 | founded | P↔E | → | 설립/창시 |
| 10 | member_of | P↔E | → | 소속/참여 |
| 11 | participated | P↔E | → | 사건 참여 |
| 12 | caused | P↔E | → | 사건의 사상적 원인 |
| 13 | affected_by | P↔E | → | 사건에 영향받음 |
| 14 | authored | P↔E | → | 문헌 저술 |
| 15 | advocated | P↔E | → | 사상 옹호 |
| 16 | criticized | P↔E | → | 사상/제도 비판 |
| 17 | belongs_to | P↔E | → | 사상/학파 소속 |
| 18 | preceded | E↔E | → | 시간적 선행 |
| 19 | caused | E↔E | → | 인과 관계 |
| 20 | part_of | E↔E | → | 부분-전체 관계 |
| 21 | opposed_to | E↔E | ↔ | 대립 관계 |
| 22 | evolved_into | E↔E | → | 변형/발전 |
| 23 | influenced | E↔E | → | 영향 관계 |

### 10.2 데이터 작성 체크리스트

```
□ Person 체크리스트:
  □ id가 kebab-case 영문인가?
  □ name.ko, name.en이 정확한가?
  □ era가 period와 일치하는가?
  □ period.start < period.end인가?
  □ location 좌표가 올바른 지역을 가리키는가?
  □ category/subcategory가 올바른가?
  □ summary가 1~3문장, 핵심을 담고 있는가?
  □ detailed가 500자 이상인가?
  □ influences/influenced에 실제 존재하는 id가 있는가?
  □ 최소 3개 이상의 관계가 있는가?
  □ 카테고리별 전용 필드가 채워져 있는가?
```

### 10.3 참조 온톨로지 매핑

```
Sophia Atlas          → CIDOC-CRM
─────────────────────────────────
Person                → E21 Person
Entity (event)        → E5 Event
Entity (institution)  → E74 Group
Entity (text)         → E73 Information Object
Entity (concept)      → E89 Propositional Object
Relationship          → P14 carried out by (부분 매핑)
period                → E52 Time-Span
location              → E53 Place
```

---

> **문서 끝**
>
> 다음 문서: [02-interaction-animation-design.md](./02-interaction-animation-design.md)
