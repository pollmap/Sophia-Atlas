"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Route,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Globe,
  Landmark,
  Brain,
  Calculator,
  Lock,
  Star,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningStep {
  title: string;
  description: string;
  link?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: React.ReactNode;
  color: string;
  steps: LearningStep[];
  comingSoon?: boolean;
}

const difficultyConfig: Record<
  string,
  { label: string; className: string }
> = {
  beginner: { label: "입문", className: "bg-modern/15 text-modern" },
  intermediate: {
    label: "중급",
    className: "bg-gold/15 text-gold",
  },
  advanced: { label: "고급", className: "bg-cat-historical/15 text-cat-historical" },
};

const learningPaths: LearningPath[] = [
  {
    id: "philosophy-intro",
    title: "철학 입문",
    description:
      "철학이 무엇인지, 왜 중요한지부터 시작하여 서양 철학의 기초를 다지는 과정입니다. 핵심 질문들을 함께 탐구합니다.",
    difficulty: "beginner",
    icon: <BookOpen className="w-6 h-6" />,
    color: "philosopher",
    steps: [
      {
        title: "소크라테스 - 철학의 시작",
        description:
          "'너 자신을 알라' - 질문하는 것이 철학의 시작입니다. 소크라테스의 산파술과 무지의 자각을 배웁니다.",
        link: `/philosophy/socrates/`,
      },
      {
        title: "플라톤 - 이데아의 세계",
        description:
          "동굴의 비유를 통해 진정한 실재란 무엇인지 탐구합니다. 현상과 본질의 구분을 이해합니다.",
        link: `/philosophy/plato/`,
      },
      {
        title: "아리스토텔레스 - 만학의 아버지",
        description:
          "논리학, 윤리학, 정치학을 체계화한 아리스토텔레스의 철학 세계를 탐험합니다.",
        link: `/philosophy/aristotle/`,
      },
      {
        title: "데카르트 - 근대의 출발",
        description:
          "'나는 생각한다, 고로 존재한다' - 방법적 회의와 근대 주체 철학의 탄생을 살펴봅니다.",
        link: `/philosophy/descartes/`,
      },
      {
        title: "칸트 - 비판철학",
        description:
          "인식의 한계와 도덕의 보편 법칙을 탐구한 칸트의 비판철학을 정리합니다.",
        link: `/philosophy/kant/`,
      },
    ],
  },
  {
    id: "western-philosophy",
    title: "서양철학사 여행",
    description:
      "고대 그리스부터 현대까지 서양 철학의 흐름을 시대순으로 따라가며, 사상의 발전과 변화를 이해하는 종합 과정입니다.",
    difficulty: "intermediate",
    icon: <Brain className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "소크라테스 이전 자연철학",
        description:
          "탈레스, 헤라클레이토스, 파르메니데스 등 최초의 철학적 질문들을 살펴봅니다.",
      },
      {
        title: "소크라테스와 아테네 철학",
        description:
          "소크라테스의 산파술, 소피스트와의 논쟁, 윤리적 지식의 추구를 탐구합니다.",
        link: `/philosophy/socrates/`,
      },
      {
        title: "플라톤과 아리스토텔레스",
        description:
          "이데아론과 질료형상론의 대립, 아카데메이아와 리케이온의 전통을 비교합니다.",
        link: `/philosophy/plato/`,
      },
      {
        title: "중세 교부철학과 스콜라철학",
        description:
          "아우구스티누스와 토마스 아퀴나스를 통해 신앙과 이성의 관계를 살펴봅니다.",
        link: `/philosophy/augustine/`,
      },
      {
        title: "근대 합리론: 데카르트",
        description:
          "코기토에서 출발하는 근대 철학의 전환점을 이해합니다.",
        link: `/philosophy/descartes/`,
      },
      {
        title: "칸트의 비판철학",
        description:
          "합리론과 경험론의 종합, 코페르니쿠스적 전회의 의미를 파악합니다.",
        link: `/philosophy/kant/`,
      },
      {
        title: "니체와 가치의 전복",
        description:
          "'신은 죽었다' 선언과 위버멘쉬, 영원회귀 사상을 살펴봅니다.",
        link: `/philosophy/nietzsche/`,
      },
      {
        title: "현대 실존주의: 하이데거와 사르트르",
        description:
          "존재의 의미, 실존과 자유, 인간의 책임에 대한 현대적 사유를 정리합니다.",
        link: `/philosophy/heidegger/`,
      },
    ],
  },
  {
    id: "world-religions",
    title: "세계 종교 이해",
    description:
      "세계 주요 종교와 신화의 핵심 가르침을 비교하며, 인류가 공유하는 근본적 질문에 대한 다양한 답을 탐색합니다.",
    difficulty: "beginner",
    icon: <Globe className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "힌두교 - 가장 오래된 종교 전통",
        description:
          "브라만과 아트만, 카르마와 윤회, 다르마의 개념을 이해합니다.",
        link: `/religion/hinduism/`,
      },
      {
        title: "불교 - 고통과 깨달음의 길",
        description:
          "사성제와 팔정도, 연기와 무아의 가르침을 살펴봅니다.",
        link: `/religion/buddhism/`,
      },
      {
        title: "유대교/기독교/이슬람 - 아브라함 종교",
        description:
          "유일신 신앙의 세 전통을 비교하며 공통점과 차이점을 이해합니다.",
        link: `/religion/christianity/`,
      },
      {
        title: "유교 - 동아시아의 윤리 체계",
        description:
          "인, 의, 예, 지의 덕목과 군자의 이상을 탐구합니다.",
        link: `/religion/confucianism/`,
      },
      {
        title: "세계 신화 비교",
        description:
          "그리스, 북유럽, 이집트, 메소포타미아 신화의 공통 테마를 비교합니다.",
        link: `/religion/compare/`,
      },
    ],
  },
  {
    id: "eastern-philosophy",
    title: "동양철학",
    description:
      "유교, 도교, 불교를 중심으로 동아시아 사상의 핵심을 탐구하는 과정입니다.",
    difficulty: "intermediate",
    icon: <Landmark className="w-6 h-6" />,
    color: "historical",
    steps: [],
    comingSoon: true,
  },
  {
    id: "logic-basics",
    title: "논리학 기초",
    description:
      "논리적 사고의 기본 원리와 논증 구조를 배우는 과정입니다.",
    difficulty: "beginner",
    icon: <Calculator className="w-6 h-6" />,
    color: "modern",
    steps: [],
    comingSoon: true,
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  philosopher: {
    bg: "bg-cat-philosopher/10",
    border: "border-cat-philosopher/30",
    text: "text-cat-philosopher",
    iconBg: "bg-cat-philosopher/15",
  },
  medieval: {
    bg: "bg-medieval/10",
    border: "border-medieval/30",
    text: "text-medieval",
    iconBg: "bg-medieval/15",
  },
  gold: {
    bg: "bg-gold/10",
    border: "border-gold/30",
    text: "text-gold",
    iconBg: "bg-gold/15",
  },
  historical: {
    bg: "bg-cat-historical/10",
    border: "border-cat-historical/30",
    text: "text-cat-historical",
    iconBg: "bg-cat-historical/15",
  },
  modern: {
    bg: "bg-modern/10",
    border: "border-modern/30",
    text: "text-modern",
    iconBg: "bg-modern/15",
  },
};

