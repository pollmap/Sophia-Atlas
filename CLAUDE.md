# Sophia Atlas - 개발 지시안 v2.0

## 프로젝트 개요

**"인류 사상의 시공간 지도"** — 철학·종교·과학·역사를 하나의 인터랙티브 웹 플랫폼에서 탐색한다.
인물(Person), 엔터티(사건·이념·기관·경전·국가·개념), 관계(Relationship)의 3축으로
인류 지성사 전체를 그래프·타임라인·세계지도 위에 시각화한다.

- **Sophia**: 그리스어 '지혜' (philosophia = 지혜를 사랑함)
- **Atlas**: 지도책
- **인드라망(Indra's Net)**: 모든 사상이 서로를 비추는 보석의 그물

---

## 기술스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | Static Export (`output: 'export'`) |
| 스타일 | Tailwind CSS 3 + shadcn/ui | 다크모드 기본 |
| 시각화 | D3.js (그래프), React-Leaflet (지도), SVG | 인드라망 커스텀 SVG |
| 콘텐츠 | MDX (상세 페이지), JSON (구조 데이터) | 점진적 MDX 전환 |
| 검색 | Fuse.js | 클라이언트 퍼지 검색 |
| 배포 | GitHub Pages + GitHub Actions | `.github/workflows/deploy.yml` |

---

## 데이터 규모

| 카테고리 | 현재 | 목표 (v2) | 목표 (v3) |
|----------|------|-----------|-----------|
| 철학자 | 32명 | 187명 (MVP 75) | 222명 |
| 종교 인물 | — | 156명 (MVP 52) | 200명+ |
| 과학자 | — | 130명 (MVP 48) | 200명+ |
| 역사/문화 | — | 100명 (MVP 25) | 150명+ |
| **인물 합계** | **32명** | **573명 (MVP 200)** | **1,000명+** |
| 종교/신화 | 12개 | 15개 | 20개+ |
| 엔터티 (사건·이념 등) | — | 100개+ | 300개+ |
| 관계 | 90개 | 2,000개+ | 5,000개+ |

---

## 디렉토리 구조

```
sophia-atlas/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 홈 대시보드
│   │   ├── layout.tsx                  # 루트 레이아웃
│   │   ├── globals.css
│   │   ├── philosophy/
│   │   │   ├── timeline/page.tsx       # 타임라인 뷰
│   │   │   ├── graph/page.tsx          # 영향 관계 그래프
│   │   │   ├── questions/page.tsx      # 질문 탐색
│   │   │   └── [id]/page.tsx           # 철학자 개별 페이지
│   │   ├── religion/
│   │   │   ├── map/page.tsx            # 세계지도
│   │   │   ├── tree/page.tsx           # 분파 트리
│   │   │   ├── compare/page.tsx        # 비교 매트릭스
│   │   │   └── [id]/page.tsx           # 종교 개별 페이지
│   │   ├── persons/                    # [v2 신규] 통합 인물
│   │   │   ├── page.tsx                # 인물 목록/검색
│   │   │   └── [id]/page.tsx           # 통합 인물 페이지
│   │   ├── entities/                   # [v2 신규] 엔터티
│   │   │   ├── page.tsx                # 엔터티 목록
│   │   │   └── [id]/page.tsx           # 엔터티 개별 페이지
│   │   ├── connections/page.tsx        # 인드라망 시각화
│   │   ├── search/page.tsx
│   │   ├── learn/page.tsx
│   │   └── about/page.tsx
│   ├── components/
│   │   ├── layout/                     # Header, Sidebar, Footer
│   │   ├── philosophy/                 # Timeline, Graph, PhilosopherCard
│   │   ├── religion/                   # WorldMap, BranchTree, CompareMatrix
│   │   ├── persons/                    # [v2] PersonCard, PersonList, PersonFilter
│   │   ├── entities/                   # [v2] EntityCard, EntityTimeline
│   │   ├── visualization/             # [v2] IndraNet, ForceGraph, TimelineViz
│   │   └── common/                     # Search, ExpandableSection, Toggle
│   ├── data/
│   │   ├── persons/                    # [v2] 카테고리별 분할
│   │   │   ├── philosophers.json       # 철학자 (Person[])
│   │   │   ├── religious-figures.json  # 종교 인물 (Person[])
│   │   │   ├── scientists.json         # 과학자 (Person[])
│   │   │   └── historical-figures.json # 역사/문화 (Person[])
│   │   ├── entities/                   # [v2] 엔터티 데이터
│   │   │   ├── events.json             # 역사적 사건 (Entity[])
│   │   │   ├── ideologies.json         # 사상/이념 (Entity[])
│   │   │   ├── movements.json          # 운동/학파 (Entity[])
│   │   │   ├── institutions.json       # 기관/조직 (Entity[])
│   │   │   ├── texts.json              # 경전/문헌 (Entity[])
│   │   │   └── concepts.json           # 핵심 개념 (Entity[])
│   │   ├── relationships/              # [v2] 관계 데이터
│   │   │   ├── person-person.json      # 인물↔인물 (Relationship[])
│   │   │   ├── person-entity.json      # 인물↔엔터티 (Relationship[])
│   │   │   └── entity-entity.json      # 엔터티↔엔터티 (Relationship[])
│   │   ├── religions.json              # 종교/신화 (Religion[])
│   │   ├── quotes.json                 # 명언 (Quote[])
│   │   ├── glossary.json               # 용어사전 (GlossaryTerm[])
│   │   └── _legacy/                    # v1 데이터 (마이그레이션 후 삭제)
│   │       ├── philosophers.json
│   │       └── relationships.json
│   ├── types/
│   │   └── index.ts                    # 통합 타입 시스템 v2.0
│   └── lib/
│       ├── utils.ts
│       ├── search.ts
│       ├── data-loader.ts              # [v2] 통합 데이터 로더
│       └── graph-utils.ts              # [v2] 그래프 연산 유틸
├── public/
│   └── images/
│       └── persons/                    # 인물 이미지 (선택)
├── .github/workflows/deploy.yml
├── CLAUDE.md
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 핵심 데이터 스키마 (v2)

> 전체 타입 정의: `src/types/index.ts`

### Person (통합 인물)

```typescript
interface Person {
  id: string;                    // URL slug
  name: { ko; en; original? };   // 다국어 이름
  era: Era;                      // ancient | medieval | modern | contemporary
  period: { start; end; approximate? };
  location: { lat; lng; region };

  // 분류
  category: PersonCategory;      // philosopher | religious_figure | scientist | historical_figure | cultural_figure
  categories?: PersonCategory[]; // 복수 소속 (예: 파스칼 = philosopher + scientist)
  subcategory: PersonSubcategory;
  tags: string[];
  mvp: boolean;                  // ⭐ 우선 구현 (200명)

  // 콘텐츠
  summary: string;
  detailed: string;
  keyWorks?: Work[];
  quotes?: PersonQuote[];

  // 관계 (간략 참조)
  influences?: string[];
  influenced?: string[];

  // 카테고리 전용 필드 (선택)
  school?: string[];             // 철학
  concepts?: string[];           // 철학
  questions?: string[];          // 철학
  religionId?: string;           // 종교
  role?: string;                 // 종교
  field?: string[];              // 과학
  discoveries?: string[];        // 과학
  domain?: string;               // 역사/문화
  achievements?: string[];       // 역사/문화
}
```

### Entity (비-인물 엔터티)

```typescript
interface Entity {
  id: string;
  type: EntityType;              // event | ideology | movement | institution | text | nation | concept
  name: { ko; en; original? };
  period?: TimePeriod;
  location?: GeoLocation;
  era?: Era;
  summary: string;
  detailed?: string;
  tags: string[];
  relatedPersons?: string[];
  relatedEntities?: string[];

  // 타입 전용 필드 (선택)
  significance?: string;         // event
  founders?: string[];           // ideology/movement
  keyPrinciples?: string[];      // ideology/movement
  author?: string;               // text
  domain?: string;               // concept
  originPerson?: string;         // concept
}
```

### Relationship (통합 관계)

```typescript
interface Relationship {
  source: string;
  target: string;
  sourceType: "person" | "entity";
  targetType: "person" | "entity";
  type: PersonRelationType | PersonEntityRelationType | EntityRelationType;
  description: string;
  strength?: 1 | 2 | 3;
  direction?: "directed" | "bidirectional";
  year?: number;
  tags?: string[];
}
```

**관계 유형 총 23종:**
- Person↔Person (8종): `influenced`, `opposed`, `developed`, `parallel`, `contextual`, `teacher_student`, `collaborated`, `contemporary`
- Person↔Entity (9종): `founded`, `member_of`, `participated`, `caused`, `affected_by`, `authored`, `advocated`, `criticized`, `belongs_to`
- Entity↔Entity (6종): `preceded`, `caused`, `part_of`, `opposed_to`, `evolved_into`, `influenced`

---

## 인물 분류 체계 (573명)

### 철학자 (187명, MVP 75명)

| 소분류 | 인원 | 대표 인물 |
|--------|------|-----------|
| 자연철학/소크라테스 이전 | 15 | 탈레스, 헤라클레이토스, 파르메니데스 |
| 소크라테스/아테네 | 8 | 소크라테스, 플라톤, 아리스토텔레스 |
| 소피스트 | 5 | 프로타고라스, 고르기아스 |
| 헬레니즘 | 7 | 에피쿠로스, 제논, 디오게네스 |
| 로마/후기 고대 | 12 | 세네카, 에픽테토스, 플로티노스 |
| 교부철학 | 6 | 아우구스티누스, 오리게네스 |
| 스콜라철학 | 14 | 아퀴나스, 둔스 스코투스, 오컴 |
| 이슬람/유대 철학 | 12 | 이븐 시나, 이븐 루시드, 마이모니데스 |
| 르네상스/초기 근대 | 10 | 마키아벨리, 베이컨, 홉스 |
| 합리론 | 5 | 데카르트, 스피노자, 라이프니츠 |
| 경험론 | 6 | 로크, 버클리, 흄 |
| 계몽주의 | 10 | 볼테르, 루소, 몽테스키외 |
| 독일 관념론 | 8 | 칸트, 헤겔, 쇼펜하우어 |
| 19세기 | 6 | 밀, 벤담, 윌리엄 제임스 |
| 실존주의/생철학 | 12 | 니체, 키르케고르, 하이데거, 사르트르 |
| 분석철학 | 18 | 프레게, 러셀, 비트겐슈타인 |
| 비판이론/마르크스주의 | 10 | 마르크스, 아도르노, 하버마스 |
| 구조주의/후기구조주의 | 10 | 푸코, 데리다, 들뢰즈 |
| 윤리학/정치철학 | 8 | 롤스, 아렌트, 샌델 |
| 기타 현대 | 5 | 듀이, 가다머, 로티 |
| 중국 철학 | 18 | 공자, 노자, 주희, 왕양명 |
| 인도 철학 | 12 | 붓다, 나가르주나, 샹카라 |
| 한국 철학 | 5 | 원효, 퇴계, 율곡, 다산 |

### 종교 인물 (156명, MVP 52명)

| 종교 | 인원 | 대표 인물 |
|------|------|-----------|
| 기독교 | 65 | 예수, 바울, 루터, 칼뱅 |
| 이슬람 | 35 | 무함마드, 루미, 이븐 아라비 |
| 불교 | 30 | 석가모니, 혜능, 달라이 라마 |
| 힌두교 | 15 | 샹카라, 라마크리슈나 |
| 유대교 | 11 | 모세, 힐렐, 바알 쉠 토브 |

### 과학자 (130명, MVP 48명)

| 시대/분야 | 인원 | 대표 인물 |
|-----------|------|-----------|
| 고대/중세 | 20 | 유클리드, 아르키메데스, 알-콰리즈미 |
| 과학혁명 | 20 | 코페르니쿠스, 갈릴레오, 뉴턴 |
| 수학 | 10 | 오일러, 가우스, 칸토어 |
| 물리학 | 35 | 아인슈타인, 보어, 파인만 |
| 화학 | 10 | 라부아지에, 멘델레예프 |
| 생물학/의학 | 25 | 다윈, 크릭/왓슨, 플레밍 |
| 컴퓨터/수학 | 10 | 괴델, 튜링, 섀넌 |

### 역사/문화 인물 (100명, MVP 25명)

| 분류 | 인원 | 대표 인물 |
|------|------|-----------|
| 정치사 | 40 | 알렉산드로스, 나폴레옹, 링컨 |
| 문학 | 15 | 호메로스, 셰익스피어, 도스토예프스키 |
| 예술/음악 | 15 | 다 빈치, 바흐, 베토벤 |

---

## 엔터티 분류 체계 (목표 100개+)

### 역사적 사건 (event)

| 사건 | 연도 | 관련 인물 |
|------|------|-----------|
| 니케아 공의회 | 325 | 콘스탄티누스, 아타나시우스 |
| 동서 교회 분열 | 1054 | — |
| 십자군 전쟁 | 1096-1291 | 베르나르, 이븐 루시드 |
| 인쇄술 발명 | 1440 | 구텐베르크 |
| 종교개혁 | 1517 | 루터, 칼뱅, 츠빙글리 |
| 과학혁명 | 1543-1687 | 코페르니쿠스→뉴턴 |
| 프랑스 혁명 | 1789 | 루소, 볼테르, 칸트 |
| 산업혁명 | 1760-1840 | 애덤 스미스, 마르크스 |
| 다윈 종의 기원 출간 | 1859 | 다윈, 월리스 |
| 러시아 혁명 | 1917 | 레닌, 마르크스 |
| 양자역학 완성 | 1925-1927 | 하이젠베르크, 슈뢰딩거, 보어 |
| 2차 세계대전 | 1939-1945 | 히틀러, 오펜하이머 |
| DNA 이중나선 발견 | 1953 | 크릭, 왓슨, 프랭클린 |

### 사상/이념 (ideology)

유물론, 관념론, 실증주의, 실용주의, 실존주의, 합리주의, 경험주의, 공리주의, 자유주의, 사회주의, 공산주의, 무정부주의, 민족주의, 페미니즘, 환경주의 등

### 운동/학파 (movement)

밀레토스 학파, 아카데메이아, 스토아학파, 에피쿠로스학파, 빈 학파, 프랑크푸르트 학파, 구조주의, 포스트모더니즘, 인문주의, 계몽주의 운동, 과학혁명, 종교개혁 등

### 기관/조직 (institution)

아카데메이아, 리케이온, 알렉산드리아 도서관, 바이트 알히크마, 옥스퍼드 대학, 예수회, 왕립학회, 빈 학파 등

### 핵심 경전/문헌 (text)

성경, 꾸란, 베다, 도덕경, 논어, 국가(플라톤), 형이상학(아리스토텔레스), 순수이성비판, 자본론, 종의 기원, 프린키피아 등

### 핵심 개념 (concept)

이데아, 도(道), 공(空), 로고스, 모나드, 변증법, 사회계약, 범주정언명령, 영원회귀, 해체, 리좀, 아비투스 등

---

## 관계 설계 가이드

### Person ↔ Person 관계 (8종)

| 유형 | 방향 | 예시 |
|------|------|------|
| `influenced` | → | 소크라테스 → 플라톤 (사상적 영향) |
| `opposed` | → | 아리스토텔레스 → 플라톤 이데아론 비판 |
| `developed` | → | 헤겔 → 칸트 변증법 발전 |
| `parallel` | ↔ | 스토아 ↔ 불교 (독립적 구조적 유사) |
| `contextual` | ↔ | 사르트르 ↔ 카뮈 (전후 파리) |
| `teacher_student` | → | 아리스토텔레스 → 알렉산드로스 |
| `collaborated` | ↔ | 마르크스 ↔ 엥겔스 |
| `contemporary` | ↔ | 라이프니츠 ↔ 뉴턴 (미적분 논쟁) |

### Person ↔ Entity 관계 (9종)

| 유형 | 예시 |
|------|------|
| `founded` | 플라톤 → 아카데메이아 |
| `member_of` | 비트겐슈타인 → 빈 학파 |
| `participated` | 루터 → 종교개혁 |
| `caused` | 마르크스 → 러시아 혁명 (사상적) |
| `affected_by` | 칸트 → 프랑스 혁명 |
| `authored` | 다윈 → 종의 기원 |
| `advocated` | 간디 → 비폭력주의 |
| `criticized` | 니체 → 기독교 도덕 |
| `belongs_to` | 스피노자 → 합리론 |

### Entity ↔ Entity 관계 (6종)

| 유형 | 예시 |
|------|------|
| `preceded` | 르네상스 → 과학혁명 |
| `caused` | 인쇄술 발명 → 종교개혁 |
| `part_of` | 빈 학파 → 논리실증주의 |
| `opposed_to` | 유물론 ↔ 관념론 |
| `evolved_into` | 연금술 → 근대 화학 |
| `influenced` | 그리스 철학 → 이슬람 황금시대 |

### 중복 인물 처리

한 인물이 여러 카테고리에 속할 수 있다:
- **아우구스티누스**: `category: "philosopher"`, `categories: ["philosopher", "religious_figure"]`
- **파스칼**: `category: "philosopher"`, `categories: ["philosopher", "scientist"]`
- **간디**: `category: "philosopher"`, `categories: ["philosopher", "religious_figure", "historical_figure"]`
- **다 빈치**: `category: "cultural_figure"`, `categories: ["cultural_figure", "scientist"]`

데이터 파일에는 **주 카테고리에만 저장** (중복 JSON 엔트리 없음).
`categories[]` 필드로 복수 소속 표시, UI에서 모든 카테고리 뷰에 표시.

---

## 핵심 기능 요구사항

### 1. 이중축 네비게이션
- 타임라인: 가로 스크롤, 시대별 색상 구분, 줌 가능
- 세계지도: 클릭 시 해당 지역 인물/종교 표시
- **[v2]** 타임라인에 사건(Entity) 오버레이

### 2. 영향 관계 그래프 (인드라망)
- 노드: Person + Entity
- 엣지: 23종 관계 유형 (색상·선 스타일 구분)
- 클릭 시 상세 페이지 이동
- 필터: 시대별, 카테고리별, 관계 유형별
- **[v2]** Force-directed 레이아웃 (D3.js)

### 3. 콘텐츠 구조
- 모든 페이지: 요약(기본 표시) + 상세(펼치기)
- 상세 해설: MDX로 작성, 인용/출처 포함
- 상호참조: 개념/인물 클릭 시 해당 페이지로
- **[v2]** Person 카드에 카테고리 뱃지, 관계 미니그래프

### 4. 종교 분파 트리
- 수직 트리 구조, 분기점에 연도/사건 표시
- 지도와 연동 (해당 지역 하이라이트)
- **[v2]** 종교 인물 노드 표시

### 5. 비교 매트릭스
- 행: 신화/종교, 열: 테마 (창조, 사후세계, 윤리 등)
- **[v2]** 철학 학파 간 비교, 동서양 사상 비교

### 6. 오늘의 명언
- 홈 화면에 랜덤 명언 + 출처(사상가/경전)
- 공유 버튼 (트위터, 링크 복사)
- 클릭 시 해당 인물/종교 페이지로 이동

### 7. [v2 신규] 통합 검색
- Person + Entity + Religion 통합 검색
- 카테고리/시대/지역 필터
- 자동완성, 최근 검색어

### 8. [v2 신규] 인물 탐색기
- 카테고리별 필터링 가능한 전체 인물 목록
- 카드/리스트 뷰 전환
- MVP 인물 하이라이트

---

## 디자인 가이드

### 시대별 컬러
| 시대 | 색상 | Hex | 사용처 |
|------|------|-----|--------|
| 고대 (ancient) | 황금 | #D4AF37 | 배지, 타임라인, 노드 |
| 중세 (medieval) | 보라 | #7C3AED | 배지, 타임라인, 노드 |
| 근대 (modern) | 청록 | #14B8A6 | 배지, 타임라인, 노드 |
| 현대 (contemporary) | 회색 | #64748B | 배지, 타임라인, 노드 |

### 카테고리별 컬러
| 카테고리 | 색상 | Hex | 아이콘 |
|----------|------|-----|--------|
| philosopher | 인디고 | #6366F1 | BookOpen |
| religious_figure | 앰버 | #F59E0B | Scroll |
| scientist | 에메랄드 | #10B981 | Atom |
| historical_figure | 레드 | #EF4444 | Crown |
| cultural_figure | 핑크 | #EC4899 | Palette |

### 관계 유형별 시각화
| 유형 | 선 스타일 | 색상 |
|------|-----------|------|
| influenced / teacher_student | 실선 화살표 | Blue |
| opposed | 실선 양화살표 | Red |
| developed | 실선 화살표 | Green |
| parallel | 점선 | Purple |
| contextual / contemporary | 점선 | Gray |
| collaborated | 실선 양방향 | Orange |

### 기타
- 다크모드 기본, 라이트모드 지원
- 폰트: Pretendard (한글), Inter (영문)
- 미니멀하지만 정보 밀도 높게
- 모바일 반응형 필수
- 한국어 기본, 영문 병기

---

## 데이터 작성 가이드

### Person JSON 예시 (철학자)

```json
{
  "id": "socrates",
  "name": { "ko": "소크라테스", "en": "Socrates", "original": "Σωκράτης" },
  "era": "ancient",
  "period": { "start": -470, "end": -399 },
  "location": { "lat": 37.97, "lng": 23.72, "region": "그리스 아테네" },
  "category": "philosopher",
  "subcategory": "classical_greek",
  "tags": ["서양철학", "문답법", "윤리학"],
  "mvp": true,
  "summary": "서양 철학의 아버지. 문답법(산파술)을 통해 진리를 탐구했다.",
  "detailed": "...",
  "keyWorks": [{ "title": "직접 저술 없음 (플라톤의 대화편을 통해 전해짐)" }],
  "quotes": [{ "text": "너 자신을 알라.", "source": "델포이 신전" }],
  "influences": [],
  "influenced": ["plato", "antisthenes"],
  "school": ["소크라테스학파"],
  "concepts": ["산파술", "무지의 자각", "덕의 지식"],
  "questions": ["지식이란 무엇인가?", "선이란 무엇인가?"]
}
```

### Person JSON 예시 (과학자)

```json
{
  "id": "einstein",
  "name": { "ko": "알베르트 아인슈타인", "en": "Albert Einstein", "original": "Albert Einstein" },
  "era": "contemporary",
  "period": { "start": 1879, "end": 1955 },
  "location": { "lat": 47.55, "lng": 7.59, "region": "스위스/미국" },
  "category": "scientist",
  "subcategory": "physics",
  "tags": ["물리학", "상대성이론", "양자역학", "노벨상"],
  "mvp": true,
  "summary": "특수 상대성이론과 일반 상대성이론으로 시공간 개념을 혁명적으로 변화시킨 20세기 최고의 물리학자.",
  "detailed": "...",
  "keyWorks": [
    { "title": "특수 상대성이론", "year": 1905, "type": "paper" },
    { "title": "일반 상대성이론", "year": 1915, "type": "paper" }
  ],
  "quotes": [{ "text": "상상력은 지식보다 중요하다.", "source": "" }],
  "field": ["이론물리학", "양자역학"],
  "discoveries": ["특수 상대성이론", "일반 상대성이론", "광전효과", "E=mc²"]
}
```

### Entity JSON 예시

```json
{
  "id": "french-revolution",
  "type": "event",
  "name": { "ko": "프랑스 혁명", "en": "French Revolution" },
  "period": { "start": 1789, "end": 1799 },
  "location": { "lat": 48.86, "lng": 2.35, "region": "프랑스 파리" },
  "era": "modern",
  "summary": "절대왕정을 무너뜨리고 자유·평등·박애의 이념을 확산시킨 혁명.",
  "tags": ["혁명", "계몽주의", "민주주의", "인권"],
  "relatedPersons": ["rousseau", "voltaire", "montesquieu", "kant", "napoleon"],
  "significance": "근대 민주주의의 출발점. 계몽주의 사상이 실천으로 전환된 결정적 사건."
}
```

### Relationship JSON 예시

```json
{
  "source": "socrates",
  "target": "plato",
  "sourceType": "person",
  "targetType": "person",
  "type": "teacher_student",
  "description": "소크라테스는 플라톤의 스승으로, 대화법과 산파술은 플라톤 철학의 출발점이 되었다",
  "strength": 3,
  "direction": "directed"
}
```

---

## 개발 순서

### Phase 1: 기반 (완료)
- [x] 프로젝트 초기화 + 기본 레이아웃
- [x] v1 데이터 (철학자 32명, 종교 12개, 관계 90개)
- [x] 철학 타임라인/그래프/질문 페이지
- [x] 종교 지도/트리/비교 페이지
- [x] 인드라망 시각화
- [x] 검색 + 학습경로 + About
- [x] GitHub Pages 배포 설정

### Phase 2: 데이터 확장 + 스키마 v2 (현재)
- [x] 통합 타입 시스템 v2.0 (`types/index.ts`)
- [x] CLAUDE.md v2 업데이트
- [ ] v1→v2 데이터 마이그레이션 (기존 32명 → Person 형식)
- [ ] 철학자 187명 데이터 작성 (MVP 75명 우선)
- [ ] 종교 인물 156명 데이터 작성 (MVP 52명 우선)
- [ ] 과학자 130명 데이터 작성 (MVP 48명 우선)
- [ ] 역사/문화 100명 데이터 작성 (MVP 25명 우선)
- [ ] 엔터티 100개+ 작성
- [ ] 관계 2,000개+ 작성
- [ ] 통합 인물 페이지 (`/persons/[id]`)
- [ ] 통합 데이터 로더 (`lib/data-loader.ts`)
- [ ] 기존 페이지 v2 데이터 연동

### Phase 3: 시각화 강화
- [ ] D3.js Force-directed 그래프
- [ ] React-Leaflet 실제 세계지도
- [ ] 타임라인에 사건 오버레이
- [ ] 인드라망 v2 (Person + Entity 통합)

### Phase 4: 콘텐츠 심화
- [ ] MDX 상세 페이지 작성 (MVP 200명)
- [ ] 동서양 사상 비교 기능
- [ ] 학습 경로 확장

### Phase 5: 1000명+ 확장
- [ ] 추가 인물 500명+
- [ ] 엔터티 300개+
- [ ] 관계 5,000개+

---

## 주의사항

- 정적 빌드 (`output: 'export'`) 필수
- 이미지는 `public/` 폴더, 최적화 필수
- 모바일 반응형 필수
- 한국어 기본, 영문 병기
- GitHub Pages: `basePath: '/Sophia-Atlas'` 설정 유지
- 데이터 파일 크기 주의: 인물당 ~1KB, 573명 ≈ 600KB (분할 로딩 고려)
- `generateStaticParams`로 모든 인물/엔터티 페이지 정적 생성
- v1 기존 컴포넌트 호환성 유지 (Philosopher 타입 deprecated 유지)
