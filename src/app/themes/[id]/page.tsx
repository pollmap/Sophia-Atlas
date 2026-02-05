import Link from "next/link";
import {
  Sparkles,
  Skull,
  Sword,
  Scale,
  ArrowLeft,
  ArrowRight,
  Landmark,
  Scroll,
  BookOpen,
  Users,
} from "lucide-react";
import religionsData from "@/data/religions.json";
import philosophersData from "@/data/persons/philosophers.json";
import religiousFiguresData from "@/data/persons/religious-figures.json";
import { cn, getCategoryHexColor, formatYear } from "@/lib/utils";

// Theme configuration
const THEMES: Record<
  string,
  {
    label: string;
    en: string;
    icon: string;
    color: string;
    description: string;
    longDescription: string;
    relatedConcepts: string[];
  }
> = {
  creation: {
    label: "창조신화",
    en: "Creation Myths",
    icon: "sparkles",
    color: "#F59E0B",
    description:
      "세계의 시작을 어떻게 설명하는가? 무에서 유로, 혼돈에서 질서로 — 각 문명이 상상한 우주의 탄생 이야기.",
    longDescription:
      "창조신화는 모든 문명의 출발점입니다. 왜 세계가 존재하는가, 인간은 어디서 왔는가라는 근원적 질문에 대한 각 문명의 답입니다. 메소포타미아의 에누마 엘리시에서 성경의 창세기까지, 인도의 리그베다 찬가에서 중국의 반고 신화까지 — 놀라울 정도로 유사한 구조(혼돈→분리→질서)가 반복되면서도 각 문화의 고유한 세계관을 반영합니다.",
    relatedConcepts: ["우주론", "신정론", "원초적 혼돈", "창조주", "세계수"],
  },
  afterlife: {
    label: "사후세계",
    en: "Afterlife",
    icon: "skull",
    color: "#8B5CF6",
    description:
      "죽음 너머에는 무엇이 있는가? 천국과 지옥, 환생과 해탈, 명계와 엘리시움 — 인류가 꿈꾼 사후의 세계.",
    longDescription:
      "사후세계에 대한 믿음은 인류 문명의 가장 오래된 특징 중 하나입니다. 네안데르탈인의 매장 의식에서 이집트의 사자의 서까지, 불교의 윤회에서 기독교의 최후 심판까지 — 죽음 이후를 상상하는 방식은 그 문화의 도덕관, 정의관, 존재론을 압축적으로 보여줍니다. 사후세계관은 단순한 사후 상상이 아니라, 현세의 삶을 어떻게 살아야 하는가에 대한 강력한 윤리적 프레임워크입니다.",
    relatedConcepts: ["영혼", "윤회", "심판", "구원", "해탈", "명계"],
  },
  heroMyth: {
    label: "영웅서사",
    en: "Hero Narratives",
    icon: "sword",
    color: "#EF4444",
    description:
      "영웅은 어떻게 탄생하고 시련을 겪는가? 신화적 영웅의 여정에서 발견하는 인류 보편의 서사 구조.",
    longDescription:
      "조지프 캠벨이 '천의 얼굴을 가진 영웅'에서 밝힌 것처럼, 세계 모든 문화의 영웅 서사는 놀라운 구조적 유사성을 보입니다. '소명→출발→시련→죽음/재생→귀환'이라는 단핵 신화(monomyth)는 그리스의 오디세우스, 인도의 라마, 기독교의 예수, 불교의 싯다르타에서 동일하게 반복됩니다. 영웅서사는 인간이 고통과 성장을 이해하는 보편적 심리 구조를 반영합니다.",
    relatedConcepts: [
      "단핵신화",
      "영웅의 여정",
      "시련과 변환",
      "트릭스터",
      "희생",
    ],
  },
  ethics: {
    label: "윤리/계율",
    en: "Ethics & Commandments",
    icon: "scale",
    color: "#10B981",
    description:
      "어떻게 살아야 하는가? 십계명에서 팔정도까지, 각 종교가 제시하는 올바른 삶의 기준과 도덕적 가르침.",
    longDescription:
      "모든 종교의 핵심에는 '어떻게 살아야 하는가'라는 윤리적 질문이 있습니다. 기독교의 십계명, 불교의 팔정도, 유교의 오륜, 이슬람의 다섯 기둥 — 형식은 다르지만 자비, 정의, 진실, 절제라는 공통 가치를 발견할 수 있습니다. 종교 윤리는 개인의 내면 수양에서 사회 정의까지, 일상의 식사 규율에서 우주적 도덕 법칙까지 포괄하는 총체적 삶의 지침입니다.",
    relatedConcepts: [
      "자비",
      "정의",
      "덕",
      "계율",
      "황금률",
      "카르마",
    ],
  },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="w-6 h-6" />,
  skull: <Skull className="w-6 h-6" />,
  sword: <Sword className="w-6 h-6" />,
  scale: <Scale className="w-6 h-6" />,
};

