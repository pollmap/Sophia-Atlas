"use client";

import Link from "next/link";
import {
  Sparkles,
  Skull,
  Sword,
  Scale,
  ArrowRight,
  Landmark,
  Scroll,
} from "lucide-react";
import religionsData from "@/data/religions.json";
import { cn } from "@/lib/utils";

const themes = [
  {
    id: "creation",
    label: "창조신화",
    en: "Creation Myths",
    icon: <Sparkles className="w-6 h-6" />,
    color: "#F59E0B",
    description:
      "세계의 시작을 어떻게 설명하는가? 무에서 유로, 혼돈에서 질서로 — 각 문명이 상상한 우주의 탄생 이야기.",
  },
  {
    id: "afterlife",
    label: "사후세계",
    en: "Afterlife",
    icon: <Skull className="w-6 h-6" />,
    color: "#8B5CF6",
    description:
      "죽음 너머에는 무엇이 있는가? 천국과 지옥, 환생과 해탈, 명계와 엘리시움 — 인류가 꿈꾼 사후의 세계.",
  },
  {
    id: "heroMyth",
    label: "영웅서사",
    en: "Hero Narratives",
    icon: <Sword className="w-6 h-6" />,
    color: "#EF4444",
    description:
      "영웅은 어떻게 탄생하고 시련을 겪는가? 신화적 영웅의 여정에서 발견하는 인류 보편의 서사 구조.",
  },
  {
    id: "ethics",
    label: "윤리/계율",
    en: "Ethics & Commandments",
    icon: <Scale className="w-6 h-6" />,
    color: "#10B981",
    description:
      "어떻게 살아야 하는가? 십계명에서 팔정도까지, 각 종교가 제시하는 올바른 삶의 기준과 도덕적 가르침.",
  },
];

export default function ThemesPage() {
  const religionCount = religionsData.length;

  return (
    <div className="min-h-screen bg-[var(--fresco-ivory)]">
      {/* Header */}
      <div className="border-b border-[var(--fresco-shadow)]">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <h1
            className="text-3xl md:text-4xl font-bold text-[var(--ink-dark)] mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            주요 테마
          </h1>
          <p className="text-[var(--ink-medium)] max-w-2xl" style={{ fontFamily: "'Pretendard', sans-serif" }}>
            {religionCount}개 종교와 신화를 관통하는 보편적 테마를 탐구합니다.
            각 문명은 같은 질문에 어떻게 다른 답을 내렸을까요?
          </p>
        </div>
      </div>

      {/* Theme Cards */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map((theme) => {
            const religionsWithTheme = religionsData.filter(
              (r: any) => r.themes?.[theme.id as keyof typeof r.themes]
            );

            return (
              <Link
                key={theme.id}
                href={`/themes/${theme.id}`}
                className="group block"
              >
                <div className="border border-[var(--fresco-shadow)] rounded-xl p-6 bg-[var(--fresco-parchment)]/50 hover:bg-[var(--fresco-parchment)] transition-all duration-300 hover:shadow-lg hover:border-[var(--fresco-shadow-dark)]">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: theme.color + "15", color: theme.color }}
                    >
                      {theme.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--ink-dark)] group-hover:text-[var(--gold)] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {theme.label}
                      </h2>
                      <span className="text-xs text-[var(--ink-faded)]">{theme.en}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--ink-faded)] ml-auto group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[var(--ink-medium)] leading-relaxed mb-4" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                    {theme.description}
                  </p>

                  {/* Religion previews */}
                  <div className="flex flex-wrap gap-1.5">
                    {religionsWithTheme.slice(0, 8).map((r: any) => (
                      <span
                        key={r.id}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-medium",
                          r.type === "religion"
                            ? "bg-[#F59E0B]/10 text-[#B8860B]"
                            : "bg-[#10B981]/10 text-[#0D9668]"
                        )}
                      >
                        {r.name.ko}
                      </span>
                    ))}
                    {religionsWithTheme.length > 8 && (
                      <span className="px-2 py-0.5 rounded text-[10px] text-[var(--ink-faded)]">
                        +{religionsWithTheme.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Compare link */}
        <div className="mt-8 text-center">
          <Link
            href="/religion/compare"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--fresco-shadow)] text-sm text-[var(--ink-medium)] hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-all"
            style={{ fontFamily: "'Pretendard', sans-serif" }}
          >
            <Landmark className="w-4 h-4" />
            테마별 비교 매트릭스 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
