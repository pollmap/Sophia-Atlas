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
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400">
            <Search className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            통합 검색
          </h1>
        </div>
        <p className="text-foreground-secondary">
          인물, 종교/신화, 용어를 한 곳에서 검색하세요. ({allPersonsData.length}명의 인물)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요..."
          className="w-full pl-12 pr-10 py-4 rounded-xl bg-background-secondary border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base transition-all duration-200"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-background-tertiary/50 text-foreground-muted hover:text-foreground transition-colors"
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
            <p className="text-sm text-foreground-muted">
              총 <span className="text-foreground font-medium">{totalResults}</span>개의 결과
            </p>

            {/* Persons */}
            {results.persons.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  인물
                  <span className="text-xs text-foreground-muted font-normal">
                    ({results.persons.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.persons.map((item) => (
                    <Link
                      key={item.id}
                      href={`/persons/${item.id}`}
                      className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background-secondary/20 hover:bg-background-secondary/40 transition-colors group"
                    >
                      <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm text-foreground group-hover:text-blue-300 transition-colors">
                            {item.name}
                          </span>
                          <span className="text-xs text-foreground-muted">
                            {item.nameEn}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-medium",
                              getEraColorClass(item.era)
                            )}
                          >
                            {getEraLabel(item.era)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/15 text-slate-400">
                            {getCategoryLabel(item.category)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-secondary line-clamp-2">
                          {item.preview}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground-muted flex-shrink-0 mt-1 group-hover:text-blue-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Religions */}
            {results.religions.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  종교/신화
                  <span className="text-xs text-foreground-muted font-normal">
                    ({results.religions.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.religions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/religion/${item.id}`}
                      className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background-secondary/20 hover:bg-background-secondary/40 transition-colors group"
                    >
                      {item.type === "religion" ? (
                        <Landmark className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                      ) : (
                        <Scroll className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm text-foreground group-hover:text-amber-300 transition-colors">
                            {item.name}
                          </span>
                          <span className="text-xs text-foreground-muted">
                            {item.nameEn}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-medium",
                              item.type === "religion"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-emerald-500/15 text-emerald-400"
                            )}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-secondary line-clamp-2">
                          {item.preview}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground-muted flex-shrink-0 mt-1 group-hover:text-amber-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Glossary */}
            {results.glossary.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
                  <BookMarked className="w-4 h-4 text-teal-400" />
                  용어사전
                  <span className="text-xs text-foreground-muted font-normal">
                    ({results.glossary.length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {results.glossary.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-border bg-background-secondary/20"
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm text-foreground">
                          {item.term}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          {item.termEn}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/15 text-teal-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-foreground-secondary leading-relaxed">
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
            <Search className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-50" />
            <p className="text-foreground-muted text-lg">
              검색 결과가 없습니다
            </p>
            <p className="text-foreground-muted text-sm mt-1">
              다른 검색어를 시도해보세요.
            </p>
          </div>
        )
      ) : (
        <div>
          {/* Empty state */}
          <div className="text-center py-12 mb-12">
            <Search className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-30" />
            <p className="text-foreground-muted">검색어를 입력하세요</p>
          </div>

          {/* Glossary Section */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
              <BookMarked className="w-5 h-5 text-teal-400" />
              용어사전
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {glossaryData.map((term) => {
                const isExpanded = expandedGlossary.has(term.id);
                return (
                  <div
                    key={term.id}
                    className="border border-border rounded-xl overflow-hidden bg-background-secondary/20"
                  >
                    <button
                      onClick={() => toggleGlossaryExpand(term.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-background-secondary/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">
                          {term.term.ko}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          {term.term.en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400">
                          {term.category}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-foreground-muted transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 border-t border-border/50">
                        <p className="text-xs text-foreground-secondary leading-relaxed pt-3">
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
