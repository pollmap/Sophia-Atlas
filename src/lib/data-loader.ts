// ============================================================
// Sophia Atlas - Unified Data Loader v2.0
// 모든 데이터 소스를 통합하여 로드/검색/필터링 제공
// Static Site (Next.js output: 'export') — 모든 데이터는 동기 import
// ============================================================

import type {
  Person,
  PersonCategory,
  PersonSubcategory,
  Era,
  Entity,
  EntityType,
  Relationship,
  Religion,
  Quote,
  GlossaryTerm,
  DataStats,
  SearchableItem,
} from "@/types/index";

// ────────────────────────────────────────────────────────────
// Data Imports — Person
// ────────────────────────────────────────────────────────────
import philosophersData from "@/data/persons/philosophers.json";
import religiousFiguresData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalFiguresData from "@/data/persons/historical-figures.json";

// ────────────────────────────────────────────────────────────
// Data Imports — Entity
// ────────────────────────────────────────────────────────────
import eventsData from "@/data/entities/events.json";
import ideologiesData from "@/data/entities/ideologies.json";
import movementsData from "@/data/entities/movements.json";
import institutionsData from "@/data/entities/institutions.json";
import textsData from "@/data/entities/texts.json";
import conceptsData from "@/data/entities/concepts.json";
import archetypesData from "@/data/entities/archetypes.json";
import artMovementsData from "@/data/entities/art-movements.json";
import technologiesData from "@/data/entities/technologies.json";

// ────────────────────────────────────────────────────────────
// Data Imports — Relationship
// ────────────────────────────────────────────────────────────
import personPersonRels from "@/data/relationships/person-person.json";
import personEntityRels from "@/data/relationships/person-entity.json";
import entityEntityRels from "@/data/relationships/entity-entity.json";

// ────────────────────────────────────────────────────────────
// Data Imports — Other
// ────────────────────────────────────────────────────────────
import religionsData from "@/data/religions.json";
import quotesData from "@/data/quotes.json";
import glossaryData from "@/data/glossary.json";

// ────────────────────────────────────────────────────────────
// Merged Collections (computed once at import time)
// ────────────────────────────────────────────────────────────

const allPersons: Person[] = [
  ...(philosophersData as Person[]),
  ...(religiousFiguresData as Person[]),
  ...(scientistsData as Person[]),
  ...(historicalFiguresData as Person[]),
];

const allEntities: Entity[] = [
  ...(eventsData as Entity[]),
  ...(ideologiesData as Entity[]),
  ...(movementsData as Entity[]),
  ...(institutionsData as Entity[]),
  ...(textsData as Entity[]),
  ...(conceptsData as Entity[]),
  ...(archetypesData as Entity[]),
  ...(artMovementsData as Entity[]),
  ...(technologiesData as Entity[]),
];

const allRelationships: Relationship[] = [
  ...(personPersonRels as Relationship[]),
  ...(personEntityRels as Relationship[]),
  ...(entityEntityRels as Relationship[]),
];

const allReligions: Religion[] = religionsData as Religion[];
const allQuotes: Quote[] = quotesData as unknown as Quote[];
const allGlossary: GlossaryTerm[] = glossaryData as unknown as GlossaryTerm[];

// ────────────────────────────────────────────────────────────
// Lookup Maps (lazy-initialized singletons)
// ────────────────────────────────────────────────────────────

let personMap: Map<string, Person> | null = null;
let entityMap: Map<string, Entity> | null = null;
let religionMap: Map<string, Religion> | null = null;

function getPersonMap(): Map<string, Person> {
  if (!personMap) {
    personMap = new Map(allPersons.map((p) => [p.id, p]));
  }
  return personMap;
}

function getEntityMap(): Map<string, Entity> {
  if (!entityMap) {
    entityMap = new Map(allEntities.map((e) => [e.id, e]));
  }
  return entityMap;
}

function getReligionMap(): Map<string, Religion> {
  if (!religionMap) {
    religionMap = new Map(allReligions.map((r) => [r.id, r]));
  }
  return religionMap;
}

// ────────────────────────────────────────────────────────────
// Person Functions
// ────────────────────────────────────────────────────────────

/** 전체 인물 목록 */
export function getAllPersons(): Person[] {
  return allPersons;
}

/** ID로 인물 조회 */
export function getPersonById(id: string): Person | undefined {
  return getPersonMap().get(id);
}

/**
 * 카테고리별 인물 필터.
 * categories[] 배열도 확인하여 복수 소속 인물도 포함.
 */
export function getPersonsByCategory(category: PersonCategory): Person[] {
  return allPersons.filter(
    (p) =>
      p.category === category ||
      (p.categories && p.categories.includes(category))
  );
}

/** 시대별 인물 필터 */
export function getPersonsByEra(era: Era): Person[] {
  return allPersons.filter((p) => p.era === era);
}

/** 소분류별 인물 필터 */
export function getPersonsBySubcategory(
  subcategory: PersonSubcategory
): Person[] {
  return allPersons.filter((p) => p.subcategory === subcategory);
}

/** MVP 인물만 반환 */
export function getMvpPersons(): Person[] {
  return allPersons.filter((p) => p.mvp);
}

/**
 * 인물 텍스트 검색 (이름, 요약, 태그 등).
 * 간단한 substring match. 대소문자 무시.
 */
