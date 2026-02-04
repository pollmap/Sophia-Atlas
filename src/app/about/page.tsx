import Link from "next/link";
import {
  Info,
  BookOpen,
  Globe,
  Network,
  Search,
  Code,
  ExternalLink,
  Github,
  Heart,
  Scale,
  Lightbulb,
  Users,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

const goals = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "지식의 시각화",
    description:
      "인류의 사상과 지혜를 타임라인, 그래프, 지도 등 다양한 시각적 도구로 표현하여 직관적 이해를 돕습니다.",
    color: "text-cat-philosopher",
    bg: "bg-cat-philosopher/10",
  },
  {
    icon: <Network className="w-6 h-6" />,
    title: "연결의 발견",
    description:
      "철학자 간의 영향 관계, 종교 간의 공통 테마 등 사상들 사이의 숨겨진 연결고리를 탐색합니다.",
    color: "text-medieval",
    bg: "bg-medieval/10",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "문화 간 대화",
    description:
      "동양과 서양, 고대와 현대의 사상을 나란히 비교하며 문화적 경계를 넘나드는 대화를 촉진합니다.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "학습의 여정",
    description:
      "체계적인 학습 경로를 통해 복잡한 사상을 단계별로 이해할 수 있도록 안내합니다.",
    color: "text-modern",
    bg: "bg-modern/10",
  },
];

const techStack = [
  { name: "Next.js 14", category: "프레임워크" },
  { name: "TypeScript", category: "언어" },
  { name: "Tailwind CSS", category: "스타일링" },
  { name: "D3.js", category: "시각화" },
  { name: "React-Leaflet", category: "지도" },
  { name: "Fuse.js", category: "검색" },
  { name: "MDX", category: "콘텐츠" },
  { name: "GitHub Pages", category: "배포" },
  { name: "lucide-react", category: "아이콘" },
];

const references = [
  {
    name: "Stanford Encyclopedia of Philosophy",
    url: "https://plato.stanford.edu/",
    description: "스탠포드 철학 백과사전",
  },
  {
    name: "Internet Encyclopedia of Philosophy",
    url: "https://iep.utm.edu/",
    description: "인터넷 철학 백과사전",
  },
  {
    name: "Encyclopedia Britannica",
    url: "https://www.britannica.com/",
    description: "브리태니커 백과사전",
  },
  {
    name: "World History Encyclopedia",
    url: "https://www.worldhistory.org/",
    description: "세계사 백과사전",
  },
  {
    name: "한국민족문화대백과사전",
    url: "https://encykorea.aks.ac.kr/",
    description: "한국학중앙연구원",
  },
];