export default function LearnPage() {
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const togglePath = (id: string) => {
    setExpandedPath((prev) => (prev === id ? null : id));
  };

  return (
    <div className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold">
            <Route className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-dark font-display">
            학습 경로
          </h1>
        </div>
        <p className="text-ink-medium max-w-2xl">
          체계적으로 정리된 학습 경로를 따라 철학과 종교/신화의 세계를
          탐험하세요. 각 경로는 단계별로 구성되어 있으며, 관련 페이지로의
          링크를 제공합니다.
        </p>
      </div>

      {/* Learning Paths */}
      <div className="space-y-4">
        {learningPaths.map((path) => {
          const isExpanded = expandedPath === path.id;
          const colors = colorMap[path.color];
          const difficulty = difficultyConfig[path.difficulty];

          return (
            <div
              key={path.id}
              className={cn(
                "border rounded-2xl overflow-hidden transition-all duration-300",
                path.comingSoon
                  ? "border-fresco-shadow/50 opacity-60"
                  : isExpanded
                  ? cn(colors.border, "shadow-sepia-lg")
                  : "border-fresco-shadow hover:border-gold/40"
              )}
            >
              {/* Path Header */}
              <button
                onClick={() => !path.comingSoon && togglePath(path.id)}
                disabled={path.comingSoon}
                className={cn(
                  "w-full flex items-center gap-4 p-5 md:p-6 text-left transition-colors duration-200",
                  !path.comingSoon && "hover:bg-fresco-aged/30",
                  path.comingSoon && "cursor-not-allowed"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0",
                    path.comingSoon
                      ? "bg-fresco-shadow/20 text-ink-faded"
                      : cn(colors.iconBg, colors.text)
                  )}
                >
                  {path.comingSoon ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    path.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2
                      className={cn(
                        "text-lg font-semibold font-display",
                        path.comingSoon
                          ? "text-ink-faded"
                          : "text-ink-dark"
                      )}
                    >
                      {path.title}
                    </h2>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium font-ui",
                        path.comingSoon
                          ? "bg-fresco-shadow/20 text-ink-faded"
                          : difficulty.className
                      )}
                    >
                      {difficulty.label}
                    </span>
                    {path.comingSoon && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-ui bg-fresco-shadow/20 text-ink-faded">
                        준비 중
                      </span>
                    )}
                    {!path.comingSoon && (
                      <span className="text-xs text-ink-faded font-ui">
                        {path.steps.length}단계
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      path.comingSoon
                        ? "text-ink-faded/60"
                        : "text-ink-medium"
                    )}
                  >
                    {path.description}
                  </p>
                </div>

                {/* Expand icon */}
                {!path.comingSoon && (
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-ink-faded flex-shrink-0 transition-transform duration-300",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </button>

              {/* Expanded Steps */}
              {isExpanded && !path.comingSoon && (
                <div className="border-t border-fresco-shadow">
                  <div className="p-5 md:p-6 space-y-0">
                    {path.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        {/* Step number and line */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold font-ui",
                              colors.bg,
                              colors.text,
                              "border",
                              colors.border
                            )}
                          >
                            {idx + 1}
                          </div>
                          {idx < path.steps.length - 1 && (
                            <div
                              className={cn(
                                "w-0.5 flex-1 my-1",
                                colors.bg
                              )}
                            />
                          )}
                        </div>

                        {/* Step content */}
                        <div
                          className={cn(
                            "flex-1 pb-6",
                            idx === path.steps.length - 1 && "pb-0"
                          )}
                        >
                          {step.link ? (
                            <Link
                              href={step.link}
                              className="block p-4 -ml-1 rounded-xl hover:bg-fresco-aged/30 transition-colors group"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm text-ink-dark group-hover:text-gold transition-colors">
                                  {step.title}
                                </h3>
                                <ChevronRight className="w-3.5 h-3.5 text-ink-faded group-hover:text-gold transition-colors" />
                              </div>
                              <p className="text-xs text-ink-medium leading-relaxed">
                                {step.description}
                              </p>
                            </Link>
                          ) : (
                            <div className="p-4 -ml-1">
                              <h3 className="font-medium text-sm text-ink-dark mb-1">
                                {step.title}
                              </h3>
                              <p className="text-xs text-ink-medium leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
