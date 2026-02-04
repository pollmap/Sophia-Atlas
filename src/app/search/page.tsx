"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Landmark,
  Scroll,
  BookMarked,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import Fuse from "fuse.js";
import philosophersData from "@/data/persons/philosophers.json";
import religiousFiguresData from "@/data/persons/religious-figures.json";
import scientistsData from "@/data/persons/scientists.json";
import historicalFiguresData from "@/data/persons/historical-figures.json";
import religionsData from "@/data/religions.json";
import glossaryData from "@/data/glossary.json";
import { cn, getEraColorClass, getEraLabel, getCategoryLabel } from "@/lib/utils";

const allPersonsData = [
  ...philosophersData,
  ...religiousFiguresData,
  ...scientistsData,
  ...historicalFiguresData,
] as any[];

interface PersonResult {
  type: "person";
  id: string;
  name: string;
  nameEn: string;
  era: string;
  category: string;
  preview: string;
}

interface ReligionResult {
  type: "religion" | "mythology";
  id: string;
  name: string;
  nameEn: string;
  category: string;
  preview: string;
}

interface GlossaryResult {
  type: "glossary";
  id: string;
  term: string;
  termEn: string;
  category: string;
  definition: string;
}

type SearchResult = PersonResult | ReligionResult | GlossaryResult;

// Build search indices
const personIndex = new Fuse(allPersonsData, {
  keys: ["name.ko", "name.en", "summary", "tags", "concepts", "field", "school"],
  threshold: 0.4,
  includeScore: true,
});

const religionIndex = new Fuse(religionsData, {
  keys: ["name.ko", "name.en", "summary"],
  threshold: 0.4,
  includeScore: true,
});