export default function AboutPage() {
  return (
    <div className="section-container py-8 md:py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold">
            <Info className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-dark font-display">
            Sophia Atlas에 대하여
          </h1>
        </div>
      </div>

      {/* Project Meaning */}
      <section className="mb-12">
        <div className="border border-fresco-shadow rounded-2xl bg-fresco-parchment/40 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink-dark mb-4 font-display">
                Sophia + Atlas
              </h2>
              <div className="space-y-4 text-ink-medium leading-relaxed">
                <p>
                  <span className="font-semibold text-gold">Sophia</span>
                  (소피아)는 그리스어로{" "}
                  <span className="text-ink-dark font-medium">&apos;지혜&apos;</span>를
                  의미합니다. Philosophy(철학)의 어원인 philosophia는 &apos;지혜를
                  사랑함&apos;이라는 뜻을 담고 있습니다.
                </p>
                <p>
                  <span className="font-semibold text-cat-philosopher">Atlas</span>
                  (아틀라스)는{" "}
                  <span className="text-ink-dark font-medium">지도책</span>을
                  의미합니다. 그리스 신화에서 하늘을 떠받치는 거인 아틀라스에서
                  유래하였으며, 메르카토르가 자신의 지도책에 이 이름을 사용한 것이
                  시초입니다.
                </p>
                <p>
                  <span className="font-semibold text-ink-dark">
                    Sophia Atlas
                  </span>
                  는 &apos;인류 사상의 시공간 지도&apos;를 표방합니다. 철학 계보와 세계
                  신화/종교를 타임라인과 세계지도로 탐색하는 인터랙티브 웹
                  플랫폼입니다.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto">
              <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-fresco-aged/50 border border-fresco-shadow">
                <Map className="w-12 h-12 text-gold mb-2" />
                <span className="text-2xl font-bold text-ink-dark tracking-tight font-display">
                  Sophia Atlas
                </span>
                <span className="text-sm text-ink-faded">
                  인류 사상의 지도
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-ink-dark mb-6 font-display">프로젝트 목표</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div
              key={goal.title}
              className="border border-fresco-shadow rounded-xl p-5 bg-fresco-parchment/40 hover:bg-fresco-aged/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    goal.bg,
                    goal.color
                  )}
                >
                  {goal.icon}
                </div>
                <h3 className="font-semibold text-ink-dark font-display">{goal.title}</h3>
              </div>
              <p className="text-sm text-ink-medium leading-relaxed">
                {goal.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-ink-dark mb-6 font-display">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-ink-light" />
            기술 스택
          </div>
        </h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fresco-parchment border border-fresco-shadow"
            >
              <span className="text-sm font-medium text-ink-dark">
                {tech.name}
              </span>
              <span className="text-[10px] text-ink-faded px-1.5 py-0.5 rounded bg-fresco-aged/50 font-ui">
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* References */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-ink-dark mb-6 font-display">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-ink-light" />
            참고 자료
          </div>
        </h2>
        <div className="space-y-2">
          {references.map((ref) => (
            <a
              key={ref.name}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-fresco-shadow bg-fresco-parchment/40 hover:bg-fresco-aged/50 transition-colors group"
            >
              <div>
                <span className="text-sm font-medium text-ink-dark group-hover:text-gold transition-colors">
                  {ref.name}
                </span>
                <span className="text-xs text-ink-faded ml-2">
                  {ref.description}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-ink-faded flex-shrink-0 group-hover:text-gold transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* Contribution */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-ink-dark mb-6 font-display">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-ink-light" />
            기여하기
          </div>
        </h2>
        <div className="border border-fresco-shadow rounded-xl p-5 bg-fresco-parchment/40">
          <p className="text-sm text-ink-medium leading-relaxed mb-4">
            Sophia Atlas는 오픈소스 프로젝트입니다. 콘텐츠 추가, 오류 수정,
            번역, 기능 개선 등 모든 형태의 기여를 환영합니다.
          </p>
          <ul className="space-y-2 text-sm text-ink-medium">
            <li className="flex items-start gap-2">
              <span className="text-ink-faded mt-0.5">1.</span>
              <span>
                GitHub 저장소를 Fork 합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ink-faded mt-0.5">2.</span>
              <span>
                새로운 브랜치를 생성하고 변경사항을 커밋합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ink-faded mt-0.5">3.</span>
              <span>Pull Request를 제출합니다.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* GitHub Link */}
      <section className="mb-12">
        <a
          href="https://github.com/pollmap/Sophia-Atlas"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 rounded-xl border border-fresco-shadow bg-fresco-parchment/40 hover:bg-fresco-aged/50 transition-colors group"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-fresco-aged/50 group-hover:bg-fresco-aged transition-colors">
            <Github className="w-6 h-6 text-ink-dark" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-ink-dark group-hover:text-gold transition-colors font-display">
              GitHub Repository
            </h3>
            <p className="text-sm text-ink-faded">
              pollmap/Sophia-Atlas
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-ink-faded group-hover:text-gold transition-colors" />
        </a>
      </section>

      {/* Footer Info */}
      <section className="border-t border-fresco-shadow pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-ink-medium">
            <Heart className="w-4 h-4 text-cat-historical" />
            <span>
              제작:{" "}
              <span className="font-medium text-ink-dark">이찬희</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-faded">
            <Scale className="w-4 h-4" />
            <span>ISC License</span>
          </div>
        </div>
      </section>
    </div>
  );
}
