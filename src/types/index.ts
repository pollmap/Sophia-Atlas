// ============================================================
// Sophia Atlas - Unified Type System v2.0
// "인류 사상의 시공간 지도" 통합 데이터 스키마
// ============================================================

// ────────────────────────────────────────────────────────────
// 1. 공통 타입 (Common Types)
// ────────────────────────────────────────────────────────────

/** 시대 구분 */
export type Era = "ancient" | "medieval" | "modern" | "contemporary";

/** 다국어 이름 */
export interface MultilingualName {
  ko: string;           // 한국어 (기본)
  en: string;           // 영문
  original?: string;    // 원어 (그리스어, 아랍어, 산스크리트 등)
}

/** 지리 좌표 */
export interface GeoLocation {
  lat: number;
  lng: number;
  region: string;       // 표시용 지역명 (예: "그리스 아테네")
}

/** 시간 범위 (BC는 음수) */
export interface TimePeriod {
  start: number;        // 출생/시작 연도
  end: number;          // 사망/종료 연도
  approximate?: boolean; // 대략적 연대 여부
}

// ────────────────────────────────────────────────────────────
// 2. Person (통합 인물 스키마)
// ────────────────────────────────────────────────────────────

/**
 * 인물 대분류
 * - philosopher: 철학자 (187명)
 * - religious_figure: 종교 인물 (156명)
 * - scientist: 과학자 (130명)
 * - historical_figure: 정치/역사 인물 (40명+)
 * - cultural_figure: 문화/예술 인물 (30명+)
 */
export type PersonCategory =
  | "philosopher"
  | "religious_figure"
  | "scientist"
  | "historical_figure"
  | "cultural_figure";

/**
 * 철학자 소분류
 */
export type PhilosopherSubcategory =
  | "presocratic"         // 소크라테스 이전
  | "classical_greek"     // 소크라테스/플라톤/아리스토텔레스
  | "sophist"             // 소피스트
  | "hellenistic"         // 헬레니즘
  | "roman"               // 로마/후기 고대
  | "patristic"           // 교부철학
  | "scholastic"          // 스콜라철학
  | "islamic_jewish"      // 이슬람/유대 철학
  | "renaissance"         // 르네상스/초기 근대
  | "rationalist"         // 합리론
  | "empiricist"          // 경험론
  | "enlightenment"       // 계몽주의
  | "german_idealism"     // 독일 관념론
  | "utilitarian"         // 19세기 공리주의 등
  | "existentialist"      // 실존주의/생철학
  | "analytic"            // 분석철학
  | "critical_theory"     // 비판이론/마르크스주의
  | "structuralist"       // 구조주의/후기구조주의
  | "political_ethics"    // 윤리학/정치철학
  | "pragmatist"          // 실용주의
  | "phenomenologist"     // 현상학
  | "chinese"             // 중국 철학
  | "indian"              // 인도 철학
  | "korean"              // 한국 철학
  | "other_philosophy";   // 기타

/**
 * 종교 인물 소분류
 */
export type ReligiousFigureSubcategory =
  | "christianity_early"     // 초대교회
  | "christianity_patristic" // 교부 시대
  | "christianity_medieval"  // 중세
  | "christianity_reform"    // 종교개혁
  | "christianity_modern"    // 근현대
  | "islam_early"            // 이슬람 초기
  | "islam_scholar"          // 이슬람 학자/학파
  | "islam_modern"           // 이슬람 근현대
  | "buddhism_early"         // 초기 불교
  | "buddhism_mahayana"      // 대승불교
  | "buddhism_tibetan_japanese" // 티베트/일본 불교
  | "hinduism"               // 힌두교
  | "judaism"                // 유대교
  | "other_religion";        // 기타 종교

/**
 * 과학자 소분류
 */
export type ScientistSubcategory =
  | "ancient_medieval_science"  // 고대/중세 과학
  | "scientific_revolution"     // 과학혁명
  | "mathematics"               // 수학
  | "physics"                   // 물리학
  | "chemistry"                 // 화학
  | "biology"                   // 생물학
  | "medicine"                  // 의학
  | "computer_science"          // 수학/컴퓨터
  | "astronomy"                 // 천문학
  | "other_science";            // 기타

/**
 * 역사/문화 인물 소분류
 */
export type HistoricalSubcategory =
  | "political_leader"    // 정치 지도자
  | "military_leader"     // 군사 지도자
  | "revolutionary"       // 혁명가
  | "explorer"            // 탐험가
  | "literary_figure"     // 문학가
  | "writer"              // 작가/문인
  | "artist"              // 예술가
  | "musician"            // 음악가
  | "social_reformer"     // 사회 개혁가
  | "other_historical";   // 기타