const glossaryIndex = new Fuse(glossaryData, {
  keys: ["term.ko", "term.en", "definition"],
  threshold: 0.4,
  includeScore: true,
});

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [expandedGlossary, setExpandedGlossary] = useState<Set<string>>(
    new Set()
  );

  const results = useMemo(() => {
    if (!query.trim()) return { persons: [], religions: [], glossary: [] };

    const personResults = personIndex.search(query).map((r) => ({
      type: "person" as const,
      id: r.item.id,
      name: r.item.name.ko,
      nameEn: r.item.name.en,
      era: r.item.era,
      category: r.item.category || "philosopher",
      preview: r.item.summary,
    }));

    const relResults = religionIndex.search(query).map((r) => ({
      type: r.item.type as "religion" | "mythology",
      id: r.item.id,
      name: r.item.name.ko,
      nameEn: r.item.name.en,
      category: r.item.type === "religion" ? "종교" : "신화",
      preview: r.item.summary,
    }));

    const glosResults = glossaryIndex.search(query).map((r) => ({
      type: "glossary" as const,
      id: r.item.id,
      term: r.item.term.ko,
      termEn: r.item.term.en,
      category: r.item.category,
      definition: r.item.definition,
    }));

    return {
      persons: personResults,
      religions: relResults,
      glossary: glosResults,
    };
  }, [query]);

  const totalResults =
    results.persons.length +
    results.religions.length +
    results.glossary.length;

  const toggleGlossaryExpand = (id: string) => {
    setExpandedGlossary((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold">
            <Search className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-dark font-display">
            통합 검색
          </h1>
        </div>
        <p className="text-ink-medium">
          인물, 종교/신화, 용어를 한 곳에서 검색하세요. ({allPersonsData.length}명의 인물)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faded" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요..."
          className="w-full pl-12 pr-10 py-4 rounded-xl bg-fresco-parchment border border-fresco-shadow text-ink-dark placeholder:text-ink-faded focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 text-base transition-all duration-200"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-fresco-aged/50 text-ink-faded hover:text-ink-dark transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {query.trim() ? (
        totalResults > 0 ? (
          <div className="space-y-8">
            {/* Result count */}
            <p className="text-sm text-ink-faded">
              총 <span className="text-ink-dark font-medium">{totalResults}</span>개의 결과
            </p>

            {/* Persons */}
            {results.persons.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink-dark mb-3 font-display">
                  <BookOpen className="w-4 h-4 text-cat-philosopher" />
                  인물
                  <span className="text-xs text-ink-faded font-normal font-ui">
                    ({results.persons.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.persons.map((item) => (
                    <Link
                      key={item.id}
                      href={`/persons/${item.id}`}
                      className="flex items-start gap-3 p-4 rounded-xl border border-fresco-shadow bg-fresco-parchment/40 hover:bg-fresco-aged/50 transition-colors group"
                    >
                      <BookOpen className="w-4 h-4 text-cat-philosopher flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm text-ink-dark group-hover:text-gold transition-colors">
                            {item.name}
                          </span>
                          <span className="text-xs text-ink-faded">
                            {item.nameEn}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-medium font-ui",
                              getEraColorClass(item.era)
                            )}
                          >
                            {getEraLabel(item.era)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui bg-fresco-shadow/30 text-ink-light">
                            {getCategoryLabel(item.category)}
                          </span>
                        </div>
                        <p className="text-xs text-ink-medium line-clamp-2">
                          {item.preview}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-faded flex-shrink-0 mt-1 group-hover:text-gold transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Religions */}
            {results.religions.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink-dark mb-3 font-display">
                  <Landmark className="w-4 h-4 text-gold" />
                  종교/신화
                  <span className="text-xs text-ink-faded font-normal font-ui">
                    ({results.religions.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.religions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/religion/${item.id}`}
                      className="flex items-start gap-3 p-4 rounded-xl border border-fresco-shadow bg-fresco-parchment/40 hover:bg-fresco-aged/50 transition-colors group"
                    >
                      {item.type === "religion" ? (
                        <Landmark className="w-4 h-4 text-gold flex-shrink-0 mt-1" />
                      ) : (
                        <Scroll className="w-4 h-4 text-cat-scientist flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm text-ink-dark group-hover:text-gold transition-colors">
                            {item.name}
                          </span>
                          <span className="text-xs text-ink-faded">
                            {item.nameEn}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-medium font-ui",
                              item.type === "religion"
                                ? "bg-gold/15 text-gold"
                                : "bg-cat-scientist/15 text-cat-scientist"
                            )}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-ink-medium line-clamp-2">
                          {item.preview}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-faded flex-shrink-0 mt-1 group-hover:text-gold transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Glossary */}
            {results.glossary.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink-dark mb-3 font-display">
                  <BookMarked className="w-4 h-4 text-modern" />
                  용어사전
                  <span className="text-xs text-ink-faded font-normal font-ui">
                    ({results.glossary.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.glossary.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-fresco-shadow bg-fresco-parchment/40"
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm text-ink-dark">
                          {item.term}
                        </span>
                        <span className="text-xs text-ink-faded">
                          {item.termEn}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui bg-modern/15 text-modern">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-ink-medium leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-ink-faded mx-auto mb-4 opacity-50" />
            <p className="text-ink-light text-lg">
              검색 결과가 없습니다
            </p>
            <p className="text-ink-faded text-sm mt-1">
              다른 검색어를 시도해보세요.
            </p>
          </div>
        )
      ) : (
        <div>
          {/* Empty state */}
          <div className="text-center py-12 mb-12">
            <Search className="w-12 h-12 text-ink-faded mx-auto mb-4 opacity-30" />
            <p className="text-ink-faded">검색어를 입력하세요</p>
          </div>

          {/* Glossary Section */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-dark mb-4 font-display">
              <BookMarked className="w-5 h-5 text-modern" />
              용어사전
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {glossaryData.map((term) => {
                const isExpanded = expandedGlossary.has(term.id);
                return (
                  <div
                    key={term.id}
                    className="border border-fresco-shadow rounded-xl overflow-hidden bg-fresco-parchment/40"
                  >
                    <button
                      onClick={() => toggleGlossaryExpand(term.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-fresco-aged/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-ink-dark">
                          {term.term.ko}
                        </span>
                        <span className="text-xs text-ink-faded">
                          {term.term.en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui bg-modern/10 text-modern">
                          {term.category}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-ink-faded transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 border-t border-fresco-shadow/50">
                        <p className="text-xs text-ink-medium leading-relaxed pt-3">
                          {term.definition}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
