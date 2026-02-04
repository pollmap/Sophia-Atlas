"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table2,
  Filter,
  X,
  ChevronRight,
  Sparkles,
  Skull,
  Sword,
  Scale,
  Landmark,
  Scroll,
} from "lucide-react";
import religionsData from "@/data/religions.json";
import { cn } from "@/lib/utils";

type FilterType = "all" | "religion" | "mythology";

interface ThemeConfig {
  key: "creation" | "afterlife" | "heroMyth" | "ethics";
  label: string;
  icon: React.ReactNode;
}

const themeColumns: ThemeConfig[] = [
  { key: "creation", label: "창조신화", icon: <Sparkles className="w-4 h-4" /> },
  { key: "afterlife", label: "사후세계", icon: <Skull className="w-4 h-4" /> },
  { key: "heroMyth", label: "영웅서사", icon: <Sword className="w-4 h-4" /> },
  { key: "ethics", label: "윤리/계율", icon: <Scale className="w-4 h-4" /> },
];

export default function ReligionComparePage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCell, setSelectedCell] = useState<{
    religionId: string;
    themeKey: string;
    religionName: string;
    themeLabel: string;
    content: string;
  } | null>(null);

  const filteredReligions = religionsData.filter(
    (r) => filter === "all" || r.type === filter
  );

  const openDetail = (
    religionId: string,
    themeKey: string,
    religionName: string,
    themeLabel: string,
    content: string
  ) => {
    setSelectedCell({ religionId, themeKey, religionName, themeLabel, content });
  };

  return (
    <div className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400">
            <Table2 className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            테마별 비교 매트릭스
          </h1>
        </div>
        <p className="text-foreground-secondary max-w-2xl">
          세계 종교와 신화를 공통 테마별로 비교해보세요. 셀을 클릭하면 상세
          내용을 확인할 수 있습니다.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-8">
        <Filter className="w-4 h-4 text-foreground-muted" />
        <span className="text-sm text-foreground-muted mr-2">유형:</span>
        {(
          [
            { key: "all", label: "전체" },
            { key: "religion", label: "종교" },
            { key: "mythology", label: "신화" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              filter === item.key
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-background-secondary text-foreground-secondary hover:text-foreground border border-transparent"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-secondary/80">
                <th className="text-left px-5 py-4 text-sm font-semibold text-foreground border-b border-border min-w-[160px]">
                  종교/신화
                </th>
                {themeColumns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-4 text-sm font-semibold text-foreground border-b border-border min-w-[180px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-foreground-muted">{col.icon}</span>
                      {col.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReligions.map((religion, idx) => (
                <tr
                  key={religion.id}
                  className={cn(
                    "hover:bg-background-secondary/30 transition-colors",
                    idx < filteredReligions.length - 1 && "border-b border-border"
                  )}
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/religion/${religion.id}`}
                      className="flex items-center gap-2 group"
                    >
                      {religion.type === "religion" ? (
                        <Landmark className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <Scroll className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm text-foreground group-hover:text-amber-300 transition-colors">
                        {religion.name.ko}
                      </span>
                    </Link>
                  </td>
                  {themeColumns.map((col) => {
                    const content =
                      religion.themes[col.key as keyof typeof religion.themes];
                    return (
                      <td key={col.key} className="px-4 py-4">
                        {content ? (
                          <button
                            onClick={() =>
                              openDetail(
                                religion.id,
                                col.key,
                                religion.name.ko,
                                col.label,
                                content
                              )
                            }
                            className="text-left text-xs text-foreground-secondary hover:text-foreground transition-colors leading-relaxed line-clamp-3 cursor-pointer hover:bg-background-secondary/50 rounded-lg p-1.5 -m-1.5"
                          >
                            {content}
                          </button>
                        ) : (
                          <span className="text-xs text-foreground-muted italic">
                            -
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {filteredReligions.map((religion) => (
          <div
            key={religion.id}
            className="border border-border rounded-xl overflow-hidden bg-background-secondary/20"
          >
            {/* Card Header */}
            <Link
              href={`/religion/${religion.id}`}
              className="flex items-center justify-between px-4 py-3 bg-background-secondary/50 border-b border-border group"
            >
              <div className="flex items-center gap-2">
                {religion.type === "religion" ? (
                  <Landmark className="w-4 h-4 text-amber-400" />
                ) : (
                  <Scroll className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-semibold text-sm text-foreground group-hover:text-amber-300 transition-colors">
                  {religion.name.ko}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium",
                    religion.type === "religion"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  )}
                >
                  {religion.type === "religion" ? "종교" : "신화"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground-muted" />
            </Link>

            {/* Theme Items */}
            <div className="divide-y divide-border">
              {themeColumns.map((col) => {
                const content =
                  religion.themes[col.key as keyof typeof religion.themes];
                if (!content) return null;
                return (
                  <button
                    key={col.key}
                    onClick={() =>
                      openDetail(
                        religion.id,
                        col.key,
                        religion.name.ko,
                        col.label,
                        content
                      )
                    }
                    className="w-full text-left px-4 py-3 hover:bg-background-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-foreground-muted">{col.icon}</span>
                      <span className="text-xs font-medium text-foreground-muted">
                        {col.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary leading-relaxed line-clamp-2">
                      {content}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedCell && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCell(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-background-secondary border border-border rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary z-10">
              <div>
                <h3 className="font-semibold text-foreground">
                  {selectedCell.religionName}
                </h3>
                <p className="text-sm text-foreground-muted">
                  {selectedCell.themeLabel}
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-background-tertiary/50 text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-line">
                {selectedCell.content}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border">
              <Link
                href={`/religion/${selectedCell.religionId}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                onClick={() => setSelectedCell(null)}
              >
                {selectedCell.religionName} 상세 페이지
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