export type PersonSubcategory =
  | PhilosopherSubcategory
  | ReligiousFigureSubcategory
  | ScientistSubcategory
  | HistoricalSubcategory;

/**
 * 통합 인물 스키마
 *
 * 573명+ 모든 인물을 하나의 타입으로 통합.
 * 카테고리별 필수/선택 필드를 유연하게 대응.
 *
 * 중복 인물 처리:
 *   - 아우구스티누스 = philosopher + religious_figure
 *   - 파스칼 = philosopher + scientist
 *   - categories 배열로 복수 소속 표현
 */
export interface Person {
  // ── 식별 ──
  id: string;                          // URL slug (예: "socrates", "einstein")
  name: MultilingualName;
  era: Era;
  period: TimePeriod;
  location: GeoLocation;               // 주 활동지
  birthPlace?: GeoLocation;            // 출생지 (활동지와 다를 경우)

  // ── 분류 ──
  category: PersonCategory;            // 주 카테고리
  categories?: PersonCategory[];       // 복수 카테고리 (중복 인물)
  subcategory: PersonSubcategory;      // 소분류
  tags: string[];                      // 자유 태그 (학파, 분야, 운동 등)
  mvp: boolean;                        // MVP(⭐) 여부 — 우선 구현 대상

  // ── 콘텐츠 ──
  summary: string;                     // 2-3문장 요약
  detailed: string;                    // 상세 설명 (HTML/MDX 가능)
  keyWorks?: Work[];                   // 주요 저작/업적
  quotes?: PersonQuote[];              // 명언

  // ── 관계 (간략 참조, 상세는 Relationship에서) ──
  influences?: string[];               // 영향 받은 인물 ID[]
  influenced?: string[];               // 영향 준 인물 ID[]

  // ── 철학 전용 ──
  school?: string[];                   // 학파 (예: ["스토아학파", "자연철학"])
  concepts?: string[];                 // 핵심 개념
  questions?: string[];                // 탐구 질문

  // ── 종교 전용 ──
  religionId?: string;                 // 소속 종교 ID (religions.json 참조)
  role?: string;                       // 역할 (예: "사도", "교황", "수피 시인")

  // ── 과학 전용 ──
  field?: string[];                    // 분야 (예: ["물리학", "수학"])
  discoveries?: string[];              // 주요 발견/발명

  // ── 역사/문화 전용 ──
  domain?: string;                     // 활동 영역 (예: "정치", "문학", "음악")
  achievements?: string[];             // 주요 업적

  // ── 메타 ──
  imageUrl?: string;                   // 초상화/이미지 경로
  externalLinks?: ExternalLink[];      // 외부 링크 (위키 등)
}

export interface Work {
  title: string;
  year?: number;
  type?: "book" | "paper" | "artwork" | "music" | "discovery" | "other";
}

export interface PersonQuote {
  text: string;
  source: string;
}

export interface ExternalLink {
  label: string;
  url: string;
}

// ────────────────────────────────────────────────────────────
// 3. Entity (사건, 이념, 집단 등 비-인물 주제)
// ────────────────────────────────────────────────────────────

/**
 * 주제 유형
 * - event: 역사적 사건 (프랑스 혁명, 니케아 공의회 등)
 * - ideology: 사상/이념 (유물론, 계몽주의, 페미니즘 등)
 * - movement: 운동/학파 (과학혁명, 비판이론, 인문주의 등)
 * - institution: 기관/조직 (아카데메이아, 빈 학파, 예수회 등)
 * - text: 핵심 경전/문헌 (꾸란, 성경, 자본론 등)
 * - nation: 국가/문명 (로마 제국, 아바스 왕조 등)
 * - concept: 핵심 개념 (이데아, 도, 공(空) 등)
 */
export type EntityType =
  | "event"
  | "ideology"
  | "movement"
  | "institution"
  | "text"
  | "nation"
  | "concept"
  | "tradition"        // v9: 전통 (사상체계, 종교/영성, 과학 패러다임 등)
  | "archetype"        // v9: 신화/원형 서사 (영웅의 여정, 창조 신화 등)
  | "art_movement"     // v9: 예술운동 (낭만주의, 인상파 등)
  | "technology";      // v9: 기술 패러다임 (산업혁명, AI 등)

export interface Entity {
  id: string;
  type: EntityType;
  name: MultilingualName;
  period?: TimePeriod;
  location?: GeoLocation;
  era?: Era;
  summary: string;
  detailed?: string;
  tags: string[];

