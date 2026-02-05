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
  // ── 철학 추가 (6개) ──────────────────────────────────────
  {
    id: "phenomenology-journey",
    title: "현상학의 여정",
    description:
      "의식의 구조를 탐구하는 현상학의 탄생과 발전. 후설의 '사태 자체로!'에서 시작해 실존과 타자의 철학까지 이어지는 여정입니다.",
    difficulty: "advanced",
    icon: <Brain className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "후설 - 현상학의 창시",
        description:
          "에포케(판단중지)와 지향성 개념. '사태 자체로!' 돌아가 의식의 본질 구조를 밝히려는 엄밀한 학문의 기획.",
        link: `/persons/husserl`,
      },
      {
        title: "하이데거 - 존재론적 전환",
        description:
          "현존재 분석과 세계-내-존재. 후설의 인식론적 현상학을 존재의 물음으로 근본적으로 전환.",
        link: `/persons/heidegger`,
      },
      {
        title: "메를로퐁티 - 몸의 현상학",
        description:
          "지각의 현상학과 체화된 인식. 정신과 신체의 이분법을 넘어 '살아있는 몸'의 경험을 탐구.",
        link: `/persons/merleau-ponty`,
      },
      {
        title: "레비나스 - 타자의 윤리학",
        description:
          "타자의 얼굴과 무한 책임. 존재론을 넘어 윤리를 제1철학으로 세운 전환적 사유.",
        link: `/persons/levinas`,
      },
    ],
  },
  {
    id: "analytic-101",
    title: "분석철학 101",
    description:
      "언어와 논리를 통해 철학적 문제를 해명하려는 분석 전통. 프레게의 논리 혁명에서 현대 분석철학까지의 핵심 흐름을 따라갑니다.",
    difficulty: "intermediate",
    icon: <Calculator className="w-6 h-6" />,
    color: "modern",
    steps: [
      {
        title: "프레게 - 현대 논리학의 탄생",
        description:
          "개념표기법과 뜻/지시체 구분. 2,000년 만에 아리스토텔레스를 넘어선 논리학의 혁명.",
        link: `/persons/frege`,
      },
      {
        title: "러셀 - 논리적 원자론",
        description:
          "러셀의 역설과 확정기술구 이론. 수학과 논리학의 기초를 놓으려 한 야심찬 시도.",
        link: `/persons/russell`,
      },
      {
        title: "비트겐슈타인 - 언어의 두 얼굴",
        description:
          "전기: 그림 이론과 말할 수 없는 것. 후기: 언어 게임과 가족유사성. 철학의 방향을 두 번 바꾼 천재.",
        link: `/persons/wittgenstein`,
      },
      {
        title: "콰인 - 경험주의의 두 도그마",
        description:
          "분석/종합 구분 비판과 번역의 불확정성. 경험주의를 내부에서 혁신한 전체론적 관점.",
        link: `/persons/quine`,
      },
      {
        title: "크립키 - 이름과 필연성",
        description:
          "고정 지시어와 가능세계. 언어철학과 형이상학의 풍경을 근본적으로 바꾼 현대의 혁신.",
        link: `/persons/kripke`,
      },
    ],
  },
  {
    id: "islamic-philosophy",
    title: "이슬람 철학 탐험",
    description:
      "그리스 철학을 계승하고 발전시킨 이슬람 황금시대의 사상가들. 동서양을 잇는 지적 가교 역할을 탐구합니다.",
    difficulty: "intermediate",
    icon: <Star className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "알킨디 - 아랍 철학의 아버지",
        description:
          "그리스 철학을 아랍어로 번역하고 이슬람 신학과 조화시킨 최초의 아랍 철학자.",
        link: `/persons/al-kindi`,
      },
      {
        title: "이븐 시나 - 존재와 본질",
        description:
          "존재/본질 구분과 필연적 존재자 논증. 아리스토텔레스와 신플라톤주의를 종합한 거대한 체계.",
        link: `/persons/ibn-sina`,
      },
      {
        title: "알 가잘리 - 철학자들의 자멸",
        description:
          "이성의 한계를 논증하고 수피 신비주의로 전환. 이슬람 세계에서 철학과 신학의 관계를 재설정.",
        link: `/persons/al-ghazali`,
      },
      {
        title: "이븐 루시드 - 이중진리론",
        description:
          "아리스토텔레스의 최고 주석가. 철학과 종교의 조화를 논증하며 서양 스콜라철학에 심대한 영향.",
        link: `/persons/ibn-rushd`,
      },
      {
        title: "이븐 아라비 - 존재의 단일성",
        description:
          "와흐다트 알 우주드(존재의 단일성). 이슬람 신비주의의 정점을 이룬 형이상학적 비전.",
        link: `/persons/ibn-arabi`,
      },
    ],
  },
  {
    id: "african-philosophy",
    title: "아프리카 철학의 세계",
    description:
      "우분투에서 탈식민 사상까지. 서구 중심 철학을 넘어 아프리카 고유의 사상 전통과 현대적 전개를 만납니다.",
    difficulty: "intermediate",
    icon: <Globe className="w-6 h-6" />,
    color: "historical",
    steps: [
      {
        title: "우분투 - 나는 우리이기에 존재한다",
        description:
          "공동체적 인간관과 관계적 존재론. 서구 개인주의와 대비되는 아프리카의 근본적 세계관.",
      },
      {
        title: "프란츠 파농 - 식민지의 저주받은 자들",
        description:
          "식민주의와 인종주의의 심리적 폭력을 분석. 탈식민 사상과 해방 철학의 핵심 텍스트.",
        link: `/persons/fanon`,
      },
      {
        title: "콰메 앱피아 - 세계시민주의",
        description:
          "코스모폴리터니즘과 정체성의 윤리. 문화적 다양성과 보편적 가치의 양립 가능성을 모색.",
        link: `/persons/appiah`,
      },
      {
        title: "아킬 음벰베 - 네크로폴리틱스",
        description:
          "죽음의 정치학과 포스트식민 비판. 권력이 삶과 죽음을 어떻게 관리하는지에 대한 급진적 분석.",
        link: `/persons/mbembe`,
      },
    ],
  },
  {
    id: "feminist-philosophy",
    title: "페미니즘 철학",
    description:
      "여성의 권리 선언에서 젠더 해체까지. 가부장제에 도전하고 평등을 사유한 철학자들의 용기 있는 여정.",
    difficulty: "intermediate",
    icon: <Flame className="w-6 h-6" />,
    color: "philosopher",
    steps: [
      {
        title: "메리 울스턴크래프트 - 여성 권리의 옹호",
        description:
          "여성도 이성적 존재라는 당연한 진리를 최초로 체계적으로 논증한 선구적 저작.",
        link: `/persons/wollstonecraft`,
      },
      {
        title: "시몬 드 보부아르 - 제2의 성",
        description:
          "'여성은 태어나는 것이 아니라 만들어지는 것이다.' 실존주의 페미니즘의 기념비적 선언.",
        link: `/persons/de-beauvoir`,
      },
      {
        title: "주디스 버틀러 - 젠더 트러블",
        description:
          "젠더 수행성 이론. 성별은 본질이 아니라 반복적으로 수행되는 것이라는 전복적 통찰.",
        link: `/persons/butler`,
      },
      {
        title: "벨 훅스 - 교차성의 실천",
        description:
          "인종, 계급, 젠더가 교차하는 억압의 체계를 분석. 사랑의 윤리학과 해방 교육의 비전.",
        link: `/persons/bell-hooks`,
      },
    ],
  },
  {
    id: "chinese-hundred-schools",
    title: "제자백가의 시대",
    description:
      "춘추전국시대, 인류 사상사의 가장 폭발적인 창조의 시기. 유가, 묵가, 도가, 법가가 경쟁하며 동아시아 문명의 기틀을 놓았습니다.",
    difficulty: "beginner",
    icon: <Landmark className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "공자 - 인(仁)과 예(禮)",
        description:
          "인간다움과 사회 질서의 조화. 덕치와 군자의 이상으로 동아시아 2,500년을 지배한 사상.",
        link: `/persons/confucius`,
      },
      {
        title: "묵자 - 겸애(兼愛)와 실용",
        description:
          "차별 없는 보편적 사랑과 실리주의. 유가의 차등적 인(仁)을 비판하며 평등을 주장.",
        link: `/persons/mozi`,
      },
      {
        title: "노자 - 무위자연(無爲自然)",
        description:
          "도(道)를 따르는 자연스러운 삶. 인위적 문명과 도덕을 비판하고 소박한 원시로 회귀를 주장.",
        link: `/persons/laozi`,
      },
      {
        title: "한비자 - 법치(法治)의 철학",
        description:
          "법, 술, 세의 삼위일체. 인간의 이기심을 인정하고 제도로 다스리는 냉철한 현실주의.",
        link: `/persons/han-feizi`,
      },
      {
        title: "순자 - 성악설과 예치",
        description:
          "인간의 본성은 악하다. 그러므로 교육과 예(禮)로 교화해야 한다는 유가 내부의 급진적 전환.",
        link: `/persons/xunzi`,
      },
    ],
  },
  // ── 종교/영성 (9개) ──────────────────────────────────────
  {
    id: "abrahamic-comparison",
    title: "아브라함 종교 비교",
    description:
      "유대교, 기독교, 이슬람. 하나의 뿌리에서 갈라진 세 종교의 공통 유산과 핵심적 차이를 비교 탐구합니다.",
    difficulty: "beginner",
    icon: <Globe className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "아브라함 - 공통의 조상",
        description:
          "세 종교가 공유하는 아브라함의 유산. 유일신 신앙, 예언자 전통, 계시의 개념을 비교합니다.",
        link: `/persons/abraham`,
      },
      {
        title: "유대교 - 토라와 율법",
        description:
          "모세 율법과 선민 사상, 탈무드 전통. 가장 오래된 아브라함 종교의 핵심 가르침.",
        link: `/religion/judaism/`,
      },
      {
        title: "기독교 - 복음과 구원",
        description:
          "예수 그리스도의 가르침, 삼위일체, 은총과 구원의 신학. 유대교에서 분리된 과정을 이해합니다.",
        link: `/religion/christianity/`,
      },
      {
        title: "이슬람 - 꾸란과 복종",
        description:
          "무함마드의 계시, 오주(五柱), 샤리아. 마지막 예언자의 가르침이 이룬 문명을 살펴봅니다.",
        link: `/religion/islam/`,
      },
      {
        title: "공통점과 차이점 종합",
        description:
          "경전, 예배, 윤리, 종말론에서의 공통 주제와 핵심적 차이. 대화와 갈등의 역사를 정리합니다.",
        link: `/religion/compare/`,
      },
    ],
  },
  {
    id: "indian-spirituality",
    title: "인도 영성의 세계",
    description:
      "베다에서 우파니샤드, 붓다에서 샹카라까지. 5,000년 인도 영성의 심오한 흐름을 따라가며 해탈과 깨달음의 다양한 길을 탐구합니다.",
    difficulty: "intermediate",
    icon: <Star className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "베다 - 인도 사상의 원천",
        description:
          "리그베다의 창조 찬가와 제의 전통. 인도 문명 5,000년의 정신적 토대.",
        link: `/entities/vedas`,
      },
      {
        title: "우파니샤드 - 브라만과 아트만",
        description:
          "우주적 실재(브라만)와 개인 자아(아트만)의 동일성. '너는 그것이다'(Tat tvam asi)의 심오한 의미.",
        link: `/entities/upanishads`,
      },
      {
        title: "붓다 - 무아와 해탈",
        description:
          "고정된 자아(아트만)를 부정하고 연기와 공의 가르침으로 고통의 소멸을 제시한 혁명적 전환.",
        link: `/persons/buddha`,
      },
      {
        title: "샹카라 - 아드바이타 베단타",
        description:
          "불이일원론(不二一元論). 현상 세계는 마야(환상)이며 오직 브라만만이 참된 실재라는 극한의 일원론.",
        link: `/persons/shankara`,
      },
      {
        title: "라마크리슈나 - 종교의 합일",
        description:
          "모든 종교는 같은 진리로 이끈다. 힌두교, 이슬람, 기독교를 직접 체험하며 도달한 보편적 영성.",
        link: `/persons/ramakrishna`,
      },
    ],
  },
  {
    id: "buddhist-paths",
    title: "불교 수행의 계보",
    description:
      "석가모니의 깨달음에서 시작된 불교가 인도, 중국, 한국, 일본, 티베트로 전파되며 변화한 수행과 사상의 계보.",
    difficulty: "intermediate",
    icon: <CircleDot className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "석가모니 - 깨달음의 원류",
        description:
          "보리수 아래의 성도(成道). 사성제와 팔정도, 중도의 가르침으로 인류 정신사를 전환.",
        link: `/persons/buddha`,
      },
      {
        title: "나가르주나 - 공(空)의 논리",
        description:
          "중관학파의 창시. 모든 것은 자성(自性)이 없다는 공사상을 논리적으로 체계화.",
        link: `/persons/nagarjuna`,
      },
      {
        title: "혜능 - 선불교의 혁명",
        description:
          "돈오(頓悟)와 무념무상. 문자에 얽매이지 않고 직접 마음을 가리키는 선종의 정신.",
        link: `/persons/huineng`,
      },
      {
        title: "도겐 - 일본 선의 완성",
        description:
          "수행과 깨달음은 하나다(修證一等). 좌선 수행을 통한 현성공안의 실천적 선불교.",
        link: `/persons/dogen`,
      },
      {
        title: "달라이 라마 - 티베트 불교와 세계",
        description:
          "자비와 공(空)의 가르침을 현대 세계에 전파. 과학과 불교의 대화를 이끄는 영적 지도자.",
        link: `/persons/dalai-lama`,
      },
    ],
  },
  {
    id: "mysticism-traditions",
    title: "신비주의 전통",
    description:
      "종교와 문화를 넘어 직접적인 신적 체험을 추구한 신비주의자들. 동서양 신비 전통의 공통 구조와 독특한 표현을 비교합니다.",
    difficulty: "advanced",
    icon: <Flame className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "마이스터 에크하르트 - 신성의 근저",
        description:
          "신의 근저(Grund)와 영혼의 불꽃. 기독교 신비주의의 정점에서 신과 영혼의 합일을 논한 사변적 신비가.",
        link: `/persons/eckhart`,
      },
      {
        title: "루미 - 사랑의 시인",
        description:
          "수피즘의 가장 위대한 시인. 신에 대한 황홀한 사랑과 선회무(세마)를 통한 합일의 체험.",
        link: `/persons/rumi`,
      },
      {
        title: "카발라 - 유대 신비주의",
        description:
          "세피로트(생명의 나무)와 아인 소프(무한자). 히브리 문자와 수비학을 통한 신비적 우주론.",
        link: `/entities/kabbalah`,
      },
      {
        title: "수피즘 - 이슬람 내면의 길",
        description:
          "파나(소멸)와 바카(존속). 자아의 소멸을 통해 신과 합일에 이르는 이슬람 신비주의의 수행 단계.",
        link: `/entities/sufism`,
      },
      {
        title: "동서양 신비 체험의 비교",
        description:
          "기독교의 어둔 밤, 수피의 파나, 불교의 삼매, 도교의 좌망. 문화를 초월한 신비 체험의 보편적 구조.",
      },
    ],
  },
  {
    id: "indigenous-spirituality",
    title: "토착 영성의 세계",
    description:
      "제도 종교 이전의 원초적 영성. 호주 원주민의 드림타임, 아프리카 요루바, 마야 우주론, 텡그리즘의 세계를 만납니다.",
    difficulty: "intermediate",
    icon: <Compass className="w-6 h-6" />,
    color: "historical",
    steps: [
      {
        title: "드림타임 - 호주 원주민의 세계관",
        description:
          "꿈의 시대(Dreamtime). 조상 존재들이 노래로 세계를 창조한 호주 원주민의 시간 초월적 우주론.",
      },
      {
        title: "요루바 - 서아프리카의 영성",
        description:
          "오리샤(신격)와 이파 점술 체계. 나이지리아에서 아메리카까지 전파된 서아프리카 종교 전통.",
      },
      {
        title: "마야 우주론 - 시간의 신성",
        description:
          "포폴 부(Popol Vuh)와 마야 달력. 시간의 순환과 우주의 창조/파괴를 정교하게 체계화한 문명.",
      },
      {
        title: "텡그리즘 - 유라시아 유목민의 하늘 신앙",
        description:
          "영원한 푸른 하늘(텡그리)에 대한 경외. 몽골과 투르크 유목민의 샤머니즘적 세계관.",
      },
      {
        title: "토착 영성의 현대적 의미",
        description:
          "생태 위기 시대에 재조명되는 원주민 세계관. 자연과의 공존, 관계적 존재론의 현대적 가치.",
      },
    ],
  },
  {
    id: "esoteric-traditions",
    title: "비의(秘儀) 전통 탐험",
    description:
      "고대 이집트의 헤르메스주의에서 연금술, 카발라, 장미십자회까지. 비밀리에 전승된 지식의 지하 수맥을 추적합니다.",
    difficulty: "advanced",
    icon: <Star className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "헤르메스 트리스메기스투스 - 비의의 원천",
        description:
          "'위에서와 같이 아래에서도.' 헤르메스 문서와 에메랄드 서판에 담긴 고대 비의의 핵심 원리.",
        link: `/entities/hermeticism`,
      },
      {
        title: "연금술 - 물질과 영혼의 변환",
        description:
          "현자의 돌과 대작업(Magnum Opus). 금속의 변환 너머에 숨겨진 영적 변환의 상징 체계.",
        link: `/entities/alchemy`,
      },
      {
        title: "카발라 - 생명의 나무",
        description:
          "세피로트와 아인 소프. 유대 신비주의의 우주론적 도식과 수비학적 명상 체계.",
        link: `/entities/kabbalah`,
      },
      {
        title: "장미십자회 - 근대 비의 결사",
        description:
          "17세기 유럽을 뒤흔든 비밀 결사의 선언문. 과학, 종교, 마법의 경계에서 탄생한 근대 비의 전통.",
        link: `/entities/rosicrucianism`,
      },
      {
        title: "신지학 - 동서양 비의의 종합",
        description:
          "블라바츠키와 신지학회. 동양의 카르마, 윤회 사상과 서양 비의 전통을 종합하려 한 19세기의 시도.",
        link: `/entities/theosophy`,
      },
    ],
  },
  {
    id: "east-asian-traditions",
    title: "동아시아 종교와 사상",
    description:
      "유교, 도교, 선불교, 신도. 동아시아 문명을 형성한 네 가지 큰 흐름이 어떻게 융합하며 독특한 정신 세계를 만들었는지 탐구합니다.",
    difficulty: "intermediate",
    icon: <Landmark className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "유교 - 사회 윤리의 체계",
        description:
          "인(仁), 예(禮), 효(孝)의 덕목. 가족에서 국가까지 확장되는 동아시아 사회 윤리의 기반.",
        link: `/religion/confucianism/`,
      },
      {
        title: "도교 - 자연과의 합일",
        description:
          "무위자연과 양생. 자연의 도(道)를 따르며 인위를 넘어서는 생명철학과 수행 전통.",
        link: `/religion/taoism/`,
      },
      {
        title: "선불교 - 직지인심(直指人心)",
        description:
          "교외별전(敎外別傳), 문자를 떠나 직접 마음을 가리킨다. 중국, 한국, 일본에서 꽃핀 선의 전통.",
        link: `/religion/buddhism/`,
      },
      {
        title: "신도 - 일본의 고유 영성",
        description:
          "카미(神)와 자연 숭배. 일본 문화의 기저에 흐르는 고유한 신앙 체계와 의례 전통.",
        link: `/religion/shinto/`,
      },
      {
        title: "삼교합일 - 융합의 전통",
        description:
          "유불도 삼교의 조화. 동아시아에서 서로 다른 종교가 배타적이지 않고 상호 보완적으로 공존한 독특한 전통.",
      },
    ],
  },
  {
    id: "myth-archetype",
    title: "신화와 원형 서사",
    description:
      "전 세계 신화에 나타나는 보편적 원형. 창조, 영웅, 종말, 트릭스터 서사를 비교하며 인류 공통의 상상력을 탐구합니다.",
    difficulty: "beginner",
    icon: <CircleDot className="w-6 h-6" />,
    color: "historical",
    steps: [
      {
        title: "창조 신화 비교",
        description:
          "무에서 유로, 혼돈에서 질서로. 메소포타미아, 그리스, 인도, 중국, 북유럽 창조 신화의 놀라운 유사성.",
        link: `/religion/compare/`,
      },
      {
        title: "영웅의 여정 - 캠벨의 단일신화",
        description:
          "출발-입문-귀환. 길가메시에서 오디세우스, 붓다에서 예수까지 반복되는 영웅 서사의 보편 구조.",
      },
      {
        title: "종말론 - 세계의 끝과 새로운 시작",
        description:
          "아포칼립스, 라그나로크, 칼파의 끝. 세계의 종말과 재생에 대한 다양한 문화의 비전.",
      },
      {
        title: "트릭스터 - 질서의 교란자",
        description:
          "로키, 헤르메스, 손오공, 코요테. 규칙을 어기고 경계를 넘으며 새로운 질서를 만드는 혼돈의 원형.",
      },
      {
        title: "융과 원형 - 집단무의식",
        description:
          "칼 융의 원형 이론. 그림자, 아니마/아니무스, 자기(Self). 신화가 드러내는 인간 심층의 보편적 패턴.",
        link: `/persons/jung`,
      },
    ],
  },
  {
    id: "korean-spiritual-heritage",
    title: "한국 영성의 유산",
    description:
      "무교에서 불교, 유교, 동학, 증산도까지. 한반도에서 꽃핀 고유한 영성의 흐름과 외래 사상의 토착화 과정을 살펴봅니다.",
    difficulty: "intermediate",
    icon: <Landmark className="w-6 h-6" />,
    color: "historical",
    steps: [
      {
        title: "무교 - 한국 영성의 원류",
        description:
          "하늘(천)과 땅(지)과 인간(인)의 조화. 단군신화와 무속 전통에 담긴 한국 고유의 세계관.",
      },
      {
        title: "한국 불교 - 회통과 원융",
        description:
          "원효의 화쟁사상, 지눌의 돈오점수. 교학과 선의 대립을 회통시킨 한국 불교의 독창적 전통.",
        link: `/persons/wonhyo`,
      },
      {
        title: "한국 유교 - 성리학의 꽃",
        description:
          "퇴계의 이기호발설, 율곡의 기발이승일도설. 중국 성리학을 넘어선 한국 유학의 독자적 심화.",
        link: `/persons/yi-hwang`,
      },
      {
        title: "동학 - 인내천(人乃天)",
        description:
          "사람이 곧 하늘이다. 서학(기독교)에 대응하며 민중의 존엄을 선언한 한국 근대 사상의 출발점.",
        link: `/entities/donghak`,
      },
      {
        title: "증산도와 원불교 - 한국 신종교",
        description:
          "후천개벽과 정신개벽. 전통 영성을 재해석하며 새로운 시대를 열고자 한 한국 고유의 종교 운동.",
      },
    ],
  },
  // ── 과학 (6개) ──────────────────────────────────────
  {
    id: "math-history",
    title: "수학의 역사",
    description:
      "피타고라스의 조화에서 칸토어의 무한까지. 수의 세계를 탐험한 수학자들의 경이로운 발견을 시대순으로 따라갑니다.",
    difficulty: "beginner",
    icon: <Calculator className="w-6 h-6" />,
    color: "modern",
    steps: [
      {
        title: "피타고라스 - 수의 철학",
        description:
          "'만물은 수(數)다.' 수학과 음악, 우주의 조화를 발견한 고대 그리스 수학의 선구자.",
        link: `/persons/pythagoras`,
      },
      {
        title: "유클리드 - 기하학의 원론",
        description:
          "5개의 공리에서 시작해 기하학 전체를 연역한 논리적 체계. 2,000년간 학문의 모범이 된 저작.",
        link: `/persons/euclid`,
      },
      {
        title: "알콰리즈미 - 대수학의 탄생",
        description:
          "알고리즘이라는 단어의 어원. 대수학(al-jabr)을 체계화한 이슬람 황금시대의 수학자.",
        link: `/persons/al-khwarizmi`,
      },
      {
        title: "오일러 - 수학의 모차르트",
        description:
          "역사상 가장 다작한 수학자. e, i, π를 하나의 공식(e^iπ+1=0)으로 연결한 수학적 아름다움의 극치.",
        link: `/persons/euler`,
      },
      {
        title: "칸토어 - 무한의 탐험",
        description:
          "무한에도 크기가 있다. 집합론을 창시하고 무한의 위계를 밝혀 수학의 기초를 혁신한 천재.",
        link: `/persons/cantor`,
      },
    ],
  },
  {
    id: "physics-revolutions",
    title: "물리학 혁명",
    description:
      "갈릴레오의 실험에서 양자역학의 불확정성까지. 우주의 법칙을 밝혀낸 물리학자들의 혁명적 발견을 추적합니다.",
    difficulty: "intermediate",
    icon: <Atom className="w-6 h-6" />,
    color: "scientist",
    steps: [
      {
        title: "갈릴레오 - 근대 과학의 탄생",
        description:
          "사고실험과 망원경 관측. 자연의 책은 수학의 언어로 쓰여 있다는 통찰로 근대 과학을 개창.",
        link: `/persons/galileo`,
      },
      {
        title: "뉴턴 - 고전역학의 완성",
        description:
          "운동의 3법칙과 만유인력. 사과에서 행성까지 하나의 법칙으로 설명하는 역사상 가장 위대한 종합.",
        link: `/persons/newton`,
      },
      {
        title: "맥스웰 - 전자기학의 통합",
        description:
          "맥스웰 방정식으로 전기, 자기, 빛을 통합. 아인슈타인이 '뉴턴 이후 가장 위대한 변화'라 평가한 업적.",
        link: `/persons/maxwell`,
      },
      {
        title: "아인슈타인 - 시공간의 혁명",
        description:
          "특수·일반 상대성이론. 시간과 공간이 절대적이지 않다는 발견으로 뉴턴의 세계관을 근본적으로 수정.",
        link: `/persons/einstein`,
      },
      {
        title: "하이젠베르크 - 불확정성의 원리",
        description:
          "위치와 운동량을 동시에 정확히 알 수 없다. 결정론적 세계관을 무너뜨린 양자역학의 핵심 원리.",
        link: `/persons/heisenberg`,
      },
    ],
  },
  {
    id: "life-sciences",
    title: "생명과학의 여정",
    description:
      "히포크라테스의 의학에서 유전자 편집까지. 생명의 비밀을 탐구한 과학자들의 발견이 인간의 자기 이해를 어떻게 바꾸었는지 살펴봅니다.",
    difficulty: "intermediate",
    icon: <CircleDot className="w-6 h-6" />,
    color: "scientist",
    steps: [
      {
        title: "히포크라테스 - 의학의 아버지",
        description:
          "질병을 신의 징벌이 아닌 자연적 원인으로 설명한 최초의 과학적 의학. 히포크라테스 선서의 윤리.",
        link: `/persons/hippocrates`,
      },
      {
        title: "다윈 - 진화론의 혁명",
        description:
          "자연선택과 종의 기원. 인간도 자연의 일부라는 발견이 종교, 철학, 사회에 미친 거대한 파장.",
        link: `/persons/darwin`,
      },
      {
        title: "멘델 - 유전학의 탄생",
        description:
          "완두콩 실험으로 밝힌 유전의 법칙. 수도원의 무명 연구자가 발견한 생명의 숨겨진 규칙.",
        link: `/persons/mendel`,
      },
      {
        title: "크릭과 왓슨 - DNA 이중나선",
        description:
          "생명의 설계도 해독. DNA 구조 발견이 열어젖힌 분자생물학 혁명과 유전공학의 시대.",
        link: `/persons/crick`,
      },
      {
        title: "제니퍼 다우드나 - 유전자 가위 CRISPR",
        description:
          "CRISPR-Cas9 유전자 편집 기술. 생명의 설계도를 직접 수정할 수 있게 된 인류의 새로운 능력과 윤리적 과제.",
        link: `/persons/doudna`,
      },
    ],
  },
  {
    id: "cognitive-mind",
    title: "인지과학과 마음의 탐구",
    description:
      "마음이란 무엇인가? 데카르트의 심신이원론에서 현대 인지과학과 행동경제학까지, 마음의 본질에 대한 다학제적 탐구.",
    difficulty: "intermediate",
    icon: <Brain className="w-6 h-6" />,
    color: "modern",
    steps: [
      {
        title: "데카르트 - 심신이원론",
        description:
          "정신과 물질은 별개의 실체다. 마음-몸 문제를 최초로 명확하게 제기한 근대 철학의 출발점.",
        link: `/persons/descartes`,
      },
      {
        title: "프로이트 - 무의식의 발견",
        description:
          "이드, 에고, 슈퍼에고. 의식 아래 숨겨진 무의식의 세계를 발견하고 정신분석학을 창시.",
        link: `/persons/freud`,
      },
      {
        title: "촘스키 - 언어와 마음",
        description:
          "보편 문법과 생득적 언어 능력. 행동주의를 비판하며 인지혁명을 촉발한 언어학의 혁신.",
        link: `/persons/chomsky`,
      },
      {
        title: "카너먼 - 빠른 사고, 느린 사고",
        description:
          "시스템 1과 시스템 2. 인간의 판단과 결정에서 체계적으로 나타나는 인지 편향의 발견.",
        link: `/persons/kahneman`,
      },
    ],
  },
  {
    id: "complexity-systems",
    title: "복잡계 과학",
    description:
      "사이버네틱스에서 카오스 이론, 복잡적응계, 네트워크 과학까지. 환원주의를 넘어 복잡한 세계를 이해하는 새로운 패러다임.",
    difficulty: "advanced",
    icon: <Network className="w-6 h-6" />,
    color: "scientist",
    steps: [
      {
        title: "사이버네틱스 - 피드백과 제어",
        description:
          "노버트 위너의 사이버네틱스. 기계와 생물에 공통된 피드백 제어 원리의 발견.",
      },
      {
        title: "카오스 이론 - 나비 효과",
        description:
          "결정론적이지만 예측 불가능한 세계. 초기 조건의 미세한 차이가 전혀 다른 결과를 만드는 비선형 동역학.",
      },
      {
        title: "복잡적응계 - 창발의 과학",
        description:
          "개미 군집, 주식시장, 면역계. 단순한 규칙에서 복잡한 패턴이 자발적으로 출현하는 창발 현상.",
      },
      {
        title: "네트워크 과학 - 6단계 분리",
        description:
          "스몰월드, 척도없는 네트워크, 허브. 바라바시의 네트워크 과학이 밝힌 연결된 세계의 숨겨진 구조.",
      },
    ],
  },
  {
    id: "alchemy-to-chemistry",
    title: "연금술에서 화학으로",
    description:
      "이집트의 연금술에서 근대 화학의 탄생까지. 신비적 실천이 어떻게 과학적 방법론으로 변환되었는지 그 역동적 과정을 추적합니다.",
    difficulty: "intermediate",
    icon: <Atom className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "이집트 연금술 - 신비의 기술",
        description:
          "헤르메스의 에메랄드 서판과 대작업(Magnum Opus). 물질 변환과 영적 정화가 하나였던 고대의 전통.",
        link: `/entities/alchemy`,
      },
      {
        title: "이슬람 연금술 - 자비르의 유산",
        description:
          "자비르 이븐 하이얀의 실험적 접근. 증류, 결정화 등 실험 기법을 발전시킨 이슬람 과학의 기여.",
      },
      {
        title: "파라켈수스 - 의화학의 선구자",
        description:
          "연금술을 의학에 적용. 화학적 약물 치료의 선구자이자 독성학의 아버지.",
        link: `/persons/paracelsus`,
      },
      {
        title: "라부아지에 - 근대 화학의 탄생",
        description:
          "질량 보존의 법칙과 산소의 명명. 플로지스톤설을 뒤엎고 정량적 화학의 시대를 연 근대 화학의 아버지.",
        link: `/persons/lavoisier`,
      },
      {
        title: "멘델레예프 - 주기율표",
        description:
          "원소의 주기적 패턴 발견. 아직 발견되지 않은 원소의 성질까지 예측한 화학의 가장 아름다운 체계.",
        link: `/persons/mendeleev`,
      },
    ],
  },
  // ── 역사/정치 (5개) ──────────────────────────────────────
  {
    id: "revolutions-history",
    title: "혁명의 역사",
    description:
      "세계를 바꾼 위대한 혁명들. 프랑스 혁명에서 시민권 운동까지, 기존 질서를 전복하고 새로운 사회를 건설하려는 인류의 투쟁을 살펴봅니다.",
    difficulty: "intermediate",
    icon: <Flame className="w-6 h-6" />,
    color: "historical",
    steps: [
      {
        title: "프랑스 혁명 - 자유, 평등, 박애",
        description:
          "절대왕정의 몰락과 인권 선언. 계몽사상이 실천으로 전환된 근대 민주주의의 출발점.",
        link: `/entities/french-revolution`,
      },
      {
        title: "러시아 혁명 - 이론에서 현실로",
        description:
          "마르크스의 이론이 레닌의 실천으로. 자본주의 체제에 대한 최초의 대규모 대안 실험.",
        link: `/entities/russian-revolution`,
      },
      {
        title: "중국 혁명 - 대장정과 신중국",
        description:
          "마오쩌둥과 중국 공산혁명. 세계 인구의 4분의 1이 참여한 20세기 최대의 사회 변혁.",
      },
      {
        title: "시민권 운동 - 비폭력 저항",
        description:
          "마틴 루서 킹의 꿈. 간디의 비폭력에서 영감을 받아 인종 차별에 맞선 미국 시민권 운동의 유산.",
        link: `/persons/mlk`,
      },
    ],
  },
  {
    id: "empires-civilizations",
    title: "제국과 문명",
    description:
      "로마에서 오스만까지, 세계를 지배한 위대한 제국들. 제국의 흥망성쇠를 통해 문명의 순환과 지식의 전파를 이해합니다.",
    difficulty: "intermediate",
    icon: <Globe className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "로마 제국 - 영원한 도시",
        description:
          "공화정에서 제정까지. 법, 건축, 행정 체계로 서양 문명의 기틀을 놓은 위대한 제국.",
      },
      {
        title: "이슬람 황금시대 - 지식의 집",
        description:
          "바이트 알히크마(지혜의 집)와 번역 운동. 그리스 학문을 보존하고 발전시킨 이슬람 문명의 학문적 번영.",
        link: `/entities/islamic-golden-age`,
      },
      {
        title: "몽골 제국 - 세계의 연결자",
        description:
          "칭기즈 칸의 정복과 팍스 몽골리카. 동서양을 잇는 교역로를 열어 문명 간 교류를 촉진.",
      },
      {
        title: "오스만 제국 - 동서의 교차로",
        description:
          "콘스탄티노플의 정복과 600년의 통치. 이슬람, 기독교, 유대교가 공존한 다문화 제국.",
      },
      {
        title: "제국의 유산과 교훈",
        description:
          "제국의 흥망이 남긴 교훈. 문명의 확산, 지식의 전파, 그리고 지배와 저항의 변증법.",
      },
    ],
  },
  {
    id: "freedom-expansion",
    title: "자유의 확대",
    description:
      "마그나카르타에서 여성 참정권까지. 인류가 더 많은 자유를 쟁취해온 길고 험난한 여정을 시대순으로 따라갑니다.",
    difficulty: "intermediate",
    icon: <Star className="w-6 h-6" />,
    color: "modern",
    steps: [
      {
        title: "마그나카르타 - 왕권의 제한",
        description:
          "1215년, 왕도 법 아래에 있다. 영국 귀족이 쟁취한 자유의 대헌장과 그 후대의 영향.",
      },
      {
        title: "프랑스 혁명 - 인간과 시민의 권리",
        description:
          "자유, 평등, 박애. 인권 선언과 민주주의의 이상이 전 세계로 확산된 결정적 계기.",
        link: `/entities/french-revolution`,
      },
      {
        title: "노예 해방 - 인간 존엄의 회복",
        description:
          "링컨의 노예 해방 선언과 전 세계적 폐지 운동. 인간이 인간을 소유할 수 없다는 당연한 진리의 승리.",
        link: `/persons/lincoln`,
      },
      {
        title: "여성 참정권 - 절반의 해방",
        description:
          "서프러제트 운동과 여성의 투표권 획득. 인류 절반의 정치적 권리를 위한 오랜 투쟁의 역사.",
      },
      {
        title: "보편적 인권 - 끝나지 않은 여정",
        description:
          "세계인권선언(1948)과 현대의 인권 투쟁. 자유의 확대는 아직 진행 중인 미완의 프로젝트.",
      },
    ],
  },
  {
    id: "economic-thought",
    title: "경제사상의 계보",
    description:
      "보이지 않는 손에서 행동경제학까지. 부와 빈곤, 시장과 국가에 대한 경제사상가들의 논쟁을 따라갑니다.",
    difficulty: "intermediate",
    icon: <Calculator className="w-6 h-6" />,
    color: "modern",
    steps: [
      {
        title: "애덤 스미스 - 보이지 않는 손",
        description:
          "국부론과 자유시장의 원리. 개인의 이기심이 어떻게 공공선을 증진하는지에 대한 역설적 통찰.",
        link: `/persons/adam-smith`,
      },
      {
        title: "마르크스 - 자본론",
        description:
          "잉여가치와 계급투쟁. 자본주의의 내부 모순을 분석하고 대안적 사회 체제를 구상한 혁명적 사상.",
        link: `/persons/marx`,
      },
      {
        title: "케인스 - 유효수요와 정부 개입",
        description:
          "대공황의 해법. 시장의 자기 조정 능력을 의심하고 적극적 정부 역할을 주장한 거시경제학의 혁명.",
        link: `/persons/keynes`,
      },
      {
        title: "하이에크 - 자생적 질서",
        description:
          "계획경제 비판과 자유시장 옹호. 분산된 지식과 가격 메커니즘이 만드는 자발적 질서의 논리.",
        link: `/persons/hayek`,
      },
      {
        title: "행동경제학 - 제한된 합리성",
        description:
          "카너먼과 탈러. 호모 에코노미쿠스의 신화를 깨뜨린 인지 편향과 넛지의 경제학.",
        link: `/persons/kahneman`,
      },
    ],
  },
  {
    id: "technology-society",
    title: "기술과 사회",
    description:
      "인쇄술에서 AI까지. 기술 혁신이 사회, 문화, 사상을 어떻게 근본적으로 변화시켰는지 그 상호작용을 탐구합니다.",
    difficulty: "intermediate",
    icon: <Network className="w-6 h-6" />,
    color: "scientist",
    steps: [
      {
        title: "인쇄술 - 지식의 민주화",
        description:
          "구텐베르크의 활판 인쇄. 성경의 대량 복제가 종교개혁을 촉발하고 지식의 독점을 깨뜨린 과정.",
        link: `/entities/printing-press`,
      },
      {
        title: "산업혁명 - 기계의 시대",
        description:
          "증기기관과 공장제. 노동, 도시, 계급 구조의 근본적 변화. 마르크스와 엥겔스가 본 세계.",
        link: `/entities/industrial-revolution`,
      },
      {
        title: "인터넷 - 연결된 세계",
        description:
          "ARPANET에서 월드와이드웹까지. 정보의 자유로운 흐름이 만든 새로운 공론장과 그 빛과 그림자.",
      },
      {
        title: "AI - 지능의 외주화",
        description:
          "튜링 테스트에서 대규모 언어 모델까지. 인공지능이 제기하는 존재론적, 윤리적 질문들.",
        link: `/persons/turing`,
      },
    ],
  },
  // ── 예술/문화 (5개) ──────────────────────────────────────
  {
    id: "world-literature",
    title: "세계 문학 여행",
    description:
      "호메로스에서 현대 문학까지. 시대와 문화를 관통하는 위대한 문학 작품들의 주제와 형식의 변천을 여행합니다.",
    difficulty: "beginner",
    icon: <BookOpen className="w-6 h-6" />,
    color: "philosopher",
    steps: [
      {
        title: "호메로스 - 서양 문학의 시원",
        description:
          "일리아스와 오디세이아. 영웅의 분노와 귀향의 여정에 담긴 인간 존재의 근본적 드라마.",
        link: `/persons/homer`,
      },
      {
        title: "셰익스피어 - 인간 본성의 거울",
        description:
          "햄릿, 맥베스, 리어왕. 인간의 야망, 질투, 사랑, 복수를 가장 깊이 탐구한 극작가.",
        link: `/persons/shakespeare`,
      },
      {
        title: "도스토예프스키 - 영혼의 심연",
        description:
          "죄와 벌, 카라마조프가의 형제들. 인간 내면의 가장 어둡고 깊은 곳을 탐사한 심리 소설의 대가.",
        link: `/persons/dostoevsky`,
      },
      {
        title: "보르헤스 - 무한의 도서관",
        description:
          "미로, 거울, 무한. 철학과 문학의 경계를 허문 환상적 사유의 극치.",
        link: `/persons/borges`,
      },
      {
        title: "무라카미 하루키 - 현대의 이야기꾼",
        description:
          "일상과 초현실의 경계. 현대인의 고독과 상실을 독특한 문체로 그려낸 동아시아 문학의 세계적 목소리.",
        link: `/persons/murakami`,
      },
    ],
  },
  {
    id: "art-history",
    title: "미술사의 흐름",
    description:
      "동굴 벽화에서 현대 미술까지. 인류가 시각적으로 세계를 표현하고 해석해온 장대한 미술사의 흐름을 따라갑니다.",
    difficulty: "beginner",
    icon: <Star className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "동굴 벽화 - 최초의 예술",
        description:
          "라스코와 알타미라. 3만 년 전 인류가 남긴 최초의 시각적 표현. 예술 충동의 기원을 묻다.",
      },
      {
        title: "르네상스 - 인간의 재발견",
        description:
          "다 빈치, 미켈란젤로, 라파엘로. 원근법과 인체 해부학으로 인간과 자연을 사실적으로 재현한 혁명.",
        link: `/persons/da-vinci`,
      },
      {
        title: "인상파 - 빛의 혁명",
        description:
          "모네, 르누아르, 세잔. 아카데미의 규범을 깨고 순간의 빛과 색채를 포착한 근대 미술의 전환점.",
      },
      {
        title: "추상미술 - 형태의 해방",
        description:
          "칸딘스키, 몬드리안, 말레비치. 재현을 벗어나 순수한 형태와 색채로 내면 세계를 표현.",
      },
      {
        title: "현대미술 - 경계의 해체",
        description:
          "뒤샹의 레디메이드에서 설치, 퍼포먼스, 디지털 아트까지. '예술이란 무엇인가?'라는 질문 자체가 예술이 된 시대.",
      },
    ],
  },
  {
    id: "music-evolution",
    title: "음악의 진화",
    description:
      "그레고리안 성가에서 전자음악까지. 소리를 통해 인간의 감정과 사상을 표현해온 음악의 장대한 역사를 들어봅니다.",
    difficulty: "beginner",
    icon: <CircleDot className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "그레고리안 성가 - 신성한 소리",
        description:
          "단선율의 기도. 중세 수도원에서 울려 퍼진 서양 음악의 가장 오래된 기록된 전통.",
      },
      {
        title: "바흐 - 음악의 수학",
        description:
          "대위법의 완성자. 수학적 정밀함과 영적 깊이를 결합한 바로크 음악의 절대적 거장.",
        link: `/persons/bach`,
      },
      {
        title: "베토벤 - 운명에 맞서다",
        description:
          "고전주의에서 낭만주의로의 다리. 청각을 잃고도 인류 최고의 교향곡을 작곡한 불굴의 의지.",
        link: `/persons/beethoven`,
      },
      {
        title: "재즈 - 자유의 음악",
        description:
          "즉흥연주와 스윙. 아프리카계 미국인의 경험에서 탄생해 20세기 음악을 혁명적으로 바꾼 장르.",
      },
      {
        title: "전자음악 - 디지털 시대의 소리",
        description:
          "신시사이저에서 DAW까지. 기술이 만든 새로운 음색과 리듬의 세계. 음악의 민주화와 미래.",
      },
    ],
  },
  {
    id: "architecture-space",
    title: "건축과 공간",
    description:
      "피라미드에서 현대 건축까지. 인간이 공간을 설계하고 의미를 부여해온 건축의 역사를 통해 문명의 정신을 읽습니다.",
    difficulty: "beginner",
    icon: <Landmark className="w-6 h-6" />,
    color: "gold",
    steps: [
      {
        title: "이집트 피라미드 - 영원을 향한 건축",
        description:
          "기자의 대피라미드. 죽음 이후의 영원한 삶을 위해 건설된 고대 건축 기술의 경이.",
      },
      {
        title: "파르테논 - 비례의 미학",
        description:
          "황금비와 엔타시스. 그리스인이 추구한 수학적 완벽함과 아름다움의 이상이 담긴 신전.",
      },
      {
        title: "고딕 성당 - 빛의 건축",
        description:
          "첨두아치, 플라잉 버트레스, 스테인드글라스. 하늘을 향해 솟은 돌의 기도와 빛의 신학.",
      },
      {
        title: "바우하우스 - 형태는 기능을 따른다",
        description:
          "장식을 버리고 기능에 집중한 모더니즘 건축. 그로피우스, 미스 반 데어 로에의 혁신.",
      },
      {
        title: "현대 건축 - 해체와 지속가능성",
        description:
          "게리의 해체주의에서 친환경 건축까지. 기술과 예술, 환경이 만나는 현대 건축의 최전선.",
      },
    ],
  },
  {
    id: "cinema-lens",
    title: "영화의 눈",
    description:
      "뤼미에르 형제에서 누벨바그까지. 20세기의 새로운 예술 형식이 세계를 어떻게 바라보고 재창조했는지 탐구합니다.",
    difficulty: "beginner",
    icon: <Compass className="w-6 h-6" />,
    color: "modern",
    steps: [
      {
        title: "뤼미에르 형제 - 영화의 탄생",
        description:
          "열차의 도착(1895). 움직이는 이미지를 처음 스크린에 투사한 순간, 새로운 예술이 탄생했다.",
      },
      {
        title: "에이젠슈타인 - 몽타주 이론",
        description:
          "전함 포템킨의 오데사 계단. 편집(몽타주)이 의미를 창조한다는 발견으로 영화 언어의 문법을 확립.",
      },
      {
        title: "히치콕 - 서스펜스의 대가",
        description:
          "사이코, 현기증, 이창. 관객의 심리를 정밀하게 조종하는 영화적 서사 기법의 완성.",
      },
      {
        title: "구로사와 아키라 - 동양의 셰익스피어",
        description:
          "라쇼몬, 7인의 사무라이. 동서양 문화를 횡단하며 인간의 본성을 탐구한 일본 영화의 거장.",
      },
      {
        title: "누벨바그 - 영화의 혁명",
        description:
          "고다르, 트뤼포. 기존 영화 문법을 파괴하고 작가주의를 선언한 프랑스 새물결의 혁신.",
      },
    ],
  },
  // ── 통합/비의 (3개) ──────────────────────────────────────
  {
    id: "religion-science",
    title: "종교와 과학의 대화",
    description:
      "갈등에서 대화로. 갈릴레오 재판에서 양자역학과 신비주의의 만남까지, 종교와 과학이 충돌하고 화해해온 역사를 탐구합니다.",
    difficulty: "advanced",
    icon: <Atom className="w-6 h-6" />,
    color: "scientist",
    steps: [
      {
        title: "갈릴레오 재판 - 과학과 교회의 충돌",
        description:
          "지동설을 주장한 갈릴레오의 종교재판. 과학적 진리와 종교적 권위의 최초의 대규모 충돌.",
        link: `/persons/galileo`,
      },
      {
        title: "다윈 논쟁 - 진화론과 창조론",
        description:
          "종의 기원이 촉발한 신학적 지진. 인간의 기원에 대한 과학과 종교의 근본적 시각 차이.",
        link: `/persons/darwin`,
      },
      {
        title: "양자역학과 동양 사상",
        description:
          "보어의 상보성과 도교, 하이젠베르크와 불교의 공. 현대 물리학과 동양 신비주의의 놀라운 공명.",
        link: `/entities/quantum-mechanics`,
      },
      {
        title: "현대의 대화 - 과학과 영성",
        description:
          "달라이 라마와 신경과학, 의식 연구와 명상. 과학과 종교가 서로의 영역에서 배우는 새로운 관계.",
        link: `/persons/dalai-lama`,
      },
    ],
  },
  {
    id: "astrology-astronomy",
    title: "점성술에서 천문학으로",
    description:
      "바빌로니아의 별 점에서 코페르니쿠스의 지동설까지. 하늘을 읽으려는 인류의 열망이 어떻게 과학적 천문학으로 변모했는지 추적합니다.",
    difficulty: "intermediate",
    icon: <Compass className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "바빌로니아 - 별의 학문",
        description:
          "메소포타미아의 천문 기록과 점성술. 하늘의 움직임에서 인간의 운명을 읽으려 한 최초의 체계적 시도.",
      },
      {
        title: "프톨레마이오스 - 천동설의 완성",
        description:
          "알마게스트와 지구 중심 우주 모델. 1,400년간 서양 천문학을 지배한 정교한 체계.",
        link: `/persons/ptolemy`,
      },
      {
        title: "코페르니쿠스 - 태양 중심의 혁명",
        description:
          "지구는 우주의 중심이 아니다. 점성술의 전제를 뒤흔든 과학 혁명의 시작.",
        link: `/persons/copernicus`,
      },
      {
        title: "케플러 - 행성 운동의 법칙",
        description:
          "점성술사이자 천문학자. 행성 궤도가 타원임을 발견하고 점성술에서 천문학으로의 전환을 상징.",
        link: `/persons/kepler`,
      },
      {
        title: "현대 천문학 - 우주의 지평",
        description:
          "허블의 팽창 우주에서 제임스 웹 망원경까지. 점성술이 꿈꾸던 것 이상으로 경이로운 실제 우주의 모습.",
      },
    ],
  },
  {
    id: "secret-knowledge",
    title: "비밀 지식의 전승",
    description:
      "오르페우스 밀의에서 프리메이슨, 신지학까지. 공개적 종교와 철학 뒤에 숨겨진 비밀 전승의 지하 수맥을 추적합니다.",
    difficulty: "advanced",
    icon: <Star className="w-6 h-6" />,
    color: "medieval",
    steps: [
      {
        title: "오르페우스 밀의 - 죽음과 재생",
        description:
          "오르페우스교의 입문 의식. 영혼의 불멸과 정화, 윤회와 해방에 대한 고대 그리스의 비밀 가르침.",
      },
      {
        title: "엘레우시스 밀의 - 신비 체험",
        description:
          "데메테르와 페르세포네의 밀의. 2,000년간 입문자만이 경험한 고대 세계 최고의 비밀 의식.",
      },
      {
        title: "그노시스주의 - 숨겨진 지식",
        description:
          "물질 세계는 열등한 신의 창조물. 참된 신에 대한 직접적 인식(그노시스)을 통한 해방의 가르침.",
      },
      {
        title: "프리메이슨 - 건축가의 형제단",
        description:
          "솔로몬 성전의 건축가 전설에서 출발한 형제 결사. 계몽주의와 혁명에 미친 역사적 영향.",
      },
      {
        title: "신지학 - 근대 비의의 종합",
        description:
          "블라바츠키, 슈타이너. 동양과 서양의 비의 전통을 종합하려 한 19-20세기 영성 운동.",
        link: `/entities/theosophy`,
      },
    ],
  },
  // ── 추가 경로 (3개) ──────────────────────────────────────
  {
    id: "korean-philosophy",
    title: "한국 철학의 여정",
    description:
      "원효의 화쟁에서 다산의 실학, 동학의 인내천까지. 한반도에서 꽃핀 독창적 철학 전통과 그 현대적 의미를 탐구합니다.",
    difficulty: "intermediate",
    icon: <Landmark className="w-6 h-6" />,
    color: "philosopher",
    steps: [
      {
        title: "원효 - 화쟁(和諍)의 철학",
        description:
          "불교 교학의 대립을 회통시킨 통합의 사유. 일심(一心)으로 모든 쟁론을 화해시키는 원효의 비전.",
        link: `/persons/wonhyo`,
      },
      {
        title: "퇴계 이황 - 이기호발설",
        description:
          "이(理)의 자발성을 강조한 한국 성리학의 독자적 심화. 조선 유학의 주리론적 전통의 정립.",
        link: `/persons/yi-hwang`,
      },
      {
        title: "율곡 이이 - 기발이승일도설",
        description:
          "기(氣)의 능동성을 인정한 현실주의적 성리학. 퇴계와의 사단칠정 논쟁은 세계 철학사의 유례없는 성과.",
        link: `/persons/yi-i`,
      },
      {
        title: "다산 정약용 - 실학의 집대성",
        description:
          "경세치용과 이용후생. 관념적 성리학을 비판하고 실증적·실용적 학문을 추구한 조선 후기의 혁신.",
        link: `/persons/jeong-yakyong`,
      },
      {
        title: "동학 - 인내천(人乃天)",
        description:
          "사람이 곧 하늘이다. 서구 근대성에 대한 독자적 응답으로 민중의 주체성을 선언한 한국 근대 사상.",
        link: `/entities/donghak`,
      },
    ],
  },
  {
    id: "philosophy-of-science",
    title: "과학철학의 탐구",
    description:
      "과학이란 무엇인가? 반증주의에서 패러다임 전환, 과학적 무정부주의까지. 과학의 본질과 한계를 묻는 철학적 여정.",
    difficulty: "advanced",
    icon: <Brain className="w-6 h-6" />,
    color: "scientist",
    steps: [
      {
        title: "포퍼 - 반증 가능성",
        description:
          "과학과 비과학의 구분 기준은 반증 가능성이다. 귀납의 문제를 극복하고 과학적 방법의 논리를 세운 비판적 합리주의.",
        link: `/persons/popper`,
      },
      {
        title: "쿤 - 과학혁명의 구조",
        description:
          "패러다임과 정상과학. 과학은 누적적으로 진보하는 것이 아니라 혁명적으로 전환된다는 충격적 주장.",
        link: `/persons/kuhn`,
      },
      {
        title: "라카토슈 - 연구 프로그램",
        description:
          "포퍼의 반증주의와 쿤의 상대주의 사이에서. 과학적 합리성을 구출하려는 정교한 방법론.",
        link: `/persons/lakatos`,
      },
      {
        title: "파이어아벤트 - 방법에 반대하다",
        description:
          "'무엇이든 좋다(Anything goes).' 과학적 방법의 유일성을 부정한 과학적 무정부주의의 도발.",
        link: `/persons/feyerabend`,
      },
    ],
  },
  {
    id: "ethics-journey",
    title: "윤리학의 흐름",
    description:
      "좋은 삶이란 무엇인가? 아리스토텔레스의 덕 윤리에서 롤스의 정의론, 피터 싱어의 실천 윤리까지. 도덕의 기초를 묻는 여정.",
    difficulty: "intermediate",
    icon: <BookOpen className="w-6 h-6" />,
    color: "philosopher",
    steps: [
      {
        title: "아리스토텔레스 - 덕 윤리학",
        description:
          "행복(에우다이모니아)과 덕(아레테). 좋은 삶은 덕을 실천하는 삶이라는 고대의 지혜.",
        link: `/philosophy/aristotle/`,
      },
      {
        title: "칸트 - 의무 윤리학",
        description:
          "정언명령과 보편법칙. 결과가 아닌 의무에 따라 행위하라는 엄격한 도덕 법칙.",
        link: `/philosophy/kant/`,
      },
      {
        title: "밀 - 공리주의",
        description:
          "최대 다수의 최대 행복. 쾌락의 질적 차이를 인정하며 벤담의 공리주의를 세련되게 발전시킨 사상.",
        link: `/persons/mill`,
      },
      {
        title: "롤스 - 정의론",
        description:
          "무지의 장막과 공정으로서의 정의. 사회 정의의 원칙을 합리적으로 도출하려는 현대 정치철학의 기념비.",
        link: `/persons/rawls`,
      },
      {
        title: "피터 싱어 - 실천 윤리학",
        description:
          "동물 해방과 효과적 이타주의. 윤리를 이론에서 실천으로, 인간에서 모든 감각 존재로 확장한 현대의 도전.",
        link: `/persons/singer`,
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