// Related persons per theme (manually curated key figures)
const THEME_PERSONS: Record<string, string[]> = {
  creation: [
    "moses",
    "nagarjuna",
    "plotinus",
    "laozi",
    "shankara",
    "augustine",
  ],
  afterlife: [
    "plato",
    "jesus",
    "buddha",
    "muhammad",
    "zoroaster",
    "origenes",
  ],
  heroMyth: [
    "jesus",
    "buddha",
    "moses",
    "muhammad",
    "homer",
    "krishna",
  ],
  ethics: [
    "confucius",
    "jesus",
    "buddha",
    "muhammad",
    "moses",
    "aristotle",
    "kant",
    "gandhi",
  ],
};

export function generateStaticParams() {
  return Object.keys(THEMES).map((id) => ({ id }));
}

export default function ThemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const theme = THEMES[params.id];

  if (!theme) {
    return (
      <div className="min-h-screen bg-[var(--fresco-ivory)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--ink-dark)] mb-2">
            테마를 찾을 수 없습니다
          </h1>
          <Link
            href="/themes"
            className="text-[var(--gold)] hover:underline"
          >
            테마 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const themeKey = params.id as keyof (typeof religionsData)[0]["themes"];

  // Get religions with this theme
  const religionsWithTheme = religionsData
    .filter((r: any) => r.themes?.[themeKey])
    .map((r: any) => ({
      ...r,
      themeContent: r.themes[themeKey] as string,
    }));

  const religions = religionsWithTheme.filter((r: any) => r.type === "religion");
  const mythologies = religionsWithTheme.filter((r: any) => r.type === "mythology");

  // Get related persons
  const allPersons = [
    ...(philosophersData as any[]),
    ...(religiousFiguresData as any[]),
  ];
  const relatedPersons = THEME_PERSONS[params.id]
    ?.map((id) => allPersons.find((p) => p.id === id))
    .filter(Boolean) || [];

  // Theme navigation
  const themeIds = Object.keys(THEMES);
  const currentIdx = themeIds.indexOf(params.id);
  const prevTheme = currentIdx > 0 ? themeIds[currentIdx - 1] : null;
  const nextTheme = currentIdx < themeIds.length - 1 ? themeIds[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[var(--fresco-ivory)]">
      {/* Header */}
      <div className="border-b border-[var(--fresco-shadow)]">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/themes"
              className="flex items-center gap-1 text-sm text-[var(--ink-faded)] hover:text-[var(--gold)] transition-colors"
              style={{ fontFamily: "'Pretendard', sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" />
              주요 테마
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: theme.color + "15",
                color: theme.color,
              }}
            >
              {ICON_MAP[theme.icon]}
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold text-[var(--ink-dark)]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {theme.label}
              </h1>
              <span className="text-sm text-[var(--ink-faded)]">
                {theme.en}
              </span>
            </div>
          </div>

          <p
            className="text-[var(--ink-medium)] leading-relaxed max-w-3xl"
            style={{ fontFamily: "'Pretendard', sans-serif" }}
          >
            {theme.longDescription}
          </p>

          {/* Related concepts */}
          <div className="flex flex-wrap gap-2 mt-4">
            {theme.relatedConcepts.map((concept) => (
              <span
                key={concept}
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{
                  borderColor: theme.color + "30",
                  color: theme.color,
                  backgroundColor: theme.color + "08",
                }}
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Religions section */}
        {religions.length > 0 && (
          <section className="mb-10">
            <h2
              className="flex items-center gap-2 text-xl font-bold text-[var(--ink-dark)] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Landmark className="w-5 h-5 text-[#B8860B]" />
              종교
            </h2>
            <div className="space-y-4">
              {religions.map((r: any) => (
                <div
                  key={r.id}
                  className="border border-[var(--fresco-shadow)] rounded-xl p-5 bg-[var(--fresco-parchment)]/30 hover:bg-[var(--fresco-parchment)]/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Link
                      href={`/religion/${r.id}`}
                      className="flex items-center gap-2 group"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                      <span
                        className="font-bold text-[var(--ink-dark)] group-hover:text-[var(--gold)] transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {r.name.ko}
                      </span>
                      <span className="text-xs text-[var(--ink-faded)]">
                        {r.name.en}
                      </span>
                    </Link>
                    <Link
                      href={`/religion/${r.id}`}
                      className="text-xs text-[var(--ink-faded)] hover:text-[var(--gold)] transition-colors"
                    >
                      상세 &rarr;
                    </Link>
                  </div>
                  <p
                    className="text-sm text-[var(--ink-medium)] leading-relaxed"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                  >
                    {r.themeContent}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mythologies section */}
        {mythologies.length > 0 && (
          <section className="mb-10">
            <h2
              className="flex items-center gap-2 text-xl font-bold text-[var(--ink-dark)] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Scroll className="w-5 h-5 text-[#10B981]" />
              신화
            </h2>
            <div className="space-y-4">
              {mythologies.map((r: any) => (
                <div
                  key={r.id}
                  className="border border-[var(--fresco-shadow)] rounded-xl p-5 bg-[var(--fresco-parchment)]/30 hover:bg-[var(--fresco-parchment)]/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Link
                      href={`/religion/${r.id}`}
                      className="flex items-center gap-2 group"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span
                        className="font-bold text-[var(--ink-dark)] group-hover:text-[var(--gold)] transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {r.name.ko}
                      </span>
                      <span className="text-xs text-[var(--ink-faded)]">
                        {r.name.en}
                      </span>
                    </Link>
                    <Link
                      href={`/religion/${r.id}`}
                      className="text-xs text-[var(--ink-faded)] hover:text-[var(--gold)] transition-colors"
                    >
                      상세 &rarr;
                    </Link>
                  </div>
                  <p
                    className="text-sm text-[var(--ink-medium)] leading-relaxed"
                    style={{ fontFamily: "'Pretendard', sans-serif" }}
                  >
                    {r.themeContent}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related key figures */}
        {relatedPersons.length > 0 && (
          <section className="mb-10">
            <h2
              className="flex items-center gap-2 text-xl font-bold text-[var(--ink-dark)] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <Users className="w-5 h-5 text-[var(--ink-medium)]" />
              관련 인물
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {relatedPersons.map((p: any) => {
                const link =
                  p.category === "philosopher"
                    ? `/philosophy/${p.id}/`
                    : `/persons/${p.id}/`;
                const color = getCategoryHexColor(p.category);
                return (
                  <Link
                    key={p.id}
                    href={link}
                    className="flex items-center gap-2.5 p-3 rounded-lg border border-[var(--fresco-shadow)] hover:border-[var(--gold)]/30 hover:bg-[var(--fresco-parchment)]/50 transition-all group"
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: color + "20",
                        color: color,
                      }}
                    >
                      {p.name.ko[0]}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[var(--ink-dark)] group-hover:text-[var(--gold)] transition-colors block truncate">
                        {p.name.ko}
                      </span>
                      <span className="text-[10px] text-[var(--ink-faded)]">
                        {formatYear(p.period.start)}~{formatYear(p.period.end)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Navigation between themes */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--fresco-shadow)]">
          {prevTheme ? (
            <Link
              href={`/themes/${prevTheme}`}
              className="flex items-center gap-2 text-sm text-[var(--ink-medium)] hover:text-[var(--gold)] transition-colors"
              style={{ fontFamily: "'Pretendard', sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" />
              {THEMES[prevTheme].label}
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/religion/compare"
            className="flex items-center gap-1.5 text-xs text-[var(--ink-faded)] hover:text-[var(--gold)] transition-colors px-3 py-1.5 rounded border border-[var(--fresco-shadow)]"
            style={{ fontFamily: "'Pretendard', sans-serif" }}
          >
            비교 매트릭스
          </Link>

          {nextTheme ? (
            <Link
              href={`/themes/${nextTheme}`}
              className="flex items-center gap-2 text-sm text-[var(--ink-medium)] hover:text-[var(--gold)] transition-colors"
              style={{ fontFamily: "'Pretendard', sans-serif" }}
            >
              {THEMES[nextTheme].label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