  // 관련 인물 (빠른 참조)
  relatedPersons?: string[];           // Person ID[]
  // 관련 주제 (빠른 참조)
  relatedEntities?: string[];          // Entity ID[]

  // event 전용
  significance?: string;               // 역사적 의의

  // ideology/movement 전용
  founders?: string[];                 // 창시자 Person ID[]
  keyPrinciples?: string[];            // 핵심 원리

  // institution 전용
  foundedYear?: number;
  dissolvedYear?: number;

  // text 전용
  author?: string;                     // Person ID
  language?: string;

  // nation 전용
  capital?: string;
  territory?: string;

  // concept 전용
  domain?: string;                     // 분야 (형이상학, 인식론, 윤리학 등)
  originPerson?: string;               // 최초 제시자 Person ID
}

// ────────────────────────────────────────────────────────────
// 4. Relationship (관계 시스템)
// ────────────────────────────────────────────────────────────

/**
 * 인물 간 관계 유형 (Person ↔ Person)
 *
 * 기존 5종 유지 + 3종 추가 = 8종
 */
export type PersonRelationType =
  | "influenced"         // 직접 영향 (스승→제자, 저작 읽음)
  | "opposed"            // 비판/반박 (아리스토텔레스→플라톤 이데아론 비판)
  | "developed"          // 사상을 발전/변형/종합 (헤겔→칸트 변증법 발전)
  | "parallel"           // 독립적 구조적 유사성 (스토아↔불교 무집착)
  | "contextual"         // 같은 역사적 맥락 공유 (사르트르↔카뮈 전후 파리)
  | "teacher_student"    // 명시적 사제 관계 (소크라테스→플라톤)
  | "collaborated"       // 공동 작업 (마르크스↔엥겔스, 크릭↔왓슨)
  | "contemporary"       // 동시대 교류 (라이프니츠↔뉴턴 미적분 논쟁)
  // v9 확장
  | "patron"             // 후원자 관계 (메디치→다 빈치)
  | "correspondent"      // 서신 교환 (라이프니츠↔뉴턴)
  | "family"             // 가족 관계
  | "rival"              // 논적/경쟁자
  | "synthesized"        // 종합 (여러 사상을 결합)
  | "reacted_against"    // 반발 (계승이 아닌 적극적 거부)
  | "shared_archetype"   // 같은 원형 표현 (문화적 동형)
  | "synchronistic";     // 의미 있는 우연/동시 발견

/**
 * 인물-주제 관계 유형 (Person ↔ Entity)
 */
export type PersonEntityRelationType =
  | "founded"         // 창설 (플라톤→아카데메이아)
  | "member_of"       // 소속 (비트겐슈타인→빈 학파)
  | "participated"    // 참여 (루터→종교개혁)
  | "caused"          // 야기 (마르크스→러시아 혁명에 사상적 영향)
  | "affected_by"     // 영향 받음 (칸트→프랑스 혁명에 영향 받음)
  | "authored"        // 저술 (다윈→종의 기원)
  | "advocated"       // 옹호 (간디→비폭력)
  | "criticized"      // 비판 (니체→기독교 도덕)
  | "belongs_to";     // 소속 (스피노자→합리론)

/**
 * 주제 간 관계 유형 (Entity ↔ Entity)
 */
export type EntityRelationType =
  | "preceded"           // 선행 (르네상스→과학혁명)
  | "caused"             // 야기 (인쇄술 발명→종교개혁)
  | "part_of"            // 부분 (빈 학파→논리실증주의)
  | "opposed_to"         // 대립 (유물론↔관념론)
  | "evolved_into"       // 발전 (연금술→근대 화학)
  | "influenced"         // 영향 (그리스 철학→이슬람 철학)
  // v9 확장
  | "branched_from"      // 분파 (개신교→가톨릭에서 분리)
  | "merged_with"        // 합류/융합 (신유학 = 유교+불교+도교)
  | "replaced"           // 대체 (천동설→지동설)
  | "coexisted"          // 공존/병행
  | "shared_origin";     // 공통 기원 (유대교/기독교/이슬람)

/** 관계 강도 */
export type RelationshipStrength = 1 | 2 | 3; // 1=약함, 2=보통, 3=강함

/** 관계 방향성 */
export type RelationshipDirection = "directed" | "bidirectional";

/**
 * 통합 관계 스키마
 *
 * 모든 관계를 하나의 테이블에 저장.
 * sourceType/targetType으로 Person↔Person, Person↔Entity, Entity↔Entity 구분.
 */