export function searchPersons(query: string): Person[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return allPersons.filter((p) => {
    const haystack = [
      p.name.ko,
      p.name.en,
      p.name.original ?? "",
      p.summary,
      ...p.tags,
      ...(p.school ?? []),
      ...(p.concepts ?? []),
      ...(p.field ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

// ────────────────────────────────────────────────────────────
// Entity Functions
// ────────────────────────────────────────────────────────────

/** 전체 주제 목록 */
export function getAllEntities(): Entity[] {
  return allEntities;
}

/** ID로 주제 조회 */
export function getEntityById(id: string): Entity | undefined {
  return getEntityMap().get(id);
}

/** 유형별 주제 필터 */
export function getEntitiesByType(type: EntityType): Entity[] {
  return allEntities.filter((e) => e.type === type);
}

// ────────────────────────────────────────────────────────────
// Relationship Functions
// ────────────────────────────────────────────────────────────

/** 전체 관계 목록 */
export function getAllRelationships(): Relationship[] {
  return allRelationships;
}

/**
 * 특정 노드(Person 또는 Entity)와 관련된 모든 관계.
 * source 또는 target이 해당 ID인 관계를 모두 반환.
 */
export function getRelationshipsForNode(nodeId: string): Relationship[] {
  return allRelationships.filter(
    (r) => r.source === nodeId || r.target === nodeId
  );
}

/** Person ID와 관련된 관계만 (sourceType/targetType이 person인 행) */
export function getPersonRelationships(personId: string): Relationship[] {
  return allRelationships.filter(
    (r) =>
      (r.source === personId && r.sourceType === "person") ||
      (r.target === personId && r.targetType === "person")
  );
}

/** Entity ID와 관련된 관계만 */
export function getEntityRelationships(entityId: string): Relationship[] {
  return allRelationships.filter(
    (r) =>
      (r.source === entityId && r.sourceType === "entity") ||
      (r.target === entityId && r.targetType === "entity")
  );
}

// ────────────────────────────────────────────────────────────
// Religion Functions
// ────────────────────────────────────────────────────────────

/** 전체 종교 목록 */
export function getAllReligions(): Religion[] {
  return allReligions;
}

/** ID로 종교 조회 */
export function getReligionById(id: string): Religion | undefined {
  return getReligionMap().get(id);
}

// ────────────────────────────────────────────────────────────
// Quote & Glossary Functions
// ────────────────────────────────────────────────────────────

/** 전체 명언 목록 */
export function getAllQuotes(): Quote[] {
  return allQuotes;
}

/** 전체 용어사전 */
export function getAllGlossary(): GlossaryTerm[] {
  return allGlossary;
}

/** 랜덤 명언 (오늘의 명언) */
export function getRandomQuote(): Quote | undefined {
  if (allQuotes.length === 0) return undefined;
  return allQuotes[Math.floor(Math.random() * allQuotes.length)];
}

// ────────────────────────────────────────────────────────────
// Data Stats
// ────────────────────────────────────────────────────────────

/** 전체 데이터 통계 */
export function getDataStats(): DataStats {
  const byCategory = {} as Record<PersonCategory, number>;
  const categories: PersonCategory[] = [
    "philosopher",
    "religious_figure",
    "scientist",
    "historical_figure",
    "cultural_figure",
  ];
  for (const cat of categories) {
    byCategory[cat] = allPersons.filter((p) => p.category === cat).length;
  }

  const byEra = {} as Record<Era, number>;
  const eras: Era[] = ["ancient", "medieval", "modern", "contemporary"];
  for (const era of eras) {
    byEra[era] = allPersons.filter((p) => p.era === era).length;
  }

  const byEntityType = {} as Record<EntityType, number>;
  const entityTypes: EntityType[] = [
    "event",
    "ideology",
    "movement",
    "institution",
    "text",
    "nation",
    "concept",
    "tradition",
    "archetype",
    "art_movement",
    "technology",
  ];
  for (const t of entityTypes) {
    byEntityType[t] = allEntities.filter((e) => e.type === t).length;
  }

  return {
    totalPersons: allPersons.length,
    mvpPersons: allPersons.filter((p) => p.mvp).length,
    byCategory,
    byEra,
    totalEntities: allEntities.length,
    byEntityType,
    totalRelationships: allRelationships.length,
  };
}

// ────────────────────────────────────────────────────────────
// Combined Search
// ────────────────────────────────────────────────────────────

/**
 * Person + Entity + Religion 통합 검색.
 * 이름, 요약, 태그에 대한 substring match.
 */
export function searchAll(query: string): SearchableItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchableItem[] = [];

  // Search persons
  for (const p of allPersons) {
    const haystack = [
      p.name.ko,
      p.name.en,
      p.name.original ?? "",
      p.summary,
      ...p.tags,
    ]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(q)) {
      results.push({
        id: p.id,
        type: "person",
        name: p.name,
        category: p.category,
        era: p.era,
        summary: p.summary,
        tags: p.tags,
        url: `/persons/${p.id}`,
      });
    }
  }

  // Search entities
  for (const e of allEntities) {
    const haystack = [
      e.name.ko,
      e.name.en,
      e.name.original ?? "",
      e.summary,
      ...e.tags,
    ]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(q)) {
      results.push({
        id: e.id,
        type: "entity",
        name: e.name,
        category: e.type,
        era: e.era,
        summary: e.summary,
        tags: e.tags,
        url: `/entities/${e.id}`,
      });
    }
  }

  // Search religions
  for (const r of allReligions) {
    const haystack = [r.name.ko, r.name.en, r.name.original ?? "", r.summary]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(q)) {
      results.push({
        id: r.id,
        type: "religion",
        name: r.name,
        category: r.type,
        summary: r.summary,
        tags: r.region,
        url: `/religion/${r.id}`,
      });
    }
  }

  return results;
}
