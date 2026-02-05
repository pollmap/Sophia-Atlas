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
  Atom,
  Compass,
  Network,
  Flame,
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
    title: "동양철학의 세계",
    description:
      "유교, 도교, 불교를 중심으로 동아시아 사상의 핵심을 탐구합니다. 서양과는 전혀 다른 세계관과 인간 이해를 만나봅니다.",
    difficulty: "intermediate",
    icon: <Landmark className="w-6 h-6" />,
    color: "historical",
    steps: [
      {
        title: "공자 - 인(仁)의 철학",
        description:
          "인, 의, 예, 지의 덕목과 군자의 이상. 2,500년간 동아시아를 지배한 윤리 체계의 출발점입니다.",
        link: `/persons/confucius`,
      },
      {
        title: "노자 - 도(道)의 세계",
        description:
          "무위자연과 도의 철학. '도가도비상도' — 말로 할 수 있는 도는 참된 도가 아닙니다.",
        link: `/persons/laozi`,
      },
      {
        title: "장자 - 자유의 철학",
        description:
          "나비의 꿈, 소요유. 인간의 편견을 넘어 절대 자유의 경지를 추구한 장자의 사유.",
        link: `/persons/zhuangzi`,
      },
      {
        title: "붓다 - 고통의 소멸",
        description:
          "사성제와 팔정도, 연기와 공(空)의 가르침. 인도에서 탄생해 동아시아 전체를 변화시킨 사상.",
        link: `/persons/buddha`,
      },
      {
        title: "나가르주나 - 중관철학",
        description:
          "공(空)의 논리적 체계화. '모든 것은 비어있기에 모든 것이 가능하다'는 역설적 진리.",
        link: `/persons/nagarjuna`,
      },
      {
        title: "주희 - 성리학의 완성",
        description:
          "이(理)와 기(氣)의 이원론으로 유교 형이상학을 완성. 동아시아 근세 사상의 기둥.",
        link: `/persons/zhu-xi`,
      },
      {
        title: "왕양명 - 심즉리(心卽理)",
        description:
          "마음이 곧 이치다. 지행합일(知行合一)을 주장한 양명학의 실천 철학.",
        link: `/persons/wang-yangming`,
      },
      {
        title: "원효 - 한국 철학의 시작",
        description:
          "화쟁(和諍)사상으로 불교 교학의 대립을 회통시킨 한국 사상의 원류.",
        link: `/persons/wonhyo`,
      },
    ],
  },
  {
    id: "logic-basics",
    title: "논리학의 모험",
    description:
      "논리적 사고의 기본 원리와 논증 구조를 배웁니다. 아리스토텔레스의 삼단논법부터 현대 분석철학까지.",
    difficulty: "beginner",
    icon: <Calculator className="w-6 h-6" />,
    color: "modern",
    steps: [
      {
        title: "아리스토텔레스 - 논리학의 탄생",
        description:
          "삼단논법과 범주론. 2,000년간 서양 논리의 기초가 된 오르가논 체계를 살펴봅니다.",
        link: `/philosophy/aristotle/`,
      },
      {
        title: "스토아학파의 명제 논리",
        description:
          "조건문과 접속사 논리. 스토아학파가 발전시킨 명제 논리의 원형을 이해합니다.",
        link: `/entities/stoicism-movement`,
      },
      {
        title: "프레게 - 현대 논리학의 아버지",
        description:
          "개념표기법과 양화논리. 2,000년 만에 아리스토텔레스를 넘어선 논리 혁명.",
        link: `/persons/frege`,
      },
      {
        title: "러셀 - 수리논리와 역설",
        description:
          "러셀의 역설과 프린키피아 마테마티카. 수학의 기초를 논리로 환원하려는 야심찬 시도.",
        link: `/persons/russell`,
      },
      {
        title: "괴델 - 불완전성의 충격",
        description:
          "완전하고 무모순인 체계는 불가능하다. 수학과 논리학의 한계를 증명한 세기의 정리.",
        link: `/persons/godel`,
      },
      {
        title: "비트겐슈타인 - 언어의 한계",
        description:
          "'말할 수 없는 것에 대해서는 침묵해야 한다.' 논리와 언어의 관계를 근본적으로 재고합니다.",
        link: `/persons/wittgenstein`,
      },
    ],
  },
  {
    id: "scientific-revolution",
    title: "과학혁명의 여정",
    description:
      "코페르니쿠스에서 뉴턴, 아인슈타인까지. 세계를 바꾼 과학적 발견과 그 철학적 의미를 추적합니다.",
    difficulty: "intermediate",
    icon: <Atom className="w-6 h-6" />,
    color: "scientist",
    steps: [
      {
        title: "코페르니쿠스 - 지동설 혁명",
        description:
          "지구가 우주의 중심이 아니다. 천문학 혁명이 인간의 자기 이해를 어떻게 뒤흔들었는가.",
        link: `/persons/copernicus`,
      },
      {
        title: "갈릴레오 - 실험과 관찰의 승리",
        description:
          "'그래도 지구는 돈다.' 망원경과 실험으로 세계의 비밀을 밝힌 근대 과학의 선구자.",
        link: `/persons/galileo`,
      },
      {
        title: "뉴턴 - 만유인력의 세계",
        description:
          "프린키피아와 만유인력의 법칙. 하늘과 땅의 법칙을 하나로 통합한 역사상 가장 위대한 종합.",
        link: `/persons/newton`,
      },
      {
        title: "다윈 - 진화론의 충격",
        description:
          "자연선택과 적자생존. 인간도 자연의 산물이라는 발견이 종교와 철학에 미친 파장.",
        link: `/persons/darwin`,
      },
      {
        title: "아인슈타인 - 시공간의 혁명",
        description:
          "특수·일반 상대성이론과 E=mc². 뉴턴 이후 200년간의 물리학을 근본적으로 재구성.",
        link: `/persons/einstein`,
      },
      {
        title: "양자역학 - 확률의 세계",
        description:
          "하이젠베르크의 불확정성, 보어의 상보성. 세계는 결정론적이지 않다는 충격적 발견.",
        link: `/entities/quantum-mechanics`,
      },
      {
        title: "튜링 - 계산의 본질",
        description:
          "튜링 머신과 계산 가능성. 수학, 논리학, 컴퓨터를 연결한 현대 정보시대의 이론적 기초.",
        link: `/persons/turing`,
      },
    ],
  },
  {
    id: "existentialism",
    title: "실존주의 탐험",
    description:
      "'실존은 본질에 앞선다.' 키르케고르부터 카뮈까지, 인간 존재의 의미를 묻는 실존 사상가들의 여정.",
    difficulty: "advanced",
    icon: <Flame className="w-6 h-6" />,
    color: "philosopher",
    steps: [
      {
        title: "키르케고르 - 실존의 발견",
        description:
          "불안, 절망, 신앙의 도약. 헤겔의 체계에 반발하며 개인의 주체적 실존을 외친 최초의 실존주의자.",
        link: `/persons/kierkegaard`,
      },
      {
        title: "니체 - 신의 죽음 이후",
        description:
          "허무주의의 도래와 위버멘쉬. 가치의 전복과 영원회귀 속에서 새로운 의미를 창조하라.",
        link: `/philosophy/nietzsche/`,
      },
      {
        title: "하이데거 - 존재의 물음",
        description:
          "현존재(Dasein)와 세계-내-존재. 존재의 의미를 묻는 근본적 질문과 죽음으로의 선구.",
        link: `/philosophy/heidegger/`,
      },
      {
        title: "야스퍼스 - 한계상황",
        description:
          "죽음, 고통, 투쟁, 죄의식. 한계상황에서 비로소 실존이 각성되는 인간의 조건.",
        link: `/persons/jaspers`,
      },
      {
        title: "사르트르 - 자유와 책임",
        description:
          "'인간은 자유를 선고받았다.' 실존이 본질에 앞선다는 선언과 앙가주망(참여)의 윤리학.",
        link: `/persons/sartre`,
      },
      {
        title: "카뮈 - 부조리의 철학",
        description:
          "시지프스의 신화와 이방인. 부조리한 세계에서 반항하며 살아가는 인간의 존엄.",
        link: `/persons/camus`,
      },
      {
        title: "보부아르 - 실존주의 페미니즘",
        description:
          "'여성은 태어나는 것이 아니라 만들어지는 것이다.' 실존주의를 여성 해방에 적용한 선구적 사유.",
        link: `/persons/de-beauvoir`,
      },
    ],
  },
  {
    id: "east-west-dialogue",
    title: "동서양 사상 대화",
    description:
      "동양과 서양의 핵심 사상가들을 비교하며, 인류가 같은 질문에 어떻게 다른 답을 내놓았는지 탐구합니다.",
    difficulty: "advanced",
    icon: <Compass className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "플라톤 vs 공자 - 이상국가와 덕치",
        description:
          "철인왕과 군자의 비교. 서양의 이데아와 동양의 인(仁), 두 문명의 정치철학적 꿈.",
        link: `/compare?a=plato&b=confucius`,
      },
      {
        title: "아리스토텔레스 vs 노자 - 논리와 도",
        description:
          "범주와 논증 vs 무위자연. 세계를 분석하려는 서양과 합일하려는 동양의 근본 차이.",
        link: `/compare?a=aristotle&b=laozi`,
      },
      {
        title: "데카르트 vs 왕양명 - 인식의 기초",
        description:
          "코기토 vs 양지(良知). 서양의 이성적 주체와 동양의 도덕적 직관, 인식론의 두 길.",
        link: `/compare?a=descartes&b=wang-yangming`,
      },
      {
        title: "칸트 vs 주희 - 도덕의 근거",
        description:
          "정언명령 vs 이기론. 서양의 보편 도덕법칙과 동양의 우주론적 윤리의 비교.",
        link: `/compare?a=kant&b=zhu-xi`,
      },
      {
        title: "붓다 vs 소크라테스 - 무지와 무아",
        description:
          "무지의 자각과 무아의 깨달음. 동서양 지혜의 두 정점이 만나는 경이로운 교차점.",
        link: `/compare?a=socrates&b=buddha`,
      },
      {
        title: "니체 vs 장자 - 자유와 해방",
        description:
          "위버멘쉬와 소요유. 기존 가치의 전복과 절대 자유를 추구한 두 반역자의 사상.",
        link: `/compare?a=nietzsche&b=zhuangzi`,
      },
    ],
  },
  {
    id: "influence-chains",
    title: "영향의 사슬 탐험",
    description:
      "인드라망에서 사상가 간 영향 관계의 연쇄를 따라가며, 지성사의 숨겨진 연결고리를 발견합니다.",
    difficulty: "intermediate",
    icon: <Network className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "소크라테스 → 플라톤 → 아리스토텔레스",
        description:
          "서양 철학의 기초를 놓은 세 거인. 스승에서 제자로 이어지는 사상의 계보를 추적합니다.",
        link: `/connections?from=socrates&to=aristotle`,
      },
      {
        title: "붓다 → 나가르주나 → 혜능",
        description:
          "인도에서 중국으로, 소승에서 대승으로. 불교 사상의 변형과 심화 과정을 봅니다.",
        link: `/connections?from=buddha&to=huineng`,
      },
      {
        title: "데카르트 → 칸트 → 헤겔",
        description:
          "근대 합리론에서 비판철학을 거쳐 절대정신까지. 근대 유럽 철학의 핵심 줄기.",
        link: `/connections?from=descartes&to=hegel`,
      },
      {
        title: "마르크스 → 레닌 → 러시아 혁명",
        description:
          "사상이 현실을 바꾼 가장 극적인 사례. 이론에서 혁명까지의 인과 사슬을 추적합니다.",
        link: `/connections?from=marx&to=russian-revolution`,
      },
      {
        title: "뉴턴 → 아인슈타인 → 양자역학",
        description:
          "고전역학에서 상대성이론, 양자역학까지. 과학혁명의 연쇄적 패러다임 전환.",
        link: `/connections?from=newton&to=quantum-mechanics`,
      },
      {
        title: "공자 → 주희 → 퇴계 이황",
        description:
          "유교의 동아시아 전파. 중국에서 한국으로 이어진 성리학의 전승과 변용.",
        link: `/connections?from=confucius&to=zhu-xi`,
      },
    ],
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
  scientist: {
    bg: "bg-cat-scientist/10",
    border: "border-cat-scientist/30",
    text: "text-cat-scientist",
    iconBg: "bg-cat-scientist/15",
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
          체계적으로 정리된 학습 경로를 따라 철학, 종교, 과학, 역사의 세계를
          탐험하세요. 입문부터 고급까지, 동서양을 넘나드는 지성의 여정이
          기다립니다.
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