export interface Relationship {
  id?: string;                         // 선택적 고유 ID
  source: string;                      // 출발 노드 ID
  target: string;                      // 도착 노드 ID
  sourceType: "person" | "entity";     // 출발 노드 유형
  targetType: "person" | "entity";     // 도착 노드 유형
  type: PersonRelationType | PersonEntityRelationType | EntityRelationType;
  description: string;                 // 관계 설명
  strength?: RelationshipStrength;     // 관계 강도 (1-3)
  direction?: RelationshipDirection;   // 방향성 (기본: directed)
  year?: number;                       // 관계 발생 시점
  tags?: string[];                     // 추가 태그
}

// ────────────────────────────────────────────────────────────
// 5. Religion (종교/신화 — 기존 호환)
// ────────────────────────────────────────────────────────────

export type ThemeKey = "creation" | "afterlife" | "ethics" | "heroMyth";

export interface Branch {
  name: string;
  year?: number;
  description: string;
  location?: string;           // 주요 분포 지역
  adherents?: string;          // 신자 수 (대략)
  keyFigures?: string[];       // 핵심 인물 Person ID[]
  children?: Branch[];
}

export interface Religion {
  id: string;
  name: MultilingualName;
  type: "religion" | "mythology";
  region: string[];
  origin: { year: number; location: string };
  branches?: Branch[];
  themes: {
    creation?: string;
    afterlife?: string;
    ethics?: string;
    heroMyth?: string;
  };
  summary: string;
  detailed: string;
  adherents?: string;          // 전체 신자 수
  keyTexts?: string[];         // 핵심 경전 Entity ID[]
  keyFigures?: string[];       // 핵심 인물 Person ID[]
}

// ────────────────────────────────────────────────────────────
// 6. 기존 호환 타입 (Backward Compatibility)
// ────────────────────────────────────────────────────────────

/**
 * @deprecated v1 Philosopher 타입. Person으로 마이그레이션 예정.
 * 기존 컴포넌트 호환을 위해 유지.
 */
export interface Philosopher {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: Era;
  period: { start: number; end: number };
  location: { lat: number; lng: number; region: string };
  school: string[];
  summary: string;
  detailed: string;
  keyWorks: { title: string; year?: number }[];
  quotes: { text: string; source: string }[];
  influences: string[];
  influenced: string[];
  concepts: string[];
  questions: string[];
}

export interface Quote {
  id: string;
  text: string;
  source: string;
  personId?: string;           // v2: Person ID (통합)
  philosopherId?: string;      // v1 호환
  religionId?: string;         // v1 호환
  category: string;
}

export interface GlossaryTerm {
  id: string;
  term: MultilingualName;
  definition: string;
  relatedPersons?: string[];   // v2: Person ID[]
  relatedPhilosophers?: string[]; // v1 호환
  relatedReligions?: string[];
  relatedEntities?: string[];  // v2: Entity ID[]
  category: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  steps: LearningStep[];
  comingSoon?: boolean;
}

export interface LearningStep {
  title: string;
  description: string;
  link?: string;
  type: "person" | "religion" | "entity" | "concept" | "philosopher"; // v2 확장
}

// ────────────────────────────────────────────────────────────
// 7. 데이터 통계 / 인덱스 타입
// ────────────────────────────────────────────────────────────

/** 카테고리별 통계 */
export interface DataStats {
  totalPersons: number;
  mvpPersons: number;
  byCategory: Record<PersonCategory, number>;
  byEra: Record<Era, number>;
  totalEntities: number;
  byEntityType: Record<EntityType, number>;
  totalRelationships: number;
}

/** 검색 인덱스용 경량 타입 */
export interface SearchableItem {
  id: string;
  type: "person" | "entity" | "religion";
  name: MultilingualName;
  category?: string;
  era?: Era;
  summary: string;
  tags: string[];
  url: string;
}

// ────────────────────────────────────────────────────────────
// 8. 뷰 전용 타입 (UI Components)
// ────────────────────────────────────────────────────────────

/** 타임라인 노드 */
export interface TimelineNode {
  id: string;
  name: string;
  era: Era;
  startYear: number;
  endYear: number;
  category: PersonCategory;
  mvp: boolean;
}

/** 그래프 노드 */
export interface GraphNode {
  id: string;
  name: string;
  era: Era;
  category: PersonCategory;
  x?: number;
  y?: number;
  connectionCount: number;
}

/** 그래프 엣지 */
export interface GraphEdge {
  source: string;
  target: string;
  type: PersonRelationType;
  strength: RelationshipStrength;
}

/** 지도 마커 */
export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: PersonCategory | "religion";
  era?: Era;
  count?: number;               // 같은 위치 인물 수
}
